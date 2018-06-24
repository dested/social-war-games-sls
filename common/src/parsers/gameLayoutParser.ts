import {EntityAction} from '../game/entityDetail';
import {TileSubType, TileType} from '../game/hexagonTypes';
import {GameLayout, GameLayoutHex} from '../models/gameLayout';
import {RoundState, RoundStateEntityVote} from '../models/roundState';
import {ArrayBufferBuilder, ArrayBufferReader} from '../utils/arrayBufferBuilder';
import {Utils} from '../utils/utils';
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
        return buff.buildBuffer();
    }

    static toGameLayout(buffer: Uint8Array): GameLayout {
        const reader = new ArrayBufferReader(buffer);
        const boardWidth = reader.readInt32();
        const boardHeight = reader.readInt32();
        const hexLength = reader.readInt32();

        const hexes: GameLayoutHex[] = [];

        for (let i = 0; i < hexLength; i++) {
            const hexId = ParserEnumUtils.readHexId(reader);
            const type = ParserEnumUtils.intToHexType(reader.readInt8());
            const subType = ParserEnumUtils.intToHexSubType(reader.readInt8());
            hexes.push({
                x: hexId.x,
                y: hexId.y,
                type,
                subType,
                id: hexId.id
            });
        }
        const gameLayout = {
            boardWidth,
            boardHeight,
            hexes
        };
        console.log(JSON.stringify(gameLayout).length, buffer.length);
        return gameLayout;
    }
}
