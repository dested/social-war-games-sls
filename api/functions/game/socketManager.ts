import {DynamoDB, ApiGatewayManagementApi} from 'aws-sdk';
import {Config} from '@swg-server-common/config';
import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';

const options: DocumentClient.DocumentClientOptions & DynamoDB.Types.ClientConfiguration = {
  apiVersion: '2012-08-10',
  region: 'us-west-2',
};
if (process.env.IS_OFFLINE) {
  options.region = 'localhost';
  options.endpoint = 'http://localhost:8020';
}
const ddb = new DynamoDB.DocumentClient(options);
const publishUrl = () => {
  if (process.env.IS_OFFLINE) {
    return `http://localhost:3001`;
  } else {
    return `https://ws.socialwargames.com`;
  }
};
const apigwManagementApi = new ApiGatewayManagementApi({
  apiVersion: '2018-11-29',
  endpoint: publishUrl(),
  region: process.env.IS_OFFLINE ? 'localhost' : 'us-west-2',
});

export class SocketManager {
  static async publish(gameId: string, faction: string, payload: Buffer) {
    let connectionData;
    try {
      connectionData = await ddb
        .scan({
          TableName: 'swg-connections',
          IndexName: 'GameFactionIndex',
          FilterExpression: '#gameIdFactionId = :gameIdFactionId',
          ExpressionAttributeNames: {
            '#gameIdFactionId': 'gameIdFactionId',
          },
          ExpressionAttributeValues: {
            ':gameIdFactionId': gameId + '-' + faction,
          },
          ProjectionExpression: 'connectionId',
        })
        .promise();
    } catch (e) {
      console.error(e);
      return;
    }
    console.log(connectionData.Items.length, gameId, faction);
    const payloadStr = payload.toString('hex');
    const postCalls = connectionData.Items.map(async ({connectionId}) => {
      try {
        await apigwManagementApi
          .postToConnection({
            ConnectionId: connectionId,
            Data: payloadStr,
          })
          .promise();
      } catch (e) {
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connectionId}`);
          await ddb.delete({TableName: 'swg-connections', Key: {connectionId}}).promise();
        } else {
          throw e;
        }
      }
    });

    try {
      await Promise.all(postCalls);
    } catch (e) {
      console.error(e);
    }
  }
}
