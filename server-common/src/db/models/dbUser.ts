import {DocumentManager} from '../dataManager';
import {MongoDocument} from './mongoDocument';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {FactionId} from '@swg-common/game';

export class DBUser extends MongoDocument {
    static collectionName = 'user';
    static db = new DocumentManager<DBUser>(DBUser.collectionName);

    email: string;
    passwordHash: string;
    maxVotesPerRound: number;
    factionId: FactionId;

    static map(e: DBUser): HttpUser {
        return {
            id: e._id.toHexString(),
            email: e.email,
            factionId: e.factionId,
            maxVotesPerRound: e.maxVotesPerRound
        };
    }
}
