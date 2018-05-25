import {config, S3, SES, SNS} from 'aws-sdk';
import {Config} from '../config';

config.region = Config.awsRegion;
config.update({
    accessKeyId: Config.awsAccessKeyId,
    secretAccessKey: Config.awsSecretAccessKey
});

export class S3Manager {
    static async uploadJson(key: string, content: string) {
        const s3 = new S3();
        const bucket = Config.awsContentBucket;
        await s3
            .putObject({
                Bucket: bucket,
                Key: key,
                Body: content,
                ACL: 'public-read'
            })
            .promise();

        return `https://${bucket}.s3.amazonaws.com/${key}`;
    }
}
