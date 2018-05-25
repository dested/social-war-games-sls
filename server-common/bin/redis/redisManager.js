"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const config_1 = require("../config");
class RedisManager {
    static setup() {
        return new Promise((res, rej) => {
            const manager = new RedisManager();
            manager.client = redis_1.createClient({
                url: config_1.Config.redisUrl
            });
            manager.client.on('ready', result => {
                res(manager);
            });
        });
    }
    getKey(key) {
        return config_1.Config.gameKey + '-' + key;
    }
    get(key) {
        return new Promise((res, rej) => {
            this.client.get(this.getKey(key), (err, result) => {
                if (err) {
                    rej(err);
                    return;
                }
                res(JSON.parse(result));
            });
        });
    }
    set(key, value) {
        return new Promise((res, rej) => {
            this.client.set(this.getKey(key), JSON.stringify(value), (err, result) => {
                if (err) {
                    rej(err);
                    return;
                }
                res();
            });
        });
    }
    expire(key, duration) {
        return new Promise((res, rej) => {
            this.client.expire(this.getKey(key), duration, (err, result) => {
                if (err) {
                    rej(err);
                    return;
                }
                res();
            });
        });
    }
    incr(key) {
        return new Promise((res, rej) => {
            this.client.incr(this.getKey(key), (err, result) => {
                if (err) {
                    rej(err);
                    return;
                }
                res();
            });
        });
    }
}
exports.RedisManager = RedisManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkaXNNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JlZGlzL3JlZGlzTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUFnRDtBQUNoRCxzQ0FBaUM7QUFFakM7SUFFSSxNQUFNLENBQUMsS0FBSztRQUNSLE9BQU8sSUFBSSxPQUFPLENBQWUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDMUMsTUFBTSxPQUFPLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUVuQyxPQUFPLENBQUMsTUFBTSxHQUFHLG9CQUFZLENBQUM7Z0JBQzFCLEdBQUcsRUFBRSxlQUFNLENBQUMsUUFBUTthQUN2QixDQUFDLENBQUM7WUFDSCxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQ2hDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFXO1FBQ2QsT0FBTyxlQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDdEMsQ0FBQztJQUVELEdBQUcsQ0FBSSxHQUFXO1FBQ2QsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUM5QyxJQUFJLEdBQUcsRUFBRTtvQkFDTCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ1QsT0FBTztpQkFDVjtnQkFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQU0sQ0FBQyxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsR0FBRyxDQUFJLEdBQVcsRUFBRSxLQUFRO1FBQ3hCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNyRSxJQUFJLEdBQUcsRUFBRTtvQkFDTCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ1QsT0FBTztpQkFDVjtnQkFDRCxHQUFHLEVBQUUsQ0FBQztZQUNWLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQVcsRUFBRSxRQUFnQjtRQUNoQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUMzRCxJQUFJLEdBQUcsRUFBRTtvQkFDTCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ1QsT0FBTztpQkFDVjtnQkFDRCxHQUFHLEVBQUUsQ0FBQztZQUNWLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsSUFBSSxDQUFDLEdBQVc7UUFDWixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQy9DLElBQUksR0FBRyxFQUFFO29CQUNMLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDVCxPQUFPO2lCQUNWO2dCQUVELEdBQUcsRUFBRSxDQUFDO1lBQ1YsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXBFRCxvQ0FvRUMifQ==