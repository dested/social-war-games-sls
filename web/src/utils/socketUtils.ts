import {RoundState} from '@swg-common/models/roundState';
import {RoundStateParser} from '@swg-common/parsers/roundStateParser';
import * as AWSMqtt from 'aws-mqtt';
import * as AWS from 'aws-sdk/global';
AWS.config.region = 'us-west-2';

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-west-2:72aa50f2-bbec-4cc6-848e-d3bfb5058d7c',
});

const params = {
  WebSocket: (window as any).WebSocket,
  credentials: AWS.config.credentials,
  region: 'us-west-2',
  endpoint: 'a11r7webls2miq-ats.iot.us-west-2.amazonaws.com',
};

export class SocketUtils {
  private static client: any;

  static connect(gameId: string, clientId: string, factionToken: string, onMessage: (roundState: RoundState) => void) {
    this.client = AWSMqtt.connect({...params, clientId});
    this.client.on('connect', () => {
      console.log('connected');
      this.client.subscribe(`${gameId}/round-state-${factionToken}`);
    });
    this.client.on('message', (topic: string, buffer: Uint8Array) => {
      const round = RoundStateParser.toRoundState(new Uint8Array(buffer).buffer);
      onMessage(round);
    });
    this.client.on('close', (err: string) => {
      console.log('Closed  :-(', err);
    });
    this.client.on('offline', () => {
      console.log('Went offline  :-(');
    });
  }
}
