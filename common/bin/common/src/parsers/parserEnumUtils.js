"use strict";
exports.__esModule = true;
var ParserEnumUtils = /** @class */ (function () {
    function ParserEnumUtils() {
    }
    ParserEnumUtils.hexTypeToInt = function (type) {
        switch (type) {
            case 'Dirt':
                return 1;
            case 'Clay':
                return 2;
            case 'Grass':
                return 3;
            case 'Stone':
                return 4;
            case 'Water':
                return 5;
        }
    };
    ParserEnumUtils.hexSubTypeToInt = function (type) {
        switch (type) {
            case '1':
                return 1;
            case '2':
                return 2;
            case '3':
                return 3;
            case '4':
                return 4;
            case '5':
                return 5;
        }
    };
    ParserEnumUtils.intToHexType = function (type) {
        switch (type) {
            case 1:
                return 'Dirt';
            case 2:
                return 'Clay';
            case 3:
                return 'Grass';
            case 4:
                return 'Stone';
            case 5:
                return 'Water';
        }
    };
    ParserEnumUtils.intToHexSubType = function (type) {
        switch (type) {
            case 1:
                return '1';
            case 2:
                return '2';
            case 3:
                return '3';
            case 4:
                return '4';
            case 5:
                return '5';
        }
    };
    ParserEnumUtils.resourceTypeToInt = function (type) {
        switch (type) {
            case 'bronze':
                return 1;
            case 'gold':
                return 2;
            case 'silver':
                return 3;
        }
    };
    ParserEnumUtils.intToResourceType = function (type) {
        switch (type) {
            case 1:
                return 'bronze';
            case 2:
                return 'gold';
            case 3:
                return 'silver';
        }
    };
    ParserEnumUtils.entityTypeToInt = function (type) {
        switch (type) {
            case 'infantry':
                return 1;
            case 'tank':
                return 2;
            case 'factory':
                return 3;
            case 'plane':
                return 4;
        }
    };
    ParserEnumUtils.intToEntityType = function (type) {
        switch (type) {
            case 1:
                return 'infantry';
            case 2:
                return 'tank';
            case 3:
                return 'factory';
            case 4:
                return 'plane';
        }
    };
    ParserEnumUtils.actionToInt = function (action) {
        switch (action) {
            case 'attack':
                return 1;
            case 'move':
                return 2;
            case 'mine':
                return 3;
            case 'spawn-plane':
                return 4;
            case 'spawn-tank':
                return 5;
            case 'spawn-infantry':
                return 6;
        }
    };
    ParserEnumUtils.intToAction = function (action) {
        switch (action) {
            case 1:
                return 'attack';
            case 2:
                return 'move';
            case 3:
                return 'mine';
            case 4:
                return 'spawn-plane';
            case 5:
                return 'spawn-tank';
            case 6:
                return 'spawn-infantry';
        }
    };
    ParserEnumUtils.writeHexId = function (hexId, buff) {
        var hexIdParse = /(-?\d*)-(-?\d*)/;
        var hexIdResult = hexIdParse.exec(hexId);
        var x = parseInt(hexIdResult[1]);
        var y = parseInt(hexIdResult[2]);
        buff.addInt16(x);
        buff.addInt16(y);
    };
    ParserEnumUtils.readHexId = function (reader) {
        var x = reader.readInt16();
        var y = reader.readInt16();
        return { x: x, y: y, id: x + '-' + y };
    };
    return ParserEnumUtils;
}());
exports.ParserEnumUtils = ParserEnumUtils;
