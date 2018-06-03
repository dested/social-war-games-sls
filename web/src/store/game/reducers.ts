import {GameAction, GameActionOptions} from './actions';
import {EntityAction, GameEntity, GameModel} from '@swg-common/game';
import {RoundState} from '@swg-common/models/roundState';

const initialState: GameStore = {};

export interface GameStore {
    game?: GameModel;
    roundState?: RoundState;
    selectedEntity?: GameEntity;
    selectedEntityAction?: EntityAction;
    viableHexIds?: {[hexId: string]: boolean};
    imagesLoading?: number;
    isVoting?: boolean;
}

export default function gameReducer(
    state: GameStore = initialState,
    action: GameAction
): GameStore {
    switch (action.type) {
        case GameActionOptions.SelectEntity: {
            return {
                ...state,
                selectedEntity: action.entity,
                selectedEntityAction: undefined,
                viableHexIds: undefined
            };
        }
        case GameActionOptions.UpdateGame: {
            return {
                ...state,
                game: action.game,
                roundState: action.roundState
            };
        }
        case GameActionOptions.SetImagesLoading: {
            return {
                ...state,
                imagesLoading: action.imagesLoading
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
