"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    static arrayToDictionary(array, callback) {
        return array.reduce((a, b) => {
            a[callback(b)] = b;
            return a;
        }, {});
    }
    static timeout(timeout) {
        return new Promise(res => {
            setTimeout(() => {
                res();
            }, timeout);
        });
    }
}
exports.Utils = Utils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtJQUNJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBSSxLQUFVLEVBQUUsUUFBbUM7UUFDdkUsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUNmLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ0wsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQixPQUFPLENBQUMsQ0FBQztRQUNiLENBQUMsRUFDRCxFQUFTLENBQ1osQ0FBQztJQUNOLENBQUM7SUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQWU7UUFDMUIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNyQixVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNaLEdBQUcsRUFBRSxDQUFDO1lBQ1YsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBbEJELHNCQWtCQyJ9