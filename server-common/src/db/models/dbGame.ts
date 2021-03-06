import {OfFaction} from '@swg-common/game/entityDetail';
import {GameModel, ProcessedVote} from '@swg-common/game/gameLogic';
import {FactionDetail, GameState, GameStateEntity, GameStateResource} from '@swg-common/models/gameState';
import {HttpGame} from '@swg-common/models/http/httpGame';
import {VoteNote} from '@swg-common/models/voteNote';
import {DataManager} from '../dataManager'; import {DocumentManager} from 'mongo-safe';
import {MongoDocument} from './mongoDocument';

export class DBGame extends MongoDocument {
  static collectionName = 'swg-game';
  static db = new DocumentManager<DBGame>(DBGame.collectionName,DataManager.dbConnection);

  constructor(gameModel: GameModel) {
    super();
    this.dateStarted = new Date();
    this.gameId = gameModel.id;
    this.roundDuration = gameModel.roundDuration;
  }

  gameId: string;
  dateStarted: Date;
  roundDuration: number;

  static map(e: DBGame): HttpGame {
    return {
      gameId: e.gameId,
      roundDuration: e.roundDuration,
    };
  }
}
