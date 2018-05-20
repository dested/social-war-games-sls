export declare class QueryBuilder<T> {
    private hasParams;
    private paramsName;
    private params;
    parse(query: (q: T) => boolean): object;
    parse<P>(query: (q: T, params: P) => boolean, params: P): object;
    private parseBody(body, variableNames);
    private parseBinaryExpression(body, variableNames);
    private parseUnaryExpression(body, variableNames);
    private parseLogicalExpression(body, variableNames);
    private parseSide(side, variableNames);
    private evaluateParams(propertyName);
    private flattenObject(member, variableNames);
    private static functionToArrow(input);
    locationSearch(latitude: number, longitude: number, minDistance: number, maxDistance: number): [number, number];
}
