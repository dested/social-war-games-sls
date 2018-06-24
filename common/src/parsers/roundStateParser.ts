import {RoundState, RoundStateEntityVote} from '../models/roundState';
import {EntityAction} from '../game/entityDetail';
import {Utils} from '../utils/utils';
import {ArrayBufferBuilder, ArrayBufferReader} from '../utils/arrayBufferBuilder';

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

    static actionToInt(action: EntityAction): number {
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

    static intToAction(action: number): EntityAction {
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
