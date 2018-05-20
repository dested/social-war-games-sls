"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const esprima = require("esprima");
class QueryBuilder {
    parse(query, params) {
        this.params = params;
        let input = query.toString();
        if (input.indexOf('function') === 0) {
            input = QueryBuilder.functionToArrow(input);
        }
        const parseResult = esprima.parseScript(input);
        const body = parseResult.body[0];
        if (body.type !== 'ExpressionStatement') {
            throw new Error('Body must be an expression');
        }
        const arrow = body.expression;
        if (arrow.type !== 'ArrowFunctionExpression') {
            throw new Error('Function must be an arrow function.');
        }
        const variableName = arrow.params[0].name;
        this.hasParams = arrow.params.length > 1;
        if (this.hasParams) {
            this.paramsName = arrow.params[1].name;
        }
        if (!this.hasParams && arrow.params.length > 1) {
            throw new Error('The second parameter in the query must be named params.');
        }
        const queryResult = this.parseBody(arrow.body, [variableName]);
        return queryResult;
    }
    parseBody(body, variableNames) {
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
    }
    parseBinaryExpression(body, variableNames) {
        const leftSide = this.parseSide(body.left, variableNames);
        const rightSide = this.parseSide(body.right, variableNames);
        const left = leftSide.expression;
        const right = rightSide.expression;
        let result;
        switch (body.operator) {
            case '===':
            case '==':
                result = { [left]: right };
                break;
            case '!=':
            case '!==':
                result = { [left]: { $ne: right } };
                break;
            case '>':
                result = { [left]: { $gt: right } };
                break;
            case '>=':
                result = { [left]: { $gte: right } };
                break;
            case '<':
                result = { [left]: { $lt: right } };
                break;
            case '<=':
                result = { [left]: { $lte: right } };
                break;
            default:
                throw new Error(`Binary Expression can only be ==, ===, >, <, >=, <= : ${body.operator}`);
        }
        if (leftSide.shouldBeUnary === true) {
            throw new Error('Left side should have been unary');
        }
        if (leftSide.variable === 'local' && leftSide.expressionName.endsWith('.length')) {
            const rightExpression = result[left];
            return {
                [leftSide.expressionName.replace('.length', '')]: { $size: rightExpression }
            };
        }
        return result;
    }
    parseUnaryExpression(body, variableNames) {
        const side = this.parseSide(body.argument, variableNames);
        if (side.shouldBeUnary === false) {
            throw Error('Expression was supposed to be Unary');
        }
        return side.expression;
    }
    parseLogicalExpression(body, variableNames) {
        const left = this.parseBody(body.left, variableNames);
        const right = this.parseBody(body.right, variableNames);
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
    }
    parseSide(side, variableNames) {
        switch (side.type) {
            case 'Identifier':
            case 'MemberExpression':
                const name = this.flattenObject(side, variableNames);
                const nameWithoutInitial = name
                    .split('.')
                    .slice(1)
                    .join('.');
                if (variableNames.find(a => a === name.split('.')[0])) {
                    return {
                        expression: nameWithoutInitial,
                        expressionName: nameWithoutInitial,
                        shouldBeUnary: false,
                        variable: 'local'
                    };
                }
                else if (name.split('.')[0] === this.paramsName) {
                    if (!this.hasParams) {
                        throw new Error('Must include params.');
                    }
                    const result = this.evaluateParams(nameWithoutInitial);
                    return {
                        expression: result,
                        expressionName: nameWithoutInitial,
                        shouldBeUnary: false,
                        variable: 'params'
                    };
                }
                else {
                    throw new Error(`Cannot use variable outside of params: ${name.split('.')[0]}`);
                }
            case 'Literal':
                return {
                    expression: side.value,
                    shouldBeUnary: false,
                    variable: null
                };
            case 'CallExpression':
                const callExpression = side;
                const callee = this.parseSide(callExpression.callee, variableNames);
                const calleeName = callee.expressionName;
                const calleeNamePieces = calleeName.split('.');
                const functionName = calleeNamePieces[calleeNamePieces.length - 1];
                const propertyName = calleeNamePieces.slice(0, calleeNamePieces.length - 1).join('.');
                switch (functionName) {
                    case 'some':
                        if (callExpression.arguments.length !== 1) {
                            throw new Error('There must only be one Some Argument');
                        }
                        const body = callExpression.arguments[0];
                        const arrow = body;
                        if (arrow.type !== 'ArrowFunctionExpression') {
                            throw new Error('Function must be an arrow function.');
                        }
                        const innerVariableName = arrow.params[0].name;
                        const queryResult = this.parseBody(arrow.body, [...variableNames, innerVariableName]);
                        switch (callee.variable) {
                            case 'local':
                                return {
                                    expression: { [propertyName]: { $elemMatch: queryResult } },
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
                                const inField = queryResult[''];
                                const paramsResult = this.evaluateParams(propertyName);
                                return {
                                    expression: { [inField]: { $in: paramsResult } },
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
                throw new Error(`Side must either be an Identifier, Member Expression, or Literal: ${JSON.stringify(side)}`);
        }
    }
    evaluateParams(propertyName) {
        let result = this.params;
        if (propertyName.length === 0) {
            return result;
        }
        const paramsSplit = propertyName.split('.');
        for (const split of paramsSplit) {
            result = result[split];
        }
        return result;
    }
    flattenObject(member, variableNames) {
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
                const name = this.flattenObject(member.object, variableNames);
                const identifier = this.flattenObject(member.property, variableNames);
                if (identifier === '$ARRAY_QUERY$') {
                    // for array indexer
                    return name;
                }
                return `${name}.${identifier}`;
        }
        throw new Error('Object can only be of type Identifier or MemberExpression: ' + JSON.stringify(member));
    }
    static functionToArrow(input) {
        const results = input.match(/function\s*\((\w),*(\s*\s*\w*)*\)\s*{\s*return\s+(.+);\s*}/);
        if (!results || results.length !== 4) {
            throw new Error(`Cannot convert function to arrow`);
        }
        if (results[2]) {
            return `(${results[1]},${results[2]})=>${results[3]}`;
        }
        else {
            return `(${results[1]})=>${results[3]}`;
        }
    }
    locationSearch(latitude, longitude, minDistance, maxDistance) {
        return {
            $near: {
                $geometry: { type: 'Point', coordinates: [longitude, latitude] },
                $minDistance: minDistance,
                $maxDistance: maxDistance
            }
        };
    }
}
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlCdWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWxzL3F1ZXJ5QnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFtQztBQWNuQztJQU9JLEtBQUssQ0FBSSxLQUFtQyxFQUFFLE1BQVU7UUFDcEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRTdCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDakMsS0FBSyxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0M7UUFFRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRS9DLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLHFCQUFxQixFQUFFO1lBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztTQUNqRDtRQUVELE1BQU0sS0FBSyxHQUFJLElBQTRCLENBQUMsVUFBcUMsQ0FBQztRQUNsRixJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUsseUJBQXlCLEVBQUU7WUFDMUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1NBQzFEO1FBRUQsTUFBTSxZQUFZLEdBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQWdCLENBQUMsSUFBSSxDQUFDO1FBQzFELElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixJQUFJLENBQUMsVUFBVSxHQUFJ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