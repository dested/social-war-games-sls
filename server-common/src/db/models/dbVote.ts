import {EntityAction, PlayableFactionId} from '@swg-common/game/entityDetail';
import {DocumentManager} from '../dataManager';
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
  static db = new DocumentManager<DBVote>(DBVote.collectionName);

  userId: string;
  gameId: string;
  generation: number;
  entityId: number;
  action: EntityAction;
  hexId: string;
  factionId: PlayableFactionId;

  static getVoteCount(gameId: string, generation: number): Promise<VoteCountResult[]> {
    return this.db.aggregate([
      {
        $match: {
          gameId,
          generation,
        },
      },
      {
        $group: {
          _id: {
            entityId: '$entityId',
            action: '$action',
            hexId: '$hexId',
          },
          count: {$sum: 1},
        },
      },
      {
        $group: {
          _id: '$_id.entityId',
          actions: {
            $push: {
              action: '$_id.action',
              hexId: '$_id.hexId',
              count: '$count',
            },
          },
        },
      },
    ]);
  }

  static getRoundUserStats(gameId: string, generation: number): Promise<RoundUserStats[]> {
    return this.db.aggregate([
      {
        $match: {
          gameId,
          generation,
        },
      },
      {
        $group: {
          _id: {userId: '$userId', factionId: '$factionId'},
          count: {$sum: 1},
          votes: {
            $push: {
              action: '$action',
              entityId: '$entityId',
              hexId: '$hexId',
            },
          },
        },
      },
    ]);
  }
}
