import {TileSubType, TileType} from '../game';

export type GameLayout = {hexes: GameLayoutHex[]};
export type GameLayoutHex = {x: number; y: number; id: string; type: TileType; subType: TileSubType};
