import {GameModel} from '@swg-common/../../common/src/game/gameLogic';
import {OfFaction} from '@swg-common/game/entityDetail';
import {GameState, GameStateEntity} from '@swg-common/models/gameState';
import {RoundState, RoundStateEntityVote} from '@swg-common/models/roundState';
import {Config} from '@swg-server-common/config';
import {VoteCountResult} from '@swg-server-common/db/models/dbVote';

export class StateManager {
  static buildRoundState(generation: number, voteCounts: VoteCountResult[]): RoundState {
    return {
      generation,
      thisUpdateTime: +new Date(),
      entities: voteCounts.reduce(
        (entities, vote) => {
          entities[vote._id] = vote.actions.map(a => ({
            hexId: a.hexId,
            action: a.action,
            count: a.count,
          }));
          return entities;
        },
        {} as {[id: string]: RoundStateEntityVote[]}
      ),
    };
  }

  static buildGameState(game: GameModel): GameState {
    return {
      factions: game.grid.hexes.map(a => a.factionId + '' + a.factionDuration).join(''),
      factionDetails: game.factionDetails,
      resources: game.resources.map(a => ({
        x: a.x,
        y: a.y,
        type: a.resourceType,
        count: a.currentCount,
      })),
      entities: game.entities.reduce(
        (entities, ent) => {
          if (!entities[ent.factionId]) {
            entities[ent.factionId] = [];
          }
          entities[ent.factionId].push({
            x: ent.x,
            y: ent.y,
            entityType: ent.entityType,
            busy: ent.busy,
            health: ent.health,
            id: ent.id,
            healthRegenStep: ent.healthRegenStep,
          });
          return entities;
        },
        {} as OfFaction<GameStateEntity[]>
      ),
      generation: game.generation,
      roundDuration: game.roundDuration,
      roundStart: +new Date(),
      roundEnd: +new Date() + Config.gameDuration,
    };
  }
}
