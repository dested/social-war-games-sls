"use strict";
exports.__esModule = true;
var utils_1 = require("../utils/utils");
var HexagonTypes = /** @class */ (function () {
    function HexagonTypes() {
    }
    HexagonTypes.preloadTypes = function () {
        return [
            HexagonTypes.get('Dirt', '1'),
            HexagonTypes.get('Dirt', '2'),
            HexagonTypes.get('Dirt', '3'),
            HexagonTypes.get('Dirt', '4'),
            HexagonTypes.get('Dirt', '5'),
            HexagonTypes.get('Clay', '1'),
            HexagonTypes.get('Clay', '2'),
            HexagonTypes.get('Clay', '3'),
            HexagonTypes.get('Clay', '4'),
            HexagonTypes.get('Clay', '5'),
            HexagonTypes.get('Stone', '1'),
            HexagonTypes.get('Stone', '2'),
            HexagonTypes.get('Stone', '3'),
            HexagonTypes.get('Stone', '4'),
            HexagonTypes.get('Stone', '5'),
            HexagonTypes.get('Water', '1'),
            HexagonTypes.get('Water', '2'),
            HexagonTypes.get('Water', '3'),
            HexagonTypes.get('Water', '4'),
            HexagonTypes.get('Water', '5'),
            HexagonTypes.get('Grass', '1'),
            HexagonTypes.get('Grass', '2'),
            HexagonTypes.get('Grass', '3'),
            HexagonTypes.get('Grass', '4'),
            HexagonTypes.get('Grass', '5'),
        ];
    };
    HexagonTypes.randomSubType = function () {
        if (utils_1.Utils.random(90)) {
            return '1';
        }
        return (Math.floor(Math.random() * 5) + 1).toString();
    };
    HexagonTypes.get = function (type, subType) {
        if (this.cache[type + subType]) {
            return this.cache[type + subType];
        }
        switch (type) {
            case 'Dirt':
                return (this.cache[type + subType] = this.dirt(subType));
            case 'Clay':
                return (this.cache[type + subType] = this.clay(subType));
            case 'Grass':
                return (this.cache[type + subType] = this.grass(subType));
            case 'Stone':
                return (this.cache[type + subType] = this.stone(subType));
            case 'Water':
                return (this.cache[type + subType] = this.water(subType));
        }
    };
    HexagonTypes.dirt = function (subType) { return ({
        type: 'Dirt',
        color: '#BB8044',
        subType: subType,
        cost: 1,
        blocked: false
    }); };
    HexagonTypes.grass = function (subType) { return ({
        type: 'Grass',
        color: '#27AE60',
        subType: subType,
        cost: 1,
        blocked: false
    }); };
    HexagonTypes.clay = function (subType) { return ({
        type: 'Clay',
        color: '#E5D5B2',
        subType: subType,
        cost: 2,
        blocked: false
    }); };
    HexagonTypes.stone = function (subType) { return ({
        type: 'Stone',
        color: '#A4AFAF',
        subType: subType,
        cost: 2,
        blocked: false
    }); };
    HexagonTypes.water = function (subType) { return ({
        type: 'Water',
        color: '#6afffd',
        subType: subType,
        cost: 0,
        blocked: true
    }); };
    HexagonTypes.cache = {};
    return HexagonTypes;
}());
exports.HexagonTypes = HexagonTypes;
