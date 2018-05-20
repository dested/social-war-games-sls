import {config, S3, SES, SNS} from 'aws-sdk';
import {AWSError} from 'aws-sdk/lib/error';
import {PromiseResult} from 'aws-sdk/lib/request';
import {Config} from '../config';

config.region = Config.awsRegion;
config.update({
    accessKeyId: Config.awsAccessKeyId,
    secretAccessKey: Config.awsSecretAccessKey
});

export class AwsUtils {
    static async uploadImage(base64: string, fileType: string) {
        const s3 = new S3();
        const key = `avatars/a`;
        const bucket = Config.awsContentBucket;
        await s3
            .putObject({
                Bucket: bucket,
                Key: key,
                Body: Buffer.from(base64, 'base64'),
                ACL: 'public-read'
            })
            .promise();

        return `https://${bucket}.s3.amazonaws.com/${key}`;
    }

    static sendSms(phoneNumber: string, message: string) {
        const sns = new SNS();
        const params = {
            Message: message,
            MessageStructure: 'string',
            PhoneNumber: phoneNumber
        };
        return sns.publish(params).promise();
    }


}
