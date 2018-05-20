import {ObjectID} from 'bson';
import {Db, IndexOptions, MongoClient} from 'mongodb';
import {Config} from '../config';
import {QueryBuilder} from '../utils/queryBuilder';
import {MongoDocument} from './models/mongoDocument';

export class DataManager {
    static dbConnection: Db;

    static async openDbConnection() {
        if (!this.dbConnection) {
            this.dbConnection = (await MongoClient.connect(Config.dbConnection)).db(Config.dbName);
        }
    }

    static async closeDbConnection() {
        if (this.dbConnection) {
            await this.dbConnection.close();
            this.dbConnection = undefined!;
        }
    }
}

export class DocumentManager<T extends MongoDocument> {
    query = new QueryBuilder<T>();

    constructor(private collectionName: string) {}

    async insertDocument(document: T): Promise<T> {
        const result = await DataManager.dbConnection.collection(this.collectionName).insertOne(document);
        document._id = result.insertedId;
        return document;
    }

    async updateDocument(document: T): Promise<T> {
        DataManager.dbConnection.collection(this.collectionName).findOneAndUpdate({_id: document._id}, document);
        return document;
    }

    async getOne(query: any): Promise<T> {
        return await DataManager.dbConnection.collection(this.collectionName).findOne(query);
    }

    async getById(id: string | ObjectID): Promise<T> {
        const objectId: ObjectID = typeof id === 'string' ? new ObjectID(id) : id;
        return await DataManager.dbConnection.collection(this.collectionName).findOne({_id: objectId});
    }

    async getAll(query: any): Promise<T[]> {
        return (await DataManager.dbConnection.collection(this.collectionName).find(query)).toArray();
    }

    async count(query: any): Promise<number> {
        return await DataManager.dbConnection.collection(this.collectionName).count(query);
    }

    async ensureIndex(spec: any, options: IndexOptions): Promise<string> {
        return await DataManager.dbConnection.collection(this.collectionName).createIndex(spec, options);
    }
}
