import { DocumentManager } from '../dataManager';
import { MongoDocument } from './mongoDocument';
import { HttpUser } from 'swg-common/bin/models/http/httpUser';
export declare class DBUser extends MongoDocument {
    static collectionName: string;
    static db: DocumentManager<DBUser>;
    email: string;
    passwordHash: string;
    maxVotesPerRound: number;
    factionId: string;
    static map(e: DBUser): HttpUser;
}
