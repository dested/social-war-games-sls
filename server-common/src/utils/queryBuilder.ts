import * as esprima from 'esprima';
import {
    ArrowFunctionExpression,
    BaseExpression,
    BinaryExpression,
    CallExpression,
    ExpressionStatement,
    Identifier,
    Literal,
    LogicalExpression,
    MemberExpression,
    UnaryExpression
} from 'estree';

export class QueryBuilder<T> {
    private hasParams: boolean;
    private paramsName: string;
    private params: any;

    parse(query: (q: T) => boolean): object;
    parse<P>(query: (q: T, params: P) => boolean, params: P): object;
    parse<P>(query: (q: T, params: P) => boolean, params?: P): object {
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

        const arrow = (body as ExpressionStatement).expression as ArrowFunctionExpression;
        if (arrow.type !== 'ArrowFunctionExpression') {
            throw new Error('Function must be an arrow function.');
        }

        const variableName = (arrow.params[0] as Identifier).name;
        this.hasParams = arrow.params.length > 1;
        if (this.hasParams) {
            this.paramsName = (arrow.params[1] as Identifier).name;
        }

        if (!this.hasParams && arrow.params.length > 1) {
            throw new Error('The second parameter in the query must be named params.');
        }

        const queryResult = this.parseBody(arrow.body, [variableName]);

        return queryResult;
    }

    private parseBody(body: BaseExpression, variableNames: string[]) {
        if (body.type === 'BinaryExpression') {
            return this.parseBinaryExpression(body as BinaryExpression, variableNames);
        } else if (body.type === 'UnaryExpression') {
            return this.parseUnaryExpression(body as UnaryExpression, variableNames);
        } else if (body.type === 'CallExpression') {
            return this.parseUnaryExpression(
                {type: 'UnaryExpression', operator: 'void', prefix: true, argument: body as CallExpression},
                variableNames
            );
        } else if (body.type === 'LogicalExpression') {
            return this.parseLogicalExpression(body as LogicalExpression, variableNames);
        } else {
            throw new Error('Expression must be Binary or Logical: ' + body.type);
        }
    }

    private parseBinaryExpression(body: BinaryExpression, variableNames: string[]): any {
        const leftSide = this.parseSide(body.left, variableNames);
        const rightSide = this.parseSide(body.right, variableNames);

        const left = leftSide.expression;
        const right = rightSide.expression;

        let result: any;

        switch (body.operator) {
            case '===':
            case '==':
                result = {[left]: right};
                break;
            case '!=':
            case '!==':
                result = {[left]: {$ne: right}};
                break;
            case '>':
                result = {[left]: {$gt: right}};
                break;
            case '>=':
                result = {[left]: {$gte: right}};
                break;
            case '<':
                result = {[left]: {$lt: right}};
                break;
            case '<=':
                result = {[left]: {$lte: right}};
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
                [leftSide.expressionName.replace('.length', '')]: {$size: rightExpression}
            };
        }

        return result;
    }

    private parseUnaryExpression(body: UnaryExpression, variableNames: string[]): any {
        const side = this.parseSide(body.argument, variableNames);

        if (side.shouldBeUnary === false) {
            throw Error('Expression was supposed to be Unary');
        }
        return side.expression;
    }

    private parseLogicalExpression(body: LogicalExpression, variableNames: string[]): any {
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

    private parseSide(
        side: BaseExpression,
        variableNames: string[]
    ): {
        expression: any;
        variable?: 'params' | 'local';
        expressionName?: string;
        shouldBeUnary: boolean;
    } {
        switch (side.type) {
            case 'Identifier':
            case 'MemberExpression':
                const name = this.flattenObject(side as MemberExpression | Identifier, variableNames);
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
                } else if (name.split('.')[0] === this.paramsName) {
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
                } else {
                    throw new Error(`Cannot use variable outside of params: ${name.split('.')[0]}`);
                }
            case 'Literal':
                return {
                    expression: (side as Literal).value,
                    shouldBeUnary: false,
                    variable: null
                };

            case 'CallExpression':
                const callExpression = side as CallExpression;
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

                        const arrow = body as ArrowFunctionExpression;
                        if (arrow.type !== 'ArrowFunctionExpression') {
                            throw new Error('Function must be an arrow function.');
                        }

                        const innerVariableName = (arrow.params[0] as Identifier).name;

                        const queryResult = this.parseBody(arrow.body, [...variableNames, innerVariableName]);

                        switch (callee.variable) {
                            case 'local':
                                return {
                                    expression: {[propertyName]: {$elemMatch: queryResult}},
                                    shouldBeUnary: true,
                                    variable: null
                                };
                            case 'params':
                                if (!queryResult['']) {
                                    throw new Error(
                                        'Params some must have the argument on the left side of the expression'
                                    );
                                }
                                if (typeof queryResult[''] !== 'string') {
                                    throw new Error(
                                        'Params some must have only a field on the right side of the expression'
                                    );
                                }
                                const inField = queryResult[''];
                                const paramsResult = this.evaluateParams(propertyName);
                                return {
                                    expression: {[inField]: {$in: paramsResult}},
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
                throw new Error(
                    `Side must either be an Identifier, Member Expression, or Literal: ${JSON.stringify(side)}`
                );
        }
    }

    private evaluateParams(propertyName: string) {
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

    private flattenObject(
        member: MemberExpression | Identifier | UnaryExpression | Literal,
        variableNames: string[]
    ): string {
        switch (member.type) {
            case 'Identifier':
                return (member as Identifier).name;
            case 'Literal':
                throw new Error('Array indexing is not supported yet.');
            case 'UnaryExpression':
                if ((member as UnaryExpression).operator !== '-') {
                    throw new Error('Array index can only be -1: ');
                }
                return '$ARRAY_QUERY$';
            case 'MemberExpression':
                const name = this.flattenObject((member as MemberExpression).object as MemberExpression, variableNames);
                const identifier = this.flattenObject(
                    (member as MemberExpression).property as Identifier | Literal,
                    variableNames
                );
                if (identifier === '$ARRAY_QUERY$') {
                    // for array indexer
                    return name;
                }
                return `${name}.${identifier}`;
        }
        throw new Error('Object can only be of type Identifier or MemberExpression: ' + JSON.stringify(member));
    }

    private static functionToArrow(input: string) {
        const results = input.match(/function\s*\((\w),*(\s*\s*\w*)*\)\s*{\s*return\s+(.+);\s*}/);
        if (!results || results.length !== 4) {
            throw new Error(`Cannot convert function to arrow`);
        }
        if (results[2]) {
            return `(${results[1]},${results[2]})=>${results[3]}`;
        } else {
            return `(${results[1]})=>${results[3]}`;
        }
    }

    locationSearch(latitude: number, longitude: number, minDistance: number, maxDistance: number): [number, number] {
        return ({
            $near: {
                $geometry: {type: 'Point', coordinates: [longitude, latitude]},
                $minDistance: minDistance,
                $maxDistance: maxDistance
            }
        } as any) as [number, number];
    }
}
