import {DocumentManager} from '../dataManager';
import {MongoDocument} from './mongoDocument';
import {EntityAction, PlayableFactionId} from '@swg-common/game/entityDetail';

export type VoteCountResult = {_id: string; actions: {action: EntityAction; hexId: string; count: number}[]};
export type RoundUserStats = {
    _id: {userId: string; factionId: PlayableFactionId};
    count: number;
    votes: {action: EntityAction; hexId: string; entityId: string}[];
};

export class DBVote extends MongoDocument {
    static collectionName = 'vote';
    static db = new DocumentManager<DBVote>(DBVote.collectionName);

    userId: string;
    generation: number;
    entityId: string;
    action: EntityAction;
    hexId: string;
    factionId: PlayableFactionId;

    static getVoteCount(generation: number): Promise<VoteCountResult[]> {
        return this.db.aggregate([
            {
                $match: {
                    generation
                }
            },
            {
                $group: {
                    _id: {
                        entityId: '$entityId',
                        action: '$action',
                        hexId: '$hexId'
                    },
                    count: {$sum: 1}
                }
            },
            {
                $group: {
                    _id: '$_id.entityId',
                    actions: {
                        $push: {
                            action: '$_id.action',
                            hexId: '$_id.hexId',
                            count: '$count'
                        }
                    }
                }
            }
        ]);
    }

    static getRoundUserStats(generation: number): Promise<RoundUserStats[]> {
        return this.db.aggregate([
            {
                $match: {
                    generation
                }
            },
            {
                $group: {
                    _id: {userId: '$userId', factionId: '$factionId'},
                    count: {$sum: 1},
                    votes: {
                        $push: {
                            action: '$action',
                            entityId: '$entityId',
                            hexId: '$hexId'
                        }
                    }
                }
            }
        ]);
    }
}
