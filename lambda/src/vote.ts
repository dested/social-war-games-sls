import {RedisClient} from 'redis';
import {DataManager} from 'swg-server-common/bin/db/dataManager';
import {DBUser} from 'swg-server-common/bin/db/models/dbUser';

export const handler = async (event: Event) => {
    const redis = eval('require')('redis');

    console.log('auth', event);
    try {
        const client = redis.createClient({
            url: 'redis://swg.cl6fvk.0001.usw2.cache.amazonaws.com:6379'
        });
        console.log('connecting');
        await redisReady(client);
        console.log('connected to redis');
        const result = await redisGet<boolean>(client, 'stop');
        await DataManager.openDbConnection();
        const foundUsers = await DBUser.db.count({email: 'a@a.com'});
        console.log(foundUsers);
        console.log('is stopped', result);
        if (result) {
            return 'stopped';
        }
    } catch (ex) {
        console.log('er', ex);
        return 'fail';
    }
    return 'good';
};

const gameKey = 'abc123';
const getKey = (key: string) => {
    return gameKey + '-' + key;
};

const redisGet = <T>(client: RedisClient, key: string) => {
    return new Promise((res, rej) => {
        client.get(getKey(key), (err, result) => {
            if (err) {
                rej(err);
                return;
            }

            res(JSON.parse(result) as T);
        });
    });
};
const redisReady = <T>(client: RedisClient) => {
    return new Promise((res, rej) => {
        console.log('getting ready');
        client.on('ready', result => {
            console.log('got ready', result);
            res();
        });
    });
};

interface Event {
    body: string;
    headers: Headers;
    httpMethod: string;
    path: string;
}

interface Headers {
    Authorization: string;
}
