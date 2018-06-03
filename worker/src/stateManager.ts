import {VoteCountResult} from '@swg-server-common/db/models/dbVote';
import {RoundState, RoundStateEntityVote} from '@swg-common/models/roundState';
import {Config} from '@swg-server-common/config';
import {GameState, GameStateEntityMap} from '@swg-common/models/gameState';
import {GameLogic, GameModel} from '@swg-common/game';

export class StateManager {
    static buildRoundState(generation: number, voteCounts: VoteCountResult[]): RoundState {
        return {
            generation,
            hash: (Math.random() * 1000000).toString(),
            nextUpdate: +new Date() + Config.roundUpdateDuration,
            entities: voteCounts.reduce(
                (entities, vote) => {
                    entities[vote._id] = vote.actions.map(a => ({
                        hexId: a.hexId,
                        action: a.action,
                        count: a.count
                    }));
                    return entities;
                },
                {} as {[id: string]: RoundStateEntityVote[]}
            )
        };
    }

    static buildGameState(game: GameModel): GameState {
        return {
            factions: game.grid.hexes.map(a => a.factionId).join(''),
            entities: game.entities.reduce(
                (entities, ent) => {
                    if (!entities[ent.factionId]) entities[ent.factionId] = [];
                    entities[ent.factionId].push({
                        x: ent.x,
                        y: ent.y,
                        entityType: ent.entityType,
                        health: ent.health,
                        id: ent.id
                    });
                    return entities;
                },
                {} as GameStateEntityMap
            ),
            generation: game.generation,
            roundDuration: game.roundDuration,
            roundStart: +new Date(),
            roundEnd: +new Date() + Config.gameDuration
        };
    }
}
