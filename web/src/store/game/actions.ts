import {Dispatcher} from '../actions';
import {SwgStore} from '../reducers';
import {DataService} from '../../dataServices';
import {RoundState} from '@swg-common/models/roundState';
import {HexImages} from '../../utils/hexImages';
import {Point, PointHashKey} from '@swg-common/hex/hex';
import {HashArray} from '@swg-common/utils/hashArray';
import {GameHexagon} from '@swg-common/game/gameHexagon';
import {HexagonTypes} from '@swg-common/game/hexagonTypes';
import {GameLogic, GameModel, ProcessedVote} from '@swg-common/game/gameLogic';
import {VoteResult} from '@swg-common/game/voteResult';
import {EntityAction, EntityDetails, GameEntity} from '@swg-common/game/entityDetail';
import {loadEntities} from '../../drawing/gameAssets';
import {GameResource} from '@swg-common/game/gameResource';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {GameRenderer} from '../../drawing/gameRenderer';

export enum GameActionOptions {
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

    static setGameRenderer(gameRenderer: GameRenderer): SetGameRendererAction {
        return {
            type: GameActionOptions.SetGameRenderer,
            gameRenderer
        };
    }

    static selectResource(resource: GameResource): SelectResourceAction {
        return {
            type: GameActionOptions.SelectResource,
            resource
        };
    }

    static updateGame(game: GameModel, roundState: RoundState): UpdateGameAction {
        return {
            type: GameActionOptions.UpdateGame,
            game,
            roundState
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
    static startLoading() {
        return async (dispatch: Dispatcher, getState: () => SwgStore) => {
            loadEntities();
            HexagonTypes.preloadTypes().map(a => HexImages.hexTypeToImage(a.type, a.subType));
        };
    }

    static async newRound() {
        return async (dispatch: Dispatcher, getState: () => SwgStore) => {
            const {gameState, appState} = getState();
            const {game} = gameState;
            await dispatch(GameActions.resetLocalVotes());
        };
    }

    static sendVote(entityId: string, action: EntityAction, hexId: string) {
        return async (dispatch: Dispatcher, getState: () => SwgStore) => {
            const {gameState, appState} = getState();
            const {game} = gameState;
            dispatch(GameActions.selectEntity(null));

            const processedVote = {
                entityId,
                action,
                hexId,
                factionId: appState.user.factionId
            };

            let voteResult = GameLogic.validateVote(game, processedVote);

            if (voteResult !== VoteResult.Success) {
                dispatch(GameActions.votingError(voteResult));
                setTimeout(() => {
                    dispatch(GameActions.votingError(null));
                }, 2000);
                return;
            }

            dispatch(GameActions.voting(true));
            await dispatch(GameActions.addLocalVote({...processedVote, processedTime: Number.MAX_VALUE}));

            const generation = game.generation;

            try {
                const serverVoteResult = await DataService.vote({
                    entityId,
                    action,
                    hexId,
                    generation
                });

                if (serverVoteResult.reason !== 'ok') {
                    dispatch(GameActions.votingError(serverVoteResult.voteResult || VoteResult.Error));
                    dispatch(GameActions.removeLocalVote(processedVote));

                    setTimeout(() => {
                        dispatch(GameActions.votingError(null));
                    }, 3000);
                } else {
                    await dispatch(GameActions.removeLocalVote(processedVote));
                    await dispatch(
                        GameActions.addLocalVote({...processedVote, processedTime: serverVoteResult.processedTime})
                    );

                    const roundState = gameState.roundState;
                    if (!roundState.entities[processedVote.entityId]) {
                        roundState.entities[processedVote.entityId] = [];
                    }
                    const vote = roundState.entities[processedVote.entityId].find(
                        a => a.hexId === processedVote.hexId && a.action === a.action
                    );
                    if (vote) {
                        vote.count++;
                    } else {
                        roundState.entities[processedVote.entityId].push({
                            action: processedVote.action,
                            count: 1,
                            hexId: processedVote.hexId
                        });
                    }
                    dispatch(GameActions.updateGame(gameState.game, roundState));

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
                }, 2000);
            }
        };
    }

    static startEntityAction(entity: GameEntity, action: EntityAction) {
        return (dispatch: Dispatcher, getState: () => SwgStore) => {
            const game = getState().gameState.game;
            let radius = 0;
            const entityDetails = EntityDetails[entity.entityType];
            const entityHex = game.grid.hexes.get(entity);
            let entityHash: HashArray<GameEntity, Point>;

            switch (action) {
                case 'attack':
                    radius = entityDetails.attackRadius;
                    entityHash = new HashArray<GameEntity, Point>(PointHashKey);
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
                    viableHexes = viableHexes.filter(a => !game.entities.find(e => e.x === a.x && e.y === a.y));
                    break;
                case 'mine':
                    viableHexes = viableHexes.filter(a => !game.entities.find(e => e.x === a.x && e.y === a.y));
                    break;
                case 'spawn-infantry':
                case 'spawn-tank':
                case 'spawn-plane':
                    viableHexes = viableHexes.filter(a => !game.entities.find(e => e.x === a.x && e.y === a.y));
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
