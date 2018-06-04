import {GameAction, GameActionOptions} from './actions';
import {RoundState} from '@swg-common/models/roundState';
import {GameModel} from '@swg-common/game/gameLogic';
import {EntityAction, GameEntity} from '@swg-common/game/entityDetail';

const initialState: GameStore = {};

export interface GameStore {
    game?: GameModel;
    roundState?: RoundState;
    selectedEntity?: GameEntity;
    selectedEntityAction?: EntityAction;
    viableHexIds?: {[hexId: string]: boolean};
    imagesLoading?: number;
    isVoting?: boolean;
    votingError?: boolean;
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
                isVoting: action.isVoting,
                votingError: false
            };
        }
        case GameActionOptions.VotingError: {
            return {
                ...state,
                votingError: true
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
