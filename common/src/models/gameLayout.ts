import {TileSubType, TileType} from '../game/hexagonTypes';
import {customSchemaTypes} from '@swg-common/models/customSchemaTypes';
import {generateSchema, makeSchema} from 'safe-schema';

export interface GameLayout {
  boardWidth: number;
  boardHeight: number;
  hexes: GameLayoutHex[];
}
export interface GameLayoutHex {
  x: number;
  y: number;
  type: TileType;
  subType: TileSubType;
}
export const GameLayoutSchema = makeSchema<GameLayout, typeof customSchemaTypes>({
  boardWidth: 'uint16',
  boardHeight: 'uint16',
  hexes: {
    flag: 'array-uint16',
    elements: {
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
});

export const GameLayoutSchemaGenerator = generateSchema<GameLayout, typeof customSchemaTypes>(
  GameLayoutSchema,
  customSchemaTypes
);
