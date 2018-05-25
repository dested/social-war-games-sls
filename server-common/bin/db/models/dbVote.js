"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataManager_1 = require("../dataManager");
const mongoDocument_1 = require("./mongoDocument");
class DBVote extends mongoDocument_1.MongoDocument {
    static getVoteCount(generation) {
        return this.db.aggregate([
            {
                $match: {
                    generation
                }
            },
            {
                $group: {
                    _id: {
                        entityId: '$entityId',
                        action: '$action',
                        hexId: '$hexId'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.entityId',
                    actions: {
                        $push: {
                            action: '$_id.action',
                            hexId: '$_id.hexId',
                            count: '$count'
                        }
                    }
                }
            }
        ]);
    }
}
DBVote.collectionName = 'vote';
DBVote.db = new dataManager_1.DocumentManager(DBVote.collectionName);
exports.DBVote = DBVote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGJWb3RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RiL21vZGVscy9kYlZvdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnREFBK0M7QUFDL0MsbURBQThDO0FBTTlDLFlBQW9CLFNBQVEsNkJBQWE7SUFXckMsTUFBTSxDQUFDLFlBQVksQ0FBQyxVQUFrQjtRQUNsQyxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDO1lBQ3JCO2dCQUNJLE1BQU0sRUFBRTtvQkFDSixVQUFVO2lCQUNiO2FBQ0o7WUFDRDtnQkFDSSxNQUFNLEVBQUU7b0JBQ0osR0FBRyxFQUFFO3dCQUNELFFBQVEsRUFBRSxXQUFXO3dCQUNyQixNQUFNLEVBQUUsU0FBUzt3QkFDakIsS0FBSyxFQUFFLFFBQVE7cUJBQ2xCO29CQUNELEtBQUssRUFBRSxFQUFDLElBQUksRUFBRSxDQUFDLEVBQUM7aUJBQ25CO2FBQ0o7WUFDRDtnQkFDSSxNQUFNLEVBQUU7b0JBQ0osR0FBRyxFQUFFLGVBQWU7b0JBQ3BCLE9BQU8sRUFBRTt3QkFDTCxLQUFLLEVBQUU7NEJBQ0gsTUFBTSxFQUFFLGFBQWE7NEJBQ3JCLEtBQUssRUFBRSxZQUFZOzRCQUNuQixLQUFLLEVBQUUsUUFBUTt5QkFDbEI7cUJBQ0o7aUJBQ0o7YUFDSjtTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7O0FBeENNLHFCQUFjLEdBQUcsTUFBTSxDQUFDO0FBQ3hCLFNBQUUsR0FBRyxJQUFJLDZCQUFlLENBQVMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBRm5FLHdCQTBDQyJ9