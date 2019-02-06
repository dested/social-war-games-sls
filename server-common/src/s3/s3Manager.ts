import {S3} from 'aws-sdk';
import {Config} from '../config';

const s3 = new S3({
  region: Config.awsRegion,
  accessKeyId: Config.awsAccessKeyId,
  secretAccessKey: Config.awsSecretAccessKey,
});

export class S3Manager {
  static async uploadJson(key: string, content: string, cache: boolean) {
    const bucket = Config.awsContentBucket;
    await s3
      .putObject({
        Bucket: bucket,
        Key: key,
        Body: content,
        ACL: 'public-read',
        ContentType: 'application/json',
        ...(cache ? {CacheControl: 'max-age=86400'} : {}),
      })
      .promise();

    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }

  static async uploadBytes(key: string, content: Buffer, cache: boolean) {
    const bucket = Config.awsContentBucket;
    await s3
      .putObject({
        Bucket: bucket,
        Key: key,
        Body: content,
        ACL: 'public-read',
        ContentType: 'application/octet-stream',
        ...(cache ? {CacheControl: 'max-age=86400'} : {}),
      })
      .promise();

    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
}
