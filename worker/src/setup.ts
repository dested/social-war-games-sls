import {GameLayout} from '@swg-common/models/gameLayout';
import {GameLayoutParser} from '@swg-common/parsers/gameLayoutParser';
import {DataManager} from '@swg-server-common/db/dataManager';
import {DBGameStateResult} from '@swg-server-common/db/models/DBGameStateResult';
import {DBLadder} from '@swg-server-common/db/models/dbLadder';
import {DBUserRoundStats} from '@swg-server-common/db/models/dbUserRoundStats';
import {DBVote} from '@swg-server-common/db/models/dbVote';
import {ServerGameLogic} from '@swg-server-common/game/serverGameLogic';
import {RedisManager} from '@swg-server-common/redis/redisManager';
import {S3Manager} from '@swg-server-common/s3/s3Manager';
import {S3Splitter} from './s3Splitter';
import {SocketManager} from './socketManager';
import {StateManager} from './stateManager';

export class Setup {
  static start() {
    this.work().catch(er => {
      console.error(er);
      process.exit(0);
    });
  }

  static async work() {
    console.time('setup');
    const redisManager = await RedisManager.setup();
    console.log('redis connected');
    await DataManager.openDbConnection();

    await SocketManager.open();
    await redisManager.flushAll();
    await redisManager.set('stop', true);

    await DBVote.db.deleteMany({});
    await DBUserRoundStats.db.deleteMany({});
    await DBGameStateResult.db.deleteMany({});
    await DBLadder.db.deleteMany({});

    const game = ServerGameLogic.createDebugGame();
    console.log('create game');
    await redisManager.set<number>('game-generation', game.generation);
    console.log('set generation', game.generation);

    const gameLayout: GameLayout = {
      boardWidth: game.grid.boundsWidth,
      boardHeight: game.grid.boundsHeight,
      hexes: game.grid.hexes.map(a => ({
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
    await S3Manager.uploadBytes('layout.swg', gameLayoutBytes, true);
    const factionTokens = await S3Splitter.generateFactionTokens(redisManager, game.generation);
    await S3Splitter.output(game, gameLayout, gameState, roundState, factionTokens, true);

    await redisManager.set('layout', gameLayout);
    await redisManager.set('game-state', gameState);
    console.log('set redis');
    await S3Manager.uploadJson(`faction-stats.json`, JSON.stringify([]), false);

    await redisManager.set('stop', false);
    console.timeEnd('setup');
    process.exit(0);
  }
}
