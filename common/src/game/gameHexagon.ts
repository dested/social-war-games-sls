import {Point} from '@swg-common/utils/hexUtils';
import {Hexagon} from '../hex/hex';
import {Faction} from './entityDetail';
import {HexagonTileType} from './hexagonTypes';

export class GameHexagon extends Hexagon {
  factionId: Faction = '0';
  factionDuration: number = 0;

  center: Point;
  smallCenter: Point;
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

  setFactionId(factionId: Faction, duration: number) {
    this.factionId = factionId;
    this.factionDuration = duration;
  }

  lines: {line: [Point, Point]; color: string}[] = [];
}
