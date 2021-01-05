import {EntityAction, PlayableFactionId} from '@swg-common/game/entityDetail';
import {DataManager} from '../dataManager';
import {Aggregator, DocumentManager} from 'mongo-safe';
import {MongoDocument} from './mongoDocument';

export interface VoteCountResult {
  _id: number;
  actions: {action: EntityAction; hexId: string; count: number}[];
}
export interface RoundUserStats {
  _id: {userId: string; factionId: PlayableFactionId};
  count: number;
  votes: {action: EntityAction; hexId: string; entityId: number}[];
}

export class DBVote extends MongoDocument {
  static collectionName = 'vote';
  static db = new DocumentManager<DBVote>(DBVote.collectionName, DataManager.dbConnection);

  userId: string;
  gameId: string;
  generation: number;
  entityId: number;
  action: EntityAction;
  hexId: string;
  factionId: PlayableFactionId;

  static async getVoteCount(
    gameId: string,
    generation: number
  ): Promise<
    VoteCountResult[]
  > {
    const result = await Aggregator.start<DBVote>()
      .$match({
        gameId,
        generation,
      })
      .$group({
        _id: {
          entityId: '$entityId',
          action: '$action',
          hexId: '$hexId',
        },
        count: {$sum: 1},
      })
      .$group({
        _id: '$_id.entityId',
        actions: {
          $push: {
            action: '$_id.action',
            hexId: '$_id.hexId',
            count: '$count',
          },
        },
      })
      .result(await this.db.getCollection());
    return (result as unknown) as VoteCountResult[];
  }

  static async getRoundUserStats(gameId: string, generation: number): Promise<RoundUserStats[]> {
    const result = await Aggregator.start<DBVote>()
      .$match({
        gameId,
        generation,
      })
      .$group({
        _id: {userId: '$userId', factionId: '$factionId'},
        count: {$sum: 1},
        votes: {
          $push: {
            action: '$action',
            entityId: '$entityId',
            hexId: '$hexId',
          },
        },
      })
      .result(await this.db.getCollection());

    return (result as unknown) as RoundUserStats[];
  }
}
