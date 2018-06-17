import {config, S3} from 'aws-sdk';
import {Config} from '../config';

export class S3Manager {
    static async uploadJson(key: string, content: string) {
        const s3 = new S3({
            region: Config.awsRegion,
            accessKeyId: Config.awsAccessKeyId,
            secretAccessKey: Config.awsSecretAccessKey
        });
        const bucket = Config.awsContentBucket;
        await s3
            .putObject({
                Bucket: bucket,
                Key: key,
                Body: content,
                ACL: 'public-read',
                ContentType: 'application/json'
            })
            .promise();

        return `https://${bucket}.s3.amazonaws.com/${key}`;
    }
}
