// https://github.com/bodinaren/BHex.js

/**
 * Axial is a axial position of a Hexagon within a grid.
 */
export class Axial {
    constructor(public x: number, public y: number) {}

    getKey() {
        return `${this.x}x${this.y}`;
    }

    /**
     * Return a Cube representation of the axial.
     * @returns {Cube}
     */
    toCube() {
        return new Cube(this.x, -this.x - this.y, this.y);
    }

    /**
     * Check if two Axial items has the same x and y.
     */
    compareTo(other: Point | undefined) {
        if (!other) return false;
        return this.x === other.x && this.y === other.y;
    }
}

/**
 * Cube is a cubic position of a Hexagon within a grid which includes the Z variable. Note that in a hexagonal grid, x + y + z should always equal 0!
 * @class
 * @augments Axial
 */
export class Cube extends Axial {
    constructor(x: number, y: number, public z: number = -x - y) {
        super(x, y);
    }

    /**
     * Returns a Axial representation of the cube.
     * @returns {Axial}
     */
    toAxial() {
        return new Axial(this.x, this.z);
    }

    /**
     * Rounds the values of x, y and z. Needed to find a hex at a specific position. Returns itself after.
     */
    round() {
        const cx = this.x,
            cy = this.y,
            cz = this.z;

        this.x = Math.round(cx);
        this.y = Math.round(cy);
        this.z = Math.round(cz);

        const x_diff = Math.abs(this.x - cx),
            y_diff = Math.abs(this.y - cy),
            z_diff = Math.abs(this.z - cz);

        if (x_diff > y_diff && x_diff > z_diff) this.x = -this.y - this.z;
        else if (y_diff > z_diff) this.y = -this.x - this.z;
        else this.z = -this.x - this.y;

        return this;
    }
}

/**
 * Hexagon
 * @class
 * @param {number} x - Value of the X axis
 * @param {number} y - Value of the Y axis
 * @param {number} [cost=1] - The movement cost to step on the hexagon. For the pathfinding to work optimally, minimum cost should be 1.
 * @param {boolean} [blocked=false] - If movement is enabled on this hexagon.
 */
export class Hexagon extends Axial {
    constructor(x: number, y: number, public cost: number = 1, public blocked: boolean = false) {
        super(x, y);
    }

    center: Point;
    points: Point[];
}

/**
 * Grid is a grid of one or more Hexagons, created from the center outwards in a circle.
 * @class
 * @param {number} radius - The radius of the grid with 0 being just the center piece.
 * @property {number} radius - The radius of the grid with 0 being just the center piece.
 * @property {Array} hexes - The hexes of the grid.
 */
export class Grid<T extends Hexagon = Hexagon> {
    hexes: T[];

    constructor() {
        this.hexes = [];
    }

    /**
     * Get the hexagon at a given axial position.
     * @param {Axial} a - The axial position to look for.
     * @returns {Hexagon}
     */
    getHexAt(a: Point): T | undefined {
        return this.hexes.find(h => h.compareTo(a));
    }

    /**
     * Get the neighboring hexagons at a given axial position.
     * @param {Axial} a - The axial position to get neighbors for.
     * @returns {Hexagon[]} Array of neighboring hexagons.
     */
    getNeighbors(a: Point): T[] {
        const directions = [
            new Axial(a.x - 1, a.y + 1),
            new Axial(a.x - 1, a.y),
            new Axial(a.x, a.y - 1),
            new Axial(a.x + 1, a.y - 1),
            new Axial(a.x + 1, a.y),
            new Axial(a.x, a.y + 1),
        ];
        return directions.map(d => this.getHexAt(d));
    }

    /**
     * Gets the distance between two axial positions ignoring any obstacles.
     * @param {Axial} a - The first axial position.
     * @param {Axial} b - The second axial position.
     * @returns {number} How many hexes it is between the given Axials.
     */
    getDistance(a: Point, b: Point) {
        return (Math.abs(a.x - b.x) + Math.abs(a.x + a.y - b.x - b.y) + Math.abs(a.y - b.y)) / 2;
    }

    /**
     * Get a line of sight between two axial positions.
     * @param {Axial} start -  The starting axial position.
     * @param {Axial} end -  The ending axial position.
     * @returns {Hexagon[]} The hexagons along the line of sight, excluding starting position.
     */
    getLine(start: Axial, end: Axial) {
        if (start.compareTo(end)) return [];

        const cube_lerp = (a: Cube, b: Cube, t: number) =>
            new Cube(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
        const N = this.getDistance(start, end);
        const line1 = [];
        const line2 = [];
        const cStart = start.toCube();
        const cEnd1 = end.toCube();
        const cEnd2 = end.toCube();

        // Offset the ends slightly to get two lines, handling horizontal and vertical lines (in FlatTop and PointyTop respectively).
        cEnd1.x -= 1e-6;
        cEnd1.y -= 1e-6;
        cEnd1.z += 2e-6;
        cEnd2.x += 1e-6;
        cEnd2.y += 1e-6;
        cEnd2.z -= 2e-6;

        for (var i = 0; i <= N; i++) {
            var axial = cube_lerp(cStart, cEnd1, 1.0 / N * i)
                .round()
                .toAxial();

            var hex = this.getHexAt(axial);

            if (!start.compareTo(hex)) {
                if (hex && !hex.blocked) {
                    line1.push(hex);
                } else break;
            }
        }

        for (let i = 0; i <= N; i++) {
            const axial = cube_lerp(cStart, cEnd2, 1.0 / N * i)
                .round()
                .toAxial();

            const hex = this.getHexAt(axial);

            if (!start.compareTo(hex)) {
                if (hex && !hex.blocked) {
                    line2.push(hex);
                } else break;
            }
        }

        return line1.length > line2.length ? line1 : line2;
    }

    /**
     * Gets all the hexes within a specified range, taking inertia (Hexagon.cost) into account.
     */
    getRange(start: T, movement: number) {
        const grid = this;
        const openHeap = new BinaryHeap((node: Grid_Search_Node) => node.F);
        const closedHexes: {[key: string]: Hexagon} = {};
        const visitedNodes: {[key: string]: Grid_Search_Node} = {};

        openHeap.push(new Grid_Search_Node(start, null, 0));

        while (openHeap.size() > 0) {
            // Get the item with the lowest score (current + heuristic).
            const current = openHeap.pop();

            // Close the hex as processed.
            closedHexes[current.hex.getKey()] = current.hex;

            // Get and iterate the neighbors.
            const neighbors = grid.getNeighbors(current.hex);

            neighbors.forEach(n => {
                // Make sure the neighbor is not blocked and that we haven't already processed it.
                if (n.blocked || closedHexes[n.getKey()]) return;

                // Get the total cost of going to this neighbor.
                const g = current.G + n.cost;

                const visited = visitedNodes[n.getKey()];

                // Is it cheaper the previously best path to get here?
                if (g <= movement && (!visited || g < visited.G)) {
                    const h = 0;

                    if (!visited) {
                        // This was the first time we visited this node, add it to the heap.
                        const nNode = new Grid_Search_Node(n, current, g, h);
                        visitedNodes[n.getKey()] = nNode;
                        openHeap.push(nNode);
                    } else {
                        // We've visited this path before, but found a better path. Rescore it.
                        visited.rescore(current, g, h);
                        openHeap.rescoreElement(visited);
                    }
                }
            });
        }

        const arr = [];
        for (const i in visitedNodes) if (visitedNodes.hasOwnProperty(i)) arr.push(visitedNodes[i].hex);

        return arr;
    }

    /**
     * Get the shortest path from two axial positions, taking inertia (Hexagon.cost) into account.
     * @param {Axial} start - The starting axial position.
     * @param {Axial} end - The ending axial position.
     * @returns {Hexagon[]} The path from the first hex to the last hex (excluding the starting position).
     */
    findPath(start: T, end: T) {
        const grid = this;
        const openHeap = new BinaryHeap(node => node.F);
        const closedHexes: {[key: string]: Grid_Search_Node} = {};
        const visitedNodes: {[key: string]: Grid_Search_Node} = {};

        openHeap.push(new Grid_Search_Node(start, null, 0, grid.getDistance(start, end)));

        while (openHeap.size() > 0) {
            // Get the item with the lowest score (current + heuristic).
            let current = openHeap.pop();

            // SUCCESS: If this is where we're going, backtrack and return the path.
            if (current.hex.compareTo(end)) {
                const path = [];
                while (current.parent) {
                    path.push(current);
                    current = current.parent;
                }
                return path.map(x => x.hex).reverse();
            }

            // Close the hex as processed.
            closedHexes[current.hex.getKey()] = current;

            // Get and iterate the neighbors.
            const neighbors = grid.getNeighbors(current.hex);
            neighbors.forEach(n => {
                // Make sure the neighbor is not blocked and that we haven't already processed it.
                if (n.blocked || closedHexes[n.getKey()]) return;

                // Get the total cost of going to this neighbor.
                const g = current.G + n.cost;

                const visited = visitedNodes[n.getKey()];

                // Is it cheaper the previously best path to get here?
                if (!visited || g < visited.G) {
                    const h = grid.getDistance(n, end);

                    if (!visited) {
                        // This was the first time we visited this node, add it to the heap.
                        const nNode = new Grid_Search_Node(n, current, g, h);
                        closedHexes[nNode.hex.getKey()] = nNode;
                        openHeap.push(nNode);
                    } else {
                        // We've visited this path before, but found a better path. Rescore it.
                        visited.rescore(current, g, h);
                        openHeap.rescoreElement(visited);
                    }
                }
            });
        }

        // Failed to find a path
        return [];
    }
}

/**
 * Helper class to store data relevant to our astar search. This class is used to avoid dumping data on our hexes.
 * @class
 * @private
 * @param {Hexagon} hex - The hexagon this node is relevant for.
 * @param {Hexagon} parent - How we came to this hexagon.
 * @param {number} g - The movement cost to move from the starting point A to a given hex on the grid, following the path generated to get there.
 * @param {number} [h=0] - The Heuristic (estimated) cost to get to the final destination.
 * @property {number} F - The sum of G + H
 */
class Grid_Search_Node {
    parent: Grid_Search_Node | null;
    G: number;
    H: number;
    F: number;

    constructor(public hex: Hexagon, parent: Grid_Search_Node | null, g: number, h: number = 0) {
        this.rescore(parent, g, h);
    }

    /**
     * Rescore the node. Set a new parent and updates the G, H and F score.
     * @param {Hexagon} parent - How we came to this hexagon.
     * @param {number} g - The movement cost to move from the starting point A to a given hex on the grid, following the path generated to get there.
     * @property {number} [h=0] - The Heuristic (estimated) cost to get to the final destination.
     */
    rescore(parent: Grid_Search_Node | null, g: number, h: number) {
        this.parent = parent;
        this.G = g;
        this.H = h || 0;
        this.F = this.G + this.H;
    }
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
export class Drawing {
    /**
     * The rotation of the hexagon when drawn.
     * @enum {number}
     */
    static Orientation: {
        FlatTop: 1;
        PointyTop: 2;
    } = {
        /** The hexagon will have flat tops and bottom, and pointy sides. */
        FlatTop: 1,
        /** The hexagon will have flat sides, and pointy top and bottom. */
        PointyTop: 2
    };

    constructor(public grid: Grid, public options: DrawingOptions) {
        this.grid.hexes.forEach(hex => {
            hex.center = Drawing.getCenter(hex, options);
            hex.points = Drawing.getCorners(hex.center, options);
        });
    }

    /**
     * Creates 6 points that marks the corners of a hexagon.
     * @private
     * @param {Drawing.Point} center - The center point of the hexagon.
     * @param {Drawing.Options} options - Drawing options to be used.
     * @returns {Drawing.Point[]}
     */
    static getCorners(center: Point, options: DrawingOptions) {
        const points = [];

        for (let i = 0; i < 6; i++) {
            points.push(Drawing.getCorner(center, options, i));
        }
        return points;
    }

    /**
     * Find the given corner for a hex.
     * @param {Drawing.Point} center - The center of the hexagon.
     * @param {Drawing.Options} options - Drawing options to be used.
     * @param {number} corner - Which of the 6 corners should be calculated?
     * @returns {Drawing.Point}
     */
    static getCorner(center: Point, options: DrawingOptions, corner: number) {
        const offset = options.orientation === Drawing.Orientation.PointyTop ? 90 : 0;
        const angle_deg = 60 * corner + offset;
        const angle_rad = Math.PI / 180 * angle_deg;
        return new Point(center.x + options.size * Math.cos(angle_rad), center.y + options.size * Math.sin(angle_rad));
    }

    /**
     * Find the center point of the axial, given the options provided.
     * @param {Axial} axial - The axial for which to find the center point.
     * @param {Drawing.Options} options - Drawing options to be used.
     * @returns {Drawing.Point}
     */
    static getCenter(axial: Axial, options: DrawingOptions) {
        let x = 0;
        let y = 0;
        const c = axial.toCube();

        if (options.orientation === Drawing.Orientation.FlatTop) {
            x = c.x * options.width * 3 / 4;
            y = (c.z + c.x / 2) * options.height;
        } else {
            x = (c.x + c.z / 2) * options.width;
            y = c.z * options.height * 3 / 4;
        }
        x += options.center.x;
        y += options.center.y;
        return new Point(x, y);
    }

    /**
     * Get the hexagon at a specific point.
     * @param {Drawing.Point} p - The points for which to find a hex.
     * @returns {Hexagon}
     */
    getHexAt(p: Point) {
        let x;
        let y;

        if (this.options.orientation === Drawing.Orientation.FlatTop) {
            x = p.x * 2 / 3 / this.options.size;
            y = (-p.x / 3 + Math.sqrt(3) / 3 * p.y) / this.options.size;
        } else {
            x = (p.x * Math.sqrt(3) / 3 - p.y / 3) / this.options.size;
            y = p.y * 2 / 3 / this.options.size;
        }

        const a = new Axial(x, y)
            .toCube()
            .round()
            .toAxial();

        return this.grid.getHexAt(a);
    }
}

/**
 * Drawing.Point is a horizontal and vertical representation of a position.
 */
export class Point {
    constructor(public x: number, public y: number) {}
}

/**
 * A Hexagon is a 6 sided polygon, our hexes don't have to be symmetrical, i.e. ratio of width to height could be 4 to 3
 * @class
 * @param {number} side - How long the flat side should be.
 * @param {Drawing.Static.Orientation} [orientation=Drawing.Static.Orientation.FlatTop] - Which orientation the hex will have.
 * @param {Drawing.Point} [center=new Drawing.Point(0, 0)] - Where is the center of the grid located. This helps by saving you the trouble of keeping track of the offset yourself.
 * @property {number} side - How long the flat side should be.
 * @property {Drawing.Static.Orientation} orientation - Which orientation the hex will have.
 */
export class DrawingOptions {
    size: number;
    width: number;
    height: number;

    constructor(
        side: number,
        public orientation: 1 | 2 = Drawing.Orientation.FlatTop,
        public center: Point = new Point(0, 0)
    ) {
        this.size = side;
        if (this.orientation === Drawing.Orientation.FlatTop) {
            this.width = side * 2;
            this.height = Math.sqrt(3) / 2 * this.width;
        } else {
            this.height = side * 2;
            this.width = Math.sqrt(3) / 2 * this.height;
        }
    }
}

// Binary Heap implementation by bgrins https://github.com/bgrins/javascript-astar
// Based on implementation by Marijn Haverbeke http://eloquentjavascript.net/1st_edition/appendix2.html

class BinaryHeap {
    content: Grid_Search_Node[] = [];

    constructor(private scoreFunction: (node: Grid_Search_Node) => number) {}

    push(element: Grid_Search_Node) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    }

    pop() {
        // Store the first element so we can return it later.
        const result = this.content[0];
        // Get the element at the end of the array.
        const end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    }

    remove(node: Grid_Search_Node) {
        const i = this.content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        const end = this.content.pop();

        if (i !== this.content.length - 1) {
            this.content[i] = end;

            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            } else {
                this.bubbleUp(i);
            }
        }
    }

    size() {
        return this.content.length;
    }

    rescoreElement(node: Grid_Search_Node) {
        this.sinkDown(this.content.indexOf(node));
    }

    sinkDown(n: number) {
        // Fetch the element that has to be sunk.
        const element = this.content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            const parentN = ((n + 1) >> 1) - 1;

            const parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            } else {
                // Found a parent that is less, no need to sink any further.
                break;
            }
        }
    }

    bubbleUp(n: number) {
        // Look up the target element and its score.
        const length = this.content.length;

        const element = this.content[n];
        const elemScore = this.scoreFunction(element);

        while (true) {
            // Compute the indices of the child elements.
            const child2N = (n + 1) << 1;

            const child1N = child2N - 1;

            // This is used to store the new position of the element, if any.
            let swap = null;

            let child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                const child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);

                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) {
                    swap = child1N;
                }
            }

            // Do the same checks for the other child.
            if (child2N < length) {
                const child2 = this.content[child2N];
                const child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            } else {
                // Otherwise, we are done.
                break;
            }
        }
    }
}
