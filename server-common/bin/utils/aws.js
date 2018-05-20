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
const uuidv1 = require("uuid/v1");
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
            const key = `avatars/${this.generateAssetName(fileType)}`;
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
    static generateAssetName(fileType) {
        const fileName = uuidv1();
        switch (fileType) {
            case 'image/jpeg':
                return fileName + '.jpg';
            case 'image/png':
                return fileName + '.png';
        }
        return null;
    }
}
exports.AwsUtils = AwsUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2F3cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEscUNBQTZDO0FBRzdDLGtDQUFrQztBQUNsQyxzQ0FBaUM7QUFFakMsZ0JBQU0sQ0FBQyxNQUFNLEdBQUcsZUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNqQyxnQkFBTSxDQUFDLE1BQU0sQ0FBQztJQUNWLFdBQVcsRUFBRSxlQUFNLENBQUMsY0FBYztJQUNsQyxlQUFlLEVBQUUsZUFBTSxDQUFDLGtCQUFrQjtDQUM3QyxDQUFDLENBQUM7QUFFSDtJQUNJLE1BQU0sQ0FBTyxXQUFXLENBQUMsTUFBYyxFQUFFLFFBQWdCOztZQUNyRCxNQUFNLEVBQUUsR0FBRyxJQUFJLFlBQUUsRUFBRSxDQUFDO1lBQ3BCLE1BQU0sR0FBRyxHQUFHLFdBQVcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDMUQsTUFBTSxNQUFNLEdBQUcsZUFBTSxDQUFDLGdCQUFnQixDQUFDO1lBQ3ZDLE1BQU0sRUFBRTtpQkFDSCxTQUFTLENBQUM7Z0JBQ1AsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsR0FBRyxFQUFFLEdBQUc7Z0JBQ1IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQztnQkFDbkMsR0FBRyxFQUFFLGFBQWE7YUFDckIsQ0FBQztpQkFDRCxPQUFPLEVBQUUsQ0FBQztZQUVmLE9BQU8sV0FBVyxNQUFNLHFCQUFxQixHQUFHLEVBQUUsQ0FBQztRQUN2RCxDQUFDO0tBQUE7SUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQW1CLEVBQUUsT0FBZTtRQUMvQyxNQUFNLEdBQUcsR0FBRyxJQUFJLGFBQUcsRUFBRSxDQUFDO1FBQ3RCLE1BQU0sTUFBTSxHQUFHO1lBQ1gsT0FBTyxFQUFFLE9BQU87WUFDaEIsZ0JBQWdCLEVBQUUsUUFBUTtZQUMxQixXQUFXLEVBQUUsV0FBVztTQUMzQixDQUFDO1FBQ0YsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFHTyxNQUFNLENBQUMsaUJBQWlCLENBQUMsUUFBZ0I7UUFDN0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxFQUFFLENBQUM7UUFFMUIsUUFBUSxRQUFRLEVBQUU7WUFDZCxLQUFLLFlBQVk7Z0JBQ2IsT0FBTyxRQUFRLEdBQUcsTUFBTSxDQUFDO1lBQzdCLEtBQUssV0FBVztnQkFDWixPQUFPLFFBQVEsR0FBRyxNQUFNLENBQUM7U0FDaEM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUF2Q0QsNEJBdUNDIn0=