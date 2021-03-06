import {OfFaction} from '@swg-common/game/entityDetail';
import {ProcessedVote} from '@swg-common/game/gameLogic';
import {FactionDetail, GameState, GameStateEntity, GameStateResource} from '@swg-common/models/gameState';
import {VoteNote} from '@swg-common/models/voteNote';
import {DataManager} from '../dataManager'; import {DocumentManager} from 'mongo-safe';
import {MongoDocument} from './mongoDocument';

export class DBGameStateResult extends MongoDocument implements GameState {
  static collectionName = 'gameStateResult';
  static db = new DocumentManager<DBGameStateResult>(DBGameStateResult.collectionName,DataManager.dbConnection);

  constructor(gameState: GameState) {
    super();
    this.gameId = gameState.gameId;
    this.factions = gameState.factions;
    this.factionDetails = gameState.factionDetails;
    this.entities = gameState.entities;
    this.resources = gameState.resources;
    this.generation = gameState.generation;
    this.roundDuration = gameState.roundDuration;
    this.roundStart = gameState.roundStart;
    this.roundEnd = gameState.roundEnd;
    this.totalPlayersVoted = gameState.totalPlayersVoted;
    this.winningVotes = gameState.winningVotes;
    this.playersVoted = gameState.playersVoted;
    this.scores = gameState.scores;
    this.hotEntities = gameState.hotEntities;
    this.notes = gameState.notes;
  }

  gameId: string;
  factions: number[];
  factionDetails: OfFaction<FactionDetail>;
  entities: OfFaction<GameStateEntity[]>;
  resources: GameStateResource[];
  generation: number;
  roundDuration: number;
  roundStart: number;
  roundEnd: number;

  totalPlayersVoted: number;
  winningVotes: OfFaction<ProcessedVote[]>;
  playersVoted: OfFaction<number>;
  scores: OfFaction<number>;
  hotEntities: OfFaction<{id: number; count: number}[]>;
  notes: OfFaction<VoteNote[]>;
}
