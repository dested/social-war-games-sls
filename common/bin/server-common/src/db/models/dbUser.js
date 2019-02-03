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
exports.__esModule = true;
var dataManager_1 = require("../dataManager");
var mongoDocument_1 = require("./mongoDocument");
var DBUser = /** @class */ (function (_super) {
    __extends(DBUser, _super);
    function DBUser() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DBUser.map = function (e) {
        return {
            id: e._id.toHexString(),
            email: e.email,
            userName: e.userName,
            factionId: e.factionId,
            maxVotesPerRound: e.maxVotesPerRound
        };
    };
    DBUser.collectionName = 'user';
    DBUser.db = new dataManager_1.DocumentManager(DBUser.collectionName);
    return DBUser;
}(mongoDocument_1.MongoDocument));
exports.DBUser = DBUser;
