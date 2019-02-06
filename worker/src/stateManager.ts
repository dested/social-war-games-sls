import {GameModel, ProcessedVote} from '@swg-common/../../common/src/game/gameLogic';
import {
  EntityAction,
  EntityDetails,
  EntityTypeNames,
  FactionNames,
  Factions,
  GameEntity,
  OfFaction,
} from '@swg-common/game/entityDetail';
import {GameResource} from '@swg-common/game/gameResource';
import {GameState, GameStateEntity} from '@swg-common/models/gameState';
import {RoundState, RoundStateEntityVote} from '@swg-common/models/roundState';
import {VoteNote} from '@swg-common/models/voteNote';
import {HexUtils} from '@swg-common/utils/hexUtils';
import {Utils} from '@swg-common/utils/utils';
import {Config} from '@swg-server-common/config';
import {DBGameStateResult} from '@swg-server-common/db/models/DBGameStateResult';
import {DBUserRoundStats} from '@swg-server-common/db/models/dbUserRoundStats';
import {DBVote, RoundUserStats, VoteCountResult} from '@swg-server-common/db/models/dbVote';
import {ServerGameLogic} from '@swg-server-common/game/serverGameLogic';

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

  static async buildGameState(
    game: GameModel,
    preVoteEntities: GameEntity[],
    preVoteResources: GameResource[],
    winningVotes: ProcessedVote[],
    voteCounts: VoteCountResult[]
  ): Promise<GameState> {
    const actionToWeight = (a: EntityAction) => {
      switch (a) {
        case 'attack':
          return 0;
        case 'mine':
          return 1;
        case 'spawn-plane':
          return 2;
        case 'spawn-tank':
          return 3;
        case 'spawn-infantry':
          return 4;
        case 'move':
          return 5;
      }
      return 100;
    };

    const notes = Utils.mapMany(
      /**/ winningVotes.sort((a, b) => actionToWeight(a.action) - actionToWeight(b.action)),
      a => this.buildNote(a, game, preVoteEntities, preVoteResources)
    );
    const userStats = await DBVote.getRoundUserStats(game.generation - 1);
    const playersVoted = Utils.groupByReduce(
      userStats,
      a => a._id.factionId,
      a => Object.keys(Utils.groupBy(a, b => b._id.userId))
    );
    const players = Utils.flattenArray(Utils.mapObjToArray(playersVoted, (_, ar) => ar));

    const gameState: GameState = {
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
            facingDirection: ent.facingDirection,
          });
          return entities;
        },
        {} as OfFaction<GameStateEntity[]>
      ),
      generation: game.generation,
      roundDuration: game.roundDuration,
      roundStart: +new Date(),
      roundEnd: +new Date() + Config.gameDuration,

      winningVotes: Utils.mapToObj(Factions, faction => winningVotes.filter(a => a.factionId === faction)),
      totalPlayersVoted: Utils.sum(Utils.mapObjToArray(playersVoted, (_, ar) => ar.length), a => a),
      playersVoted: Utils.mapObjToObj(playersVoted, (_, p) => p.length),
      scores: Utils.mapToObj(Factions, faction => ServerGameLogic.calculateScore(game, faction)),
      hotEntities: Utils.mapToObj(Factions, faction =>
        voteCounts
          .filter(vote => preVoteEntities.find(ent => ent.id === vote._id).factionId === faction)
          .sort((vote1, vote2) => Utils.sum(vote2.actions, v => v.count) - Utils.sum(vote1.actions, v => v.count))
          .map(vote => ({id: vote._id, count: Utils.sum(vote.actions, v => v.count)}))
          .slice(0, 10)
      ),
      notes: Utils.mapToObj(Factions, faction => notes.filter(a => a.factionId === faction)),
    };

    const gameStateResult = new DBGameStateResult(gameState);
    /*await*/
    DBGameStateResult.db.insertDocument(gameStateResult);
    /*await*/
    this.buildPlayerNotes(players, userStats, winningVotes, preVoteEntities, game, preVoteResources);
    return gameState;
  }

  private static async buildPlayerNotes(
    players: string[],
    userStats: RoundUserStats[],
    winningVotes: ProcessedVote[],
    preVoteEntities: GameEntity[],
    game: GameModel,
    preVoteResources: GameResource[]
  ) {
    const userStatsGrouped = Utils.arrayToDictionary(userStats, a => a._id.userId);

    for (const player of players) {
      const votesByUser = userStatsGrouped[player];

      const votesCast = votesByUser ? votesByUser.count : 0;

      const winningUserVotes = votesByUser.votes.filter(v =>
        winningVotes.find(w => w.action === v.action && w.hexId === v.hexId && w.entityId === v.entityId)
      );

      const votesWon = winningUserVotes.length;
      let damageDone = 0;
      let unitsDestroyed = 0;
      let unitsCreated = 0;
      let resourcesMined = 0;
      let distanceMoved = 0;

      for (const winningUserVote of winningUserVotes) {
        const fromEntity = preVoteEntities.find(a => a.id === winningUserVote.entityId);
        const fromHex = game.grid.hexes.get(fromEntity);
        const toHex = game.grid.hexes.find(a => a.id === winningUserVote.hexId);

        switch (winningUserVote.action) {
          case 'attack': {
            const toEntity = preVoteEntities.find(a => a.x === toHex.x && a.y === toHex.y);
            const toEntityResult = game.entities.get2(toEntity);
            damageDone += toEntityResult ? toEntity.health - toEntityResult.health : toEntity.health;
            unitsDestroyed += toEntityResult ? 0 : 1;
            break;
          }

          case 'move': {
            distanceMoved += HexUtils.getDistance(fromHex, toHex);
            break;
          }
          case 'mine': {
            const resource = preVoteResources.find(a => a.x === toHex.x && a.y === toHex.y);
            let resourceCount = 0;
            switch (resource.resourceType) {
              case 'bronze':
                resourceCount = 1;
                break;
              case 'silver':
                resourceCount = 2;
                break;
              case 'gold':
                resourceCount = 3;
                break;
            }
            resourcesMined += resourceCount;
            break;
          }
          case 'spawn-plane':
          case 'spawn-infantry':
          case 'spawn-tank': {
            unitsCreated++;
          }
        }
      }

      /*await*/
      DBUserRoundStats.addUserRoundStat(player, {
        generation: game.generation - 1,
        votesWon,
        votesCast,
        damageDone,
        unitsDestroyed,
        unitsCreated,
        resourcesMined,
        distanceMoved,
      });
    }
  }

  private static buildNote(
    vote: ProcessedVote,
    game: GameModel,
    preVoteEntities: GameEntity[],
    preVoteResources: GameResource[]
  ): VoteNote[] {
    const fromEntity = preVoteEntities.find(a => a.id === vote.entityId);
    const fromHex = game.grid.hexes.get(fromEntity);
    const toHex = game.grid.hexes.find(a => a.id === vote.hexId);

    switch (vote.action) {
      case 'attack': {
        const toEntity = preVoteEntities.find(a => a.x === toHex.x && a.y === toHex.y);
        const toEntityResult = game.entities.get2(toEntity);
        const damage = toEntityResult ? toEntity.health - toEntityResult.health : toEntity.health;
        const result = `for ${damage} damage` + (!toEntityResult ? ' and destroyed it' : '');
        return [
          {
            note:
              `Our {fromEntityId:${EntityTypeNames[fromEntity.entityType]}} attacked ` +
              `${FactionNames[toEntity.factionId]}'s ` +
              `{toEntityId:${EntityTypeNames[toEntity.entityType]}} ` +
              `(at {toHexId:${toHex.x},${toHex.y}}) ${result}. `,
            action: vote.action,
            factionId: fromEntity.factionId,
            fromEntityId: fromEntity.id,
            toEntityId: toEntity.id,
            toHexId: toHex.id,
            fromHexId: fromHex.id,
            voteCount: vote.voteCount,
            path: vote.path,
          },

          {
            note:
              `${FactionNames[fromEntity.factionId]}'s ` +
              `{fromEntityId:${EntityTypeNames[fromEntity.entityType]}} ` +
              `attacked our {toEntityId:${EntityTypeNames[toEntity.entityType]}} ` +
              `(at {toHexId:${toHex.x},${toHex.y}}) ${result}. `,
            action: vote.action,
            factionId: toEntity.factionId,
            fromEntityId: fromEntity.id,
            toEntityId: toEntity.id,
            toHexId: toHex.id,
            fromHexId: fromHex.id,
            voteCount: vote.voteCount,
            path: vote.path,
          },
        ];
      }

      case 'move': {
        const distance = HexUtils.getDistance(fromHex, toHex);
        const direction = HexUtils.getDirectionStr(fromHex, toHex);
        return [
          {
            note:
              `Our {fromEntityId:${EntityTypeNames[fromEntity.entityType]}} ` +
              `moved ${distance} space${distance === 1 ? '' : 's'} ${direction}.`,
            action: vote.action,
            factionId: fromEntity.factionId,
            fromEntityId: fromEntity.id,
            toEntityId: null,
            toHexId: toHex.id,
            fromHexId: fromHex.id,
            voteCount: vote.voteCount,
            path: vote.path,
          },
        ];
      }
      case 'mine': {
        const resource = preVoteResources.find(a => a.x === toHex.x && a.y === toHex.y);
        const resourceResult = game.resources.find(a => a.x === toHex.x && a.y === toHex.y);
        let resourceCount = 0;
        switch (resource.resourceType) {
          case 'bronze':
            resourceCount = 1;
            break;
          case 'silver':
            resourceCount = 2;
            break;
          case 'gold':
            resourceCount = 3;
            break;
        }

        const remaining = resourceResult
          ? `It has ${resourceResult.currentCount} remaining. `
          : `It has been depleted. `;

        return [
          {
            note: `We mined ${resourceCount} resource at {toHexId:${toHex.x},${toHex.y}}. ` + remaining,
            action: vote.action,
            factionId: fromEntity.factionId,
            fromEntityId: fromEntity.id,
            toEntityId: null,
            toHexId: toHex.id,
            fromHexId: fromHex.id,
            voteCount: vote.voteCount,
            path: vote.path,
          },
        ];
      }

      case 'spawn-infantry':
      case 'spawn-tank':
      case 'spawn-plane': {
        let spawnName: string;
        let turns: number;
        switch (vote.action) {
          case 'spawn-infantry':
            spawnName = EntityTypeNames.infantry;
            turns = EntityDetails.infantry.ticksToSpawn;
            break;
          case 'spawn-tank':
            spawnName = EntityTypeNames.tank;
            turns = EntityDetails.tank.ticksToSpawn;
            break;
          case 'spawn-plane':
            spawnName = EntityTypeNames.plane;
            turns = EntityDetails.plane.ticksToSpawn;
            break;
        }

        return [
          {
            note:
              `Our {fromEntityId:${EntityTypeNames.factory}} ` +
              `has begun constructing a new ${spawnName}. ` +
              `It will be ready in ${turns} rounds.`,
            action: vote.action,
            factionId: fromEntity.factionId,
            fromEntityId: fromEntity.id,
            toEntityId: null,
            toHexId: toHex.id,
            fromHexId: fromHex.id,
            voteCount: vote.voteCount,
            path: vote.path,
          },
        ];
      }
    }
  }
}
