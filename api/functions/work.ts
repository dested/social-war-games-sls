import {Event} from '../utils/models';
import {DBGame} from '@swg-server-common/db/models/dbGame';
import {RedisManager} from '@swg-server-common/redis/redisManager';
import {orderBy, sumBy} from 'lodash';
import {StateManager} from './game/stateManager';
import {S3Splitter} from './game/s3Splitter';
import {ServerGameLogic} from '@swg-server-common/game/serverGameLogic';
import {DBUserRoundStats} from '@swg-server-common/db/models/dbUserRoundStats';
import {GameState} from '@swg-common/models/gameState';
import {GameLogic, ProcessedVote} from '@swg-common/game/gameLogic';
import {DBVote} from '@swg-server-common/db/models/dbVote';
import {GameLayout} from '@swg-common/models/gameLayout';
import {VoteResult} from '@swg-common/game/voteResult';
import {GameModel} from '@swg-common/game/gameLogic';
import {EntityDetails, Factions} from '@swg-common/game/entityDetail';
import {S3Manager} from '@swg-server-common/s3/s3Manager';
import {FactionStats} from '@swg-common/models/factionStats';
import {Utils} from '@swg-common/utils/utils';
import {Config} from '@swg-server-common/config';

export async function workHandler(event: Event<void>): Promise<void> {
  try {
    const {gameId} = await DBGame.db.getOneProject({}, {gameId: 1});
    await processNewRound(gameId);
  } catch (ex) {
    console.error('ERROR', ex);
  }
}

async function processNewRound(gameId: string) {
  try {
    console.time('round end');
    await RedisManager.set(gameId, 'stop', true);
    const generation = await RedisManager.get<number>(gameId, 'game-generation');

    const game = GameLogic.buildGameFromState(
      await RedisManager.get<GameLayout>(gameId, 'layout'),
      await RedisManager.get<GameState>(gameId, 'game-state')
    );

    const preVoteEntities = JSON.parse(JSON.stringify(game.entities.array));
    const preVoteResources = JSON.parse(JSON.stringify(game.resources.array));

    const voteCounts = (await DBVote.getVoteCount(gameId, generation)).sort(
      (left, right) => sumBy(left.actions, (a) => a.count) - sumBy(right.actions, (a) => a.count)
    );

    for (const gameEntity of game.entities.filter((a) => a.busy)) {
      gameEntity.busy.ticks--;
      if (gameEntity.busy.ticks === 0) {
        const voteResult = ServerGameLogic.processVote(
          game,
          {
            factionId: gameEntity.factionId,
            action: gameEntity.busy.action,
            hexId: gameEntity.busy.hexId,
            entityId: gameEntity.id,
            voteCount: 0,
          },
          true
        );

        if (voteResult !== VoteResult.Success) {
          console.log('Busy vote failed:', voteResult);
        }
        gameEntity.busy = undefined;
      }
    }

    const winningVotes: ProcessedVote[] = [];
    for (const voteCount of voteCounts) {
      const actions = orderBy(voteCount.actions, (a) => a.count, 'desc');
      for (const action of actions) {
        const entity = game.entities.get2({id: voteCount._id});
        if (!entity) {
          // TODO REPLACE WITH DEAD ENTITY
          continue;
        }
        const vote: ProcessedVote = {
          entityId: voteCount._id,
          action: action.action,
          factionId: entity.factionId,
          hexId: action.hexId,
          voteCount: action.count,
          path: [],
        };

        let voteResult = GameLogic.validateVote(game, vote);
        if (voteResult === VoteResult.Success) {
          voteResult = ServerGameLogic.processVote(game, vote, false);
          if (voteResult !== VoteResult.Success) {
            console.log('Process vote failed:', voteResult);
            continue;
          }
          winningVotes.push(vote);
          break;
        } else {
          console.log('Vote failed:', voteResult);
        }
      }
    }

    postVoteTasks(game);

    console.log('Executed Votes', winningVotes.length);

    writeFactionStats(game);

    game.generation++;
    await RedisManager.set(gameId, 'game-generation', game.generation);

    const newGameState = await StateManager.buildGameState(
      game,
      preVoteEntities,
      preVoteResources,
      winningVotes,
      voteCounts
    );

    const roundState = StateManager.buildRoundState(game.generation, []);
    if (
      game.generation !== newGameState.generation &&
      game.generation !== (await RedisManager.get(gameId, 'game-generation'))
    ) {
      console.log(
        `weird generation:  ${game.generation} ${newGameState.generation} ${await RedisManager.get(
          gameId,
          'game-generation'
        )}`
      );
    }
    console.log(`Generation: ${game.generation}`);
    const factionTokens = await S3Splitter.generateFactionTokens(game);
    await S3Splitter.output(game, game.layout, newGameState, roundState, factionTokens, true);

    await RedisManager.set(gameId, 'game-state', newGameState);
    await RedisManager.set(gameId, 'stop', false);

    console.timeEnd('round end');
    cleanupVotes(gameId);
    DBUserRoundStats.buildLadder(gameId, generation);
  } catch (ex) {
    console.error(ex);
  }
}

function postVoteTasks(game: GameModel) {
  for (const entity of game.entities.array) {
    const details = EntityDetails[entity.entityType];
    if (details.healthRegenRate >= 0) {
      entity.healthRegenStep++;
      if (entity.healthRegenStep >= details.healthRegenRate) {
        if (entity.health < details.health) {
          entity.health++;
        }
        entity.healthRegenStep = 0;
      }
    }

    if (entity.entityType === 'factory') {
      for (const gameHexagon of game.grid.getCircle({x: entity.x, y: entity.y}, 5)) {
        gameHexagon.setFactionId(entity.factionId, 3);
      }
    }
  }

  for (const entity of game.entities.array) {
    const details = EntityDetails[entity.entityType];
    if (entity.entityType !== 'factory') {
      for (const gameHexagon of game.grid.getCircle({x: entity.x, y: entity.y}, 1)) {
        gameHexagon.setFactionId(entity.factionId, 3);
      }
    }
  }
  for (const entity of game.entities.array) {
    const details = EntityDetails[entity.entityType];
    if (entity.entityType !== 'factory') {
      game.grid.getHexAt({x: entity.x, y: entity.y}).setFactionId(entity.factionId, 3);
    }
  }

  const hexes = game.grid.hexes.array;
  for (const hex of hexes) {
    if (hex.factionDuration === 1) {
      hex.factionDuration = 0;
      hex.factionId = '0';
    } else if (hex.factionDuration > 0) {
      hex.factionDuration--;
    }
  }
}

async function cleanupVotes(gameId: string) {
  try {
    console.log('destroying votes');
    const generation = await RedisManager.get<number>(gameId, 'game-generation', 1);

    // todo, aggregate votes and store them for users later
    await DBVote.db.deleteMany(
      DBVote.db.query.parse((a, data) => a.gameId === data.gameId && a.generation < data.generation, {
        generation: generation - 2,
        gameId,
      })
    );
  } catch (ex) {
    console.error(ex);
  }
}

async function writeFactionStats(game: GameModel) {
  const factionStats: FactionStats = Utils.mapToObj(Factions, (faction) => {
    const factionHexes = game.grid.hexes.map((a) => a.factionId);
    const hexCount = factionHexes.filter((a) => a === faction).length;
    return {
      c: hexCount,
      p: hexCount / factionHexes.length,
      r: game.factionDetails[faction].resourceCount,
      s: ServerGameLogic.calculateScore(game, faction),
    };
  });
  const response = await fetch(`https://s3-us-west-2.amazonaws.com/swg-content/${game.id}/faction-stats.json`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  let json = (await response.json()) as FactionStats[];
  json.push(factionStats);
  json = json.slice(-(((24 * 60 * 60 * 1000) / Config.gameDuration) * 2));
  S3Manager.uploadJson(game.id, `faction-stats.json`, JSON.stringify(json), false);
}
