import {Event} from '../utils/models';
import {S3Manager} from '@swg-server-common/s3/s3Manager';
import {DBLadder} from '@swg-server-common/db/models/dbLadder';
import {DBGameStateResult} from '@swg-server-common/db/models/dbGameStateResult';
import {ServerGameLogic} from '@swg-server-common/game/serverGameLogic';
import {GameLayoutParser} from '@swg-common/parsers/gameLayoutParser';
import {DBUserRoundStats} from '@swg-server-common/db/models/dbUserRoundStats';
import {DBVote} from '@swg-server-common/db/models/dbVote';
import {DBGame} from '@swg-server-common/db/models/dbGame';
import {GameLayout} from '@swg-common/models/gameLayout';
import {RedisManager} from '@swg-server-common/redis/redisManager';
import {StateManager} from './game/stateManager';
import {S3Splitter} from './game/s3Splitter';
import {HttpResponse, respond} from '../utils/respond';

export async function setupHandler(event: Event<void>): Promise<HttpResponse<void>> {
  console.time('setup');
  await RedisManager.flushAll();

  await S3Manager.updateDataFile('online.json', {ready: false});

  await DBGame.db.deleteMany({});
  await DBVote.db.deleteMany({});
  await DBUserRoundStats.db.deleteMany({});
  await DBGameStateResult.db.deleteMany({});
  await DBLadder.db.deleteMany({});

  const game = await ServerGameLogic.createGame();
  console.log(game.id);
  await DBGame.db.insertDocument(new DBGame(game));

  await RedisManager.set(game.id, 'stop', true);

  console.log('create game');
  await RedisManager.set<number>(game.id, 'game-generation', game.generation);
  console.log('set generation', game.generation);

  const gameLayout: GameLayout = {
    boardWidth: game.grid.boundsWidth,
    boardHeight: game.grid.boundsHeight,
    hexes: game.grid.hexes.map((a) => ({
      x: a.x,
      y: a.y,
      id: a.id,
      type: a.tileType.type,
      subType: a.tileType.subType,
    })),
  };

  const gameState = await StateManager.buildGameState(game, [], [], [], []);
  const roundState = StateManager.buildRoundState(0, []);

  console.log('built state');

  const gameLayoutBytes = GameLayoutParser.fromGameLayout(gameLayout);
  await S3Manager.uploadBytes(game.id, `layout.swg`, gameLayoutBytes, true);
  const factionTokens = await S3Splitter.generateFactionTokens(game);
  await S3Splitter.output(game, gameLayout, gameState, roundState, factionTokens, true);

  await RedisManager.set(game.id, `layout`, gameLayout);
  await RedisManager.set(game.id, `game-state`, gameState);
  console.log('set redis');
  await S3Manager.uploadJson(game.id, `faction-stats.json`, JSON.stringify([]), false);

  await RedisManager.set(game.id, 'stop', false);
  console.timeEnd('setup');

  return respond(200, {});
}
