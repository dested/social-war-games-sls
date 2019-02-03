"use strict";
// https://github.com/bodinaren/BHex.js
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var hashArray_1 = require("../utils/hashArray");
/**
 * Axial is a axial position of a Hexagon within a grid.
 */
var Axial = /** @class */ (function () {
    function Axial(x, y) {
        this.x = x;
        this.y = y;
    }
    Axial.prototype.getKey = function () {
        return this.y * 10000 + this.x;
    };
    Axial.prototype.add = function (x, y) {
        return new Axial(this.x + x, this.y + y);
    };
    /**
     * Return a Cube representation of the axial.
     * @returns {Cube}
     */
    Axial.prototype.toCube = function () {
        return new Cube(this.x, -this.x - this.y, this.y);
    };
    /**
     * Check if two Axial items has the same x and y.
     */
    Axial.prototype.compareTo = function (other) {
        if (!other) {
            return false;
        }
        return this.x === other.x && this.y === other.y;
    };
    return Axial;
}());
exports.Axial = Axial;
/**
 * Cube is a cubic position of a Hexagon within a grid which includes the Z variable. Note that in a hexagonal grid, x + y + z should always equal 0!
 * @class
 * @augments Axial
 */
var Cube = /** @class */ (function (_super) {
    __extends(Cube, _super);
    function Cube(x, y, z) {
        if (z === void 0) { z = -x - y; }
        var _this = _super.call(this, x, y) || this;
        _this.z = z;
        return _this;
    }
    /**
     * Returns a Axial representation of the cube.
     * @returns {Axial}
     */
    Cube.prototype.toAxial = function () {
        return new Axial(this.x, this.z);
    };
    /**
     * Rounds the values of x, y and z. Needed to find a hex at a specific position. Returns itself after.
     */
    Cube.prototype.round = function () {
        var cx = this.x, cy = this.y, cz = this.z;
        this.x = Math.round(cx);
        this.y = Math.round(cy);
        this.z = Math.round(cz);
        var x_diff = Math.abs(this.x - cx), y_diff = Math.abs(this.y - cy), z_diff = Math.abs(this.z - cz);
        if (x_diff > y_diff && x_diff > z_diff) {
            this.x = -this.y - this.z;
        }
        else if (y_diff > z_diff) {
            this.y = -this.x - this.z;
        }
        else {
            this.z = -this.x - this.y;
        }
        return this;
    };
    return Cube;
}(Axial));
exports.Cube = Cube;
var Hexagon = /** @class */ (function (_super) {
    __extends(Hexagon, _super);
    function Hexagon(x, y, cost, blocked) {
        if (cost === void 0) { cost = 1; }
        if (blocked === void 0) { blocked = false; }
        var _this = _super.call(this, x, y) || this;
        _this.cost = cost;
        _this.blocked = blocked;
        return _this;
    }
    return Hexagon;
}(Axial));
exports.Hexagon = Hexagon;
var Grid = /** @class */ (function () {
    function Grid(boundsX, boundsY, boundsWidth, boundsHeight) {
        this.boundsX = boundsX;
        this.boundsY = boundsY;
        this.boundsWidth = boundsWidth;
        this.boundsHeight = boundsHeight;
        this.neighborCache = {};
        this.hexes = new hashArray_1.HashArray(exports.PointHashKey);
    }
    Grid.prototype.easyPoint = function (x, y) {
        x = Math.round(x);
        y = Math.round(y);
        return new Axial(x - Math.floor(y / 2), y);
    };
    Grid.prototype.getCircle = function (a, radius) {
        var hexes = [];
        for (var x = -radius; x <= radius; x++) {
            for (var y = -radius; y <= radius; y++) {
                for (var z = -radius; z <= radius; z++) {
                    if (x + y + z == 0) {
                        var hex = this.getHexAt({ x: x + a.x, y: y + a.y });
                        if (hex) {
                            hexes.push(hex);
                        }
                    }
                }
                g;
            }
        }
        return hexes;
    };
    /**
     * Get the hexagon at a given axial position.
     * @param {Axial} a - The axial position to look for.
     * @returns {Hexagon}
     */
    Grid.prototype.getHexAt = function (a) {
        return this.hexes.get(a);
    };
    Grid.prototype.getNeighbors = function (a) {
        var _this = this;
        var key = a.x + " " + a.y;
        if (this.neighborCache[key]) {
            return this.neighborCache[key];
        }
        var directions = [
            new Axial(a.x - 1, a.y + 1),
            new Axial(a.x - 1, a.y),
            new Axial(a.x, a.y - 1),
            new Axial(a.x + 1, a.y - 1),
            new Axial(a.x + 1, a.y),
            new Axial(a.x, a.y + 1),
        ];
        return (this.neighborCache[key] = directions.map(function (d) { return _this.getHexAt(d); }));
    };
    /**
     * Gets the distance between two axial positions ignoring any obstacles.
     * @param {Axial} a - The first axial position.
     * @param {Axial} b - The second axial position.
     * @returns {number} How many hexes it is between the given Axials.
     */
    Grid.prototype.getDistance = function (a, b) {
        return (Math.abs(a.x - b.x) + Math.abs(a.x + a.y - b.x - b.y) + Math.abs(a.y - b.y)) / 2;
    };
    Grid.prototype.getDirection = function (a, b) {
        var difX = a.x - b.x;
        var difY = a.y - b.y;
        var xDirection = difX > 0 ? 'West' : difX < 0 ? 'East' : '';
        var yDirection = difY > 0 ? 'North' : difY < 0 ? 'South' : '';
        if (yDirection && xDirection) {
            return yDirection + xDirection.toLowerCase();
        }
        return yDirection + '' + xDirection;
    };
    Grid.prototype.getThickLine = function (start, end, wd) {
        var x0 = start.x;
        var y0 = start.y;
        var x1 = end.x;
        var y1 = end.y;
        var dx = Math.abs(x1 - x0);
        var sx = x0 < x1 ? 1 : -1;
        var dy = Math.abs(y1 - y0);
        var sy = y0 < y1 ? 1 : -1;
        var err = dx - dy;
        var e2;
        var x2;
        var y2;
        var ed = dx + dy == 0 ? 1 : Math.sqrt(dx * dx + dy * dy);
        var hexes = [];
        for (wd = (wd + 1) / 2;;) {
            var hex = this.getHexAt(this.easyPoint(x0, y0));
            if (hex) {
                hexes.push(hex);
            }
            e2 = err;
            x2 = x0;
            if (2 * e2 >= -dx) {
                for (e2 += dy, y2 = y0; e2 < ed * wd && (y1 != y2 || dx > dy); e2 += dx) {
                    hex = this.getHexAt(this.easyPoint(x0, (y2 += sy)));
                    if (hex) {
                        hexes.push(hex);
                    }
                }
                if (x0 == x1) {
                    break;
                }
                e2 = err;
                err -= dy;
                x0 += sx;
            }
            if (2 * e2 <= dy) {
                for (e2 = dx - e2; e2 < ed * wd && (x1 != x2 || dx < dy); e2 += dy) {
                    hex = this.getHexAt(this.easyPoint((x2 += sx), y0));
                    if (hex) {
                        hexes.push(hex);
                    }
                }
                if (y0 == y1) {
                    break;
                }
                err += dx;
                y0 += sy;
            }
        }
        return hexes;
    };
    Grid.prototype.getLine = function (start, end) {
        if (start.compareTo(end)) {
            return [];
        }
        var cube_lerp = function (a, b, t) {
            return new Cube(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
        };
        var N = this.getDistance(start, end);
        var line1 = [];
        var line2 = [];
        var cStart = start.toCube();
        var cEnd1 = end.toCube();
        var cEnd2 = end.toCube();
        // Offset the ends slightly to get two lines, handling horizontal and vertical lines (in FlatTop and PointyTop respectively).
        cEnd1.x -= 1e-6;
        cEnd1.y -= 1e-6;
        cEnd1.z += 2e-6;
        cEnd2.x += 1e-6;
        cEnd2.y += 1e-6;
        cEnd2.z -= 2e-6;
        for (var i = 0; i <= N; i++) {
            var axial = cube_lerp(cStart, cEnd1, (1.0 / N) * i)
                .round()
                .toAxial();
            var hex = this.getHexAt(axial);
            if (!start.compareTo(hex)) {
                if (hex && !hex.blocked) {
                    line1.push(hex);
                }
                else {
                    break;
                }
            }
        }
        for (var i = 0; i <= N; i++) {
            var axial = cube_lerp(cStart, cEnd2, (1.0 / N) * i)
                .round()
                .toAxial();
            var hex = this.getHexAt(axial);
            if (!start.compareTo(hex)) {
                if (hex && !hex.blocked) {
                    line2.push(hex);
                }
                else {
                    break;
                }
            }
        }
        return line1.length > line2.length ? line1 : line2;
    };
    Grid.prototype.getRange = function (start, movement, blockEntities) {
        var grid = this;
        var openHeap = new BinaryHeap(function (node) { return node.F; });
        var closedHexes = {};
        var visitedNodes = {};
        openHeap.push(new Grid_Search_Node(start, null, 0));
        while (openHeap.size() > 0) {
            // Get the item with the lowest score (current + heuristic).
            var current = openHeap.pop();
            // Close the hex as processed.
            closedHexes[current.hex.getKey()] = current.hex;
            // Get and iterate the neighbors.
            var neighbors = grid.getNeighbors(current.hex);
            for (var _i = 0, neighbors_1 = neighbors; _i < neighbors_1.length; _i++) {
                var n = neighbors_1[_i];
                // Make sure the neighbor is not blocked and that we haven't already processed it.
                if (!n || n.blocked || closedHexes[n.getKey()]) {
                    continue;
                }
                // Get the total cost of going to this neighbor.
                var g = current.G + n.cost + (blockEntities.exists1(n) && 1000);
                var visited = visitedNodes[n.getKey()];
                // Is it cheaper the previously best path to get here?
                if (g <= movement && (!visited || g < visited.G)) {
                    var h = 0;
                    if (!visited) {
                        // This was the first time we visited this node, add it to the heap.
                        var nNode = new Grid_Search_Node(n, current, g, h);
                        visitedNodes[n.getKey()] = nNode;
                        openHeap.push(nNode);
                    }
                    else {
                        // We've visited this path before, but found a better path. Rescore it.
                        visited.rescore(current, g, h);
                        openHeap.rescoreElement(visited);
                    }
                }
            }
        }
        var arr = [];
        for (var i in visitedNodes) {
            if (visitedNodes.hasOwnProperty(i)) {
                arr.push(visitedNodes[i].hex);
            }
        }
        return arr;
    };
    Grid.prototype.findPath = function (start, end, blockEntities) {
        var grid = this;
        var openHeap = new BinaryHeap(function (node) { return node.F; });
        var closedHexes = {};
        var visitedNodes = {};
        openHeap.push(new Grid_Search_Node(start, null, 0, grid.getDistance(start, end)));
        while (openHeap.size() > 0) {
            // Get the item with the lowest score (current + heuristic).
            var current = openHeap.pop();
            // SUCCESS: If this is where we're going, backtrack and return the path.
            if (current.hex.compareTo(end)) {
                var path = [];
                while (current.parent) {
                    path.push(current);
                    current = current.parent;
                }
                return path.map(function (x) { return x.hex; }).reverse();
            }
            // Close the hex as processed.
            closedHexes[current.hex.getKey()] = current;
            // Get and iterate the neighbors.
            var neighbors = grid.getNeighbors(current.hex);
            for (var _i = 0, neighbors_2 = neighbors; _i < neighbors_2.length; _i++) {
                var n = neighbors_2[_i];
                // Make sure the neighbor is not blocked and that we haven't already processed it.
                if (!n || n.blocked || closedHexes[n.getKey()]) {
                    continue;
                }
                // Get the total cost of going to this neighbor.
                var g = current.G + n.cost + +(blockEntities.exists1(n) && 1000);
                var visited = visitedNodes[n.getKey()];
                // Is it cheaper the previously best path to get here?
                if (!visited || g < visited.G) {
                    var h = grid.getDistance(n, end);
                    if (!visited) {
                        // This was the first time we visited this node, add it to the heap.
                        var nNode = new Grid_Search_Node(n, current, g, h);
                        closedHexes[nNode.hex.getKey()] = nNode;
                        openHeap.push(nNode);
                    }
                    else {
                        // We've visited this path before, but found a better path. Rescore it.
                        visited.rescore(current, g, h);
                        openHeap.rescoreElement(visited);
                    }
                }
            }
        }
        // Failed to find a path
        return [];
    };
    Grid.prototype.bustCache = function () {
        this.neighborCache = {};
    };
    return Grid;
}());
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
var Grid_Search_Node = /** @class */ (function () {
    function Grid_Search_Node(hex, parent, g, h) {
        if (h === void 0) { h = 0; }
        this.hex = hex;
        this.rescore(parent, g, h);
    }
    /**
     * Rescore the node. Set a new parent and updates the G, H and F score.
     * @param {Hexagon} parent - How we came to this hexagon.
     * @param {number} g - The movement cost to move from the starting point A to a given hex on the grid, following the path generated to get there.
     * @property {number} [h=0] - The Heuristic (estimated) cost to get to the final destination.
     */
    Grid_Search_Node.prototype.rescore = function (parent, g, h) {
        this.parent = parent;
        this.G = g;
        this.H = h || 0;
        this.F = this.G + this.H;
    };
    return Grid_Search_Node;
}());
exports.PointHashKey = function (a) { return a.x + a.y * 10000 + ''; };
// Binary Heap implementation by bgrins https://github.com/bgrins/javascript-astar
// Based on implementation by Marijn Haverbeke http://eloquentjavascript.net/1st_edition/appendix2.html
var BinaryHeap = /** @class */ (function () {
    function BinaryHeap(scoreFunction) {
        this.scoreFunction = scoreFunction;
        this.content = [];
    }
    BinaryHeap.prototype.push = function (element) {
        // Add the new element to the end of the array.
        this.content.push(element);
        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    };
    BinaryHeap.prototype.pop = function () {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    };
    BinaryHeap.prototype.remove = function (node) {
        var i = this.content.indexOf(node);
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();
        if (i !== this.content.length - 1) {
            this.content[i] = end;
            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            }
            else {
                this.bubbleUp(i);
            }
        }
    };
    BinaryHeap.prototype.size = function () {
        return this.content.length;
    };
    BinaryHeap.prototype.rescoreElement = function (node) {
        this.sinkDown(this.content.indexOf(node));
    };
    BinaryHeap.prototype.sinkDown = function (n) {
        // Fetch the element that has to be sunk.
        var element = this.content[n];
        // When at 0, an element can not sink any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1;
            var parent_1 = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent_1)) {
                this.content[parentN] = element;
                this.content[n] = parent_1;
                // Update 'n' to continue at the new position.
                n = parentN;
            }
            else {
                // Found a parent that is less, no need to sink any further.
                break;
            }
        }
    };
    BinaryHeap.prototype.bubbleUp = function (n) {
        // Look up the target element and its score.
        var length = this.content.length;
        var element = this.content[n];
        var elemScore = this.scoreFunction(element);
        while (true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1;
            var child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            var swap = null;
            var child1Score = void 0;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);
                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) {
                    swap = child1N;
                }
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N];
                var child2Score = this.scoreFunction(child2);
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
    };
    return BinaryHeap;
}());
