import {ProcessedVote} from '@swg-common/game/gameLogic';
import {VoteNote} from '@swg-common/models/voteNote';
import {FacingDirection} from '@swg-common/utils/hexUtils';
import {EntityAction, EntityType, OfFaction} from '../game/entityDetail';
import {ResourceType} from '../game/gameResource';
import {SDSimpleObject, SDTypeElement} from '@swg-common/schemaDefiner/schemaDefinerTypes';
import {SchemaDefiner} from '@swg-common/schemaDefiner/schemaDefiner';

export interface GameState {
  gameId: string;
  factions: number[];
  factionDetails: OfFaction<FactionDetail>;
  entities: OfFaction<GameStateEntity[]>;
  resources: GameStateResource[];
  generation: number;
  roundDuration: number;
  roundStart: number;
  roundEnd: number;

  totalPlayersVoted: number;
  winningVotes: OfFaction<ProcessedVote[]>;
  playersVoted: OfFaction<number>;
  scores: OfFaction<number>;
  hotEntities: OfFaction<{id: number; count: number}[]>;
  notes: OfFaction<VoteNote[]>;
}

export const GameStateSchema: SDSimpleObject<GameState> = {
  gameId: 'string',
  factions: {
    flag: 'byte-array',
    elements: 'bit',
  },
  factionDetails: {
    '1': {
      resourceCount: 'uint16',
    },
    2: {
      resourceCount: 'uint16',
    },
    '3': {
      resourceCount: 'uint16',
    },
  },
  entities: {
    '1': {
      flag: 'array-uint16',
      elements: {
        x: 'int16',
        y: 'int16',
        health: 'uint8',
        id: 'uint32',
        healthRegenStep: 'uint8',
        facingDirection: 'uint8',
        entityType: {flag: 'enum', factory: 1, infantry: 2, plane: 3, tank: 4},
        busy: {
          flag: 'optional',
          element: {
            action: {
              flag: 'enum',
              'spawn-infantry': 1,
              'spawn-tank': 2,
              'spawn-plane': 3,
              attack: 4,
              mine: 5,
              move: 6,
            },
            hexId: 'string',
            ticks: 'uint32',
          },
        },
      },
    },
    2: {
      flag: 'array-uint16',
      elements: {
        x: 'int16',
        y: 'int16',
        health: 'uint8',
        id: 'uint32',
        healthRegenStep: 'uint8',
        facingDirection: 'uint8',
        entityType: {flag: 'enum', factory: 1, infantry: 2, plane: 3, tank: 4},
        busy: {
          flag: 'optional',
          element: {
            action: {
              flag: 'enum',
              'spawn-infantry': 1,
              'spawn-tank': 2,
              'spawn-plane': 3,
              attack: 4,
              mine: 5,
              move: 6,
            },
            hexId: 'string',
            ticks: 'uint32',
          },
        },
      },
    },
    '3': {
      flag: 'array-uint16',
      elements: {
        x: 'int16',
        y: 'int16',
        health: 'uint8',
        id: 'uint32',
        healthRegenStep: 'uint8',
        facingDirection: 'uint8',
        entityType: {flag: 'enum', factory: 1, infantry: 2, plane: 3, tank: 4},
        busy: {
          flag: 'optional',
          element: {
            action: {
              flag: 'enum',
              'spawn-infantry': 1,
              'spawn-tank': 2,
              'spawn-plane': 3,
              attack: 4,
              mine: 5,
              move: 6,
            },
            hexId: 'string',
            ticks: 'uint32',
          },
        },
      },
    },
  },
  resources: {
    flag: 'array-uint16',
    elements: {
      count: 'uint16',
      type: {flag: 'enum', silver: 1, gold: 2, bronze: 3},
      x: 'int16',
      y: 'int16',
    },
  },
  generation: 'uint16',
  roundDuration: 'uint16',
  roundStart: 'float64',
  roundEnd: 'float64',

  totalPlayersVoted: 'uint16',
  winningVotes: {
    '1': {
      flag: 'array-uint16',
      elements: {
        action: {
          flag: 'enum',
          mine: 1,
          attack: 2,
          'spawn-tank': 3,
          'spawn-plane': 4,
          'spawn-infantry': 5,
          move: 6,
        },
        entityId: 'uint32',
        hexId: 'string',
        factionId: {
          flag: 'number-enum',
          1: 1,
          2: 2,
          3: 3,
        },
        path: {
          flag: 'optional',
          element: {
            flag: 'array-uint8',
            elements: 'string',
          },
        },
        voteCount: {
          flag: 'optional',
          element: 'uint16',
        },
      },
    },
    2: {
      flag: 'array-uint16',
      elements: {
        action: {
          flag: 'enum',
          mine: 1,
          attack: 2,
          'spawn-tank': 3,
          'spawn-plane': 4,
          'spawn-infantry': 5,
          move: 6,
        },
        entityId: 'uint32',
        hexId: 'string',
        factionId: {
          flag: 'number-enum',
          1: 1,
          2: 2,
          3: 3,
        },
        path: {
          flag: 'optional',
          element: {
            flag: 'array-uint8',
            elements: 'string',
          },
        },
        voteCount: {
          flag: 'optional',
          element: 'uint16',
        },
      },
    },
    3: {
      flag: 'array-uint16',
      elements: {
        action: {
          flag: 'enum',
          mine: 1,
          attack: 2,
          'spawn-tank': 3,
          'spawn-plane': 4,
          'spawn-infantry': 5,
          move: 6,
        },
        entityId: 'uint32',
        hexId: 'string',
        factionId: {
          flag: 'number-enum',
          1: 1,
          2: 2,
          3: 3,
        },
        path: {
          flag: 'optional',
          element: {
            flag: 'array-uint8',
            elements: 'string',
          },
        },
        voteCount: {
          flag: 'optional',
          element: 'uint16',
        },
      },
    },
  },
  playersVoted: {
    1: 'uint16',
    2: 'uint16',
    3: 'uint16',
  },
  scores: {
    1: 'uint32',
    2: 'uint32',
    3: 'uint32',
  },
  hotEntities: {
    1: {
      flag: 'array-uint16',
      elements: {
        count: 'uint16',
        id: 'uint32',
      },
    },
    2: {
      flag: 'array-uint16',
      elements: {
        count: 'uint16',
        id: 'uint32',
      },
    },
    3: {
      flag: 'array-uint16',
      elements: {
        count: 'uint16',
        id: 'uint32',
      },
    },
  },
  notes: {
    1: {
      flag: 'array-uint16',
      elements: {
        action: {
          flag: 'enum',
          'spawn-infantry': 1,
          'spawn-plane': 2,
          'spawn-tank': 3,
          attack: 4,
          mine: 5,
          move: 6,
        },
        factionId: {
          flag: 'number-enum',
          1: 1,
          2: 2,
          3: 3,
        },
        fromEntityId: 'int16',
        fromHexId: 'string',
        note: 'string',
        path: {
          flag: 'array-uint8',
          elements: 'string',
        },
        toEntityId: {
          flag: 'optional',
          element: 'uint32',
        },
        toHexId: 'string',
        voteCount: 'uint16',
      },
    },
    2: {
      flag: 'array-uint16',
      elements: {
        action: {
          flag: 'enum',
          'spawn-infantry': 1,
          'spawn-plane': 2,
          'spawn-tank': 3,
          attack: 4,
          mine: 5,
          move: 6,
        },
        factionId: {
          flag: 'number-enum',
          1: 1,
          2: 2,
          3: 3,
        },
        fromEntityId: 'int16',
        fromHexId: 'string',
        note: 'string',
        path: {
          flag: 'array-uint8',
          elements: 'string',
        },
        toEntityId: {
          flag: 'optional',
          element: 'uint32',
        },
        toHexId: 'string',
        voteCount: 'uint16',
      },
    },
    3: {
      flag: 'array-uint16',
      elements: {
        action: {
          flag: 'enum',
          'spawn-infantry': 1,
          'spawn-plane': 2,
          'spawn-tank': 3,
          attack: 4,
          mine: 5,
          move: 6,
        },
        factionId: {
          flag: 'number-enum',
          1: 1,
          2: 2,
          3: 3,
        },
        fromEntityId: 'int16',
        fromHexId: 'string',
        note: 'string',
        path: {
          flag: 'array-uint8',
          elements: 'string',
        },
        toEntityId: {
          flag: 'optional',
          element: 'uint32',
        },
        toHexId: 'string',
        voteCount: 'uint16',
      },
    },
  },
};

export const GameStateSchemaReaderFunction = SchemaDefiner.generateReaderFunction(GameStateSchema);
export const GameStateSchemaAdderFunction = SchemaDefiner.generateAdderFunction(GameStateSchema);
export const GameStateSchemaAdderSizeFunction = SchemaDefiner.generateAdderSizeFunction(GameStateSchema);

export interface FactionDetail {
  resourceCount: number;
}

export interface GameStateEntity {
  x: number;
  y: number;
  id: number;
  busy?: GameStateGameEntityBusyDetails;
  entityType: EntityType;
  health: number;
  healthRegenStep: number;
  facingDirection: FacingDirection;
}

export interface GameStateGameEntityBusyDetails {
  ticks: number;
  action: EntityAction;
  hexId: string;
}

export interface GameStateResource {
  x: number;
  y: number;
  count: number;
  type: ResourceType;
}
