import { DocumentManager } from '../dataManager';
import { MongoDocument } from './mongoDocument';
import { FactionId, EntityAction } from 'swg-common/bin/game';
export declare type VoteCountResult = {
    _id: string;
    actions: {
        action: EntityAction;
        hexId: string;
        count: number;
    }[];
};
export declare class DBVote extends MongoDocument {
    static collectionName: string;
    static db: DocumentManager<DBVote>;
    userId: string;
    generation: number;
    entityId: string;
    action: EntityAction;
    hexId: string;
    factionId: FactionId;
    static getVoteCount(generation: number): Promise<VoteCountResult[]>;
}
