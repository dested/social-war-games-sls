import {config, Lambda} from 'aws-sdk';

config.region = 'us-west-2';
const lambda = new Lambda(process.env.IS_OFFLINE ? {endpoint: 'http://0.0.0.0:3002', region: 'us-west-2'} : {});

exports.iterator = async (event: any) => {
  try {
    if (!event.iterator) {
      event.iterator = {index: 0};
    }

    const index = event.iterator.index;

    const step = index % 6 === 0 ? 'swg-dev-work' : 'swg-dev-roundUpdate';
    console.log('step', step);
    await lambda.invoke({FunctionName: step, InvocationType: 'Event'}).promise();
    console.log('done');

    return {
      index: index + 1,
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
