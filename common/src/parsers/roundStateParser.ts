import {EntityAction} from '../game/entityDetail';
import {RoundState, RoundStateEntityVote} from '../models/roundState';
import {ArrayBufferBuilder, ArrayBufferReader} from '../utils/arrayBufferBuilder';
import {Utils} from '../utils/utils';
import {ParserEnumUtils} from './parserEnumUtils';

export class RoundStateParser {
    static fromRoundState(roundState: RoundState): Buffer {
        const buff = new ArrayBufferBuilder();

        buff.addInt32(roundState.generation);
        buff.addFloat64(roundState.thisUpdateTime);
        buff.addInt32(Object.keys(roundState.entities).length);
        for (const entityId in roundState.entities) {
            buff.addInt32(parseInt(entityId));
            buff.addInt32(roundState.entities[entityId].length);

            for (const entity of roundState.entities[entityId]) {
                buff.addInt16(entity.count);
                buff.addInt8(ParserEnumUtils.actionToInt(entity.action));
                ParserEnumUtils.writeHexId(entity.hexId, buff);
            }
        }
        return buff.buildBuffer(null);
    }

    static toRoundState(buffer: ArrayBuffer): RoundState {
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
                const action = ParserEnumUtils.intToAction(reader.readInt8());
                const hexId = ParserEnumUtils.readHexId(reader);
                votes.push({
                    count,
                    action,
                    hexId: hexId.id
                });
            }
            entities[entityId] = votes;
        }
        const roundState = {
            generation,
            thisUpdateTime,
            entities
        };
        return roundState;
    }
}
