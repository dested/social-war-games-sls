import {Hexagon, Point} from '../hex/hex';
import {HexagonTileType} from './hexagonTypes';
import {FactionId} from './entityDetail';

export class GameHexagon extends Hexagon {
    factionId: FactionId = '0';

    center: Point;
    points: Point[];
    pointsSvg: Path2D;

    constructor(public tileType: HexagonTileType, public id: string, x: number, y: number) {
        super(x, y, tileType.cost, tileType.blocked);
    }

    setTileType(tileType: HexagonTileType) {
        this.tileType = tileType;
        this.cost = tileType.cost;
        this.blocked = tileType.blocked;
    }

    setFactionId(factionId: FactionId) {
        this.factionId = factionId;
    }

    lines: { line: [Point, Point]; color: string }[] = [];
}