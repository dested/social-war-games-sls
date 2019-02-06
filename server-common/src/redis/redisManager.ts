import {createClient, RedisClient} from 'redis';
import {Config} from '../config';

export class RedisManager {
  // https://github.com/notenoughneon/typed-promisify/blob/master/index.ts

  private client: RedisClient;
  static manager: RedisManager;

  static setup(): Promise<RedisManager> {
    return new Promise<RedisManager>((res, rej) => {
      if (RedisManager.manager) {
        if (RedisManager.manager.client.connected) {
          res(RedisManager.manager);
          return;
        }
      }
      console.time('connecting redis');
      const manager = new RedisManager();
      RedisManager.manager = manager;
      manager.client = createClient({
        host: Config.redis.host,
        port: Config.redis.port,
        auth_pass: Config.redis.authPass,
      });
      manager.client.on('ready', result => {
        console.timeEnd('connecting redis');
        res(manager);
      });
    });
  }

  getKey(gameId: string, key: string) {
    return gameId + '-' + key;
  }

  get<T>(gameId: string, key: string, def?: T): Promise<T> {
    return new Promise((res, rej) => {
      this.client.get(this.getKey(gameId, key), (err, result) => {
        if (err) {
          rej(err);
          return;
        }

        res((JSON.parse(result) as T) || def);
      });
    });
  }

  getString(gameId: string, key: string, def?: string): Promise<string> {
    return new Promise((res, rej) => {
      this.client.get(this.getKey(gameId, key), (err, result) => {
        if (err) {
          rej(err);
          return;
        }

        res(result || def);
      });
    });
  }

  setString(gameId: string, key: string, value: string): Promise<string> {
    return new Promise((res, rej) => {
      this.client.set(this.getKey(gameId, key), value, (err, result) => {
        if (err) {
          rej(err);
          return;
        }
        res();
      });
    });
  }

  set<T>(gameId: string, key: string, value: T): Promise<void> {
    return new Promise((res, rej) => {
      this.client.set(this.getKey(gameId, key), JSON.stringify(value), (err, result) => {
        if (err) {
          rej(err);
          return;
        }
        res();
      });
    });
  }

  append(gameId: string, key: string, value: string): Promise<void> {
    return new Promise((res, rej) => {
      this.client.append(this.getKey(gameId, key), value, (err, result) => {
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

  expire(gameId: string, key: string, duration: number): Promise<void> {
    return new Promise((res, rej) => {
      this.client.expire(this.getKey(gameId, key), duration, (err, result) => {
        if (err) {
          rej(err);
          return;
        }
        res();
      });
    });
  }

  incr(gameId: string, key: string) {
    return new Promise((res, rej) => {
      this.client.incr(this.getKey(gameId, key), (err, result) => {
        if (err) {
          rej(err);
          return;
        }

        res();
      });
    });
  }
}
