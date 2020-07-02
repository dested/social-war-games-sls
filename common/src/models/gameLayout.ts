import {TileSubType, TileType} from '../game/hexagonTypes';
import {SDSimpleObject} from '@swg-common/schemaDefiner/schemaDefinerTypes';
import {SchemaDefiner} from '@swg-common/schemaDefiner/schemaDefiner';

export interface GameLayout {
  boardWidth: number;
  boardHeight: number;
  hexes: GameLayoutHex[];
}
export interface GameLayoutHex {
  x: number;
  y: number;
  id: string;
  type: TileType;
  subType: TileSubType;
}
export const GameLayoutSchema: SDSimpleObject<GameLayout> = {
  boardWidth: 'uint16',
  boardHeight: 'uint16',
  hexes: {
    flag: 'array-uint16',
    elements: {
      id: 'string',
      x: 'int16',
      y: 'int16',
      subType: {
        flag: 'enum',
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
      },
      type: {
        flag: 'enum',
        Clay: 1,
        Dirt: 2,
        Grass: 3,
        Stone: 4,
        Water: 5,
      },
    },
  },
};

export const GameLayoutSchemaReaderFunction = SchemaDefiner.generateReaderFunction(GameLayoutSchema);
export const GameLayoutSchemaAdderFunction = SchemaDefiner.generateAdderFunction(GameLayoutSchema);
export const GameLayoutSchemaAdderSizeFunction = SchemaDefiner.generateAdderSizeFunction(GameLayoutSchema);
