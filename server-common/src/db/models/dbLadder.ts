import {HttpUser} from '@swg-common/models/http/httpUser';
import {DataManager} from '../dataManager';
import {DocumentManager} from 'mongo-safe';

export class DBLadder {
  static collectionName = 'ladder';
  static db = new DocumentManager<DBLadder>(DBLadder.collectionName, DataManager.dbConnection);

  constructor() {}

  _id: string;
  gameId: string;
  userName: string;
  score: number;
  rank: number;

  static async getLadder(gameId: string, userId: string) {
    const ranks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    if (userId) {
      const me = await this.db.getOne({_id: userId, gameId});
      console.log(me);
      if (me) {
        ranks.push(...[me.rank - 2, me.rank - 1, me.rank, me.rank + 1, me.rank + 2]);
      }
    }

    const topLadder = await this.db.getAll(
      {gameId, rank: {$in: ranks}}
    );
    return topLadder;
  }
}
