import {Event} from '../utils/models';
import {S3Manager} from '@swg-server-common/s3/s3Manager';
import {DBLadder} from '@swg-server-common/db/models/dbLadder';
import {DBGameStateResult} from '@swg-server-common/db/models/dbGameStateResult';
import {ServerGameLogic} from '@swg-server-common/game/serverGameLogic';
import {DBUserRoundStats} from '@swg-server-common/db/models/dbUserRoundStats';
import {DBVote} from '@swg-server-common/db/models/dbVote';
import {DBGame} from '@swg-server-common/db/models/dbGame';
import {GameLayout} from '@swg-common/models/gameLayout';
import {StateManager} from './game/stateManager';
import {S3Splitter} from './game/s3Splitter';
import {HttpResponse, respond} from '../utils/respond';
import {SwgRemoteStore} from 'swg-server-common/src/redis/swgRemoteStore';
import {GameLayoutWrite} from 'swg-common/src/models/gameLayout';

export async function setupHandler(event: Event<void>): Promise<HttpResponse<void>> {
  console.time('setup');
  await SwgRemoteStore.flushAll();

  await S3Manager.updateDataFile('online.json', {ready: false});

  await DBGame.db.deleteMany({});
  await DBVote.db.deleteMany({});
  await DBUserRoundStats.db.deleteMany({});
  await DBGameStateResult.db.deleteMany({});
  await DBLadder.db.deleteMany({});

  const game = await ServerGameLogic.createDebugGame();
  console.log(game.id);
  await DBGame.db.insertDocument(new DBGame(game));

  await SwgRemoteStore.setStop(game.id, true);

  console.log('create game');
  await SwgRemoteStore.setGameGeneration(game.id, game.generation);
  console.log('set generation', game.generation);

  const gameLayout: GameLayout = {
    boardWidth: game.grid.boundsWidth,
    boardHeight: game.grid.boundsHeight,
    hexes: game.grid.hexes.map((a) => ({
      x: a.x,
      y: a.y,
      type: a.tileType.type,
      subType: a.tileType.subType,
    })),
  };

  const gameState = await StateManager.buildGameState(game, [], [], [], []);
  const roundState = StateManager.buildRoundState(0, []);

  console.log('built state');

  const gameLayoutBytes = GameLayoutWrite(gameLayout);
  await S3Manager.uploadBytes(game.id, `layout.swg`, Buffer.from(gameLayoutBytes), true);
  const factionTokens = await S3Splitter.generateFactionTokens(game);
  await S3Splitter.output(game, gameLayout, gameState, roundState, factionTokens, true);

  await SwgRemoteStore.setGameLayout(game.id, gameLayout);
  await SwgRemoteStore.setGameState(game.id, gameState);
  console.log('set redis');
  await S3Manager.uploadJson(game.id, `faction-stats.json`, JSON.stringify([]), false);

  await SwgRemoteStore.setStop(game.id, false);
  console.timeEnd('setup');

  return respond(200, {});
}
