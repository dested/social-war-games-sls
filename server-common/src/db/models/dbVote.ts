import {DocumentManager} from '../dataManager';
import {MongoDocument} from './mongoDocument';
import {EntityAction, Faction, PlayableFactionId} from '@swg-common/game/entityDetail';

export type VoteCountResult = {_id: string; actions: {action: EntityAction; hexId: string; count: number}[]};

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
}
