import { EntityType, FactionId } from '../game';
export declare type GameState = {
    factions: string;
    entities: GameStateEntityMap;
    generation: number;
    roundStart: number;
    roundEnd: number;
};
export declare type GameStateEntityMap = {
    [faction in FactionId]: GameStateEntity[];
};
export declare type GameStateEntity = {
    x: number;
    y: number;
    id: string;
    entityType: EntityType;
    health: number;
};
