import { Grid, Hexagon } from 'swg-common/bin/hex/hex';
export declare class GameEntity {
    id: string;
    x: number;
    y: number;
    entityType: 'infantry' | 'tank' | 'plane' | 'factory';
    health: number;
}
export declare class GameLogic {
    grid: Grid<GameHexagon>;
    entities: GameEntity[];
    static createGame(): GameLogic;
}
export declare type TileType = 'Dirt' | 'Grass' | 'Stone' | 'Clay';
export interface HexagonType {
    type: TileType;
    cost: number;
    blocked: boolean;
}
export declare class HexagonTypes {
    static dirt: HexagonType;
    static grass: HexagonType;
    static stone: HexagonType;
    static clay: HexagonType;
}
export declare class GameHexagon extends Hexagon {
    type: HexagonType;
    id: string;
    factionId: string;
    constructor(type: HexagonType, id: string, x: number, y: number);
    setType(type: HexagonType): void;
    setFactionId(factionId: string): void;
}
