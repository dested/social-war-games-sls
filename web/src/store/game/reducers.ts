import {GameAction, GameActionOptions} from './actions';
import {EntityAction, GameEntity, GameLogic} from '../../../../common/src/game';

const initialState: GameStore = {};

export interface GameStore {
    game?: GameLogic;
    selectedEntity?: GameEntity;
    selectedEntityAction?: EntityAction;
    viableHexIds?: string[];
    isVoting?: boolean;
}

export default function gameReducer(state: GameStore = initialState, action: GameAction): GameStore {
    switch (action.type) {
        case GameActionOptions.SelectEntity: {
            return {
                ...state,
                selectedEntity: action.entity,
                selectedEntityAction: undefined,
                viableHexIds: undefined
            };
        }
        case GameActionOptions.SetGame: {
            return {
                ...state,
                game: action.game
            };
        }
        case GameActionOptions.Voting: {
            return {
                ...state,
                isVoting: action.isVoting
            };
        }
        case GameActionOptions.SetEntityAction: {
            return {
                ...state,
                selectedEntity: action.entity,
                selectedEntityAction: action.action,
                viableHexIds: action.viableHexIds
            };
        }
    }
    return state;
}
