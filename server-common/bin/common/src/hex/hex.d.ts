/**
 * Axial is a axial position of a Hexagon within a grid.
 */
export declare class Axial {
    x: number;
    y: number;
    constructor(x: number, y: number);
    getKey(): string;
    add(x: number, y: number): Axial;
    /**
     * Return a Cube representation of the axial.
     * @returns {Cube}
     */
    toCube(): Cube;
    /**
     * Check if two Axial items has the same x and y.
     */
    compareTo(other: Point | undefined): boolean;
}
/**
 * Cube is a cubic position of a Hexagon within a grid which includes the Z variable. Note that in a hexagonal grid, x + y + z should always equal 0!
 * @class
 * @augments Axial
 */
export declare class Cube extends Axial {
    z: number;
    constructor(x: number, y: number, z?: number);
    /**
     * Returns a Axial representation of the cube.
     * @returns {Axial}
     */
    toAxial(): Axial;
    /**
     * Rounds the values of x, y and z. Needed to find a hex at a specific position. Returns itself after.
     */
    round(): this;
}
export declare class Hexagon extends Axial {
    cost: number;
    blocked: boolean;
    constructor(x: number, y: number, cost?: number, blocked?: boolean);
    center: Point;
    points: Point[];
    pointsSvg: string;
}
export declare class Grid<T extends Hexagon = Hexagon> {
    boundsX: number;
    boundsY: number;
    boundsWidth: number;
    boundsHeight: number;
    hexes: T[];
    constructor(boundsX: number, boundsY: number, boundsWidth: number, boundsHeight: number);
    easyBounds(x: number, y: number): Axial;
    getCircle(a: Point, radius: number): T[];
    /**
     * Get the hexagon at a given axial position.
     * @param {Axial} a - The axial position to look for.
     * @returns {Hexagon}
     */
    getHexAt(a: Point): T | undefined;
    /**
     * Get the neighboring hexagons at a given axial position.
     * @param {Axial} a - The axial position to get neighbors for.
     * @returns {Hexagon[]} Array of neighboring hexagons.
     */
    getNeighbors(a: Point): T[];
    /**
     * Gets the distance between two axial positions ignoring any obstacles.
     * @param {Axial} a - The first axial position.
     * @param {Axial} b - The second axial position.
     * @returns {number} How many hexes it is between the given Axials.
     */
    getDistance(a: Point, b: Point): number;
    /**
     * Get a line of sight between two axial positions.
     * @param {Axial} start -  The starting axial position.
     * @param {Axial} end -  The ending axial position.
     * @returns {Hexagon[]} The hexagons along the line of sight, excluding starting position.
     */
    getLine(start: Axial, end: Axial): T[];
    /**
     * Gets all the hexes within a specified range, taking inertia (Hexagon.cost) into account.
     */
    getRange(start: T, movement: number): T[];
    /**
     * Get the shortest path from two axial positions, taking inertia (Hexagon.cost) into account.
     * @param {Axial} start - The starting axial position.
     * @param {Axial} end - The ending axial position.
     * @returns {Hexagon[]} The path from the first hex to the last hex (excluding the starting position).
     */
    findPath(start: T, end: T): T[];
}
/**
 * Drawing is used for all you need to draw the hexagon grid and finding hexagons within the grid.
 * In using this constructor, the corners of all the hexes will be generated.
 * @class
 * @param {Grid} grid - The grid of hexagons to be used.
 * @param {Drawing.Options} options - Options to be used.
 * @property {Grid} grid - The grid of hexagons to be used.
 * @property {Drawing.Options} options - Options to be used.
 */
export declare class Drawing {
    grid: Grid;
    options: DrawingOptions;
    /**
     * The rotation of the hexagon when drawn.
     * @enum {number}
     */
    static Orientation: {
        FlatTop: 1;
        PointyTop: 2;
    };
    constructor(grid: Grid, options: DrawingOptions);
    static getCorners(center: Point, options: DrawingOptions): Point[];
    static getCorner(center: Point, options: DrawingOptions, corner: number): Point;
    static getCenter(axial: Axial, options: DrawingOptions): Point;
    getHexAt(p: Point): Hexagon;
}
export declare class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
}
export declare class DrawingOptions {
    orientation: 1 | 2;
    center: Point;
    size: number;
    width: number;
    height: number;
    constructor(side: number, orientation?: 1 | 2, center?: Point);
}
