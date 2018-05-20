"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataManager_1 = require("../dataManager");
const mongoDocument_1 = require("./mongoDocument");
class DBUser extends mongoDocument_1.MongoDocument {
    static map(e) {
        return {
            id: e._id.toHexString(),
            email: e.email,
            factionId: e.factionId,
            maxVotesPerRound: e.maxVotesPerRound
        };
    }
}
DBUser.collectionName = 'user';
DBUser.db = new dataManager_1.DocumentManager(DBUser.collectionName);
exports.DBUser = DBUser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGJVc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2RiL21vZGVscy9kYlVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnREFBK0M7QUFDL0MsbURBQThDO0FBRzlDLFlBQW9CLFNBQVEsNkJBQWE7SUFTckMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFTO1FBQ2hCLE9BQU87WUFDSCxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUU7WUFDdkIsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO1lBQ2QsU0FBUyxFQUFFLENBQUMsQ0FBQyxTQUFTO1lBQ3RCLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxnQkFBZ0I7U0FDdkMsQ0FBQztJQUNOLENBQUM7O0FBZk0scUJBQWMsR0FBRyxNQUFNLENBQUM7QUFDeEIsU0FBRSxHQUFHLElBQUksNkJBQWUsQ0FBUyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7QUFGbkUsd0JBaUJDIn0=