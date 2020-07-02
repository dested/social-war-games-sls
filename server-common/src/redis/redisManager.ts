import {DynamoDB} from 'aws-sdk';
import {Config} from '@swg-server-common/config';

const options: DynamoDB.Types.ClientConfiguration = {
  apiVersion: '2012-08-10',
  region: 'us-west-2',
};
if (process.env.IS_OFFLINE) {
  options.region = 'localhost';
  options.endpoint = 'http://localhost:8020';
}
const ddb = new DynamoDB.DocumentClient(options);

export class RedisManager {
  static getKey(gameId: string, key: string) {
    return gameId + '-' + key;
  }

  static async get<T>(gameId: string, key: string, def?: T): Promise<T> {
    const result = await this.getString(gameId, key);

    return result ? (JSON.parse(result) as T) : def;
  }

  static async getString(gameId: string, key: string, def?: string): Promise<string> {
    const result = await ddb
      .get({
        TableName: 'swg-redis-table',
        Key: {
          key: this.getKey(gameId, key),
        },
      })
      .promise();
    if (result.Item?.value) {
      return result.Item?.value;
    } else {
      return def;
    }
  }

  static async setString(gameId: string, key: string, value: string): Promise<void> {
    await ddb
      .put({
        TableName: 'swg-redis-table',
        Item: {
          key: this.getKey(gameId, key),
          value,
        },
      })
      .promise();
  }

  static async getBinary(gameId: string, key: string): Promise<ArrayBuffer> {
    const result = await ddb
      .get({
        TableName: 'swg-redis-table',
        Key: {
          key: this.getKey(gameId, key),
        },
      })
      .promise();
    if (result.Item?.value) {
      return result.Item.value.buffer;
    }
  }
  static async setBinary(gameId: string, key: string, value: ArrayBuffer): Promise<void> {
    await ddb.put({TableName: 'swg-redis-table', Item: {key: this.getKey(gameId, key), value}}).promise();
  }

  static async set<T>(gameId: string, key: string, value: T): Promise<void> {
    await this.setString(gameId, key, JSON.stringify(value));
  }

  static async append(gameId: string, key: string, value: string): Promise<void> {
    const old = await this.getString(gameId, key);
    await this.setString(gameId, key, old + value);
  }

  static async flushAll(): Promise<void> {
    /*
    return new Promise((res, rej) => {
      this.client.flushall((err, result) => {
        if (err) {
          rej(err);
          return;
        }
        res();
      });
    });
*/
  }

  static async expire(gameId: string, key: string, duration: number): Promise<void> {
    return;
    const result = await ddb
      .get({
        TableName: 'swg-redis-table',
        Key: {
          key: this.getKey(gameId, key),
        },
      })
      .promise();

    if (!result.Item?.value) return;
    await ddb
      .put({
        TableName: 'swg-redis-table',
        Item: {
          ...result.Item,
        },
      })
      .promise();
  }

  static async incr(gameId: string, key: string) {
    const result = await ddb
      .get({
        TableName: 'swg-redis-table',
        Key: {
          key: this.getKey(gameId, key),
        },
      })
      .promise();
    if (result.Item) {
      await ddb
        .put({
          TableName: 'swg-redis-table',
          Item: {
            ...result.Item,
            value: (parseInt(result.Item.value) + 1).toString(),
          },
        })
        .promise();
    }
  }
}
