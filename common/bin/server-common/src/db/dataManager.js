"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var bson_1 = require("bson");
var mongodb_1 = require("mongodb");
var config_1 = require("../config");
var queryBuilder_1 = require("../utils/queryBuilder");
var DataManager = /** @class */ (function () {
    function DataManager() {
    }
    DataManager.openDbConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(!this.dbConnection || !this.dbConnection.serverConfig.isConnected())) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, mongodb_1.MongoClient.connect(config_1.Config.dbConnection)];
                    case 1:
                        _a.dbConnection = (_b.sent()).db(config_1.Config.dbName);
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    DataManager.closeDbConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.dbConnection) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.dbConnection.close()];
                    case 1:
                        _a.sent();
                        this.dbConnection = undefined;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return DataManager;
}());
exports.DataManager = DataManager;
var DocumentManager = /** @class */ (function () {
    function DocumentManager(collectionName) {
        this.collectionName = collectionName;
        this.query = new queryBuilder_1.QueryBuilder();
    }
    DocumentManager.prototype.insertDocument = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DataManager.dbConnection.collection(this.collectionName).insertOne(document)];
                    case 1:
                        result = _a.sent();
                        document._id = result.insertedId;
                        return [2 /*return*/, document];
                }
            });
        });
    };
    DocumentManager.prototype.updateDocument = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                DataManager.dbConnection.collection(this.collectionName).findOneAndUpdate({ _id: document._id }, document);
                return [2 /*return*/, document];
            });
        });
    };
    DocumentManager.prototype.getOne = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DataManager.dbConnection.collection(this.collectionName).findOne(query)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DocumentManager.prototype.aggregate = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DataManager.dbConnection
                            .collection(this.collectionName)
                            .aggregate(query)
                            .toArray()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DocumentManager.prototype.getById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var objectId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        objectId = typeof id === 'string' ? new bson_1.ObjectID(id) : id;
                        return [4 /*yield*/, DataManager.dbConnection.collection(this.collectionName).findOne({ _id: objectId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DocumentManager.prototype.deleteMany = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DataManager.dbConnection.collection(this.collectionName).deleteMany(query)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DocumentManager.prototype.getAll = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DataManager.dbConnection.collection(this.collectionName).find(query)];
                    case 1: return [2 /*return*/, (_a.sent()).toArray()];
                }
            });
        });
    };
    DocumentManager.prototype.count = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DataManager.dbConnection.collection(this.collectionName).count(query)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DocumentManager.prototype.ensureIndex = function (spec, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DataManager.dbConnection.collection(this.collectionName).createIndex(spec, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return DocumentManager;
}());
exports.DocumentManager = DocumentManager;
