"use strict";
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
     * @param {Axial} other - The object to compare to.
     * @returns {boolean}
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
        var cx = this.x, cy = this.y, cz = this.z;
        this.x = Math.round(cx);
        this.y = Math.round(cy);
        this.z = Math.round(cz);
        var x_diff = Math.abs(this.x - cx), y_diff = Math.abs(this.y - cy), z_diff = Math.abs(this.z - cz);
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
    constructor(radius = 0) {
        this.radius = radius;
        this.hexes = [];
        for (let x = -radius; x <= radius; x++)
            for (let y = -radius; y <= radius; y++)
                for (let z = -radius; z <= radius; z++)
                    if (x + y + z === 0)
                        this.hexes.push(new Hexagon(x, y));
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
        for (var i = 0; i <= N; i++) {
            var axial = cube_lerp(cStart, cEnd2, 1.0 / N * i)
                .round()
                .toAxial();
            var hex = this.getHexAt(axial);
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
     * @param {Axial} a - The starting axial position.
     * @param {number} movement - How far from the starting axial should be fetched.
     * @returns {Hexagon[]} All the hexes within range (excluding the starting position).
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
        return new Point(Math.round(center.x + options.size * Math.cos(angle_rad)), Math.round(center.y + options.size * Math.sin(angle_rad)));
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
        return new Point(Math.round(x), Math.round(y));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hleC9oZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7R0FFRztBQUNIO0lBQ0ksWUFBbUIsQ0FBUyxFQUFTLENBQVM7UUFBM0IsTUFBQyxHQUFELENBQUMsQ0FBUTtRQUFTLE1BQUMsR0FBRCxDQUFDLENBQVE7SUFBRyxDQUFDO0lBRWxELE1BQU07UUFDRixPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7T0FHRztJQUNILE1BQU07UUFDRixPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUyxDQUFDLEtBQXdCO1FBQzlCLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDekIsT0FBTyxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7Q0FDSjtBQXhCRCxzQkF3QkM7QUFFRDs7OztHQUlHO0FBQ0gsVUFBa0IsU0FBUSxLQUFLO0lBQzNCLFlBQVksQ0FBUyxFQUFFLENBQVMsRUFBUyxJQUFZLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDdkQsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUR5QixNQUFDLEdBQUQsQ0FBQyxDQUFpQjtJQUUzRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsT0FBTztRQUNILE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckMs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