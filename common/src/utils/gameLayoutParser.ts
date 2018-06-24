import {RoundState, RoundStateEntityVote} from '../models/roundState';
import {EntityAction} from '../game/entityDetail';
import {Utils} from './utils';
import {GameLayout, GameLayoutHex} from '../models/gameLayout';
import {TileSubType, TileType} from '../game/hexagonTypes';

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

    private static hexTypeToInt(type: TileType): number {
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

    private static hexSubTypeToInt(type: TileSubType): number {
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

    private static intToHexType(type: number): TileType {
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

    private static intToHexSubType(type: number): TileSubType {
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

export class ArrayBufferBuilder {
    private array: {value: number; float: boolean; size: 8 | 16 | 32 | 64}[] = [];

    addFloat32(value: number) {
        this.array.push({
            value,
            float: true,
            size: 32
        });
    }

    addFloat64(value: number) {
        this.array.push({
            value,
            float: true,
            size: 64
        });
    }

    addInt8(value: number) {
        this.array.push({
            value,
            float: false,
            size: 8
        });
    }

    addInt16(value: number) {
        this.array.push({
            value,
            float: false,
            size: 16
        });
    }

    addInt32(value: number) {
        this.array.push({
            value,
            float: false,
            size: 32
        });
    }

    buildBuffer(): Buffer {
        const size = Utils.sum(this.array, a => a.size / 8);
        const buffer = new ArrayBuffer(size);
        const view = new DataView(buffer);
        let curPosition = 0;
        for (const ele of this.array) {
            if (ele.float) {
                switch (ele.size) {
                    case 32:
                        view.setFloat32(curPosition, ele.value);
                        curPosition += 4;
                        break;
                    case 64:
                        view.setFloat64(curPosition, ele.value);
                        curPosition += 8;
                        break;
                }
            } else {
                switch (ele.size) {
                    case 8:
                        view.setInt8(curPosition, ele.value);
                        curPosition += 1;
                        break;
                    case 16:
                        view.setInt16(curPosition, ele.value);
                        curPosition += 2;
                        break;
                    case 32:
                        view.setInt32(curPosition, ele.value);
                        curPosition += 4;
                        break;
                }
            }
        }
        return Buffer.from(buffer);
    }
}

export class ArrayBufferReader {
    private index: number;
    private dv: DataView;

    constructor(private buffer: Uint8Array) {
        this.dv = new DataView(new Uint8Array(buffer).buffer);
        this.index = 0;
    }

    readFloat32(): number {
        const result = this.dv.getFloat32(this.index);
        this.index += 4;
        return result;
    }

    readFloat64(): number {
        const result = this.dv.getFloat64(this.index);
        this.index += 8;
        return result;
    }

    readInt8(): number {
        const result = this.dv.getInt8(this.index);
        this.index += 1;
        return result;
    }

    readInt16(): number {
        const result = this.dv.getInt16(this.index);
        this.index += 2;
        return result;
    }

    readInt32(): number {
        const result = this.dv.getInt32(this.index);
        this.index += 4;
        return result;
    }
}
