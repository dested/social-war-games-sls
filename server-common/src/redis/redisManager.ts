import {RedisClient, createClient} from 'redis';
import {Config} from '../config';

export class RedisManager {
    private client: RedisClient;
    static setup(): Promise<RedisManager> {
        return new Promise<RedisManager>((res, rej) => {
            const manager = new RedisManager();

            manager.client = createClient({
                host: Config.redis.host,
                port: Config.redis.port,
                auth_pass: Config.redis.authPass
            });
            manager.client.on('ready', result => {
                res(manager);
            });
        });
    }

    getKey(key: string) {
        return Config.gameKey + '-' + key;
    }

    get<T>(key: string): Promise<T> {
        return new Promise((res, rej) => {
            this.client.get(this.getKey(key), (err, result) => {
                if (err) {
                    rej(err);
                    return;
                }

                res(JSON.parse(result) as T);
            });
        });
    }

    set<T>(key: string, value: T): Promise<void> {
        return new Promise((res, rej) => {
            this.client.set(this.getKey(key), JSON.stringify(value), (err, result) => {
                if (err) {
                    rej(err);
                    return;
                }
                res();
            });
        });
    }

    flushAll(): Promise<void> {
        return new Promise((res, rej) => {
            this.client.flushall((err, result) => {
                if (err) {
                    rej(err);
                    return;
                }
                res();
            });
        });
    }

    expire(key: string, duration: number): Promise<void> {
        return new Promise((res, rej) => {
            this.client.expire(this.getKey(key), duration, (err, result) => {
                if (err) {
                    rej(err);
                    return;
                }
                res();
            });
        });
    }

    incr(key: string) {
        return new Promise((res, rej) => {
            this.client.incr(this.getKey(key), (err, result) => {
                if (err) {
                    rej(err);
                    return;
                }

                res();
            });
        });
    }
}
