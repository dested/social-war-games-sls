import {EntityAction, EntityDetails, GameEntity} from '@swg-common/game/entityDetail';
import {GameHexagon} from '@swg-common/game/gameHexagon';
import {GameLogic, GameModel, ProcessedVote} from '@swg-common/game/gameLogic';
import {GameResource} from '@swg-common/game/gameResource';
import {HexagonTypes} from '@swg-common/game/hexagonTypes';
import {VoteResult} from '@swg-common/game/voteResult';
import {Point, PointHashKey} from '@swg-common/hex/hex';
import {GameLayout} from '@swg-common/models/gameLayout';
import {GameState} from '@swg-common/models/gameState';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {RoundState, RoundStateEntityVote} from '@swg-common/models/roundState';
import {DoubleHashArray} from '@swg-common/utils/hashArray';
import {DataService} from '../../dataServices';
import {loadEntities, loadUI} from '../../drawing/gameAssets';
import {GameRenderer} from '../../drawing/gameRenderer';
import {Drawing, DrawingOptions} from '../../drawing/hexDrawing';
import {SmallGameRenderer} from '../../drawing/smallGameRenderer';
import {HexConstants} from '../../utils/hexConstants';
import {HexImages} from '../../utils/hexImages';
import {SocketUtils} from '../../utils/socketUtils';
import {UIConstants} from '../../utils/uiConstants';
import {Dispatcher} from '../actions';
import {SwgStore} from '../reducers';

export enum GameActionOptions {
    SetGameLayout = 'SetGameLayout',
    SetGameState = 'SetGameState',
    SetGameReady = 'SetGameReady',

    UpdateGame = 'UPDATE_GAME',
    UpdateUserDetails = 'UPDATE_USER_DETAILS',
    SetGameRenderer = 'SetGameRenderer',
    SetImagesLoading = 'SET_IMAGES_LOADING',
    SelectEntity = 'SELECT_ENTITY',
    SelectResource = 'SELECT_RESOURCE',
    SetEntityAction = 'SET_ENTITY_ACTION',
    SelectViableHex = 'SELECT_VIABLE_HEX',
    AddLocalVote = 'AddLocalVote',
    RemoveLocalVote = 'RemoveLocalVote',
    ResetLocalVotes = 'ResetLocalVotes',
    Voting = 'VOTING',
    VotingError = 'VOTING_ERROR'
}

export interface SetEntityActionAction {
    type: GameActionOptions.SetEntityAction;
    entity: GameEntity;
    action: EntityAction;
    viableHexIds: {[hexId: string]: boolean};
}

export interface SelectEntityAction {
    type: GameActionOptions.SelectEntity;
    entity: GameEntity;
}

export interface SetGameLayoutAction {
    type: GameActionOptions.SetGameLayout;
    layout: GameLayout;
}

export interface SetGameStateAction {
    type: GameActionOptions.SetGameState;
    gameState: GameState;
}

export interface SetGameReadyAction {
    type: GameActionOptions.SetGameReady;
}

export interface AddLocalVoteAction {
    type: GameActionOptions.AddLocalVote;
    vote: ProcessedVote & {processedTime: number};
}

export interface RemoveLocalVoteAction {
    type: GameActionOptions.RemoveLocalVote;
    vote: ProcessedVote;
}

export interface ResetLocalVotesAction {
    type: GameActionOptions.ResetLocalVotes;
}

export interface SelectResourceAction {
    type: GameActionOptions.SelectResource;
    resource: GameResource;
}

export interface SetGameRendererAction {
    type: GameActionOptions.SetGameRenderer;
    gameRenderer: GameRenderer;
    smallGameRenderer: SmallGameRenderer;
}

export interface SetImagesLoadingAction {
    type: GameActionOptions.SetImagesLoading;
    imagesLoading: number;
}

export interface VotingErrorAction {
    type: GameActionOptions.VotingError;
    votingError: VoteResult | null;
}

export interface SelectViableHexAction {
    type: GameActionOptions.SelectViableHex;
    hex: GameHexagon;
}

export interface UpdateGameAction {
    type: GameActionOptions.UpdateGame;
    game: GameModel;
    roundState: RoundState;
    localRoundState: RoundState;
}

export interface UpdateUserDetailsAction {
    type: GameActionOptions.UpdateUserDetails;
    userDetails: UserDetails;
}

export interface VotingAction {
    type: GameActionOptions.Voting;
    isVoting: boolean;
}

export type GameAction =
    | SelectEntityAction
    | SetGameRendererAction
    | VotingAction
    | AddLocalVoteAction
    | RemoveLocalVoteAction
    | SetGameLayoutAction
    | SetGameReadyAction
    | SetGameStateAction
    | ResetLocalVotesAction
    | SetImagesLoadingAction
    | UpdateUserDetailsAction
    | SetEntityActionAction
    | SelectResourceAction
    | SelectViableHexAction
    | UpdateGameAction
    | VotingErrorAction;

export class GameActions {
    static selectEntity(entity: GameEntity): SelectEntityAction {
        return {
            type: GameActionOptions.SelectEntity,
            entity
        };
    }

    static addLocalVote(vote: ProcessedVote & {processedTime: number}): AddLocalVoteAction {
        return {
            type: GameActionOptions.AddLocalVote,
            vote
        };
    }
    static setGameLayout(layout: GameLayout): SetGameLayoutAction {
        return {
            type: GameActionOptions.SetGameLayout,
            layout
        };
    }
    static setGameState(gameState: GameState): SetGameStateAction {
        return {
            type: GameActionOptions.SetGameState,
            gameState
        };
    }
    static setGameReady(): SetGameReadyAction {
        return {
            type: GameActionOptions.SetGameReady
        };
    }
    static removeLocalVote(vote: ProcessedVote): RemoveLocalVoteAction {
        return {
            type: GameActionOptions.RemoveLocalVote,
            vote
        };
    }

    static resetLocalVotes(): ResetLocalVotesAction {
        return {
            type: GameActionOptions.ResetLocalVotes
        };
    }

    static setGameRenderer(gameRenderer: GameRenderer, smallGameRenderer: SmallGameRenderer): SetGameRendererAction {
        return {
            type: GameActionOptions.SetGameRenderer,
            gameRenderer,
            smallGameRenderer
        };
    }

    static selectResource(resource: GameResource): SelectResourceAction {
        return {
            type: GameActionOptions.SelectResource,
            resource
        };
    }

    static updateGame(game: GameModel, roundState: RoundState, localRoundState: RoundState): UpdateGameAction {
        return {
            type: GameActionOptions.UpdateGame,
            game,
            roundState,
            localRoundState
        };
    }

    static updateUserDetails(userDetails: UserDetails): UpdateUserDetailsAction {
        return {
            type: GameActionOptions.UpdateUserDetails,
            userDetails
        };
    }

    static voting(isVoting: boolean): VotingAction {
        return {
            type: GameActionOptions.Voting,
            isVoting
        };
    }

    static votingError(votingError: VoteResult | null): VotingErrorAction {
        return {
            type: GameActionOptions.VotingError,
            votingError
        };
    }

    static setEntityAction(
        entity: GameEntity,
        action: EntityAction,
        viableHexIds: {[hexId: string]: boolean}
    ): SetEntityActionAction {
        return {
            type: GameActionOptions.SetEntityAction,
            entity,
            action,
            viableHexIds
        };
    }
    static setImagesLoadingAction(imagesLoading: number): SetImagesLoadingAction {
        return {
            type: GameActionOptions.SetImagesLoading,
            imagesLoading
        };
    }
}

export class GameThunks {
    static processRoundState(game: GameModel, roundState: RoundState) {
        return async (dispatch: Dispatcher, getState: () => SwgStore) => {
            const {gameState} = getState();

            const localRoundState: RoundState = JSON.parse(JSON.stringify(roundState));

            for (const processedVote of gameState.localVotes) {
                if (processedVote.processedTime < localRoundState.thisUpdateTime) {
                    continue;
                }

                if (!localRoundState.entities[processedVote.entityId]) {
                    localRoundState.entities[processedVote.entityId] = [];
                }
                const vote = localRoundState.entities[processedVote.entityId].find(
                    a => a.hexId === processedVote.hexId && a.action === a.action
                );
                if (vote) {
                    vote.count++;
                } else {
                    localRoundState.entities[processedVote.entityId].push({
                        action: processedVote.action,
                        count: 1,
                        hexId: processedVote.hexId
                    });
                }
            }

            dispatch(GameActions.updateGame(game, roundState, localRoundState));
        };
    }

    static startGame() {
        return async (dispatch: Dispatcher, getState: () => SwgStore) => {
            const {gameState, appState} = getState();
            dispatch(GameThunks.startLoading());

            const layout = await DataService.getLayout();
            dispatch(GameActions.setGameLayout(layout));

            const userDetails = await DataService.currentUserDetails();
            dispatch(GameActions.updateUserDetails(userDetails));

            const localGameState = await DataService.getGameState(appState.user.factionId, userDetails.factionToken);
            dispatch(GameActions.setGameState(localGameState));
            SocketUtils.connect(
                appState.user.id,
                appState.user.factionId,
                roundState => {
                    GameThunks.getNewState(roundState, dispatch, getState).catch(ex => console.error(ex));
                }
            );
            // const roundState = await DataService.getRoundState(appState.user.factionId);
            const game = GameLogic.buildGameFromState(layout, localGameState);

            HexConstants.smallHeight = ((UIConstants.miniMapHeight() - 100) / game.grid.boundsHeight) * 1.3384;
            HexConstants.smallWidth = UIConstants.miniMapWidth() / game.grid.boundsWidth;

            DrawingOptions.defaultSmall = {
                width: HexConstants.smallWidth,
                height: HexConstants.smallHeight,
                size: HexConstants.smallHeight / 2 - 1,
                orientation: Drawing.Orientation.PointyTop
            };

            Drawing.update(game.grid, DrawingOptions.default, DrawingOptions.defaultSmall);

            const emptyRoundState = {
                nextUpdateTime: 0,
                nextGenerationTick: game.roundEnd,
                thisUpdateTime: 0,
                generation: game.generation,
                entities: {}
            };
            dispatch(GameActions.updateGame(game, emptyRoundState, emptyRoundState));

            gameState.smallGameRenderer.forceRender();

            dispatch(GameActions.setGameReady());
        };
    }

    private static async getNewState(roundState: RoundState, dispatch: Dispatcher, getState: () => SwgStore) {
        const {gameState, uiState, appState} = getState();
        let game = gameState.game;
        if (roundState.generation !== gameState.game.generation) {
            dispatch(GameActions.selectEntity(null));
            dispatch(GameActions.resetLocalVotes());
            const userDetails = await DataService.currentUserDetails();
            dispatch(GameActions.updateUserDetails(userDetails));

            const localGameState = await DataService.getGameState(appState.user.factionId, userDetails.factionToken);

            game = GameLogic.buildGameFromState(gameState.layout, localGameState);
            Drawing.update(game.grid, DrawingOptions.default, DrawingOptions.defaultSmall);
            gameState.smallGameRenderer.processMiniMap(game);
        }

        dispatch(GameThunks.processRoundState(game, roundState));
    }

    static startLoading() {
        return async (dispatch: Dispatcher, getState: () => SwgStore) => {
            loadEntities();
            loadUI();
            HexagonTypes.preloadTypes().map(a => HexImages.hexTypeToImage(a.type, a.subType));
        };
    }

    static sendVote(entityId: number, action: EntityAction, hexId: string) {
        return async (dispatch: Dispatcher, getState: () => SwgStore) => {
            const {gameState, appState} = getState();
            const {game, roundState} = gameState;
            dispatch(GameActions.selectEntity(null));

            const votesLeft = gameState.userDetails.maxVotes - gameState.userDetails.voteCount;
            if (votesLeft === 0) {
                return;
            }

            const processedVote = {
                entityId,
                action,
                hexId,
                factionId: appState.user.factionId
            };
            const voteResult = GameLogic.validateVote(game, processedVote);

            if (voteResult !== VoteResult.Success) {
                dispatch(GameActions.votingError(voteResult));
                setTimeout(() => {
                    dispatch(GameActions.votingError(null));
                }, 3000);
                return;
            }

            dispatch(GameActions.voting(true));
            await dispatch(GameActions.addLocalVote({...processedVote, processedTime: Number.MAX_VALUE}));
            dispatch(GameThunks.processRoundState(game, roundState));

            const generation = game.generation;

            try {
                const serverVoteResult = await DataService.vote({
                    entityId,
                    action,
                    hexId,
                    generation
                });

                if (serverVoteResult.reason !== 'ok') {
                    dispatch(GameActions.removeLocalVote(processedVote));
                    dispatch(GameThunks.processRoundState(game, roundState));
                    dispatch(GameActions.votingError(serverVoteResult.voteResult || VoteResult.Error));
                    setTimeout(() => {
                        dispatch(GameActions.votingError(null));
                    }, 3000);
                } else {
                    await dispatch(GameActions.removeLocalVote(processedVote));
                    await dispatch(
                        GameActions.addLocalVote({...processedVote, processedTime: serverVoteResult.processedTime})
                    );
                    dispatch(GameThunks.processRoundState(game, roundState));

                    dispatch(
                        GameActions.updateUserDetails({
                            ...gameState.userDetails,
                            voteCount: gameState.userDetails.maxVotes - serverVoteResult.votesLeft
                        })
                    );
                }

                dispatch(GameActions.voting(false));
            } catch (ex) {
                console.error(ex);
                dispatch(GameActions.voting(false));
                dispatch(GameActions.votingError(VoteResult.Error));
                setTimeout(() => {
                    dispatch(GameActions.votingError(null));
                }, 3000);
            }
        };
    }

    static startEntityAction(entity: GameEntity, action: EntityAction) {
        return (dispatch: Dispatcher, getState: () => SwgStore) => {
            const game = getState().gameState.game;
            let radius = 0;
            const entityDetails = EntityDetails[entity.entityType];
            const entityHex = game.grid.hexes.get(entity);
            let entityHash: DoubleHashArray<GameEntity, Point, {id: number}>;

            switch (action) {
                case 'attack':
                    radius = entityDetails.attackRadius;
                    entityHash = new DoubleHashArray<GameEntity, Point, {id: number}>(PointHashKey, e => e.id);
                    break;
                case 'move':
                    radius = entityDetails.moveRadius;
                    entityHash = game.entities;
                    break;
                case 'mine':
                    radius = entityDetails.mineRadius;
                    entityHash = game.entities;
                    break;
                case 'spawn-infantry':
                case 'spawn-tank':
                case 'spawn-plane':
                    radius = entityDetails.spawnRadius;
                    entityHash = game.entities;
                    break;
            }

            let viableHexes = game.grid.getRange(entityHex, radius, entityHash);

            switch (action) {
                case 'attack':
                    /*    viableHexes = viableHexes.filter(a =>
                        game.entities.find(e => e.factionId !== entity.factionId && e.x === a.x && e.y === a.y)
                    );*/
                    break;
                case 'move':
                    viableHexes = viableHexes.filter(a => !game.entities.get1(a));
                    break;
                case 'mine':
                    viableHexes = viableHexes.filter(a => !game.entities.get1(a));
                    break;
                case 'spawn-infantry':
                case 'spawn-tank':
                case 'spawn-plane':
                    viableHexes = viableHexes.filter(a => !game.entities.get1(a));
                    break;
            }

            dispatch(
                GameActions.setEntityAction(
                    entity,
                    action,
                    viableHexes.reduce(
                        (a, b) => {
                            a[b.id] = true;
                            return a;
                        },
                        {} as {[hexId: string]: boolean}
                    )
                )
            );
        };
    }

    static selectViableHex(hex: GameHexagon) {
        return (dispatch: Dispatcher, getState: () => SwgStore) => {
            const gameState = getState().gameState;
            dispatch(this.sendVote(gameState.selectedEntity.id, gameState.selectedEntityAction, hex.id));
            dispatch(GameActions.selectEntity(null));
        };
    }
}
