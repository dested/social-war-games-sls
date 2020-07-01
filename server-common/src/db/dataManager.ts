import {ArrowFunctionExpression, ExpressionStatement, Identifier, MemberExpression} from 'estree';
import * as esprima from 'esprima';
import {ObjectID} from 'bson';
import {AggregationCursor, Cursor, Db, IndexOptions, MongoClient} from 'mongodb';
import {Config} from '../config';
import {QueryBuilder} from '../utils/queryBuilder';
import {FilterQuery2, MongoAltQuery, QuerySelector, UpdateQuery2} from './typeSafeFilter';
import {Utils} from '@swg-common/utils/utils';

let mongoClient: MongoClient;
let firstTime = true;

let retries = 0;
export class DataManager {
  static async disconnectDB() {
    try {
      if (mongoClient) {
        await mongoClient.close();
        mongoClient = null;
        firstTime = true;
      }
    } catch (ex) {
      console.error('disconnect db error', ex);
    }
  }
  static async dbConnection(): Promise<Db> {
    if (!mongoClient || !mongoClient.isConnected()) {
      if (!firstTime) {
        console.log('dbConnection hot but disconnected');
        await this.disconnectDB();
      } else {
        console.log('dbConnection cold');
        firstTime = false;
      }
      try {
        mongoClient =
          mongoClient ||
          new MongoClient(Config.dbConnection, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            loggerLevel: 'error',
            logger: (e, b) => console.log(b, e),
          });
        await mongoClient.connect();
        retries = 0;
      } catch (ex) {
        console.error('dbConnection error');
        console.error(ex);
        retries++;
        if (retries > 3) {
          throw new Error(`An unexpected error has occurred.`);
        }
        await Utils.timeout(1000);
        return this.dbConnection();
      }
    } else {
      // console.log('db connection hot ');
    }
    const db = mongoClient.db(Config.dbName);
    // console.log('got db');
    return db;
  }
}
type FlattenArray<T> = {
  [key in keyof T]: T[key] extends Array<infer J> ? Array<FlattenArray<J>> & FlattenArray<J> : FlattenArray<T[key]>;
};

export class DocumentManager<T extends {_id: any}> {
  query = new QueryBuilder<T>();

  keyFilter<T2>(
    query: (t: FlattenArray<T>) => T2,
    value: MongoAltQuery<T2> | QuerySelector<MongoAltQuery<T2>>
  ): FilterQuery2<T> {
    const keyList: PropertyKey[] = [];
    const handler: any = {
      get(target: any, key: PropertyKey, receiver: any): any {
        keyList.push(key);
        return new Proxy({[key]: {}}, handler);
      },
    };
    const proxy = new Proxy({} as FlattenArray<T>, handler);

    query(proxy);
    return {[keyList.join('.')]: value} as any;
  }

  keySet<T2>(
    query: (t: FlattenArray<T>) => T2,
    value: MongoAltQuery<T2> | QuerySelector<MongoAltQuery<T2>>
  ): Partial<T> {
    return this.keyFilter(query, value) as any;
  }

  keyProject<T2>(query: (t: FlattenArray<T>) => T2, value: 1 | -1): {[key in keyof T]?: 1 | -1} {
    return this.keyFilter(query, value as any) as any;
  }

  constructor(private collectionName: string) {}

  async insertDocument(document: T): Promise<T> {
    const collection = await this.getCollection();
    console.log('insert started');
    const result = await collection.insertOne(document as any);
    console.log('insert done');
    document._id = result.insertedId;
    return document;
  }
  async updateOne(filter: FilterQuery2<T>, update: UpdateQuery2<T>): Promise<void> {
    await (await this.getCollection()).updateOne(filter, update as any);
  }

  async updateMany(filter: FilterQuery2<T>, update: UpdateQuery2<T>): Promise<void> {
    await (await this.getCollection()).updateMany(filter, update as any);
  }

  async getCollection() {
    // console.log('getting collection db');
    const db = await DataManager.dbConnection();
    // console.log('getting collection');
    const collection = db.collection<T>(this.collectionName);
    // console.log('got collection');
    return collection;
  }

  async insertDocuments(documents: T[]): Promise<T[]> {
    const result = await (await this.getCollection()).insertMany(documents as any);
    for (let i = 0; i < documents.length; i++) {
      documents[i]._id = result.insertedIds[i];
    }
    return documents;
  }

  async updateDocument(document: T): Promise<T> {
    const collection = await this.getCollection();

    await collection.findOneAndReplace({_id: document._id} as any, document);
    return document;
  }

  async getOneQuery(query: (q: T) => boolean): Promise<T>;
  async getOneQuery<P>(query: (q: T, params: P) => boolean, params: P): Promise<T>;
  async getOneQuery<P>(query: (q: T, params: P) => boolean, params?: P): Promise<T> {
    return await (await this.getCollection()).findOne(this.query.parse(query, params));
  }

  async getOne(query: FilterQuery2<T>, projection?: any): Promise<T | null> {
    if (projection) {
      return (await this.getCollection()).findOne(query, {projection});
    } else {
      return (await this.getCollection()).findOne(query);
    }
  }

  async aggregate<TResult>(pipeline: object[]): Promise<TResult[]> {
    return (await DataManager.dbConnection()).collection(this.collectionName).aggregate(pipeline).toArray();
  }

  async aggregateCursor<TResult>(pipeline: object[]): Promise<AggregationCursor<TResult>> {
    return (await DataManager.dbConnection()).collection(this.collectionName).aggregate(pipeline);
  }

  async getById(id: string | ObjectID, projection?: any): Promise<T | null> {
    const objectId: ObjectID = typeof id === 'string' ? ObjectID.createFromHexString(id) : id;
    if (projection) {
      return (await DataManager.dbConnection()).collection(this.collectionName).findOne({_id: objectId}, {projection});
    } else {
      return (await DataManager.dbConnection()).collection(this.collectionName).findOne({_id: objectId});
    }
  }

  async getByIdProject<
    TOverride extends DeepPartial<T> = DeepPartial<T>,
    TProjection extends {[key in keyof TOverride]?: 1 | -1} = {[key in keyof TOverride]?: 1 | -1},
    TKeys extends keyof TProjection & keyof TOverride = keyof T
  >(id: string | ObjectID, projection: TProjection): Promise<{[key in TKeys]: TOverride[key]}> {
    const objectId: ObjectID = typeof id === 'string' ? ObjectID.createFromHexString(id) : id;

    return (await (await DataManager.dbConnection())
      .collection(this.collectionName)
      .findOne({_id: objectId}, {projection})) as {
      [key in TKeys]: TOverride[key];
    };
  }

  async deleteMany(query: FilterQuery2<T>): Promise<void> {
    await (await this.getCollection()).deleteMany(query);
  }
  async deleteOne(query: FilterQuery2<T>): Promise<void> {
    await (await this.getCollection()).deleteOne(query);
  }

  async getAllQuery(query: (q: T) => boolean): Promise<T[]>;
  async getAllQuery<P>(query: (q: T, params: P) => boolean, params: P): Promise<T[]>;
  async getAllQuery<P>(query: (q: T, params: P) => boolean, params?: P): Promise<T[]> {
    return (await (await this.getCollection()).find(this.query.parse(query, params))).toArray();
  }

  async getAll(query: FilterQuery2<T>): Promise<T[]> {
    return (await (await this.getCollection()).find(query)).toArray();
  }

  async find(query: FilterQuery2<T>) {
    return (await this.getCollection()).find(query);
  }

  async getAllProject<
    TOverride extends DeepPartial<T> = DeepPartial<T>,
    TProjection extends {[key in keyof TOverride]?: 1 | -1} = {[key in keyof TOverride]?: 1 | -1},
    TKeys extends keyof TProjection & keyof TOverride = keyof T
  >(query: FilterQuery2<T>, projection: TProjection): Promise<{[key in TKeys]: TOverride[key]}[]> {
    return ((await (await this.getCollection()).find(query, {projection})).toArray() as unknown) as {
      [key in TKeys]: TOverride[key];
    }[];
  }

  async getOneProject<
    TOverride extends DeepPartial<T> = DeepPartial<T>,
    TProjection extends {[key in keyof TOverride]?: 1 | -1} = {[key in keyof TOverride]?: 1 | -1},
    TKeys extends keyof TProjection & keyof TOverride = keyof T
  >(query: FilterQuery2<T>, projection: TProjection): Promise<{[key in TKeys]: TOverride[key]}> {
    return ((await (await this.getCollection()).findOne(query, {projection})) as unknown) as {
      [key in TKeys]: TOverride[key];
    };
  }

  async findProject<
    TOverride extends DeepPartial<T> = DeepPartial<T>,
    TProjection extends {[key in keyof TOverride]?: 1 | -1} = {[key in keyof TOverride]?: 1 | -1},
    TKeys extends keyof TProjection & keyof TOverride = keyof T
  >(query: FilterQuery2<T>, projection: TProjection): Promise<Cursor<{[key in TKeys]: TOverride[key]}>> {
    return ((await (await this.getCollection()).find(query, {projection})) as unknown) as Cursor<
      {
        [key in TKeys]: TOverride[key];
      }
    >;
  }

  async exists(query: FilterQuery2<T>): Promise<boolean> {
    return (await (await this.getCollection()).count(query, {})) > 0;
  }

  async getAllPaged(
    query: FilterQuery2<T>,
    sortKey: keyof T | null,
    sortDirection: 1 | -1,
    page: number,
    take: number
  ): Promise<T[]> {
    let cursor = (await DataManager.dbConnection()).collection(this.collectionName).find(query);
    if (sortKey) {
      cursor = cursor.sort(sortKey as string, sortDirection);
    }
    return (await cursor.skip(page * take).limit(take)).toArray();
  }

  async getAllCursor(
    query: FilterQuery2<T>,
    sortKey: keyof T | null,
    sortDirection: number,
    page: number,
    take: number
  ): Promise<Cursor<T>> {
    let cursor = (await DataManager.dbConnection()).collection(this.collectionName).find(query);
    if (sortKey) {
      cursor = cursor.sort(sortKey as string, sortDirection);
    }
    return cursor.skip(page * take).limit(take);
  }

  async countQuery(query: (q: T) => boolean): Promise<number>;
  async countQuery<P>(query: (q: T, params: P) => boolean, params: P): Promise<number>;
  async countQuery<P>(query: (q: T, params: P) => boolean, params?: P): Promise<number> {
    return await (await this.getCollection()).count(this.query.parse(query, params));
  }

  async count(query: FilterQuery2<T>): Promise<number> {
    return await (await this.getCollection()).countDocuments(query, {});
  }

  async ensureIndex(spec: any, options: IndexOptions): Promise<string> {
    return await (await this.getCollection()).createIndex(spec, options);
  }
}
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer UU>
    ? ReadonlyArray<DeepPartial<UU>>
    : T[P] extends ObjectID
    ? T[P]
    : DeepPartial<T[P]>;
};
