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

  static async get<T>(big: boolean, gameId: string, key: string, def?: T): Promise<T> {
    const result = await this.getString(big, gameId, key);

    return result ? (JSON.parse(result) as T) : def;
  }

  static async getString(big: boolean, gameId: string, key: string, def?: string): Promise<string> {
    if (big) {
      const result = await ddb
        .get({
          TableName: 'swg-redis-table',
          Key: {
            key: this.getKey(gameId, key) + '-size',
          },
        })
        .promise();

      if (result.Item?.value) {
        const items = await Promise.all(
          Array.from(Array(result.Item?.value)).map((item, index) =>
            ddb
              .get({
                TableName: 'swg-redis-table',
                Key: {
                  key: this.getKey(gameId, key) + '-' + index,
                },
              })
              .promise()
          )
        );
        return items.map((a) => a.Item.value).join('');
      } else {
        return def;
      }
    } else {
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
  }

  static async setString(big: boolean, gameId: string, key: string, value: string): Promise<void> {
    if (big) {
      const items = value.match(new RegExp('.{1,' + (400 * 1000 - 1) + '}', 'g'));
      await Promise.all([
        ddb
          .put({
            TableName: 'swg-redis-table',
            Item: {
              key: this.getKey(gameId, key) + '-size',
              value: items.length,
            },
          })
          .promise(),
        ...items.map((a, ind) =>
          ddb
            .put({
              TableName: 'swg-redis-table',
              Item: {
                key: this.getKey(gameId, key) + '-' + ind,
                value: a,
              },
            })
            .promise()
        ),
      ]);
    } else {
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
  }

  static async set<T>(big: boolean, gameId: string, key: string, value: T): Promise<void> {
    await this.setString(big, gameId, key, JSON.stringify(value));
  }

  static async append(big: boolean, gameId: string, key: string, value: string): Promise<void> {
    const old = await this.getString(big, gameId, key);
    await this.setString(big, gameId, key, old + value);
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

  static async expire(big: boolean, gameId: string, key: string, duration: number): Promise<void> {
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
