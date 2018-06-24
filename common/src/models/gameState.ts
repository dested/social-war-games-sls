import {EntityAction, EntityType, OfFaction, PlayableFactionId} from '../game/entityDetail';
import {ResourceType} from '../game/gameResource';

export type GameState = {
    factions: string;
    factionDetails: OfFaction<FactionDetail>;
    entities: OfFaction<GameStateEntity[]>;
    resources: GameStateResource[];
    generation: number;
    roundDuration: number;
    roundStart: number;
    roundEnd: number;
};

export type FactionDetail = {
    resourceCount: number;
};

export type GameStateEntity = {
    x: number;
    y: number;
    id: number;
    busy: GameStateGameEntityBusyDetails;
    entityType: EntityType;
    health: number;
    healthRegenStep: number;
};

export type GameStateGameEntityBusyDetails = {
    ticks: number;
    action: EntityAction;
    hexId: string;
};

export type GameStateResource = {
    x: number;
    y: number;
    count: number;
    type: ResourceType;
};
