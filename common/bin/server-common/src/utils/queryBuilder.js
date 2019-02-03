"use strict";
exports.__esModule = true;
var esprima = require("esprima");
var QueryBuilder = /** @class */ (function () {
    function QueryBuilder() {
    }
    QueryBuilder.prototype.parse = function (query, params) {
        this.params = params;
        var input = query.toString();
        if (input.indexOf('function') === 0) {
            input = QueryBuilder.functionToArrow(input);
        }
        var parseResult = esprima.parseScript(input);
        var body = parseResult.body[0];
        if (body.type !== 'ExpressionStatement') {
            throw new Error('Body must be an expression');
        }
        var arrow = body.expression;
        if (arrow.type !== 'ArrowFunctionExpression') {
            throw new Error('Function must be an arrow function.');
        }
        var variableName = arrow.params[0].name;
        this.hasParams = arrow.params.length > 1;
        if (this.hasParams) {
            this.paramsName = arrow.params[1].name;
        }
        if (!this.hasParams && arrow.params.length > 1) {
            throw new Error('The second parameter in the query must be named params.');
        }
        var queryResult = this.parseBody(arrow.body, [variableName]);
        return queryResult;
    };
    QueryBuilder.prototype.parseBody = function (body, variableNames) {
        if (body.type === 'BinaryExpression') {
            return this.parseBinaryExpression(body, variableNames);
        }
        else if (body.type === 'UnaryExpression') {
            return this.parseUnaryExpression(body, variableNames);
        }
        else if (body.type === 'CallExpression') {
            return this.parseUnaryExpression({ type: 'UnaryExpression', operator: 'void', prefix: true, argument: body }, variableNames);
        }
        else if (body.type === 'LogicalExpression') {
            return this.parseLogicalExpression(body, variableNames);
        }
        else {
            throw new Error('Expression must be Binary or Logical: ' + body.type);
        }
    };
    QueryBuilder.prototype.parseBinaryExpression = function (body, variableNames) {
        var _a, _b, _c, _d, _e, _f, _g;
        var leftSide = this.parseSide(body.left, variableNames);
        var rightSide = this.parseSide(body.right, variableNames);
        var left = leftSide.expression;
        var right = rightSide.expression;
        var result;
        switch (body.operator) {
            case '===':
            case '==':
                result = (_a = {}, _a[left] = right, _a);
                break;
            case '!=':
            case '!==':
                result = (_b = {}, _b[left] = { $ne: right }, _b);
                break;
            case '>':
                result = (_c = {}, _c[left] = { $gt: right }, _c);
                break;
            case '>=':
                result = (_d = {}, _d[left] = { $gte: right }, _d);
                break;
            case '<':
                result = (_e = {}, _e[left] = { $lt: right }, _e);
                break;
            case '<=':
                result = (_f = {}, _f[left] = { $lte: right }, _f);
                break;
            default:
                throw new Error("Binary Expression can only be ==, ===, >, <, >=, <= : " + body.operator);
        }
        if (leftSide.shouldBeUnary === true) {
            throw new Error('Left side should have been unary');
        }
        if (leftSide.variable === 'local' && leftSide.expressionName.endsWith('.length')) {
            var rightExpression = result[left];
            return _g = {},
                _g[leftSide.expressionName.replace('.length', '')] = { $size: rightExpression },
                _g;
        }
        return result;
    };
    QueryBuilder.prototype.parseUnaryExpression = function (body, variableNames) {
        var side = this.parseSide(body.argument, variableNames);
        if (side.shouldBeUnary === false) {
            throw Error('Expression was supposed to be Unary');
        }
        return side.expression;
    };
    QueryBuilder.prototype.parseLogicalExpression = function (body, variableNames) {
        var left = this.parseBody(body.left, variableNames);
        var right = this.parseBody(body.right, variableNames);
        switch (body.operator) {
            case '&&':
                return {
                    $and: [left, right]
                };
            case '||':
                return {
                    $or: [left, right]
                };
        }
    };
    QueryBuilder.prototype.parseSide = function (side, variableNames) {
        var _a, _b;
        switch (side.type) {
            case 'Identifier':
            case 'MemberExpression':
                var name_1 = this.flattenObject(side, variableNames);
                var nameWithoutInitial = name_1
                    .split('.')
                    .slice(1)
                    .join('.');
                if (variableNames.find(function (a) { return a === name_1.split('.')[0]; })) {
                    return {
                        expression: nameWithoutInitial,
                        expressionName: nameWithoutInitial,
                        shouldBeUnary: false,
                        variable: 'local'
                    };
                }
                else if (name_1.split('.')[0] === this.paramsName) {
                    if (!this.hasParams) {
                        throw new Error('Must include params.');
                    }
                    var result = this.evaluateParams(nameWithoutInitial);
                    return {
                        expression: result,
                        expressionName: nameWithoutInitial,
                        shouldBeUnary: false,
                        variable: 'params'
                    };
                }
                else {
                    throw new Error("Cannot use variable outside of params: " + name_1.split('.')[0]);
                }
            case 'Literal':
                return {
                    expression: side.value,
                    shouldBeUnary: false,
                    variable: null
                };
            case 'CallExpression':
                var callExpression = side;
                var callee = this.parseSide(callExpression.callee, variableNames);
                var calleeName = callee.expressionName;
                var calleeNamePieces = calleeName.split('.');
                var functionName = calleeNamePieces[calleeNamePieces.length - 1];
                var propertyName = calleeNamePieces.slice(0, calleeNamePieces.length - 1).join('.');
                switch (functionName) {
                    case 'some':
                        if (callExpression.arguments.length !== 1) {
                            throw new Error('There must only be one Some Argument');
                        }
                        var body = callExpression.arguments[0];
                        var arrow = body;
                        if (arrow.type !== 'ArrowFunctionExpression') {
                            throw new Error('Function must be an arrow function.');
                        }
                        var innerVariableName = arrow.params[0].name;
                        var queryResult = this.parseBody(arrow.body, variableNames.concat([innerVariableName]));
                        switch (callee.variable) {
                            case 'local':
                                return {
                                    expression: (_a = {}, _a[propertyName] = { $elemMatch: queryResult }, _a),
                                    shouldBeUnary: true,
                                    variable: null
                                };
                            case 'params':
                                if (!queryResult['']) {
                                    throw new Error('Params some must have the argument on the left side of the expression');
                                }
                                if (typeof queryResult[''] !== 'string') {
                                    throw new Error('Params some must have only a field on the right side of the expression');
                                }
                                var inField = queryResult[''];
                                var paramsResult = this.evaluateParams(propertyName);
                                return {
                                    expression: (_b = {}, _b[inField] = { $in: paramsResult }, _b),
                                    shouldBeUnary: true,
                                    variable: null
                                };
                            default:
                                throw new Error('Some constructed incorrectly');
                        }
                    default:
                        throw new Error('Can only call Some: ' + functionName);
                }
            default:
                throw new Error("Side must either be an Identifier, Member Expression, or Literal: " + JSON.stringify(side));
        }
    };
    QueryBuilder.prototype.evaluateParams = function (propertyName) {
        var result = this.params;
        if (propertyName.length === 0) {
            return result;
        }
        var paramsSplit = propertyName.split('.');
        for (var _i = 0, paramsSplit_1 = paramsSplit; _i < paramsSplit_1.length; _i++) {
            var split = paramsSplit_1[_i];
            result = result[split];
        }
        return result;
    };
    QueryBuilder.prototype.flattenObject = function (member, variableNames) {
        switch (member.type) {
            case 'Identifier':
                return member.name;
            case 'Literal':
                throw new Error('Array indexing is not supported yet.');
            case 'UnaryExpression':
                if (member.operator !== '-') {
                    throw new Error('Array index can only be -1: ');
                }
                return '$ARRAY_QUERY$';
            case 'MemberExpression':
                var name_2 = this.flattenObject(member.object, variableNames);
                var identifier = this.flattenObject(member.property, variableNames);
                if (identifier === '$ARRAY_QUERY$') {
                    // for array indexer
                    return name_2;
                }
                return name_2 + "." + identifier;
        }
        throw new Error('Object can only be of type Identifier or MemberExpression: ' + JSON.stringify(member));
    };
    QueryBuilder.functionToArrow = function (input) {
        var results = input.match(/function\s*\((\w),*(\s*\s*\w*)*\)\s*{\s*return\s+(.+);\s*}/);
        if (!results || results.length !== 4) {
            throw new Error("Cannot convert function to arrow");
        }
        if (results[2]) {
            return "(" + results[1] + "," + results[2] + ")=>" + results[3];
        }
        else {
            return "(" + results[1] + ")=>" + results[3];
        }
    };
    QueryBuilder.prototype.locationSearch = function (latitude, longitude, minDistance, maxDistance) {
        return {
            $near: {
                $geometry: { type: 'Point', coordinates: [longitude, latitude] },
                $minDistance: minDistance,
                $maxDistance: maxDistance
            }
        };
    };
    return QueryBuilder;
}());
exports.QueryBuilder = QueryBuilder;
