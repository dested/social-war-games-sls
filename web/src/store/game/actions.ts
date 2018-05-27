import {EntityAction, GameEntity, GameHexagon, GameLogic} from 'swg-common/bin/game';
import {Dispatcher} from '../actions';
import {SwgStore} from '../reducers';
import {DataService} from '../../dataServices';
import {EntityDetails} from 'swg-common/bin/game';

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
            const {gameState, appState} = getState();
            const {game} = gameState;

            if (
                !GameLogic.validateVote(game, {
                    entityId,
                    action,
                    hexId,
                    factionId: appState.user.factionId
                })
            ) {
                return;
            }

            dispatch(GameActions.voting(true));
            const generation = game.generation;
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
            const entityDetails = EntityDetails[entity.entityType];
            const entityHex = game.grid.hexes.find(a => a.x === entity.x && a.y === entity.y);
            switch (action) {
                case 'attack':
                    radius = entityDetails.attackRadius;
                    break;
                case 'move':
                    radius = entityDetails.moveRadius;
                    break;
                case 'spawn':
                    radius = entityDetails.spawnRadius;
                    break;
            }

            let viableHexes = game.grid.getRange(entityHex, radius);

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
