import { Grid, Hexagon } from '../hex/hex';
export declare type EntityAction = 'attack' | 'move' | 'spawn';
export declare class GameEntity {
    id: string;
    x: number;
    y: number;
    factionId: FactionId;
    entityType: 'infantry' | 'tank' | 'plane' | 'factory';
    health: number;
}
export declare class GameLogic {
    grid: Grid<GameHexagon>;
    entities: GameEntity[];
    static createGame(): GameLogic;
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
    static stone: (subType: TileSubType) => HexagonTileType;
    static clay: (subType: TileSubType) => HexagonTileType;
    static water: (subType: TileSubType) => HexagonTileType;
    static randomSubType(): TileSubType;
}
export declare type FactionId = '0' | '1' | '2' | '3';
export declare class GameHexagon extends Hexagon {
    tileType: HexagonTileType;
    id: string;
    factionId: FactionId;
    constructor(tileType: HexagonTileType, id: string, x: number, y: number);
    setTileType(tileType: HexagonTileType): void;
    setFactionId(factionId: FactionId): void;
}
