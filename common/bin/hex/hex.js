"use strict";
// https://github.com/bodinaren/BHex.js
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Axial is a axial position of a Hexagon within a grid.
 */
class Axial {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
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
    compareTo(other) {
        if (!other)
            return false;
        return this.x === other.x && this.y === other.y;
    }
}
exports.Axial = Axial;
/**
 * Cube is a cubic position of a Hexagon within a grid which includes the Z variable. Note that in a hexagonal grid, x + y + z should always equal 0!
 * @class
 * @augments Axial
 */
class Cube extends Axial {
    constructor(x, y, z = -x - y) {
        super(x, y);
        this.z = z;
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
        const cx = this.x, cy = this.y, cz = this.z;
        this.x = Math.round(cx);
        this.y = Math.round(cy);
        this.z = Math.round(cz);
        const x_diff = Math.abs(this.x - cx), y_diff = Math.abs(this.y - cy), z_diff = Math.abs(this.z - cz);
        if (x_diff > y_diff && x_diff > z_diff)
            this.x = -this.y - this.z;
        else if (y_diff > z_diff)
            this.y = -this.x - this.z;
        else
            this.z = -this.x - this.y;
        return this;
    }
}
exports.Cube = Cube;
/**
 * Hexagon
 * @class
 * @param {number} x - Value of the X axis
 * @param {number} y - Value of the Y axis
 * @param {number} [cost=1] - The movement cost to step on the hexagon. For the pathfinding to work optimally, minimum cost should be 1.
 * @param {boolean} [blocked=false] - If movement is enabled on this hexagon.
 */
class Hexagon extends Axial {
    constructor(x, y, cost = 1, blocked = false) {
        super(x, y);
        this.cost = cost;
        this.blocked = blocked;
    }
}
exports.Hexagon = Hexagon;
/**
 * Grid is a grid of one or more Hexagons, created from the center outwards in a circle.
 * @class
 * @param {number} radius - The radius of the grid with 0 being just the center piece.
 * @property {number} radius - The radius of the grid with 0 being just the center piece.
 * @property {Array} hexes - The hexes of the grid.
 */
class Grid {
    constructor() {
        this.hexes = [];
    }
    getCircle(a, radius) {
        const hexes = [];
        for (let x = -radius; x <= radius; x++) {
            for (let y = -radius; y <= radius; y++) {
                for (let z = -radius; z <= radius; z++) {
                    if (x + y + z == 0) {
                        const hex = this.getHexAt({ x: x + a.x, y: y + a.y });
                        if (hex)
                            hexes.push(hex);
                    }
                }
            }
        }
        return hexes;
    }
    /**
     * Get the hexagon at a given axial position.
     * @param {Axial} a - The axial position to look for.
     * @returns {Hexagon}
     */
    getHexAt(a) {
        return this.hexes.find(h => h.compareTo(a));
    }
    /**
     * Get the neighboring hexagons at a given axial position.
     * @param {Axial} a - The axial position to get neighbors for.
     * @returns {Hexagon[]} Array of neighboring hexagons.
     */
    getNeighbors(a) {
        const directions = [
            new Axial(a.x - 1, a.y + 1),
            new Axial(a.x - 1, a.y),
            new Axial(a.x, a.y - 1),
            new Axial(a.x + 1, a.y - 1),
            new Axial(a.x + 1, a.y),
            new Axial(a.x, a.y + 1)
        ];
        return directions.map(d => this.getHexAt(d));
    }
    /**
     * Gets the distance between two axial positions ignoring any obstacles.
     * @param {Axial} a - The first axial position.
     * @param {Axial} b - The second axial position.
     * @returns {number} How many hexes it is between the given Axials.
     */
    getDistance(a, b) {
        return (Math.abs(a.x - b.x) + Math.abs(a.x + a.y - b.x - b.y) + Math.abs(a.y - b.y)) / 2;
    }
    /**
     * Get a line of sight between two axial positions.
     * @param {Axial} start -  The starting axial position.
     * @param {Axial} end -  The ending axial position.
     * @returns {Hexagon[]} The hexagons along the line of sight, excluding starting position.
     */
    getLine(start, end) {
        if (start.compareTo(end))
            return [];
        const cube_lerp = (a, b, t) => new Cube(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
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
                }
                else
                    break;
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
                }
                else
                    break;
            }
        }
        return line1.length > line2.length ? line1 : line2;
    }
    /**
     * Gets all the hexes within a specified range, taking inertia (Hexagon.cost) into account.
     */
    getRange(start, movement) {
        const grid = this;
        const openHeap = new BinaryHeap((node) => node.F);
        const closedHexes = {};
        const visitedNodes = {};
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
                if (n.blocked || closedHexes[n.getKey()])
                    return;
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
                    }
                    else {
                        // We've visited this path before, but found a better path. Rescore it.
                        visited.rescore(current, g, h);
                        openHeap.rescoreElement(visited);
                    }
                }
            });
        }
        const arr = [];
        for (const i in visitedNodes)
            if (visitedNodes.hasOwnProperty(i))
                arr.push(visitedNodes[i].hex);
        return arr;
    }
    /**
     * Get the shortest path from two axial positions, taking inertia (Hexagon.cost) into account.
     * @param {Axial} start - The starting axial position.
     * @param {Axial} end - The ending axial position.
     * @returns {Hexagon[]} The path from the first hex to the last hex (excluding the starting position).
     */
    findPath(start, end) {
        const grid = this;
        const openHeap = new BinaryHeap(node => node.F);
        const closedHexes = {};
        const visitedNodes = {};
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
                if (n.blocked || closedHexes[n.getKey()])
                    return;
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
                    }
                    else {
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
exports.Grid = Grid;
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
    constructor(hex, parent, g, h = 0) {
        this.hex = hex;
        this.rescore(parent, g, h);
    }
    /**
     * Rescore the node. Set a new parent and updates the G, H and F score.
     * @param {Hexagon} parent - How we came to this hexagon.
     * @param {number} g - The movement cost to move from the starting point A to a given hex on the grid, following the path generated to get there.
     * @property {number} [h=0] - The Heuristic (estimated) cost to get to the final destination.
     */
    rescore(parent, g, h) {
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
class Drawing {
    constructor(grid, options) {
        this.grid = grid;
        this.options = options;
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
    static getCorners(center, options) {
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
    static getCorner(center, options, corner) {
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
    static getCenter(axial, options) {
        let x = 0;
        let y = 0;
        const c = axial.toCube();
        if (options.orientation === Drawing.Orientation.FlatTop) {
            x = c.x * options.width * 3 / 4;
            y = (c.z + c.x / 2) * options.height;
        }
        else {
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
    getHexAt(p) {
        let x;
        let y;
        if (this.options.orientation === Drawing.Orientation.FlatTop) {
            x = p.x * 2 / 3 / this.options.size;
            y = (-p.x / 3 + Math.sqrt(3) / 3 * p.y) / this.options.size;
        }
        else {
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
 * The rotation of the hexagon when drawn.
 * @enum {number}
 */
Drawing.Orientation = {
    /** The hexagon will have flat tops and bottom, and pointy sides. */
    FlatTop: 1,
    /** The hexagon will have flat sides, and pointy top and bottom. */
    PointyTop: 2
};
exports.Drawing = Drawing;
/**
 * Drawing.Point is a horizontal and vertical representation of a position.
 */
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.Point = Point;
/**
 * A Hexagon is a 6 sided polygon, our hexes don't have to be symmetrical, i.e. ratio of width to height could be 4 to 3
 * @class
 * @param {number} side - How long the flat side should be.
 * @param {Drawing.Static.Orientation} [orientation=Drawing.Static.Orientation.FlatTop] - Which orientation the hex will have.
 * @param {Drawing.Point} [center=new Drawing.Point(0, 0)] - Where is the center of the grid located. This helps by saving you the trouble of keeping track of the offset yourself.
 * @property {number} side - How long the flat side should be.
 * @property {Drawing.Static.Orientation} orientation - Which orientation the hex will have.
 */
class DrawingOptions {
    constructor(side, orientation = Drawing.Orientation.FlatTop, center = new Point(0, 0)) {
        this.orientation = orientation;
        this.center = center;
        this.size = side;
        if (this.orientation === Drawing.Orientation.FlatTop) {
            this.width = side * 2;
            this.height = Math.sqrt(3) / 2 * this.width;
        }
        else {
            this.height = side * 2;
            this.width = Math.sqrt(3) / 2 * this.height;
        }
    }
}
exports.DrawingOptions = DrawingOptions;
// Binary Heap implementation by bgrins https://github.com/bgrins/javascript-astar
// Based on implementation by Marijn Haverbeke http://eloquentjavascript.net/1st_edition/appendix2.html
class BinaryHeap {
    constructor(scoreFunction) {
        this.scoreFunction = scoreFunction;
        this.content = [];
    }
    push(element) {
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
    remove(node) {
        const i = this.content.indexOf(node);
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        const end = this.content.pop();
        if (i !== this.content.length - 1) {
            this.content[i] = end;
            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            }
            else {
                this.bubbleUp(i);
            }
        }
    }
    size() {
        return this.content.length;
    }
    rescoreElement(node) {
        this.sinkDown(this.content.indexOf(node));
    }
    sinkDown(n) {
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
            }
            else {
                // Found a parent that is less, no need to sink any further.
                break;
            }
        }
    }
    bubbleUp(n) {
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
            }
            else {
                // Otherwise, we are done.
                break;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hleC9oZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHVDQUF1Qzs7QUFFdkM7O0dBRUc7QUFDSDtJQUNJLFlBQW1CLENBQVMsRUFBUyxDQUFTO1FBQTNCLE1BQUMsR0FBRCxDQUFDLENBQVE7UUFBUyxNQUFDLEdBQUQsQ0FBQyxDQUFRO0lBQUcsQ0FBQztJQUVsRCxNQUFNO1FBQ0YsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNO1FBQ0YsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLENBQUMsS0FBd0I7UUFDOUIsSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUN6QixPQUFPLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztDQUNKO0FBdEJELHNCQXNCQztBQUVEOzs7O0dBSUc7QUFDSCxVQUFrQixTQUFRLEtBQUs7SUFDM0IsWUFBWSxDQUFTLEVBQUUsQ0FBUyxFQUFTLElBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUN2RCxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRHlCLE1BQUMsR0FBRCxDQUFDLENBQWlCO0lBRTNELENBQUM7SUFFRDs7O09BR0c7SUFDSCxPQUFPO1FBQ0gsT0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMs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LElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFlBQVksQ0FBQyxDQUFRO1FBQ2pCLE1BQU0sVUFBVSxHQUFHO1lBQ2YsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0IsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMxQixDQUFDO1FBQ0YsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILFdBQVcsQ0FBQyxDQUFRLEVBQUUsQ0FBUTtRQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENB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