import {EntityType, FactionId} from '../game';

export type GameState = {
    factions: string;
    entities: GameStateEntityMap;
    generation: number;
    roundStart: number;
    roundEnd: number;
};
export type GameStateEntityMap = {[faction in FactionId]: GameStateEntity[]};
export type GameStateEntity = {x: number; y: number; id: string; entityType: EntityType; health: number};
