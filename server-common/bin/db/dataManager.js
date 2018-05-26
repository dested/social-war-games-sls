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
            console.log('opening db connection');
            if (!this.dbConnection || this.dbConnection.serverConfig.isConnected()) {
                console.log('db connection is closed');
                this.dbConnection = (yield mongodb_1.MongoClient.connect(config_1.Config.dbConnection)).db(config_1.Config.dbName);
                console.log('db connection is open');
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
            console.log('inserting document');
            if (!DataManager.dbConnection) {
                console.log('db is closed, reopening');
                yield DataManager.openDbConnection();
                console.log('db should be open now');
            }
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
    aggregate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DataManager.dbConnection
                .collection(this.collectionName)
                .aggregate(query)
                .toArray();
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const objectId = typeof id === 'string' ? new bson_1.ObjectID(id) : id;
            return yield DataManager.dbConnection.collection(this.collectionName).findOne({ _id: objectId });
        });
    }
    deleteMany(query) {
        return __awaiter(this, void 0, void 0, function* () {
            yield DataManager.dbConnection.collection(this.collectionName).deleteMany(query);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGIvZGF0YU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLCtCQUE4QjtBQUM5QixxQ0FBc0Q7QUFDdEQsc0NBQWlDO0FBQ2pDLHdEQUFtRDtBQUduRDtJQUdJLE1BQU0sQ0FBTyxnQkFBZ0I7O1lBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQW9CLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQzdFLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLE1BQU0scUJBQVcsQ0FBQyxPQUFPLENBQUMsZUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdkYsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2FBQ3hDO1FBQ0wsQ0FBQztLQUFBO0lBRUQsTUFBTSxDQUFPLGlCQUFpQjs7WUFDMUIsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUNuQixNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBVSxDQUFDO2FBQ2xDO1FBQ0wsQ0FBQztLQUFBO0NBQ0o7QUFsQkQsa0NBa0JDO0FBRUQ7SUFHSSxZQUFvQixjQUFzQjtRQUF0QixtQkFBYyxHQUFkLGNBQWMsQ0FBUTtRQUYxQyxVQUFLLEdBQUcsSUFBSSwyQkFBWSxFQUFLLENBQUM7SUFFZSxDQUFDO0lBRXhDLGNBQWMsQ0FBQyxRQUFXOztZQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENB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