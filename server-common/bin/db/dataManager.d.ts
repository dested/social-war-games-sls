import { ObjectID } from 'bson';
import { Db, IndexOptions } from 'mongodb';
import { QueryBuilder } from '../utils/queryBuilder';
import { MongoDocument } from './models/mongoDocument';
export declare class DataManager {
    static dbConnection: Db;
    static openDbConnection(): Promise<void>;
    static closeDbConnection(): Promise<void>;
}
export declare class DocumentManager<T extends MongoDocument> {
    private collectionName;
    query: QueryBuilder<T>;
    constructor(collectionName: string);
    insertDocument(document: T): Promise<T>;
    updateDocument(document: T): Promise<T>;
    getOne(query: any): Promise<T>;
    aggregate(query: any): Promise<any[]>;
    getById(id: string | ObjectID): Promise<T>;
    deleteMany(query: any): Promise<void>;
    getAll(query: any): Promise<T[]>;
    count(query: any): Promise<number>;
    ensureIndex(spec: any, options: IndexOptions): Promise<string>;
}
