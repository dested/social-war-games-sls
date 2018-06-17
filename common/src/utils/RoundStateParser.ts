import {RoundState, RoundStateEntityVote} from '../models/roundState';
import {EntityAction} from '../game/entityDetail';
import {Utils} from './utils';

export class RoundStateParser {
    static fromRoundState(roundState: RoundState): Buffer {
        const hexIdParse = /(-?\d*)-(-?\d*)/;
        const buff = new ArrayBufferBuilder();

        buff.addInt32(roundState.generation);
        buff.addFloat64(roundState.thisUpdateTime);
        buff.addInt32(Object.keys(roundState.entities).length);
        for (const entityId in roundState.entities) {
            buff.addInt32(parseInt(entityId));
            buff.addInt32(roundState.entities[entityId].length);

            for (const entity of roundState.entities[entityId]) {
                const hexId = hexIdParse.exec(entity.hexId);
                const x = parseInt(hexId[1]);
                const y = parseInt(hexId[2]);

                buff.addInt16(entity.count);
                buff.addInt8(this.actionToInt(entity.action));
                buff.addInt16(x);
                buff.addInt16(y);
            }
        }
        return buff.buildBuffer();
    }

    static toRoundState(buffer: Uint8Array): RoundState {
        const reader = new ArrayBufferReader(buffer);
        const generation = reader.readInt32();
        const thisUpdateTime = reader.readFloat64();
        const entLength = reader.readInt32();

        const entities: {[id: number]: RoundStateEntityVote[]} = {};

        for (let i = 0; i < entLength; i++) {
            const entityId = reader.readInt32();
            const voteCount = reader.readInt32();
            const votes: RoundStateEntityVote[] = [];
            for (let v = 0; v < voteCount; v++) {
                const count = reader.readInt16();
                const action = this.intToAction(reader.readInt8());
                const hexId = reader.readInt16() + '-' + reader.readInt16();
                votes.push({
                    count,
                    action,
                    hexId
                });
            }
            entities[entityId] = votes;
        }
        const roundState = {
            generation,
            thisUpdateTime,
            entities
        };
        console.log(JSON.stringify(roundState).length, buffer.length);
        return roundState;
    }

    private static actionToInt(action: EntityAction): number {
        switch (action) {
            case 'attack':
                return 1;
            case 'move':
                return 2;
            case 'mine':
                return 3;
            case 'spawn-plane':
                return 4;
            case 'spawn-tank':
                return 5;
            case 'spawn-infantry':
                return 6;
        }
    }
    private static intToAction(action: number): EntityAction {
        switch (action) {
            case 1:
                return 'attack';
            case 2:
                return 'move';
            case 3:
                return 'mine';
            case 4:
                return 'spawn-plane';
            case 5:
                return 'spawn-tank';
            case 6:
                return 'spawn-infantry';
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
