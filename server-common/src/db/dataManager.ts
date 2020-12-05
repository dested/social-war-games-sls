import {AggregationCursor, Cursor, Db, IndexOptions, MongoClient} from 'mongodb';
import {Config} from '../config';
import {Utils} from '@swg-common/utils/utils';

let mongoClient: MongoClient;
let firstTime = true;

let retries = 0;
export class DataManager {
  static async disconnectDB() {
    try {
      if (mongoClient) {
        await mongoClient.close();
        mongoClient = null;
        firstTime = true;
      }
    } catch (ex) {
      console.error('disconnect db error', ex);
    }
  }
  static async dbConnection(): Promise<Db> {
    if (!mongoClient || !mongoClient.isConnected()) {
      if (!firstTime) {
        console.log('dbConnection hot but disconnected');
        await this.disconnectDB();
      } else {
        console.log('dbConnection cold');
        firstTime = false;
      }
      try {
        mongoClient =
          mongoClient ||
          new MongoClient(Config.dbConnection, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            loggerLevel: 'error',
            logger: (e, b) => console.log(b, e),
          });
        await mongoClient.connect();
        retries = 0;
      } catch (ex) {
        console.error('dbConnection error');
        console.error(ex);
        retries++;
        if (retries > 3) {
          throw new Error(`An unexpected error has occurred.`);
        }
        await Utils.timeout(1000);
        return this.dbConnection();
      }
    } else {
      // console.log('db connection hot ');
    }
    const db = mongoClient.db(Config.dbName);
    // console.log('got db');
    return db;
  }
}
