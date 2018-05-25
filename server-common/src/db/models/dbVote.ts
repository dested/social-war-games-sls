import {DocumentManager} from '../dataManager';
import {MongoDocument} from './mongoDocument';
import {HttpUser} from 'swg-common/bin/models/http/httpUser';
import {EntityAction} from 'swg-common/bin/game';

export type VoteCountResult = {_id: string; actions: {action: string; hexId: string; count: string}[]};

export class DBVote extends MongoDocument {
    static collectionName = 'vote';
    static db = new DocumentManager<DBVote>(DBVote.collectionName);

    userId: string;
    generation: number;
    entityId: string;
    action: EntityAction;
    hexId: string;
    factionId: string;

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
