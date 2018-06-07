import {Dispatcher} from '../actions';
import {SwgStore} from '../reducers';
import {DataService} from '../../dataServices';
import {RoundState} from '@swg-common/models/roundState';
import {HexImages} from '../../utils/hexImages';
import {Point, PointHashKey} from '@swg-common/hex/hex';
import {HashArray} from '@swg-common/utils/hashArray';
import {GameHexagon} from '@swg-common/game/gameHexagon';
import {HexagonTypes} from '@swg-common/game/hexagonTypes';
import {GameLogic, GameModel} from '@swg-common/game/gameLogic';
import {VoteResult} from '@swg-common/game/voteResult';
import {EntityAction, EntityDetails, GameEntity} from '@swg-common/game/entityDetail';
import {loadEntities} from '../../drawing/gameAssets';
import {GameResource} from '@swg-common/game/gameResource';

export enum GameActionOptions {
    UpdateGame = 'UPDATE_GAME',
    SetImagesLoading = 'SET_IMAGES_LOADING',
    SelectEntity = 'SELECT_ENTITY',
    SelectResource = 'SELECT_RESOURCE',
    SetEntityAction = 'SET_ENTITY_ACTION',
    SelectViableHex = 'SELECT_VIABLE_HEX',
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

export interface SelectResourceAction {
    type: GameActionOptions.SelectResource;
    resource: GameResource;
}

export interface SetImagesLoadingAction {
    type: GameActionOptions.SetImagesLoading;
    imagesLoading: number;
}

export interface VotingErrorAction {
    type: GameActionOptions.VotingError;
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

export interface VotingAction {
    type: GameActionOptions.Voting;
    isVoting: boolean;
}

export type GameAction =
    | SelectEntityAction
    | VotingAction
    | SetImagesLoadingAction
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

    static voting(isVoting: boolean): VotingAction {
        return {
            type: GameActionOptions.Voting,
            isVoting
        };
    }

    static votingError(): VotingErrorAction {
        return {
            type: GameActionOptions.VotingError
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
    static vote(entityId: string, action: EntityAction, hexId: string) {
        return async (dispatch: Dispatcher, getState: () => SwgStore) => {
            const {gameState} = getState();
            const {game, roundState} = gameState;

            const newRoundState = {...roundState};
            newRoundState.hash = newRoundState.hash + '1';
            if (!newRoundState.entities[entityId]) {
                newRoundState.entities[entityId] = [];
            }
            const vote = newRoundState.entities[entityId].find(a => a.hexId === hexId && a.action === a.action);
            if (vote) {
                vote.count++;
            } else {
                newRoundState.entities[entityId].push({
                    action,
                    count: 1,
                    hexId
                });
            }

            dispatch(GameActions.updateGame(game, newRoundState));
        };
    }
    static startLoading() {
        return async (dispatch: Dispatcher, getState: () => SwgStore) => {
            loadEntities();
            HexagonTypes.preloadTypes().map(a => HexImages.hexTypeToImage(a.type, a.subType));
        };
    }
    static sendVote(entityId: string, action: EntityAction, hexId: string) {
        return async (dispatch: Dispatcher, getState: () => SwgStore) => {
            const {gameState, appState} = getState();
            const {game} = gameState;
            let voteResult = GameLogic.validateVote(game, {
                entityId,
                action,
                hexId,
                factionId: appState.user.factionId
            });

            if (voteResult !== VoteResult.Success) {
                return;
            }

            dispatch(GameActions.voting(true));
            await dispatch(GameThunks.vote(entityId, action, hexId));

            const generation = game.generation;

            try {
                const serverVoteResult = await DataService.vote({
                    entityId,
                    action,
                    hexId,
                    generation
                });

                if (serverVoteResult.reason !== 'ok') {
                    dispatch(GameActions.voting(false));
                    dispatch(GameActions.votingError());
                    return;
                }

                dispatch(GameActions.voting(false));
                dispatch(GameActions.selectEntity(null));
            } catch (ex) {
                console.error(ex);
                dispatch(GameActions.voting(false));
                dispatch(GameActions.votingError());
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
                case 'spawn':
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
                case 'spawn':
                    viableHexes = viableHexes.filter(a => !game.entities.find(e => e.x === a.x && e.y === a.y));
                    break;
            }

            dispatch(
                GameActions.setEntityAction(
                    entity,
                    action,
                    viableHexes.reduce((a, b) => {
                        a[b.id] = true;
                        return a;
                    }, {})
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
