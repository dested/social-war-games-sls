import {EntityType, GameEntityBusyDetails, OfFaction, PlayableFactionId} from '../game/entityDetail';
import {FactionDetail} from '../game/factionDetail';
import {ResourceType} from '../game/gameResource';
import {GameState, GameStateEntity, GameStateResource} from '../models/gameState';
import {ArrayBufferBuilder, ArrayBufferReader} from '../utils/arrayBufferBuilder';
import {ParserEnumUtils} from './parserEnumUtils';

export class GameStateParser {
    static fromGameState(gameState: GameState): Buffer {
        const buff = new ArrayBufferBuilder();
        buff.addInt32(gameState.generation);
        buff.addInt32(gameState.roundDuration);
        buff.addFloat64(gameState.roundStart);
        buff.addFloat64(gameState.roundEnd);
        buff.addInt16(gameState.resources.length);

        for (const resource of gameState.resources) {
            buff.addInt16(resource.x);
            buff.addInt16(resource.y);
            buff.addInt8(resource.count);
            buff.addInt8(ParserEnumUtils.resourceTypeToInt(resource.type));
        }

        buff.addInt8(Object.keys(gameState.entities).length);
        for (const factionKey in gameState.entities) {
            buff.addInt8(parseInt(factionKey));
            const entities = gameState.entities[factionKey as PlayableFactionId];
            buff.addInt16(entities.length);
            for (const entity of entities) {
                buff.addInt32(entity.id);
                buff.addInt16(entity.x);
                buff.addInt16(entity.y);
                buff.addInt8(entity.healthRegenStep);
                buff.addInt8(entity.health);
                buff.addInt8(ParserEnumUtils.entityTypeToInt(entity.entityType));
                buff.addInt8(entity.busy ? 1 : 0);
                if (entity.busy) {
                    buff.addInt8(entity.busy.ticks);
                    buff.addInt8(ParserEnumUtils.actionToInt(entity.busy.action));
                    ParserEnumUtils.writeHexId(entity.busy.hexId, buff);
                }
            }
        }

        buff.addInt8(Object.keys(gameState.factionDetails).length);
        for (const factionsKey in gameState.factionDetails) {
            buff.addInt8(parseInt(factionsKey));
            buff.addInt32(gameState.factionDetails[factionsKey as PlayableFactionId].resourceCount);
        }

        let empty = 0;
        let hidden = 0;

        function tryFlushHidden() {
            if (hidden > 0) {
                buff.addUint8(1);
                buff.addInt32(hidden);
                hidden = 0;
            }
        }

        function tryFlushEmpty() {
            if (empty > 0) {
                buff.addUint8(2);
                buff.addInt32(empty);
                empty = 0;
            }
        }

        for (let i = 0; i < gameState.factions.length; i += 2) {
            const factionId = parseInt(gameState.factions.charAt(i));
            const duration = parseInt(gameState.factions.charAt(i + 1));

            if (factionId === 9 && duration === 0) {
                tryFlushEmpty();
                hidden++;
                continue;
            }
            if (factionId === 0 && duration === 0) {
                tryFlushHidden();
                empty++;
                continue;
            }
            tryFlushEmpty();
            tryFlushHidden();

            buff.addUint8(3);
            buff.addInt8(factionId);
            buff.addInt8(duration);
        }
        tryFlushEmpty();
        tryFlushHidden();
        buff.addUint8(255);

        return buff.buildBuffer();
    }

    static toGameState(buffer: Uint8Array): GameState {
        const reader = new ArrayBufferReader(buffer);
        const generation = reader.readInt32();
        const roundDuration = reader.readInt32();
        const roundStart = reader.readFloat64();
        const roundEnd = reader.readFloat64();

        const resourcesLength = reader.readInt16();
        const resources: GameStateResource[] = [];
        for (let i = 0; i < resourcesLength; i++) {
            const x = reader.readInt16();
            const y = reader.readInt16();
            const count = reader.readInt8();
            const type = ParserEnumUtils.intToResourceType(reader.readInt8());
            resources.push({
                x,
                y,
                type,
                count
            });
        }

        const entitiesFactionsLength = reader.readInt8();
        const entities: OfFaction<GameStateEntity[]> = {} as any;

        for (let f = 0; f < entitiesFactionsLength; f++) {
            const factionId = reader.readInt8().toString() as PlayableFactionId;
            const entitiesLength = reader.readInt16();
            const entitiesInFaction: GameStateEntity[] = [];

            for (let e = 0; e < entitiesLength; e++) {
                const id = reader.readInt32();
                const x = reader.readInt16();
                const y = reader.readInt16();
                const healthRegenStep = reader.readInt8();
                const health = reader.readInt8();
                const entityType = ParserEnumUtils.intToEntityType(reader.readInt8());
                const isBusy = reader.readInt8() === 1;
                let busy: GameEntityBusyDetails;

                if (isBusy) {
                    const ticks = reader.readInt8();
                    const action = ParserEnumUtils.intToAction(reader.readInt8());
                    const hexId = ParserEnumUtils.readHexId(reader);
                    busy = {
                        ticks,
                        action,
                        hexId: hexId.id
                    };
                }

                entitiesInFaction.push({
                    x,
                    y,
                    entityType,
                    health,
                    id,
                    healthRegenStep,
                    busy
                });
            }
            entities[factionId] = entitiesInFaction;
        }

        const factionDetailsLength = reader.readInt8();
        const factionDetails: OfFaction<FactionDetail> = {} as any;
        for (let i = 0; i < factionDetailsLength; i++) {
            const factionKey = reader.readInt8().toString() as PlayableFactionId;
            const resourceCount = reader.readInt32();
            factionDetails[factionKey] = {
                resourceCount
            };
        }

        const factions: string[] = [];
        let over = false;
        while (!over) {
            const type = reader.readUint8();
            switch (type) {
                case 1:
                    {
                        const len = reader.readInt32();
                        for (let i = 0; i < len; i++) {
                            factions.push('9');
                            factions.push('0');
                        }
                    }
                    break;
                case 2:
                    {
                        const len = reader.readInt32();
                        for (let i = 0; i < len; i++) {
                            factions.push('0');
                            factions.push('0');
                        }
                    }
                    break;
                case 3:
                    factions.push(reader.readInt8().toString());
                    factions.push(reader.readInt8().toString());
                    break;
                case 255:
                    over = true;
                    break;
            }
        }
        const gameState = {
            factions: factions.join(''),
            factionDetails,
            resources,
            entities,
            generation,
            roundDuration,
            roundStart,
            roundEnd
        };

        console.log(JSON.stringify(gameState).length, buffer.length);
        return gameState;
    }
}
