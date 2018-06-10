import {DocumentManager} from '../dataManager';
import {MongoDocument} from './mongoDocument';

export class DBUserRoundStats extends MongoDocument {
    static collectionName = 'user-round-stats';
    static db = new DocumentManager<DBUserRoundStats>(DBUserRoundStats.collectionName);

    constructor() {
        super();
    }

    userId: string;
    roundsParticipated: DBUserRoundStatDetails[];

    static async getByUserId(userId: string): Promise<DBUserRoundStats> {
        let userRoundStats = await this.db.getOne(this.db.query.parse((a, uid) => a.userId === uid, userId));
        if (!userRoundStats) {
            userRoundStats = new DBUserRoundStats();
            userRoundStats.userId = userId;
            userRoundStats.roundsParticipated = [];
            await this.db.insertDocument(userRoundStats);
        }
        return userRoundStats;
    }

    static async addUserRoundStat(userId: string, stat: DBUserRoundStatDetails): Promise<void> {
        const userRoundStats = await this.getByUserId(userId);
        userRoundStats.roundsParticipated = userRoundStats.roundsParticipated || [];
        userRoundStats.roundsParticipated.push(stat);
        await this.db.updateDocument(userRoundStats);
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
