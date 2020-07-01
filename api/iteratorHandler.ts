import {config, Lambda, StepFunctions} from 'aws-sdk';
import {S3Manager} from '@swg-server-common/s3/s3Manager';

config.region = 'us-west-2';
const lambda = new Lambda(process.env.IS_OFFLINE ? {endpoint: 'http://0.0.0.0:3002', region: 'us-west-2'} : {});
const stepFunctions = new StepFunctions(
  process.env.IS_OFFLINE ? {endpoint: 'http://0.0.0.0:8083', region: 'us-west-2'} : {}
);

exports.iterator = async (event: any) => {
  try {
    if (!event.iterator) {
      event.iterator = {index: 0};
    }

    if (event.iterator.next) {
      await stepFunctions
        .startExecution({
          stateMachineArn: process.env.IS_OFFLINE
            ? 'arn:aws:states:us-east-1:114394156384:stateMachine:workRunner'
            : 'arn:aws:states:us-west-2:114394156384:stateMachine:workRunner',
        })
        .promise();
      return {continue: false, next: false};
    }

    const isReady = await S3Manager.getDataFile<{ready: boolean}>('online.json');
    if (!isReady || !isReady.ready) {
      return {
        index: 0,
        continue: false,
        next: false
      };
    }

    let index = event.iterator.index;

    const step = index === 0 ? 'swg-dev-work' : 'swg-dev-roundUpdate';
    await lambda.invoke({FunctionName: step, InvocationType: 'Event'}).promise();

    index++;
    if (index === 6) {
      return {
        continue: false,
        next: true,
      };
    }

    return {
      index,
      continue: true,
    };
  } catch (ex) {
    console.error(ex);
    return {
      index: 0,
      continue: false,
    };
  }
};
