import {TileSubType, TileType} from '../game/hexagonTypes';

export type GameLayout = {boardWidth: number; boardHeight: number; hexes: GameLayoutHex[]};
export type GameLayoutHex = {x: number; y: number; id: string; type: TileType; subType: TileSubType};
