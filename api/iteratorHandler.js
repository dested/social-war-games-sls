const {config, Lambda} = require('aws-sdk');
config.region = 'us-west-2';
const lambda = new Lambda();

exports.iterator = async (event, context) => {
  console.log('iterator', event.iterator);
  let index = event.iterator.index;
  const step = event.iterator.step;
  const count = event.iterator.count;

  index += step;
  /*
  lambda.invoke({
    FunctionName: 'Lambda_B', // the lambda function we are going to invoke
    InvocationType: 'RequestResponse',
    Payload: '{ "name" : "Alex" }',
  }).then(()=>{});
*/

  return {
    count,
    index,
    step,
    continue: index < count,
  };
};
