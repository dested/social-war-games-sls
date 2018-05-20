"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const config_1 = require("../config");
aws_sdk_1.config.region = config_1.Config.awsRegion;
aws_sdk_1.config.update({
    accessKeyId: config_1.Config.awsAccessKeyId,
    secretAccessKey: config_1.Config.awsSecretAccessKey
});
class AwsUtils {
    static uploadImage(base64, fileType) {
        return __awaiter(this, void 0, void 0, function* () {
            const s3 = new aws_sdk_1.S3();
            const key = `avatars/a`;
            const bucket = config_1.Config.awsContentBucket;
            yield s3
                .putObject({
                Bucket: bucket,
                Key: key,
                Body: Buffer.from(base64, 'base64'),
                ACL: 'public-read'
            })
                .promise();
            return `https://${bucket}.s3.amazonaws.com/${key}`;
        });
    }
    static sendSms(phoneNumber, message) {
        const sns = new aws_sdk_1.SNS();
        const params = {
            Message: message,
            MessageStructure: 'string',
            PhoneNumber: phoneNumber
        };
        return sns.publish(params).promise();
    }
}
exports.AwsUtils = AwsUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWxzL2F3cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEscUNBQTZDO0FBRzdDLHNDQUFpQztBQUVqQyxnQkFBTSxDQUFDLE1BQU0sR0FBRyxlQUFNLENBQUMsU0FBUyxDQUFDO0FBQ2pDLGdCQUFNLENBQUMsTUFBTSxDQUFDO0lBQ1YsV0FBVyxFQUFFLGVBQU0sQ0FBQyxjQUFjO0lBQ2xDLGVBQWUsRUFBRSxlQUFNLENBQUMsa0JBQWtCO0NBQzdDLENBQUMsQ0FBQztBQUVIO0lBQ0ksTUFBTSxDQUFPLFdBQVcsQ0FBQyxNQUFjLEVBQUUsUUFBZ0I7O1lBQ3JELE1BQU0sRUFBRSxHQUFHLElBQUksWUFBRSxFQUFFLENBQUM7WUFDcEIsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDO1lBQ3hCLE1BQU0sTUFBTSxHQUFHLGVBQU0sQ0FBQyxnQkFBZ0IsQ0FBQztZQUN2QyxNQUFNLEVBQUU7aUJBQ0gsU0FBUyxDQUFDO2dCQUNQLE1BQU0sRUFBRSxNQUFNO2dCQUNkLEdBQUcsRUFBRSxHQUFHO2dCQUNSLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUM7Z0JBQ25DLEdBQUcsRUFBRSxhQUFhO2FBQ3JCLENBQUM7aUJBQ0QsT0FBTyxFQUFFLENBQUM7WUFFZixPQUFPLFdBQVcsTUFBTSxxQkFBcUIsR0FBRyxFQUFFLENBQUM7UUFDdkQsQ0FBQztLQUFBO0lBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFtQixFQUFFLE9BQWU7UUFDL0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxhQUFHLEVBQUUsQ0FBQztRQUN0QixNQUFNLE1BQU0sR0FBRztZQUNYLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLGdCQUFnQixFQUFFLFFBQVE7WUFDMUIsV0FBVyxFQUFFLFdBQVc7U0FDM0IsQ0FBQztRQUNGLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0NBR0o7QUE1QkQsNEJBNEJDIn0=