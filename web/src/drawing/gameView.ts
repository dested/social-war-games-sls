export class GameView {
    x: number;
    y: number;
    width: number;
    height: number;

    scale: number;

    constructor(private canvas: HTMLCanvasElement) {
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
        localStorage.setItem('view-x' + this.canvas.id, x.toString());
        localStorage.setItem('view-y' + this.canvas.id, y.toString());
    }
    offsetPosition(x: number, y: number) {
        this.x += x;
        this.y += y;
        localStorage.setItem('view-x' + this.canvas.id, x.toString());
        localStorage.setItem('view-y' + this.canvas.id, y.toString());
    }
}
