import {HexConstants} from '../utils/hexConstants';
import {Axial, Grid, Hexagon, Point} from '@swg-common/hex/hex';
import {GameHexagon} from '@swg-common/game';
import {HexColors} from '../utils/hexColors';

export class Drawing {
    static Orientation: {
        FlatTop: 1;
        PointyTop: 2;
    } = {
        FlatTop: 1,
        PointyTop: 2
    };

    static update(grid: Grid<GameHexagon>, options: DrawingOptions) {
        for (const hex of grid.hexes) {
            this.updateHex(hex, grid, options);
        }
    }

    static updateHex(
        hex: GameHexagon,
        grid: Grid<GameHexagon>,
        options: DrawingOptions
    ) {
        hex.center = hex.center || Drawing.getCenter(hex, options);
        hex.points = hex.points || Drawing.getCorners(hex.center, options);
        hex.pointsSvg =
            hex.pointsSvg ||
            new Path2D(
                'M' + hex.points.map(a => `${a.x},${a.y}`).join(' ') + 'Z'
            );

        const neighbor = grid.getNeighbors(hex);
        hex.lines = [];
        for (let i = 0; i < hex.points.length; i++) {
            const p1 = hex.points[i];
            const p2 = hex.points[(i + 1) % 6];
            if (!neighbor[i] || neighbor[i].factionId !== hex.factionId) {
                if (
                    hex.factionId === '9' ||
                    (neighbor[i] && neighbor[i].factionId === '9')
                )
                    continue;
                hex.lines.push({
                    line: [p1, p2],
                    color: HexColors.factionIdToColor(
                        hex.factionId,
                        !neighbor[i] ? '0' : neighbor[i].factionId
                    )
                });
            }
        }
    }

    static getCorners(center: Point, options: DrawingOptions) {
        const points = [];

        for (let i = 0; i < 6; i++) {
            points.push(Drawing.getCorner(center, options, i));
        }
        return points;
    }

    static getCorner(center: Point, options: DrawingOptions, corner: number) {
        const offset =
            options.orientation === Drawing.Orientation.PointyTop ? 90 : 0;
        const angle_deg = 60 * corner + offset;
        const angle_rad = Math.PI / 180 * angle_deg;
        return {
            x: center.x + options.size * Math.cos(angle_rad),
            y: center.y + options.size * Math.sin(angle_rad)
        };
    }

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
        return {x,y};
    }

    static getHexAt<T extends Hexagon = Hexagon>(
        p: Point,
        grid: Grid<T>,
        options: DrawingOptions
    ) {
        let x;
        let y;

        if (options.orientation === Drawing.Orientation.FlatTop) {
            x = p.x * 2 / 3 / options.size;
            y = (-p.x / 3 + Math.sqrt(3) / 3 * p.y) / options.size;
        } else {
            x = (p.x * Math.sqrt(3) / 3 - p.y / 3) / options.size;
            y = p.y * 2 / 3 / options.size;
        }

        const a = new Axial(x, y)
            .toCube()
            .round()
            .toAxial();

        return grid.getHexAt(a);
    }
}

export class DrawingOptions {
    size: number;
    width: number;
    height: number;

    static default = new DrawingOptions(
        HexConstants.height / 2 - 1,
        Drawing.Orientation.PointyTop
    );

    constructor(
        side: number,
        public orientation: 1 | 2 = Drawing.Orientation.FlatTop,
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
