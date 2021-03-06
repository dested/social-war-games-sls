import {GameModel} from '@swg-common/game/gameLogic';
import {HexConstants} from '../utils/hexConstants';
import {DrawingOptions} from './hexDrawing';

export class GameView {
  x: number;
  y: number;
  width: number;
  height: number;

  scale: number;

  constructor(private canvas: HTMLCanvasElement, private game: GameModel) {
    if (localStorage.getItem('view-x' + canvas.id)) {
      this.x = parseInt(localStorage.getItem('view-x' + canvas.id));
    } else {
      this.x = 0;
    }
    if (localStorage.getItem('view-y' + canvas.id)) {
      this.y = parseInt(localStorage.getItem('view-y' + canvas.id));
    } else {
      this.y = 0;
    }

    this.width = canvas.width;
    this.height = canvas.height;
    this.scale = 1;
  }

  get xSlop(): number {
    return this.x - this.viewSlop;
  }

  get ySlop(): number {
    return this.y - this.viewSlop;
  }

  get widthSlop(): number {
    return this.width + this.viewSlop * 2;
  }

  get heightSlop(): number {
    return this.height + this.viewSlop * 2;
  }

  private viewSlop = 100;

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.clamp();

    localStorage.setItem('view-x' + this.canvas.id, this.x.toString());
    localStorage.setItem('view-y' + this.canvas.id, this.y.toString());
    this.updateSmallBox();
  }

  updateSmallBox() {
    if (!(window as any).smallRendererBox) {
      return;
    }
    const d = (window as any).smallRendererBox as HTMLDivElement;

    const w = HexConstants.width / HexConstants.smallWidth;
    const h = HexConstants.height / HexConstants.smallHeight;

    d.style.left = `${this.x / w}px`;
    d.style.top = `${this.y / h}px`;

    d.style.width = `${this.width / w}px`;
    d.style.height = `${this.height / h}px`;
  }

  offsetPosition(x: number, y: number) {
    this.setPosition(this.x + x, this.y + y);
  }

  private clamp() {
    const gutter = 0.2;
    const reverseGutter = 1 - gutter;

    if (this.x < -this.width * gutter) {
      this.x = -this.width * gutter;
    }
    if (this.y < -this.height * gutter) {
      this.y = -this.height * gutter;
    }

    if (this.x > this.game.grid.boundsWidth * DrawingOptions.default.width - this.width * reverseGutter) {
      this.x = this.game.grid.boundsWidth * DrawingOptions.default.width - this.width * reverseGutter;
    }

    if (this.y > (this.game.grid.boundsHeight * DrawingOptions.default.height * 3) / 4 - this.height * reverseGutter) {
      this.y = (this.game.grid.boundsHeight * DrawingOptions.default.height * 3) / 4 - this.height * reverseGutter;
    }
  }

  setBounds(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.clamp();
  }
}
