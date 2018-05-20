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
            new Axial(a.x + 1, a.y),
            new Axial(a.x + 1, a.y - 1),
            new Axial(a.x, a.y - 1),
            new Axial(a.x - 1, a.y),
            new Axial(a.x - 1, a.y + 1),
            new Axial(a.x, a.y + 1)
        ];
        return directions.map(d => this.getHexAt(d)).filter(d => d);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vY29tbW9uL3NyYy9oZXgvaGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1Q0FBdUM7O0FBRXZDOztHQUVHO0FBQ0g7SUFDSSxZQUFtQixDQUFTLEVBQVMsQ0FBUztRQUEzQixNQUFDLEdBQUQsQ0FBQyxDQUFRO1FBQVMsTUFBQyxHQUFELENBQUMsQ0FBUTtJQUFHLENBQUM7SUFFbEQsTUFBTTtRQUNGLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTTtRQUNGLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUyxDQUFDLEtBQXdCO1FBQzlCLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDekIsT0FBTyxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7Q0FDSjtBQXRCRCxzQkFzQkM7QUFFRDs7OztHQUlHO0FBQ0gsVUFBa0IsU0FBUSxLQUFLO0lBQzNCLFlBQVksQ0FBUyxFQUFFLENBQVMsRUFBUyxJQUFZLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDdkQsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUR5QixNQUFDLEdBQUQsQ0FBQyxDQUFpQjtJQUUzRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsT0FBTztRQUNILE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJ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