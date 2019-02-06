import {ProcessedVote} from '@swg-common/game/gameLogic';
import {VoteNote} from '@swg-common/models/voteNote';
import {FacingDirection} from '@swg-common/utils/hexUtils';
import {EntityAction, EntityType, OfFaction} from '../game/entityDetail';
import {ResourceType} from '../game/gameResource';

export interface GameState {
  factions: string;
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

export interface FactionDetail {
  resourceCount: number;
}

export interface GameStateEntity {
  x: number;
  y: number;
  id: number;
  busy: GameStateGameEntityBusyDetails;
  entityType: EntityType;
  health: number;
  healthRegenStep: number;
  facingDirection: FacingDirection;
}

export interface GameStateGameEntityBusyDetails {
  ticks: number;
  action: EntityAction;
  hexId: string;
}

export interface GameStateResource {
  x: number;
  y: number;
  count: number;
  type: ResourceType;
}
