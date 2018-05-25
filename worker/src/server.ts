import {RedisManager} from 'swg-server-common/bin/redis/redisManager';
import {DBVote} from 'swg-server-common/bin/db/models/dbVote';
import {S3Manager} from 'swg-server-common/bin/s3/s3Manager';
import {DataManager} from 'swg-server-common/bin/db/dataManager';

async function bootstrap() {
    console.log('booting');
    const redisManager = await RedisManager.setup();
    await DataManager.openDbConnection();
    console.log('connected to redis');
    setInterval(async () => {
        try {
            console.log('top')
            await redisManager.set('stop', true);
            const generation = (await redisManager.get<number>('game-generation')) || 1;
            const voteCounts = await DBVote.getVoteCount(generation);

            await S3Manager.uploadJson('layout.json', '{"a":"b"}');
            await S3Manager.uploadJson('game-state.json', '{"a":"b"}');
            await S3Manager.uploadJson('round-state.json', '{"a":"b"}');

            await redisManager.incr('game-generation');
            await redisManager.set('stop', false);
        } catch (ex) {
            console.error(ex);
        }
    }, 1000 * 1);
}
bootstrap().catch(er => console.error(er));
