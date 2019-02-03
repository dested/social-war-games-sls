import {ActionRoute, EntityAction, GameEntity} from '@swg-common/game/entityDetail';
import {GameModel, ProcessedVote} from '@swg-common/game/gameLogic';
import {GameResource} from '@swg-common/game/gameResource';
import {VoteResult} from '@swg-common/game/voteResult';
import {GameLayout} from '@swg-common/models/gameLayout';
import {GameState} from '@swg-common/models/gameState';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {RoundState} from '@swg-common/models/roundState';
import {VoteNote} from '@swg-common/models/voteNote';
import {GameRenderer} from '../../drawing/gameRenderer';
import {SmallGameRenderer} from '../../drawing/smallGameRenderer';
import {GameAction, GameActionOptions} from './actions';

const initialState: GameStore = {
  localVotes: [],
};

export interface GameStore {
  game?: GameModel;
  roundState?: RoundState;
  localRoundState?: RoundState;
  selectedResource?: GameResource;
  userDetails?: UserDetails;
  selectedEntity?: GameEntity;
  selectedEntityAction?: EntityAction;
  viableHexIds?: {[hexId: string]: boolean};
  imagesLoading?: number;
  isVoting?: boolean;
  votingError?: VoteResult;
  gameRenderer?: GameRenderer;
  smallGameRenderer?: SmallGameRenderer;
  localVotes: (ProcessedVote & {processedTime: number})[];
  gameState?: GameState;
  gameReady?: boolean;
  layout?: GameLayout;
  lastRoundActions?: ActionRoute[];
}

export default function gameReducer(state: GameStore = initialState, action: GameAction): GameStore {
  switch (action.type) {
    case GameActionOptions.SelectEntity: {
      return {
        ...state,
        selectedEntity: action.entity,
        selectedResource: undefined,
        selectedEntityAction: undefined,
        viableHexIds: undefined,
      };
    }
    case GameActionOptions.UpdateGame: {
      return {
        ...state,
        game: action.game,
        roundState: action.roundState,
        localRoundState: action.localRoundState,
      };
    }
    case GameActionOptions.SetGameRenderer: {
      return {
        ...state,
        gameRenderer: action.gameRenderer,
        smallGameRenderer: action.smallGameRenderer,
      };
    }
    case GameActionOptions.AddLocalVote: {
      return {
        ...state,
        localVotes: [...state.localVotes, action.vote],
      };
    }
    case GameActionOptions.ResetLocalVotes: {
      return {
        ...state,
        localVotes: [],
      };
    }
    case GameActionOptions.RemoveLocalVote: {
      const localVotes = state.localVotes.slice();
      localVotes.splice(
        localVotes.findIndex(
          a => a.hexId === action.vote.hexId && a.entityId === action.vote.entityId && a.action === action.vote.action
        ),
        1
      );
      return {
        ...state,
        localVotes,
      };
    }
    case GameActionOptions.UpdateUserDetails: {
      return {
        ...state,
        userDetails: action.userDetails,
      };
    }
    case GameActionOptions.SetImagesLoading: {
      return {
        ...state,
        imagesLoading: action.imagesLoading,
      };
    }
    case GameActionOptions.Voting: {
      return {
        ...state,
        isVoting: action.isVoting,
        votingError: null,
      };
    }
    case GameActionOptions.VotingError: {
      return {
        ...state,
        votingError: action.votingError,
      };
    }
    case GameActionOptions.SetGameState: {
      return {
        ...state,
        gameState: action.gameState,
      };
    }
    case GameActionOptions.SetGameReady: {
      return {
        ...state,
        gameReady: true,
      };
    }
    case GameActionOptions.SetGameLayout: {
      console.log('in action');
      return {
        ...state,
        layout: action.layout,
      };
    }
    case GameActionOptions.SetEntityAction: {
      return {
        ...state,
        selectedEntity: action.entity,
        selectedEntityAction: action.action,
        viableHexIds: action.viableHexIds,
      };
    }
    case GameActionOptions.SetLastRoundActions: {
      return {
        ...state,
        lastRoundActions: action.actions,
      };
    }
    case GameActionOptions.SelectResource: {
      return {
        ...state,
        selectedResource: action.resource,
        selectedEntity: undefined,
        selectedEntityAction: undefined,
        viableHexIds: undefined,
      };
    }
  }
  return state;
}
