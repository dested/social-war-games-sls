import {RedisManager} from '@swg-server-common/redis/redisManager';
import {DataManager} from '@swg-server-common/db/dataManager';
import {DBVote} from '@swg-server-common/db/models/dbVote';
import {S3Manager} from '@swg-server-common/s3/s3Manager';
import {GameLayout} from '@swg-common/models/gameLayout';
import {S3Splitter} from './s3Splitter';
import {StateManager} from './stateManager';
import {GameLogic} from '@swg-common/game/gameLogic';

export class Setup {
    static start() {
        this.work().catch(er => {
            console.error(er);
            process.exit(0);
        });
    }

    static async work() {
        console.time('setup');
        console.log('booting');
        const redisManager = await RedisManager.setup();
        console.log('redis connected');
        await DataManager.openDbConnection();
        await redisManager.flushAll();
        console.log('redis flush');
        await redisManager.set('stop', true);
        await DBVote.db.deleteMany({});

        let game = GameLogic.createGame();
        console.log('create game');
        await redisManager.set<number>('game-generation', game.generation);
        console.log('set generation', game.generation);

        const gameLayout: GameLayout = {
            hexes: game.grid.hexes.map(a => ({
                x: a.x,
                y: a.y,
                id: a.id,
                type: a.tileType.type,
                subType: a.tileType.subType
            }))
        };

        const gameState = StateManager.buildGameState(game);
        const roundState = StateManager.buildRoundState(0, []);

        console.log('built state');

        /*await*/ S3Manager.uploadJson('layout.json', JSON.stringify(gameLayout));

        await S3Splitter.output(game, gameLayout, gameState, roundState, true);

        await redisManager.set('layout', gameLayout);
        await redisManager.set('game-state', gameState);
        console.log('set redis');

        await redisManager.set('stop', false);
        console.timeEnd('setup');
        process.exit(0);
    }
}
