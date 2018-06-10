import {GameAction, GameActionOptions} from './actions';
import {RoundState} from '@swg-common/models/roundState';
import {GameModel} from '@swg-common/game/gameLogic';
import {EntityAction, GameEntity} from '@swg-common/game/entityDetail';
import {GameResource} from '@swg-common/game/gameResource';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {VoteResult} from '@swg-common/game/voteResult';
import {GameRenderer} from '../../drawing/gameRenderer';

const initialState: GameStore = {};

export interface GameStore {
    game?: GameModel;
    roundState?: RoundState;
    selectedResource?: GameResource;
    userDetails?: UserDetails;
    selectedEntity?: GameEntity;
    selectedEntityAction?: EntityAction;
    viableHexIds?: {[hexId: string]: boolean};
    imagesLoading?: number;
    isVoting?: boolean;
    votingError?: VoteResult;
    gameRenderer?: GameRenderer;
}

export default function gameReducer(state: GameStore = initialState, action: GameAction): GameStore {
    switch (action.type) {
        case GameActionOptions.SelectEntity: {
            return {
                ...state,
                selectedEntity: action.entity,
                selectedResource: undefined,
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
        case GameActionOptions.SetGameRenderer: {
            return {
                ...state,
                gameRenderer: action.gameRenderer
            };
        }
        case GameActionOptions.UpdateUserDetails: {
            return {
                ...state,
                userDetails: action.userDetails
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
                votingError: null
            };
        }
        case GameActionOptions.VotingError: {
            return {
                ...state,
                votingError: action.votingError
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
        case GameActionOptions.SelectResource: {
            return {
                ...state,
                selectedResource: action.resource,
                selectedEntity: undefined,
                selectedEntityAction: undefined,
                viableHexIds: undefined
            };
        }
    }
    return state;
}
