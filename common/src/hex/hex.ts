// https://github.com/bodinaren/BHex.js

import {DoubleHashArray, HashArray} from '../utils/hashArray';
import {GameEntity} from '../game/entityDetail';

/**
 * Axial is a axial position of a Hexagon within a grid.
 */
export class Axial {
    constructor(public x: number, public y: number) {}

    getKey() {
        return this.y * 10000 + this.x;
    }

    add(x: number, y: number) {
        return new Axial(this.x + x, this.y + y);
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

export class Hexagon extends Axial {
    constructor(x: number, y: number, public cost: number = 1, public blocked: boolean = false) {
        super(x, y);
    }
}

export class Grid<T extends Hexagon = Hexagon> {
    hexes: HashArray<T, Point>;

    constructor(
        public boundsX: number,
        public boundsY: number,
        public boundsWidth: number,
        public boundsHeight: number
    ) {
        this.hexes = new HashArray<T, Point>(PointHashKey);
    }

    easyBounds(x: number, y: number): Axial {
        x = Math.round(x);
        y = Math.round(y);
        return new Axial(x - Math.floor(y / 2), y);
    }

    getCircle(a: Point, radius: number): T[] {
        const hexes: T[] = [];
        for (let x = -radius; x <= radius; x++) {
            for (let y = -radius; y <= radius; y++) {
                for (let z = -radius; z <= radius; z++) {
                    if (x + y + z == 0) {
                        const hex = this.getHexAt({x: x + a.x, y: y + a.y});
                        if (hex) hexes.push(hex);
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
    getHexAt(a: Point): T | undefined {
        return this.hexes.get(a);
    }

    private neighborCache: {[key: string]: T[]} = {};
    getNeighbors(a: Point): T[] {
        let key = `${a.x} ${a.y}`;
        if (this.neighborCache[key]) return this.neighborCache[key];
        const directions = [
            new Axial(a.x - 1, a.y + 1),
            new Axial(a.x - 1, a.y),
            new Axial(a.x, a.y - 1),
            new Axial(a.x + 1, a.y - 1),
            new Axial(a.x + 1, a.y),
            new Axial(a.x, a.y + 1)
        ];
        return (this.neighborCache[key] = directions.map(d => this.getHexAt(d)).filter(a=>a));
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

    getDirection(a: Point, b: Point) {
        const difX = a.x - b.x;
        const difY = a.y - b.y;

        let xDirection = difX > 0 ? 'West' : difX < 0 ? 'East' : '';
        let yDirection = difY > 0 ? 'North' : difY < 0 ? 'South' : '';

        if (yDirection && xDirection) {
            return yDirection + xDirection.toLowerCase();
        }

        return yDirection + '' + xDirection;
    }

    getThickLine(start: Axial, end: Axial, wd: number): T[] {
        let x0 = start.x;
        let y0 = start.y;

        let x1 = end.x;
        let y1 = end.y;
        const dx = Math.abs(x1 - x0);
        const sx = x0 < x1 ? 1 : -1;
        const dy = Math.abs(y1 - y0);
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        let e2: number;
        let x2: number;
        let y2: number;

        const ed = dx + dy == 0 ? 1 : Math.sqrt(dx * dx + dy * dy);

        let hexes: T[] = [];

        for (wd = (wd + 1) / 2; ; ) {
            let hex = this.getHexAt(this.easyBounds(x0, y0));
            if (hex) hexes.push(hex);
            e2 = err;
            x2 = x0;
            if (2 * e2 >= -dx) {
                for (e2 += dy, y2 = y0; e2 < ed * wd && (y1 != y2 || dx > dy); e2 += dx) {
                    hex = this.getHexAt(this.easyBounds(x0, (y2 += sy)));
                    if (hex) hexes.push(hex);
                }
                if (x0 == x1) break;
                e2 = err;
                err -= dy;
                x0 += sx;
            }
            if (2 * e2 <= dy) {
                for (e2 = dx - e2; e2 < ed * wd && (x1 != x2 || dx < dy); e2 += dy) {
                    hex = this.getHexAt(this.easyBounds((x2 += sx), y0));
                    if (hex) hexes.push(hex);
                }

                if (y0 == y1) break;
                err += dx;
                y0 += sy;
            }
        }
        return hexes;
    }

    getLine(start: Axial, end: Axial): T[] {
        if (start.compareTo(end)) return [];

        const cube_lerp = (a: Cube, b: Cube, t: number) =>
            new Cube(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
        const N = this.getDistance(start, end);
        const line1: T[] = [];
        const line2: T[] = [];
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

        for (let i = 0; i <= N; i++) {
            const axial = cube_lerp(cStart, cEnd1, 1.0 / N * i)
                .round()
                .toAxial();

            const hex = this.getHexAt(axial);

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

    getRange(start: T, movement: number, blockEntities: DoubleHashArray<GameEntity, Point, {id: number}>): T[] {
        const grid = this;
        const openHeap = new BinaryHeap((node: Grid_Search_Node<T>) => node.F);
        const closedHexes: {[key: string]: T} = {};
        const visitedNodes: {[key: string]: Grid_Search_Node<T>} = {};

        openHeap.push(new Grid_Search_Node<T>(start, null, 0));

        while (openHeap.size() > 0) {
            // Get the item with the lowest score (current + heuristic).
            const current = openHeap.pop();

            // Close the hex as processed.
            closedHexes[current.hex.getKey()] = current.hex;

            // Get and iterate the neighbors.
            const neighbors = grid.getNeighbors(current.hex);

            for (const n of neighbors) {
                // Make sure the neighbor is not blocked and that we haven't already processed it.
                if (!n || n.blocked || closedHexes[n.getKey()]) continue;

                // Get the total cost of going to this neighbor.
                const g = current.G + n.cost + (blockEntities.exists1(n) && 1000);

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
            }
        }

        const arr: T[] = [];
        for (const i in visitedNodes) if (visitedNodes.hasOwnProperty(i)) arr.push(visitedNodes[i].hex);

        return arr;
    }

    findPath(start: T, end: T, blockEntities: DoubleHashArray<GameEntity, Point, {id: number}>): T[] {
        const grid = this;
        const openHeap = new BinaryHeap<T>(node => node.F);
        const closedHexes: {[key: string]: Grid_Search_Node<T>} = {};
        const visitedNodes: {[key: string]: Grid_Search_Node<T>} = {};

        openHeap.push(new Grid_Search_Node<T>(start, null, 0, grid.getDistance(start, end)));

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
            for (const n of neighbors) {
                // Make sure the neighbor is not blocked and that we haven't already processed it.
                if (n.blocked || closedHexes[n.getKey()]) continue;

                // Get the total cost of going to this neighbor.
                const g = current.G + n.cost + +(blockEntities.exists1(n) && 1000);

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
            }
        }

        // Failed to find a path
        return [];
    }

    bustCache() {
        this.neighborCache = {};
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
class Grid_Search_Node<T> {
    parent: Grid_Search_Node<T> | null;
    G: number;
    H: number;
    F: number;

    constructor(public hex: T, parent: Grid_Search_Node<T> | null, g: number, h: number = 0) {
        this.rescore(parent, g, h);
    }

    /**
     * Rescore the node. Set a new parent and updates the G, H and F score.
     * @param {Hexagon} parent - How we came to this hexagon.
     * @param {number} g - The movement cost to move from the starting point A to a given hex on the grid, following the path generated to get there.
     * @property {number} [h=0] - The Heuristic (estimated) cost to get to the final destination.
     */
    rescore(parent: Grid_Search_Node<T> | null, g: number, h: number) {
        this.parent = parent;
        this.G = g;
        this.H = h || 0;
        this.F = this.G + this.H;
    }
}

export interface Point {
    x: number;
    y: number;
}
export let PointHashKey = (a: Point) => a.x + a.y * 10000 + '';

// Binary Heap implementation by bgrins https://github.com/bgrins/javascript-astar
// Based on implementation by Marijn Haverbeke http://eloquentjavascript.net/1st_edition/appendix2.html

class BinaryHeap<T> {
    content: Grid_Search_Node<T>[] = [];

    constructor(private scoreFunction: (node: Grid_Search_Node<T>) => number) {}

    push(element: Grid_Search_Node<T>) {
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

    remove(node: Grid_Search_Node<T>) {
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

    rescoreElement(node: Grid_Search_Node<T>) {
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
