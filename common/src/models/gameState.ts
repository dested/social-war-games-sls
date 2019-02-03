import {EntityAction, EntityType, OfFaction, PlayableFactionId} from '../game/entityDetail';
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
