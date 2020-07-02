import {EntityAction} from '../game/entityDetail';
import {CustomSchemaTypes, SDElement, SDSimpleObject} from '@swg-common/schemaDefiner/schemaDefinerTypes';
import {SchemaDefiner} from '@swg-common/schemaDefiner/schemaDefiner';
import {Utils} from '@swg-common/utils/utils';
import {ArrayBufferBuilder, ArrayBufferReader} from '@swg-common/schemaDefiner/parsers/arrayBufferBuilder';
import {customSchemaTypes} from '@swg-common/models/customSchemaTypes';

export interface RoundState {
  thisUpdateTime: number;
  generation: number;
  entities: {[entityId: number]: RoundStateEntityVote[]};
}

export function RoundStateToModel(roundState: RoundState): RoundStateModel {
  return {
    generation: roundState.generation,
    thisUpdateTime: roundState.thisUpdateTime,
    entityVotes: Object.keys(roundState.entities).map((e) => ({
      entityId: parseInt(e),
      entities: roundState.entities[parseInt(e)],
    })),
  };
}
export function RoundStateModelToRoundState(roundState: RoundStateModel): RoundState {
  return {
    generation: roundState.generation,
    thisUpdateTime: roundState.thisUpdateTime,
    entities: Utils.groupByReduce(
      roundState.entityVotes,
      (a) => a.entityId,
      (a) => Utils.flattenArray(a.map((b) => b.entities))
    ),
  };
}

export interface RoundStateModel {
  thisUpdateTime: number;
  generation: number;
  entityVotes: RoundStateEntityVoteEntity[];
}
export type RoundStateEntityVoteEntity = {
  entityId: number;
  entities: RoundStateEntityVote[];
};
export type RoundStateEntityVote = {
  action: EntityAction;
  hexId: string;
  count: number;
};

export const RoundStateSchema: SDSimpleObject<RoundStateModel, keyof typeof customSchemaTypes> = {
  generation: 'uint32',
  thisUpdateTime: 'float64',
  entityVotes: {
    flag: 'array-uint16',
    elements: {
      entityId: 'uint32',
      entities: {
        flag: 'array-uint16',
        elements: {
          action: {
            flag: 'enum',
            attack: 1,
            move: 2,
            'spawn-infantry': 3,
            'spawn-tank': 4,
            'spawn-plane': 5,
            mine: 6,
          },
          hexId: 'hexId',
          count: 'uint16',
        },
      },
    },
  },
};

const RoundStateSchemaReaderFunction = SchemaDefiner.generateReaderFunction(RoundStateSchema, customSchemaTypes);
const RoundStateSchemaAdderFunction = SchemaDefiner.generateAdderFunction(RoundStateSchema, customSchemaTypes);
const RoundStateSchemaAdderSizeFunction = SchemaDefiner.generateAdderSizeFunction(RoundStateSchema, customSchemaTypes);

export function RoundStateRead(buffer: ArrayBuffer): RoundState {
  return RoundStateModelToRoundState(
    SchemaDefiner.startReadSchemaBuffer(buffer, RoundStateSchemaReaderFunction, customSchemaTypes)
  );
}
export function RoundStateWrite(roundState: RoundState): ArrayBuffer {
  return SchemaDefiner.startAddSchemaBuffer(
    RoundStateToModel(roundState),
    RoundStateSchemaAdderSizeFunction,
    RoundStateSchemaAdderFunction,
    customSchemaTypes
  );
}
