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
class S3Manager {
    static uploadJson(key, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const s3 = new aws_sdk_1.S3();
            const bucket = config_1.Config.awsContentBucket;
            yield s3
                .putObject({
                Bucket: bucket,
                Key: key,
                Body: content,
                ACL: 'public-read'
            })
                .promise();
            return `https://${bucket}.s3.amazonaws.com/${key}`;
        });
    }
}
exports.S3Manager = S3Manager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczNNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3MzL3MzTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEscUNBQTZDO0FBQzdDLHNDQUFpQztBQUVqQyxnQkFBTSxDQUFDLE1BQU0sR0FBRyxlQUFNLENBQUMsU0FBUyxDQUFDO0FBQ2pDLGdCQUFNLENBQUMsTUFBTSxDQUFDO0lBQ1YsV0FBVyxFQUFFLGVBQU0sQ0FBQyxjQUFjO0lBQ2xDLGVBQWUsRUFBRSxlQUFNLENBQUMsa0JBQWtCO0NBQzdDLENBQUMsQ0FBQztBQUVIO0lBQ0ksTUFBTSxDQUFPLFVBQVUsQ0FBQyxHQUFXLEVBQUUsT0FBZTs7WUFDaEQsTUFBTSxFQUFFLEdBQUcsSUFBSSxZQUFFLEVBQUUsQ0FBQztZQUNwQixNQUFNLE1BQU0sR0FBRyxlQUFNLENBQUMsZ0JBQWdCLENBQUM7WUFDdkMsTUFBTSxFQUFFO2lCQUNILFNBQVMsQ0FBQztnQkFDUCxNQUFNLEVBQUUsTUFBTTtnQkFDZCxHQUFHLEVBQUUsR0FBRztnQkFDUixJQUFJLEVBQUUsT0FBTztnQkFDYixHQUFHLEVBQUUsYUFBYTthQUNyQixDQUFDO2lCQUNELE9BQU8sRUFBRSxDQUFDO1lBRWYsT0FBTyxXQUFXLE1BQU0scUJBQXFCLEdBQUcsRUFBRSxDQUFDO1FBQ3ZELENBQUM7S0FBQTtDQUNKO0FBZkQsOEJBZUMifQ==