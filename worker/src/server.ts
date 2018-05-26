import {RedisManager} from 'swg-server-common/bin/redis/redisManager';
import {DBVote} from 'swg-server-common/bin/db/models/dbVote';
import {S3Manager} from 'swg-server-common/bin/s3/s3Manager';
import {DataManager} from 'swg-server-common/bin/db/dataManager';
import {GameLogic} from 'swg-common/bin/game';
import {GameLayout} from 'swg-common/bin/models/gameLayout';
import {GameState, GameStateEntity, GameStateEntityMap} from 'swg-common/bin/models/gameState';
import {Config} from 'swg-server-common/bin/config';
import {RoundState} from 'swg-common/bin/models/roundState';

if (process.argv[2] === 'setup') {
    async function bootstrap() {
        console.log('booting');
        const redisManager = await RedisManager.setup();
        console.log('redis connected');
        await DataManager.openDbConnection();
        await redisManager.flushAll();
        console.log('redis flush');
        await redisManager.set('stop', true);

        let game = GameLogic.createGame();
        console.log('create game');
        await redisManager.set<number>('game-generation', game.generation);
        console.log('set generation');

        const gameLayout: GameLayout = {
            hexes: game.grid.hexes.map(a => ({
                x: a.x,
                y: a.y,
                id: a.id,
                type: a.tileType.type,
                subType: a.tileType.subType
            }))
        };

        const gameState: GameState = {
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
            roundStart: +new Date(),
            roundEnd: +new Date() + Config.gameDuration
        };

        const roundState: RoundState = {
            hash: '0',
            nextUpdate: +new Date() + 10 * 1000,
            entities: {}
        };
        console.log('built state');

        await S3Manager.uploadJson('layout.json', JSON.stringify(gameLayout));
        await S3Manager.uploadJson('game-state.json', JSON.stringify(gameState));
        await S3Manager.uploadJson('round-state.json', JSON.stringify(roundState));
        console.log('upload json');

        await redisManager.set('layout', gameLayout);
        await redisManager.set('game-state', gameState);
        console.log('set redis');

        await redisManager.set('stop', false);
        console.log('done');
        process.exit(0);
    }
    bootstrap().catch(er => console.error(er));
} else if (process.argv[2] === 'work') {
    async function bootstrap() {
        console.log('booting');
        const redisManager = await RedisManager.setup();
        await DataManager.openDbConnection();
        console.log('connected to redis');
        setInterval(async () => {
            try {
                console.log('round end');
                await redisManager.set('stop', true);
                const generation = (await redisManager.get<number>('game-generation'))  ;

                const layout = await redisManager.get<GameLayout>('layout');
                let gameState = await redisManager.get<GameState>('game-state');

                const game = GameLogic.buildGame(layout, gameState);

                const voteCounts = await DBVote.getVoteCount(generation);

                gameState = {
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
                    roundStart: +new Date(),
                    roundEnd: +new Date() + Config.gameDuration
                };

                const roundState: RoundState = {
                    hash: (Math.random() * 1000000).toString(),
                    nextUpdate: +new Date() + 10 * 1000,
                    entities: {}
                };

                await S3Manager.uploadJson('game-state.json', JSON.stringify(gameState));
                await S3Manager.uploadJson('round-state.json', JSON.stringify(roundState));

                await redisManager.set('game-state', gameState);

                await redisManager.incr('game-generation');
                await redisManager.set('stop', false);
            } catch (ex) {
                console.error(ex);
            }
        }, Config.gameDuration);

        setInterval(async () => {
            try {
                console.log('update round state');
                const generation = (await redisManager.get<number>('game-generation')) || 1;
                const voteCounts = await DBVote.getVoteCount(generation);

                const roundState: RoundState = {
                    hash: (Math.random() * 1000000).toString(),
                    nextUpdate: +new Date() + 10 * 1000,
                    entities: voteCounts.reduce((entities, vote) => {
                        entities[vote._id] = vote.actions.map(a => ({
                            hexId: a.hexId,
                            action: a.action,
                            count: a.count
                        }));
                        return entities;
                    }, {})
                };

                await S3Manager.uploadJson('round-state.json', JSON.stringify(roundState));
            } catch (ex) {
                console.error(ex);
            }
        }, 1000 * 10);

        setInterval(async () => {
            try {
                console.log('destroying votes');
                const generation = (await redisManager.get<number>('game-generation')) || 1;

                // todo, aggregate votes and store them for users later
                await DBVote.db.deleteMany(DBVote.db.query.parse((a, gen) => a.generation < gen - 2, generation));
            } catch (ex) {
                console.error(ex);
            }
        }, Config.gameDuration * 2.5);
    }
    bootstrap().catch(er => console.error(er));
}
