import {GameLayout, GameLayoutHex} from '../models/gameLayout';
import {ArrayBufferBuilder, ArrayBufferReader} from '../utils/arrayBufferBuilder';
import {ParserEnumUtils} from './parserEnumUtils';

export class GameLayoutParser {
  static fromGameLayout(gameLayout: GameLayout): Buffer {
    const buff = new ArrayBufferBuilder();
    buff.addInt32(gameLayout.boardWidth);
    buff.addInt32(gameLayout.boardHeight);
    buff.addInt32(gameLayout.hexes.length);
    for (const hex of gameLayout.hexes) {
      ParserEnumUtils.writeHexId(hex.id, buff);
      buff.addInt8(ParserEnumUtils.hexTypeToInt(hex.type));
      buff.addInt8(ParserEnumUtils.hexSubTypeToInt(hex.subType));
    }
    return buff.buildBuffer(null);
  }

  static toGameLayout(buffer: ArrayBuffer): GameLayout {
    const reader = new ArrayBufferReader(buffer);
    const boardWidth = reader.readInt32();
    const boardHeight = reader.readInt32();
    const hexLength = reader.readInt32();

    const hexes: GameLayoutHex[] = [];

    for (let i = 0; i < hexLength; i++) {
      const hexId = ParserEnumUtils.readHex(reader);
      const type = ParserEnumUtils.intToHexType(reader.readInt8());
      const subType = ParserEnumUtils.intToHexSubType(reader.readInt8());
      hexes.push({
        x: hexId.x,
        y: hexId.y,
        type,
        subType,
        id: hexId.id,
      });
    }
    const gameLayout = {
      boardWidth,
      boardHeight,
      hexes,
    };
    return gameLayout;
  }
}
