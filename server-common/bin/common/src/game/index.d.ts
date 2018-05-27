import { Grid, Hexagon } from '../hex/hex';
import { GameLayout } from '../models/gameLayout';
import { GameState } from '../models/gameState';
export declare type EntityAction = 'attack' | 'move' | 'spawn';
export declare type EntityType = 'infantry' | 'tank' | 'plane' | 'factory';
export declare type FactionId = '0' | '1' | '2' | '3';
export declare class GameEntity {
    id: string;
    x: number;
    y: number;
    factionId: FactionId;
    entityType: EntityType;
    health: number;
}
export declare class GameLogic {
    grid: Grid<GameHexagon>;
    entities: GameEntity[];
    generation: number;
    static buildGame(layout: GameLayout, gameState: GameState): GameLogic;
    static createGame(): GameLogic;
    static id: number;
    static nextId(): string;
    static validateVote(game: GameLogic, vote: {
        action: EntityAction;
        hexId: string;
        factionId: FactionId;
        entityId: string;
    }): boolean;
}
export declare type TileType = 'Dirt' | 'Grass' | 'Stone' | 'Clay' | 'Water';
export declare type TileSubType = '1' | '2' | '3' | '4' | '5';
export interface HexagonTileType {
    type: TileType;
    subType: TileSubType;
    cost: number;
    blocked: boolean;
}
export declare class HexagonTypes {
    static dirt: (subType: TileSubType) => HexagonTileType;
    static grass: (subType: TileSubType) => HexagonTileType;
    static clay: (subType: TileSubType) => HexagonTileType;
    static stone: (subType: TileSubType) => HexagonTileType;
    static water: (subType: TileSubType) => HexagonTileType;
    static randomSubType(): TileSubType;
    static get(type: TileType, subType: TileSubType): HexagonTileType;
}
export declare let EntityDetails: {
    [key in EntityType]: EntityDetail;
};
export interface EntityDetail {
    solid: boolean;
    moveRadius: number;
    attackRadius: number;
    spawnRadius: number;
    attackPower: number;
    ticksToSpawn: number;
    health: number;
    healthRegenRate: number;
}
export declare class GameHexagon extends Hexagon {
    tileType: HexagonTileType;
    id: string;
    factionId: FactionId;
    constructor(tileType: HexagonTileType, id: string, x: number, y: number);
    setTileType(tileType: HexagonTileType): void;
    setFactionId(factionId: FactionId): void;
}
