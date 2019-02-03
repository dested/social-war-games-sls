import {OfFaction} from '@swg-common/game/entityDetail';
import {ProcessedVote} from '@swg-common/game/gameLogic';
import {RoundStats} from '@swg-common/models/roundStats';
import {VoteNote} from '@swg-common/models/voteNote';
import {DocumentManager} from '../dataManager';
import {MongoDocument} from './mongoDocument';

export class DBRoundStats extends MongoDocument {
  static collectionName = 'round-stats';
  static db = new DocumentManager<DBRoundStats>(DBRoundStats.collectionName);

  constructor(roundStats: RoundStats) {
    super();
    this.generation = roundStats.generation;
    this.winningVotes = roundStats.winningVotes;
    this.playersVoted = roundStats.playersVoted;
    this.scores = roundStats.scores;
    this.hotEntities = roundStats.hotEntities;
    this.notes = roundStats.notes;
  }

  generation: number;
  winningVotes: OfFaction<ProcessedVote[]>;
  playersVoted: OfFaction<number>;
  scores: OfFaction<number>;
  hotEntities: OfFaction<{id: number; count: number}[]>;
  notes: OfFaction<VoteNote[]>;
}
