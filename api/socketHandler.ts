import {DynamoDB} from 'aws-sdk';
import {APIGatewayRequestAuthorizerEvent} from 'aws-lambda';
import {Config} from '../server-common/src/config';
import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';

const options: DocumentClient.DocumentClientOptions & DynamoDB.Types.ClientConfiguration = {
  apiVersion: '2012-08-10',
  region: 'us-west-2',
};
if (Config.env === 'DEV') {
  options.region = 'localhost';
  options.endpoint = 'http://localhost:8020';
}
const ddb = new DynamoDB.DocumentClient(options);

exports.connect = async (event: APIGatewayRequestAuthorizerEvent) => {
  console.log('open', event.queryStringParameters['gameId'], event.queryStringParameters['faction']);
  try {
    await ddb
      .put({
        TableName: 'swg-connections',
        Item: {
          connectionId: event.requestContext.connectionId,
          gameIdFactionId: event.queryStringParameters['gameId'] + '-' + event.queryStringParameters['faction'],
        },
      })
      .promise();
  } catch (err) {
    return {statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(err)};
  }

  return {statusCode: 200};
};

exports.disconnect = async (event: APIGatewayRequestAuthorizerEvent) => {
  console.log('close');
  try {
    await ddb
      .delete({
        TableName: 'swg-connections',
        Key: {connectionId: event.requestContext.connectionId},
      })
      .promise();
  } catch (err) {
    console.error(err);
    return {statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(err)};
  }

  return {statusCode: 200};
};
