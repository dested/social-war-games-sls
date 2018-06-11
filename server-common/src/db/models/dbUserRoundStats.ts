import {DocumentManager} from '../dataManager';
import {MongoDocument} from './mongoDocument';
import {VoteCountResult} from './dbVote';
import {Config} from '../../config';
import {DBUser} from './dbUser';

export class DBUserRoundStats extends MongoDocument {
    static collectionName = 'user-round-stats';
    static db = new DocumentManager<DBUserRoundStats>(DBUserRoundStats.collectionName);

    constructor() {
        super();
    }

    userId: string;
    userName: string;
    roundsParticipated: DBUserRoundStatDetails[];

    static async getByUserId(userId: string): Promise<DBUserRoundStats> {
        let userRoundStats = await this.db.getOne(this.db.query.parse((a, uid) => a.userId === uid, userId));
        if (!userRoundStats) {
            userRoundStats = new DBUserRoundStats();
            userRoundStats.userId = userId;
            const user = await DBUser.db.getById(userId);
            userRoundStats.userName = user.userName;
            userRoundStats.roundsParticipated = [];
            await this.db.insertDocument(userRoundStats);
        }
        return userRoundStats;
    }

    static async addUserRoundStat(userId: string, stat: DBUserRoundStatDetails): Promise<void> {
        const userRoundStats = await this.getByUserId(userId);
        userRoundStats.roundsParticipated.push(stat);
        await this.db.updateDocument(userRoundStats);
    }

    static async buildLadder(currentGeneration: number) {
        const generationsPerDay = 24 * 60 * 60 * 1000 / Config.gameDuration;
        const valuableGenerations = generationsPerDay * 2.5;
        await this.db.aggregate([
            {
                $unwind: {
                    path: '$roundsParticipated'
                }
            },
            {
                $project: {
                    _id: '$_id',
                    userId: '$userId',
                    userName: '$userName',
                    score: {
                        $trunc: {
                            $divide: [
                                {
                                    $add: [
                                        {$multiply: ['$roundsParticipated.votesCast', 0.1]},
                                        {$multiply: ['$roundsParticipated.votesWon', 0.5]},
                                        {$multiply: ['$roundsParticipated.damageDone', 3]},
                                        {$multiply: ['$roundsParticipated.unitsDestroyed', 6]},
                                        {$multiply: ['$roundsParticipated.unitsCreated', 4]},
                                        {$multiply: ['$roundsParticipated.resourcesMined', 3.5]},
                                        {$multiply: ['$roundsParticipated.distanceMoved', 1.2]}
                                    ]
                                },
                                {
                                    $divide: [
                                        {
                                            $subtract: [
                                                valuableGenerations,
                                                {$subtract: [currentGeneration, '$roundsParticipated.generation']}
                                            ]
                                        },
                                        valuableGenerations
                                    ]
                                }
                            ]
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    userName: {$first: '$userName'},
                    score: {$sum: '$score'}
                }
            },
            {$sort: {score: -1}},
            {$group: {_id: 1, ranks: {$push: '$$CURRENT'}}},
            {$unwind: {path: '$ranks', includeArrayIndex: 'rank'}},
            {$project: {_id: '$ranks._id', userName: '$ranks.userName', score: '$ranks.score', rank: '$rank'}},
            {$out: 'ladder'}
        ]);
    }
}

export interface DBUserRoundStatDetails {
    generation: number;
    votesCast: number;
    votesWon: number;
    damageDone: number;
    unitsDestroyed: number;
    unitsCreated: number;
    resourcesMined: number;
    distanceMoved: number;
}
