import {Event} from '../utils/models';
import {S3Manager} from '@swg-server-common/s3/s3Manager';
import {StepFunctions} from 'aws-sdk';
import {HttpResponse, respond} from '../utils/respond';

const stepFunctions = new StepFunctions(
  process.env.IS_OFFLINE ? {endpoint: 'http://0.0.0.0:8083', region: 'us-west-2'} : {}
);
export async function startWorkerHandler(
  event: Event<void>
): Promise<HttpResponse<{alreadyOnline: boolean; ready: boolean}>> {
  console.log('starting');
  const data = await S3Manager.getDataFile<{ready: true}>('online.json');
  if (data?.ready) {
    return respond(200, {alreadyOnline: true, ready: false});
  }
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
  return respond(200, {alreadyOnline: false, ready: true});
}

export async function stopWorkerHandler(event: Event<void>): Promise<void> {
  await S3Manager.updateDataFile('online.json', {ready: false});
}
