"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var config_1 = require("../../config");
var dataManager_1 = require("../dataManager");
var dbUser_1 = require("./dbUser");
var mongoDocument_1 = require("./mongoDocument");
var DBUserRoundStats = /** @class */ (function (_super) {
    __extends(DBUserRoundStats, _super);
    function DBUserRoundStats() {
        return _super.call(this) || this;
    }
    DBUserRoundStats.getByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userRoundStats, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.getOne(this.db.query.parse(function (a, uid) { return a.userId === uid; }, userId))];
                    case 1:
                        userRoundStats = _a.sent();
                        if (!!userRoundStats) return [3 /*break*/, 4];
                        userRoundStats = new DBUserRoundStats();
                        userRoundStats.userId = userId;
                        return [4 /*yield*/, dbUser_1.DBUser.db.getById(userId)];
                    case 2:
                        user = _a.sent();
                        userRoundStats.userName = user.userName;
                        userRoundStats.roundsParticipated = [];
                        return [4 /*yield*/, this.db.insertDocument(userRoundStats)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, userRoundStats];
                }
            });
        });
    };
    DBUserRoundStats.addUserRoundStat = function (userId, stat) {
        return __awaiter(this, void 0, void 0, function () {
            var userRoundStats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getByUserId(userId)];
                    case 1:
                        userRoundStats = _a.sent();
                        userRoundStats.roundsParticipated.push(stat);
                        return [4 /*yield*/, this.db.updateDocument(userRoundStats)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DBUserRoundStats.buildLadder = function (currentGeneration) {
        return __awaiter(this, void 0, void 0, function () {
            var generationsPerDay, valuableGenerations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        generationsPerDay = (24 * 60 * 60 * 1000) / config_1.Config.gameDuration;
                        valuableGenerations = generationsPerDay * 2.5;
                        return [4 /*yield*/, this.db.aggregate([
                                {
                                    $unwind: {
                                        path: '$roundsParticipated'
                                    }
                                },
                                {
                                    $project: {
                                        _id: '$_id',
                                        userId: '$userId',
                                        userName: '$userName',
                                        score: {
                                            $trunc: {
                                                $divide: [
                                                    {
                                                        $add: [
                                                            { $multiply: ['$roundsParticipated.votesCast', 0.1] },
                                                            { $multiply: ['$roundsParticipated.votesWon', 0.5] },
                                                            { $multiply: ['$roundsParticipated.damageDone', 3] },
                                                            { $multiply: ['$roundsParticipated.unitsDestroyed', 6] },
                                                            { $multiply: ['$roundsParticipated.unitsCreated', 4] },
                                                            { $multiply: ['$roundsParticipated.resourcesMined', 3.5] },
                                                            { $multiply: ['$roundsParticipated.distanceMoved', 1.2] },
                                                        ]
                                                    },
                                                    {
                                                        $divide: [
                                                            {
                                                                $subtract: [
                                                                    valuableGenerations,
                                                                    { $subtract: [currentGeneration, '$roundsParticipated.generation'] },
                                                                ]
                                                            },
                                                            valuableGenerations,
                                                        ]
                                                    },
                                                ]
                                            }
                                        }
                                    }
                                },
                                {
                                    $group: {
                                        _id: '$userId',
                                        userName: { $first: '$userName' },
                                        score: { $sum: '$score' }
                                    }
                                },
                                { $sort: { score: -1 } },
                                { $group: { _id: 1, ranks: { $push: '$$CURRENT' } } },
                                { $unwind: { path: '$ranks', includeArrayIndex: 'rank' } },
                                { $project: { _id: '$ranks._id', userName: '$ranks.userName', score: '$ranks.score', rank: '$rank' } },
                                { $out: 'ladder' },
                            ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DBUserRoundStats.collectionName = 'user-round-stats';
    DBUserRoundStats.db = new dataManager_1.DocumentManager(DBUserRoundStats.collectionName);
    return DBUserRoundStats;
}(mongoDocument_1.MongoDocument));
exports.DBUserRoundStats = DBUserRoundStats;
