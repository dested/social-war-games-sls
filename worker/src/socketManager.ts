import {Config} from '@swg-server-common/config';
import * as AWS from 'aws-sdk';
import * as IotData from 'aws-sdk/clients/iotdata';

export class SocketManager {
  private static iotData: IotData;
  static open() {
    console.time('opening socket');
    AWS.config.region = Config.awsIotRegion;
    this.iotData = new AWS.IotData({
      endpoint: `a11r7webls2miq-ats.iot.us-west-2.amazonaws.com`,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-west-2:d4f63ed5-7b82-4389-b987-1f8bb7b6ed97',
      }),
    });
    console.timeEnd('opening socket');
  }
  static publish(gameId: string, topic: string, payload: Buffer | string) {
    return new Promise((res, rej) => {
      this.iotData.publish(
        {
          payload,
          topic: `${gameId}/${topic}`,
        },
        (err, data) => {
          if (err) {
            console.log(err);
            rej(err);
          } else {
            res(data);
          }
        }
      );
    });
  }
}
