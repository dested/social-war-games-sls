import * as AWS from 'aws-sdk/global';
import * as AWSMqtt from 'aws-mqtt';
import {RoundState} from '@swg-common/models/roundState';
import {RoundStateParser} from '@swg-common/utils/RoundStateParser';
AWS.config.region = 'us-west-2';

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-west-2:72aa50f2-bbec-4cc6-848e-d3bfb5058d7c'
});

let params = {
    WebSocket: (window as any).WebSocket,
    credentials: AWS.config.credentials,
    region: 'us-west-2',
    clientId: 'mqtt-client-' + Math.floor(Math.random() * 100000 + 1),
    endpoint: 'a11r7webls2miq.iot.us-west-2.amazonaws.com'
};

export class SocketUtils {
    private static client: any;

    static connect(factionToken: string, onMessage: (roundState: RoundState) => void) {
        this.client = AWSMqtt.connect(params);
        this.client.on('connect', () => {
            console.log('connected');
            this.client.subscribe(`round-state-${factionToken}`);
        });
        this.client.on('message', (topic: string, buffer: Uint8Array) => {
            const text = new TextDecoder('utf-8').decode(buffer);
            const round = RoundStateParser.toRoundState(text);
            console.log(buffer.length,text);
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
