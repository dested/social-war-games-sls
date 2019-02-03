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
var hex_1 = require("../hex/hex");
var GameHexagon = /** @class */ (function (_super) {
    __extends(GameHexagon, _super);
    function GameHexagon(tileType, id, x, y) {
        var _this = _super.call(this, x, y, tileType.cost, tileType.blocked) || this;
        _this.tileType = tileType;
        _this.id = id;
        _this.factionId = '0';
        _this.factionDuration = 0;
        _this.lines = [];
        return _this;
    }
    GameHexagon.prototype.setTileType = function (tileType) {
        this.tileType = tileType;
        this.cost = tileType.cost;
        this.blocked = tileType.blocked;
    };
    GameHexagon.prototype.setFactionId = function (factionId, duration) {
        this.factionId = factionId;
        this.factionDuration = duration;
    };
    return GameHexagon;
}(hex_1.Hexagon));
exports.GameHexagon = GameHexagon;
