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
const bson_1 = require("bson");
const mongodb_1 = require("mongodb");
const config_1 = require("../config");
const queryBuilder_1 = require("../utils/queryBuilder");
class DataManager {
    static openDbConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.dbConnection) {
                this.dbConnection = (yield mongodb_1.MongoClient.connect(config_1.Config.dbConnection)).db(config_1.Config.dbName);
            }
        });
    }
    static closeDbConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.dbConnection) {
                yield this.dbConnection.close();
                this.dbConnection = undefined;
            }
        });
    }
}
exports.DataManager = DataManager;
class DocumentManager {
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.query = new queryBuilder_1.QueryBuilder();
    }
    insertDocument(document) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield DataManager.dbConnection.collection(this.collectionName).insertOne(document);
            document._id = result.insertedId;
            return document;
        });
    }
    updateDocument(document) {
        return __awaiter(this, void 0, void 0, function* () {
            DataManager.dbConnection.collection(this.collectionName).findOneAndUpdate({ _id: document._id }, document);
            return document;
        });
    }
    getOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DataManager.dbConnection.collection(this.collectionName).findOne(query);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const objectId = typeof id === 'string' ? new bson_1.ObjectID(id) : id;
            return yield DataManager.dbConnection.collection(this.collectionName).findOne({ _id: objectId });
        });
    }
    getAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield DataManager.dbConnection.collection(this.collectionName).find(query)).toArray();
        });
    }
    count(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DataManager.dbConnection.collection(this.collectionName).count(query);
        });
    }
    ensureIndex(spec, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DataManager.dbConnection.collection(this.collectionName).createIndex(spec, options);
        });
    }
}
exports.DocumentManager = DocumentManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZGIvZGF0YU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLCtCQUE4QjtBQUM5QixxQ0FBc0Q7QUFDdEQsc0NBQWlDO0FBQ2pDLHdEQUFtRDtBQUduRDtJQUdJLE1BQU0sQ0FBTyxnQkFBZ0I7O1lBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUNwQixJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsTUFBTSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxlQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzFGO1FBQ0wsQ0FBQztLQUFBO0lBRUQsTUFBTSxDQUFPLGlCQUFpQjs7WUFDMUIsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUNuQixNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBVSxDQUFDO2FBQ2xDO1FBQ0wsQ0FBQztLQUFBO0NBQ0o7QUFmRCxrQ0FlQztBQUVEO0lBR0ksWUFBb0IsY0FBc0I7UUFBdEIsbUJBQWMsR0FBZCxjQUFjLENBQVE7UUFGMUMsVUFBSyxHQUFHLElBQUksMkJBQVksRUFBSyxDQUFDO0lBRWUsQ0FBQztJQUV4QyxjQUFjLENBQUMsUUFBVzs7WUFDNUIsTUFBTSxNQUFNLEdBQUcsTUFBTSxXQUFXLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xHLFFBQVEsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztZQUNqQyxPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDO0tBQUE7SUFFSyxjQUFjLENBQUMsUUFBVzs7WUFDNUIsV0FBVyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN6RyxPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDO0tBQUE7SUFFSyxNQUFNLENBQUMsS0FBVTs7WUFDbkIsT0FBTyxNQUFNLFdBQVcsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekYsQ0FBQztLQUFBO0lBRUssT0FBTyxDQUFDLEVBQXFCOztZQUMvQixNQUFNLFFBQVEsR0FBYSxPQUFPLEVBQUUsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksZUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDMUUsT0FBTyxNQUFNLFdBQVcsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBQyxHQUFHLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUNuRyxDQUFDO0tBQUE7SUFFSyxNQUFNLENBQUMsS0FBVTs7WUFDbkIsT0FBTyxDQUFDLE1BQU0sV0FBVyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2xHLENBQUM7S0FBQTtJQUVLLEtBQUssQ0FBQyxLQUFVOztZQUNsQixPQUFPLE1BQU0sV0FBVyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2RixDQUFDO0tBQUE7SUFFSyxXQUFXLENBQUMsSUFBUyxFQUFFLE9BQXFCOztZQUM5QyxPQUFPLE1BQU0sV0FBVyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckcsQ0FBQztLQUFBO0NBQ0o7QUFwQ0QsMENBb0NDIn0=