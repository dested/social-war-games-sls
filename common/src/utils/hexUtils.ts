export class HexUtils {
  static getDirection(p1: Point, p2: Point): FacingDirection {
    if (p1.y === p2.y) {
      if (p1.x < p2.x) {
        return FacingDirection.Right;
      } else {
        return FacingDirection.Left;
      }
    } else if (p1.y > p2.y) {
      if (p1.x === p2.x) {
        return FacingDirection.TopLeft;
      } else {
        return FacingDirection.TopRight;
      }
    } else if (p1.y < p2.y) {
      if (p1.x === p2.x) {
        return FacingDirection.BottomRight;
      } else {
        return FacingDirection.BottomLeft;
      }
    } else {
      throw new Error();
    }
  }

  static getDistance(a: Point, b: Point) {
    return (Math.abs(a.x - b.x) + Math.abs(a.x + a.y - b.x - b.y) + Math.abs(a.y - b.y)) / 2;
  }

  static getDirectionStr(a: Point, b: Point) {
    const difX = a.x - b.x;
    const difY = a.y - b.y;

    const xDirection = difX > 0 ? 'West' : difX < 0 ? 'East' : '';
    const yDirection = difY > 0 ? 'North' : difY < 0 ? 'South' : '';

    if (yDirection && xDirection) {
      return yDirection + xDirection.toLowerCase();
    }

    return yDirection + '' + xDirection;
  }

  static randomFacingDirection(): FacingDirection {
    return Math.floor(Math.random() * 6);
  }
}

export enum FacingDirection {
  TopLeft = 0,
  TopRight = 1,
  BottomLeft = 2,
  BottomRight = 3,
  Left = 4,
  Right = 5,
}

export interface Point {
  x: number;
  y: number;
}
