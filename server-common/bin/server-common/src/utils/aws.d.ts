import { SNS } from 'aws-sdk';
import { AWSError } from 'aws-sdk/lib/error';
import { PromiseResult } from 'aws-sdk/lib/request';
export declare class AwsUtils {
    static uploadImage(base64: string, fileType: string): Promise<string>;
    static sendSms(phoneNumber: string, message: string): Promise<PromiseResult<SNS.PublishResponse, AWSError>>;
}
