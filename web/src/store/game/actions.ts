import {
    EntityAction,
    GameEntity,
    GameHexagon,
    GameLogic,
    GameModel,
    HexagonTypes,
    VoteResult
} from '@swg-common/game';
import * as _ from 'lodash';
import {Dispatcher} from '../actions';
import {SwgStore} from '../reducers';
import {DataService} from '../../dataServices';
import {EntityDetails} from '@swg-common/game';
import {RoundState} from '@swg-common/models/roundState';
import {loadEntities} from '../../drawing/gameRenderer';
import {HexImages} from '../../utils/hexImages';
import {Point, PointHashKey} from '@swg-common/hex/hex';
import {HashArray} from '@swg-common/utils/hashArray';

export enum GameActionOptions {
    UpdateGame = 'UPDATE_GAME',
    SetImagesLoading = 'SET_IMAGES_LOADING',
    SelectEntity = 'SELECT_ENTITY',
    SetEntityAction = 'SET_ENTITY_ACTION',
    SelectViableHex = 'SELECT_VIABLE_HEX',
    Voting = 'VOTING'
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

export interface SetImagesLoadingAction {
    type: GameActionOptions.SetImagesLoading;
    imagesLoading: number;
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
    | SelectViableHexAction
    | UpdateGameAction;

export class GameActions {
    static selectEntity(entity: GameEntity): SelectEntityAction {
        return {
            type: GameActionOptions.SelectEntity,
            entity
        };
    }

    static updateGame(
        game: GameModel,
        roundState: RoundState
    ): UpdateGameAction {
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
    static setImagesLoadingAction(
        imagesLoading: number
    ): SetImagesLoadingAction {
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
            const vote = newRoundState.entities[entityId].find(
                a => a.hexId === hexId && a.action === a.action
            );
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
            HexagonTypes.preloadTypes().map(a =>
                HexImages.hexTypeToImage(a.type, a.subType)
            );
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
                console.log('Vote Error', voteResult);
                return;
            }

            dispatch(GameActions.voting(true));
            await dispatch(GameThunks.vote(entityId, action, hexId));

            const generation = game.generation;
            await DataService.vote({
                entityId,
                action,
                hexId,
                generation
            });

            dispatch(GameActions.voting(false));
            dispatch(GameActions.selectEntity(null));
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
                case 'spawn':
                    radius = entityDetails.spawnRadius;
                    entityHash = game.entities;
                    break;
            }

            let viableHexes = game.grid.getRange(entityHex, radius, entityHash);

            switch (action) {
                case 'attack':
                    viableHexes = viableHexes.filter(a =>
                        game.entities.find(
                            e =>
                                e.factionId !== entity.factionId &&
                                e.x === a.x &&
                                e.y === a.y
                        )
                    );
                    break;
                case 'move':
                    viableHexes = viableHexes.filter(
                        a =>
                            !game.entities.find(e => e.x === a.x && e.y === a.y)
                    );
                    break;
                case 'spawn':
                    viableHexes = viableHexes.filter(
                        a =>
                            !game.entities.find(e => e.x === a.x && e.y === a.y)
                    );
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
            dispatch(
                this.sendVote(
                    gameState.selectedEntity.id,
                    gameState.selectedEntityAction,
                    hex.id
                )
            );
            dispatch(GameActions.selectEntity(null));
        };
    }
}
