import {Config} from '../../config';
import {DataManager} from '../dataManager';
import {Aggregator, DocumentManager, tableName} from 'mongo-safe';
import {DBUser} from './dbUser';
import {MongoDocument} from './mongoDocument';
import {DBLadder} from '@swg-server-common/db/models/dbLadder';

export class DBUserRoundStats extends MongoDocument {
  static collectionName = 'user-round-stats';
  static db = new DocumentManager<DBUserRoundStats>(DBUserRoundStats.collectionName, DataManager.dbConnection);

  constructor() {
    super();
  }

  gameId: string;
  userId: string;
  userName: string;
  roundsParticipated: DBUserRoundStatDetails[];

  static async getByUserId(gameId: string, userId: string): Promise<DBUserRoundStats> {
    let userRoundStats = await this.db.getOne({userId, gameId});
    if (!userRoundStats) {
      userRoundStats = new DBUserRoundStats();
      userRoundStats.userId = userId;
      userRoundStats.gameId = gameId;
      const user = await DBUser.db.getById(userId);
      userRoundStats.userName = user.userName;
      userRoundStats.roundsParticipated = [];
      await this.db.insertDocument(userRoundStats);
    }
    return userRoundStats;
  }

  static async addUserRoundStat(gameId: string, userId: string, stat: DBUserRoundStatDetails): Promise<void> {
    const userRoundStats = await this.getByUserId(gameId, userId);
    userRoundStats.roundsParticipated.push(stat);
    await this.db.updateDocument(userRoundStats);
  }

  static async buildLadder(gameId: string, currentGeneration: number) {
    const generationsPerDay = (24 * 60 * 60 * 1000) / Config.gameDuration;
    const valuableGenerations = generationsPerDay * 2.5;

    const result = await Aggregator.start<DBUserRoundStats>()
      .$match({
        gameId,
      })
      .$unwind({
        path: '$roundsParticipated',
      })
      .$project({
        _id: '$_id',
        userId: '$userId',
        gameId: '$gameId',
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
                  {$multiply: ['$roundsParticipated.distanceMoved', 1.2]},
                ],
              },
              {
                $divide: [
                  {
                    $subtract: [
                      valuableGenerations,
                      {$subtract: [currentGeneration, '$roundsParticipated.generation']},
                    ],
                  },
                  valuableGenerations,
                ],
              },
            ],
          },
        },
      })
      .$group(
        {
          _id: '$userId',
      userName: {$first: '$userName'}, gameId: {$first: '$gameId'}, score: {$sum: '$score'}}
      )
      .$sort({score: -1})
      .$group({_id: 1,ranks: {$push: '$$CURRENT'}})
      .$unwind({path: '$ranks', includeArrayIndex: 'rank'})
      .$project({
        _id: '$ranks._id',
        gameId: '$ranks.gameId',
        userName: '$ranks.userName',
        score: '$ranks.score',
        rank: '$rank',
      })
      .$out(tableName<DBLadder>('ladder'))
      .result(await this.db.getCollection());
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
