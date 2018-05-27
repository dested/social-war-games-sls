import { DocumentManager } from '../dataManager';
import { MongoDocument } from './mongoDocument';
import { HttpUser } from 'swg-common/bin/models/http/httpUser';
import { FactionId } from '../../../../common/src/game';
export declare class DBUser extends MongoDocument {
    static collectionName: string;
    static db: DocumentManager<DBUser>;
    email: string;
    passwordHash: string;
    maxVotesPerRound: number;
    factionId: FactionId;
    static map(e: DBUser): HttpUser;
}
