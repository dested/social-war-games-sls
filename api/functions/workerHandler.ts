import {Event} from '../utils/models';
import {S3Manager} from '@swg-server-common/s3/s3Manager';
import {StepFunctions} from 'aws-sdk';

const stepFunctions = new StepFunctions(
  process.env.IS_OFFLINE ? {endpoint: 'http://0.0.0.0:8083', region: 'us-west-2'} : {}
);
export async function startWorkerHandler(event: Event<void>): Promise<void> {
  console.log('starting');
  await S3Manager.updateDataFile('online.json', {ready: true});
  console.log('upload');
  await stepFunctions
    .startExecution({
      stateMachineArn: process.env.IS_OFFLINE
        ? 'arn:aws:states:us-east-1:114394156384:stateMachine:workRunner'
        : 'arn:aws:states:us-west-2:114394156384:stateMachine:workRunner',
    })
    .promise();
  console.log('started');
}

export async function stopWorkerHandler(event: Event<void>): Promise<void> {
  await S3Manager.updateDataFile('online.json', {ready: false});
}
