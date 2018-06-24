import {RoundState, RoundStateEntityVote} from '../models/roundState';
import {EntityAction} from '../game/entityDetail';
import {Utils} from '../utils/utils';
import {GameLayout, GameLayoutHex} from '../models/gameLayout';
import {TileSubType, TileType} from '../game/hexagonTypes';
import {ArrayBufferBuilder, ArrayBufferReader} from '../utils/arrayBufferBuilder';

export class GameLayoutParser {
    static fromGameLayout(gameLayout: GameLayout): Buffer {
        const hexIdParse = /(-?\d*)-(-?\d*)/;
        const buff = new ArrayBufferBuilder();
        buff.addInt32(gameLayout.boardWidth);
        buff.addInt32(gameLayout.boardHeight);
        buff.addInt32(gameLayout.hexes.length);
        for (const hex of gameLayout.hexes) {
            const hexId = hexIdParse.exec(hex.id);
            const x = parseInt(hexId[1]);
            const y = parseInt(hexId[2]);
            buff.addInt16(x);
            buff.addInt16(y);
            buff.addInt8(this.hexTypeToInt(hex.type));
            buff.addInt8(this.hexSubTypeToInt(hex.subType));
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
            const x = reader.readInt16();
            const y = reader.readInt16();
            const type = this.intToHexType(reader.readInt8());
            const subType = this.intToHexSubType(reader.readInt8());
            hexes.push({
                x,
                y,
                type,
                subType,
                id: x + '-' + y
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

    static hexTypeToInt(type: TileType): number {
        switch (type) {
            case 'Dirt':
                return 1;
            case 'Clay':
                return 2;
            case 'Grass':
                return 3;
            case 'Stone':
                return 4;
            case 'Water':
                return 5;
        }
    }

    static hexSubTypeToInt(type: TileSubType): number {
        switch (type) {
            case '1':
                return 1;
            case '2':
                return 2;
            case '3':
                return 3;
            case '4':
                return 4;
            case '5':
                return 5;
        }
    }

    static intToHexType(type: number): TileType {
        switch (type) {
            case 1:
                return 'Dirt';
            case 2:
                return 'Clay';
            case 3:
                return 'Grass';
            case 4:
                return 'Stone';
            case 5:
                return 'Water';
        }
    }

    static intToHexSubType(type: number): TileSubType {
        switch (type) {
            case 1:
                return '1';
            case 2:
                return '2';
            case 3:
                return '3';
            case 4:
                return '4';
            case 5:
                return '5';
        }
    }
}
