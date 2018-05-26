import {HttpUser} from 'swg-common/bin/models/http/httpUser';
import {EntityAction, GameEntity, GameHexagon, GameLogic} from 'swg-common/bin/game';
import {Dispatcher} from '../actions';
import {SwgStore} from '../reducers';
import {DataService} from '../../dataServices';

export enum GameActionOptions {
    SetGame = 'SET_GAME',
    SelectEntity = 'SELECT_ENTITY',
    SetEntityAction = 'SET_ENTITY_ACTION',
    SelectViableHex = 'SELECT_VIABLE_HEX',
    Vote = 'VOTE',
    Voting = 'VOTING'
}
export interface SetEntityActionAction {
    type: GameActionOptions.SetEntityAction;
    entity: GameEntity;
    action: EntityAction;
    viableHexIds: string[];
}
export interface SelectEntityAction {
    type: GameActionOptions.SelectEntity;
    entity: GameEntity;
}

export interface SelectViableHexAction {
    type: GameActionOptions.SelectViableHex;
    hex: GameHexagon;
}

export interface SetGameAction {
    type: GameActionOptions.SetGame;
    game: GameLogic;
}

export interface VotingAction {
    type: GameActionOptions.Voting;
    isVoting: boolean;
}

export interface VoteAction {
    type: GameActionOptions.Vote;
    entityId: string;
    hexId: string;
    action: EntityAction;
}

export type GameAction =
    | SelectEntityAction
    | VoteAction
    | VotingAction
    | SetEntityActionAction
    | SelectViableHexAction
    | SetGameAction;

export class GameActions {
    static selectEntity(entity: GameEntity): SelectEntityAction {
        return {
            type: GameActionOptions.SelectEntity,
            entity
        };
    }
    static setGame(game: GameLogic): SetGameAction {
        return {
            type: GameActionOptions.SetGame,
            game
        };
    }
    static voting(isVoting: boolean): VotingAction {
        return {
            type: GameActionOptions.Voting,
            isVoting
        };
    }
    static setEntityAction(entity: GameEntity, action: EntityAction, viableHexIds: string[]): SetEntityActionAction {
        return {
            type: GameActionOptions.SetEntityAction,
            entity,
            action,
            viableHexIds
        };
    }

    static vote(entityId: string, action: EntityAction, hexId: string): VoteAction {
        return {
            type: GameActionOptions.Vote,
            entityId,
            action,
            hexId
        };
    }
}

export class GameThunks {
    static sendVote(entityId: string, action: EntityAction, hexId: string) {
        return async (dispatch: Dispatcher, getState: () => SwgStore) => {
            dispatch(GameActions.voting(true));
            const generation = getState().gameState.game.generation;
            await DataService.vote({
                entityId,
                action,
                hexId,
                generation
            });

            dispatch(GameActions.vote(entityId, action, hexId));
            dispatch(GameActions.voting(false));
            dispatch(GameActions.selectEntity(null));
        };
    }
    static startEntityAction(entity: GameEntity, action: EntityAction) {
        return (dispatch: Dispatcher, getState: () => SwgStore) => {
            const game = getState().gameState.game;
            let radius = 0;

            switch (action) {
                case 'attack':
                    switch (entity.entityType) {
                        case 'infantry':
                            radius = 3;
                            break;
                        case 'tank':
                            radius = 5;
                            break;
                        case 'plane':
                            radius = 2;
                            break;
                    }
                    break;
                case 'move':
                    switch (entity.entityType) {
                        case 'infantry':
                            radius = 5;
                            break;
                        case 'tank':
                            radius = 7;
                            break;
                        case 'plane':
                            radius = 12;
                            break;
                    }
                    break;
                case 'spawn':
                    switch (entity.entityType) {
                        case 'factory':
                            radius = 2;
                            break;
                    }
                    break;
            }

            let viableHexes = game.grid.getCircle({x: entity.x, y: entity.y}, radius);

            switch (action) {
                case 'attack':
                    viableHexes = viableHexes.filter(a =>
                        game.entities.find(e => e.factionId !== entity.factionId && e.x === a.x && e.y === a.y)
                    );
                    break;
                case 'move':
                    viableHexes = viableHexes.filter(a => !game.entities.find(e => e.x === a.x && e.y === a.y));
                    break;
                case 'spawn':
                    viableHexes = viableHexes.filter(a => !game.entities.find(e => e.x === a.x && e.y === a.y));
                    break;
            }

            dispatch(GameActions.setEntityAction(entity, action, viableHexes.map(a => a.id)));
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
