import {GameModel} from '@swg-common/game/gameLogic';
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
    }

    offsetPosition(x: number, y: number) {
        this.setPosition(this.x + x, this.y + y);
    }

    private clamp() {
        const gutter = 0.2;
        const reverseGutter = 1 - gutter;

        if (this.x < -window.innerWidth * gutter) {
            this.x = -window.innerWidth * gutter;
        }
        if (this.y < -window.innerHeight * gutter) {
            this.y = -window.innerHeight * gutter;
        }
        if (this.x > this.game.grid.boundsWidth * DrawingOptions.default.width - window.innerWidth * reverseGutter) {
            this.x = this.game.grid.boundsWidth * DrawingOptions.default.width - window.innerWidth * reverseGutter;
        }

        if (
            this.y >
            (this.game.grid.boundsHeight * DrawingOptions.default.height * 3) / 4 - window.innerHeight * reverseGutter
        ) {
            this.y =
                (this.game.grid.boundsHeight * DrawingOptions.default.height * 3) / 4 -
                window.innerHeight * reverseGutter;
        }
    }
}
