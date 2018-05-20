// Binary Heap implementation by bgrins https://github.com/bgrins/javascript-astar
// Based on implementation by Marijn Haverbeke http://eloquentjavascript.net/1st_edition/appendix2.html

var BinaryHeap = function(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
};

BinaryHeap.prototype = {
    push: function(element) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    },
    pop: function() {
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
    },
    remove: function(node) {
        var i = this.content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();

        if (i !== this.content.length - 1) {
            this.content[i] = end;

            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            } else {
                this.bubbleUp(i);
            }
        }
    },
    size: function() {
        return this.content.length;
    },
    rescoreElement: function(node) {
        this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function(n) {
        // Fetch the element that has to be sunk.
        var element = this.content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1,
                parent = this.content[parentN];
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
    },
    bubbleUp: function(n) {
        // Look up the target element and its score.
        var length = this.content.length,
            element = this.content[n],
            elemScore = this.scoreFunction(element);

        while (true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1,
                child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            var swap = null,
                child1Score;
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
                var child2 = this.content[child2N],
                    child2Score = this.scoreFunction(child2);
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
};

/**
 * The namespace. This namespace does by itself not include any code related to drawing Hexagons. It's just the logics of them.
 * @namespace
 */
var BHex = BHex || {};

/**
 * BHex.Axial is a axial position of a Hexagon within a grid.
 * @class
 * @param {number} x - Value of the X axis
 * @param {number} y - Value of the Y axis
 * @property {number} x - Value of the X axis
 * @property {number} y - Value of the Y axis
 */
BHex.Axial = function(x, y) {
    this.x = x;
    this.y = y;
};

BHex.Axial.prototype.getKey = function() {
    return this.x + 'x' + this.y;
};

/**
 * Return a BHex.Cube representation of the axial.
 * @returns {BHex.Cube}
 */
BHex.Axial.prototype.toCube = function() {
    return new BHex.Cube(this.x, -this.x - this.y, this.y);
};

/**
 * Check if two Axial items has the same x and y.
 * @param {BHex.Axial} other - The object to compare to.
 * @returns {boolean}
 */
BHex.Axial.prototype.compareTo = function(other) {
    return this.x === other.x && this.y === other.y;
};

/**
 * BHex.Cube is a cubic position of a Hexagon within a grid which includes the Z variable. Note that in a hexagonal grid, x + y + z should always equal 0!
 * @class
 * @augments BHex.Axial
 * @param {number} x - Value of the cubic X axis
 * @param {number} y - Value of the cubic Y axis
 * @param {number} [z=x + y] - Value of the cubic Z axis.
 * @property {number} x - Value of the cubic X axis
 * @property {number} y - Value of the cubic Y axis
 * @property {number} < - Value of the cubic Z axis.
 */
BHex.Cube = function(x, y, z) {
    BHex.Axial.call(this, x, y);
    this.z = z || -x - y;
};
BHex.Cube.prototype = BHex.Axial.prototype;

/**
 * Returns a BHex.Axial representation of the cube.
 * @returns {BHex.Axial}
 */
BHex.Cube.prototype.toAxial = function() {
    return new BHex.Axial(this.x, this.z);
};

/**
 * BHex.Hexagon
 * @class
 * @augments BHex.Axial
 * @param {number} x - Value of the X axis
 * @param {number} y - Value of the Y axis
 * @param {number} [cost=1] - The movement cost to step on the hexagon. For the pathfinding to work optimally, minimum cost should be 1.
 * @param {boolean} [blocked=false] - If movement is enabled on this hexagon.
 * @property {number} x - Value of the X axis
 * @property {number} y - Value of the Y axis
 * @property {number} cost - The movement cost to step on the hexagon. For the pathfinding to work optimally, minimum cost should be 1.
 * @property {boolean} blocked - If movement is enabled on this hexagon.
 */
BHex.Hexagon = function(x, y, cost, blocked) {
    BHex.Axial.call(this, x, y);

    this.cost = cost ? cost : 1;
    this.blocked = !!blocked;
};
BHex.Hexagon.prototype = BHex.Axial.prototype;

/**
 * BHex.Grid is a grid of one or more Hexagons, created from the center outwards in a circle.
 * @class
 * @param {number} radius - The radius of the grid with 0 being just the center piece.
 * @property {number} radius - The radius of the grid with 0 being just the center piece.
 * @property {Array} hexes - The hexes of the grid.
 */
BHex.Grid = function(radius) {
    this.radius = radius || 0;
    this.hexes = [];

    for (var x = -radius; x <= radius; x++)
        for (var y = -radius; y <= radius; y++)
            for (var z = -radius; z <= radius; z++) if (x + y + z == 0) this.hexes.push(new BHex.Hexagon(x, y));
};

BHex.Grid = function(radius) {
    this.radius = radius || 0;
    this.hexes = [];

    for (var x = -radius; x <= radius; x++)
        for (var y = -radius; y <= radius; y++)
            for (var z = -radius; z <= radius; z++) if (x + y + z == 0) this.hexes.push(new BHex.Hexagon(x, y));
};

/**
 * Get the hexagon at a given axial position.
 * @param {BHex.Axial} a - The axial position to look for.
 * @returns {BHex.Hexagon}
 */
BHex.Grid.prototype.getHexAt = function(a) {
    var hex;
    this.hexes.some(function(h) {
        if (h.compareTo(a)) return (hex = h);
    });
    return hex;
};

/**
 * Get the neighboring hexagons at a given axial position.
 * @param {BHex.Axial} a - The axial position to get neighbors for.
 * @returns {BHex.Hexagon[]} Array of neighboring hexagons.
 */
BHex.Grid.prototype.getNeighbors = function(a) {
    var grid = this;

    var neighbors = [],
        directions = [
            new BHex.Axial(a.x + 1, a.y),
            new BHex.Axial(a.x + 1, a.y - 1),
            new BHex.Axial(a.x, a.y - 1),
            new BHex.Axial(a.x - 1, a.y),
            new BHex.Axial(a.x - 1, a.y + 1),
            new BHex.Axial(a.x, a.y + 1)
        ];

    directions.forEach(function(d) {
        var h = grid.getHexAt(d);
        if (h) neighbors.push(h);
    });

    return neighbors;
};

/**
 * Gets the distance between two axial positions ignoring any obstacles.
 * @param {BHex.Axial} a - The first axial position.
 * @param {BHex.Axial} b - The second axial position.
 * @returns {number} How many hexes it is between the given Axials.
 */
BHex.Grid.prototype.getDistance = function(a, b) {
    return (Math.abs(a.x - b.x) + Math.abs(a.x + a.y - b.x - b.y) + Math.abs(a.y - b.y)) / 2;
};

/**
 * Contains helper objects for doing searches within the grid.
 * @namespace
 * @private
 */
BHex.Grid.Search = BHex.Grid.Search || {};

/**
 * Creates a binary heap.
 * @class
 * @private
 */
BHex.Grid.Search.Heap = function() {
    if (!BinaryHeap) throw new Error('BinaryHeap was not found.');

    return new BinaryHeap(function(node) {
        return node.F;
    });
};

/**
 * Helper class to store data relevant to our astar search. This class is used to avoid dumping data on our hexes.
 * @class
 * @private
 * @param {BHex.Hexagon} hex - The hexagon this node is relevant for.
 * @param {BHex.Hexagon} parent - How we came to this hexagon.
 * @param {number} g - The movement cost to move from the starting point A to a given hex on the grid, following the path generated to get there.
 * @param {number} [h=0] - The Heuristic (estimated) cost to get to the final destination.
 * @property {number} F - The sum of G + H
 */
BHex.Grid.Search.Node = function(hex, parent, g, h) {
    this.hex = hex;
    this.parent = this.G = this.H = this.F = null;
    this.rescore(parent, g, h);
};
/**
 * Rescore the node. Set a new parent and updates the G, H and F score.
 * @param {BHex.Hexagon} parent - How we came to this hexagon.
 * @param {number} g - The movement cost to move from the starting point A to a given hex on the grid, following the path generated to get there.
 * @property {number} [h=0] - The Heuristic (estimated) cost to get to the final destination.
 */
BHex.Grid.Search.Node.prototype.rescore = function(parent, g, h) {
    this.parent = parent;
    this.G = g;
    this.H = h || 0;
    this.F = this.G + this.H;
};

/**
 * Get a line of sight between two axial positions.
 * @param {BHex.Axial} start -  The starting axial position.
 * @param {BHex.Axial} end -  The ending axial position.
 * @returns {BHex.Hexagon[]} The hexagons along the line of sight, excluding starting position.
 */
BHex.Grid.prototype.getLine = function(start, end) {
    if (start.compareTo(end)) return [];

    var cube_lerp = function(a, b, t) {
            return new BHex.Cube(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
        },
        N = this.getDistance(start, end),
        line1 = [],
        line2 = [],
        cStart = start.toCube(),
        cEnd1 = end.toCube(),
        cEnd2 = end.toCube();

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
            if (!hex.blocked) {
                line1.push(hex);
            } else break;
        }
    }

    for (var i = 0; i <= N; i++) {
        var axial = cube_lerp(cStart, cEnd2, 1.0 / N * i)
            .round()
            .toAxial();

        var hex = this.getHexAt(axial);

        if (!start.compareTo(hex)) {
            if (!hex.blocked) {
                line2.push(hex);
            } else break;
        }
    }

    return line1.length > line2.length ? line1 : line2;
};

/**
 * Gets all the hexes within a specified range, taking inertia (BHex.Hexagon.cost) into account.
 * @param {BHex.Axial} a - The starting axial position.
 * @param {number} movement - How far from the starting axial should be fetched.
 * @returns {BHex.Hexagon[]} All the hexes within range (excluding the starting position).
 */
BHex.Grid.prototype.getRange = function(start, movement) {
    var grid = this,
        openHeap = BHex.Grid.Search.Heap(),
        closedHexes = {},
        visitedNodes = {};

    openHeap.push(new BHex.Grid.Search.Node(start, null, 0));

    while (openHeap.size() > 0) {
        // Get the item with the lowest score (current + heuristic).
        var current = openHeap.pop();

        // Close the hex as processed.
        closedHexes[current.hex.getKey()] = current.hex;

        // Get and iterate the neighbors.
        var neighbors = grid.getNeighbors(current.hex);

        neighbors.forEach(function(n) {
            // Make sure the neighbor is not blocked and that we haven't already processed it.
            if (n.blocked || closedHexes[n.getKey()]) return;

            // Get the total cost of going to this neighbor.
            var g = current.G + n.cost,
                visited = visitedNodes[n.getKey()];

            // Is it cheaper the previously best path to get here?
            if (g <= movement && (!visited || g < visited.G)) {
                var h = 0;

                if (!visited) {
                    // This was the first time we visited this node, add it to the heap.
                    var nNode = new BHex.Grid.Search.Node(n, current, g, h);
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

    var arr = [];
    for (var i in visitedNodes) if (visitedNodes.hasOwnProperty(i)) arr.push(visitedNodes[i].hex);

    return arr;
};

/**
 * Get the shortest path from two axial positions, taking inertia (BHex.Hexagon.cost) into account.
 * @param {BHex.Axial} start - The starting axial position.
 * @param {BHex.Axial} end - The ending axial position.
 * @returns {BHex.Hexagon[]} The path from the first hex to the last hex (excluding the starting position).
 */
BHex.Grid.prototype.findPath = function(start, end) {
    var grid = this,
        openHeap = new BHex.Grid.Search.Heap(),
        closedHexes = {},
        visitedNodes = {};

    openHeap.push(new BHex.Grid.Search.Node(start, null, 0, grid.getDistance(start, end)));

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
            return path
                .map(function(x) {
                    return x.hex;
                })
                .reverse();
        }

        // Close the hex as processed.
        closedHexes[current.hex.getKey()] = current;

        // Get and iterate the neighbors.
        var neighbors = grid.getNeighbors(current.hex);
        neighbors.forEach(function(n) {
            // Make sure the neighbor is not blocked and that we haven't already processed it.
            if (n.blocked || closedHexes[n.getKey()]) return;

            // Get the total cost of going to this neighbor.
            var g = current.G + n.cost,
                visited = visitedNodes[n.getKey()];

            // Is it cheaper the previously best path to get here?
            if (!visited || g < visited.G) {
                var h = grid.getDistance(n, end);

                if (!visited) {
                    // This was the first time we visited this node, add it to the heap.
                    var nNode = new BHex.Grid.Search.Node(n, current, g, h);
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
};

// Extend a few objects from BHex

/**
 * The center of the hexagon.
 * @type {BHex.Drawing.Point}
 */
BHex.Hexagon.prototype.center = null;

/**
 * Array of each of the 6 corners in the hexagon.
 * @type {BHex.Drawing.Point[]}
 */
BHex.Hexagon.prototype.points = null;

/**
 * Rounds the values of x, y and z. Needed to find a hex at a specific position. Returns itself after.
 */
BHex.Cube.prototype.round = function() {
    var cx = this.x,
        cy = this.y,
        cz = this.z;

    this.x = Math.round(cx);
    this.y = Math.round(cy);
    this.z = Math.round(cz);

    var x_diff = Math.abs(this.x - cx),
        y_diff = Math.abs(this.y - cy),
        z_diff = Math.abs(this.z - cz);

    if (x_diff > y_diff && x_diff > z_diff) this.x = -this.y - this.z;
    else if (y_diff > z_diff) this.y = -this.x - this.z;
    else this.z = -this.x - this.y;

    return this;
};

/**
 * This namespace does not include any code related to actually drawing hexagons. It's just the logics needed to draw them, such as calculating the corners and finding a hexagon at a specific point.
 * @namespace
 */
BHex.Drawing = BHex.Drawing || {};

/**
 * BHex.Drawing is used for all you need to draw the hexagon grid and finding hexagons within the grid.
 * In using this constructor, the corners of all the hexes will be generated.
 * @class
 * @param {BHex.Grid} grid - The grid of hexagons to be used.
 * @param {BHex.Drawing.Options} options - Options to be used.
 * @property {BHex.Grid} grid - The grid of hexagons to be used.
 * @property {BHex.Drawing.Options} options - Options to be used.
 */
BHex.Drawing.Drawing = function(grid, options) {
    this.grid = grid;
    this.options = options;

    this.grid.hexes.forEach(function(hex) {
        hex.center = BHex.Drawing.Drawing.getCenter(hex, options);
        hex.points = BHex.Drawing.Drawing.getCorners(hex.center, options);
    });
};

/**
 * Creates 6 points that marks the corners of a hexagon.
 * @private
 * @param {BHex.Drawing.Point} center - The center point of the hexagon.
 * @param {BHex.Drawing.Options} options - Drawing options to be used.
 * @returns {BHex.Drawing.Point[]}
 */
BHex.Drawing.Drawing.getCorners = function(center, options) {
    var points = [];

    for (var i = 0; i < 6; i++) {
        points.push(BHex.Drawing.Drawing.getCorner(center, options, i));
    }
    return points;
};

/**
 * Find the given corner for a hex.
 * @param {BHex.Drawing.Point} center - The center of the hexagon.
 * @param {BHex.Drawing.Options} options - Drawing options to be used.
 * @param {number} corner - Which of the 6 corners should be calculated?
 * @returns {BHex.Drawing.Point}
 */
BHex.Drawing.Drawing.getCorner = function(center, options, corner) {
    var offset = options.orientation == BHex.Drawing.Static.Orientation.PointyTop ? 90 : 0,
        angle_deg = 60 * corner + offset,
        angle_rad = Math.PI / 180 * angle_deg;
    return new BHex.Drawing.Point(
        Math.round(center.x + options.size * Math.cos(angle_rad)),
        Math.round(center.y + options.size * Math.sin(angle_rad))
    );
};

/**
 * Find the center point of the axial, given the options provided.
 * @param {BHex.Axial} axial - The axial for which to find the center point.
 * @param {BHex.Drawing.Options} options - Drawing options to be used.
 * @returns {BHex.Drawing.Point}
 */
BHex.Drawing.Drawing.getCenter = function(axial, options) {
    var x = 0,
        y = 0,
        c = axial.toCube();

    if (options.orientation == BHex.Drawing.Static.Orientation.FlatTop) {
        x = c.x * options.width * 3 / 4;
        y = (c.z + c.x / 2) * options.height;
    } else {
        x = (c.x + c.z / 2) * options.width;
        y = c.z * options.height * 3 / 4;
    }
    x += options.center.x;
    y += options.center.y;
    return new BHex.Drawing.Point(Math.round(x), Math.round(y));
};

/**
 * Get the hexagon at a specific point.
 * @param {BHex.Drawing.Point} p - The points for which to find a hex.
 * @returns {BHex.Hexagon}
 */
BHex.Drawing.Drawing.prototype.getHexAt = function(p) {
    var x, y;

    if (this.options.orientation == BHex.Drawing.Static.Orientation.FlatTop) {
        x = p.x * 2 / 3 / this.options.size;
        y = (-p.x / 3 + Math.sqrt(3) / 3 * p.y) / this.options.size;
    } else {
        x = (p.x * Math.sqrt(3) / 3 - p.y / 3) / this.options.size;
        y = p.y * 2 / 3 / this.options.size;
    }

    var a = new BHex.Axial(x, y)
        .toCube()
        .round()
        .toAxial();

    return this.grid.getHexAt(a);
};

/**
 * A number of enums used to describe a grid.
 * @namespace
 */
BHex.Drawing.Static = {
    /**
     * The rotation of the hexagon when drawn.
     * @enum {number}
     */
    Orientation: {
        /** The hexagon will have flat tops and bottom, and pointy sides. */
        FlatTop: 1,
        /** The hexagon will have flat sides, and pointy top and bottom. */
        PointyTop: 2
    }
};

/**
 * BHex.Drawing.Point is a horizontal and vertical representation of a position.
 * @class
 * @param {number} x - The horizontal position.
 * @param {number} y - The vertical position.
 * @property {number} x - The horizontal position.
 * @property {number} y - The vertical position.
 */
BHex.Drawing.Point = function(x, y) {
    this.x = x;
    this.y = y;
};

/**
 * A Hexagon is a 6 sided polygon, our hexes don't have to be symmetrical, i.e. ratio of width to height could be 4 to 3
 * @class
 * @param {number} side - How long the flat side should be.
 * @param {BHex.Drawing.Static.Orientation} [orientation=BHex.Drawing.Static.Orientation.FlatTop] - Which orientation the hex will have.
 * @param {BHex.Drawing.Point} [center=new BHex.Drawing.Point(0, 0)] - Where is the center of the grid located. This helps by saving you the trouble of keeping track of the offset yourself.
 * @property {number} side - How long the flat side should be.
 * @property {BHex.Drawing.Static.Orientation} orientation - Which orientation the hex will have.
 */
BHex.Drawing.Options = function(side, orientation, center) {
    this.size = side;
    this.orientation = orientation || BHex.Drawing.Static.Orientation.FlatTop;
    this.center = center || new BHex.Drawing.Point(0, 0);

    if (this.orientation == BHex.Drawing.Static.Orientation.FlatTop) {
        this.width = side * 2;
        this.height = Math.sqrt(3) / 2 * this.width;
    } else {
        this.height = side * 2;
        this.width = Math.sqrt(3) / 2 * this.height;
    }
};

export default BHex;
