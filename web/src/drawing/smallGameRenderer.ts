import {GameView} from './gameView';
import {getStore} from '../store';
import {Drawing, DrawingOptions} from './hexDrawing';
import {SwgStore} from '../store/reducers';
import {Manager, Pan} from 'hammerjs';
import {Dispatcher} from '../store/actions';
import {HexImages} from '../utils/hexImages';
import {HexConstants} from '../utils/hexConstants';
import {HexColors} from '../utils/hexColors';
import {GameHexagon} from '@swg-common/game/gameHexagon';
import {AnimationUtils} from '../utils/animationUtils';
import {GameRenderer} from './gameRenderer';

export class SmallGameRenderer {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private view: GameView;
    private gameRenderer: GameRenderer;

    tapHex(hexagon: GameHexagon) {
        const gameRendererView = this.gameRenderer.view;

        const startX = gameRendererView.x;
        const endX = gameRendererView.x + (hexagon.center.x - (gameRendererView.x + gameRendererView.width / 2));

        const startY = gameRendererView.y;
        const endY = gameRendererView.y + (hexagon.center.y - (gameRendererView.y + gameRendererView.height / 2));

        AnimationUtils.start({
            start: 0,
            finish: 1,
            duration: 250,
            easing: AnimationUtils.easings.easeInCubic,
            callback: c => {
                gameRendererView.setPosition(
                    AnimationUtils.lerp(startX, endX, c),
                    AnimationUtils.lerp(startY, endY, c)
                );
            }
        });
    }

    start(canvas: HTMLCanvasElement, gameRenderer: GameRenderer) {
        if (this.canvas) return;
        this.gameRenderer = gameRenderer;
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');

        const manager = new Manager(this.canvas); // const swipe = new Swipe();
        manager.add(new Pan({direction: Hammer.DIRECTION_ALL, threshold: 5}));
        manager.add(new Hammer.Tap({taps: 1}));

        let startX = 0;
        let startY = 0;
        let startViewX = 0;
        let startViewY = 0;

        this.view = new GameView(this.canvas);

        manager.on('panmove', e => {
            if (e.velocity === 0) return;
            this.view.setPosition(startViewX + (startX - e.center.x), startViewY + (startY - e.center.y));
            this.forceRender();
        });

        manager.on('panstart', e => {
            startX = e.center.x;
            startY = e.center.y;
            startViewX = this.view.x;
            startViewY = this.view.y;
        });
        manager.on('panend', e => {});
        manager.on('tap', e => {
            const store = getStore();
            const state = store.getState();
            if (!state.gameState) return;
            const {game} = state.gameState;
            const hex = Drawing.getHexAt(
                {
                    x: this.view.x + (e.center.x - e.target.offsetLeft),
                    y: this.view.y + (e.center.y - e.target.offsetTop)
                },
                game.grid,
                DrawingOptions.defaultSmall
            );
            if (hex) {
                this.tapHex(hex);
            }
        });
        this.forceRender();
    }

    forceRender() {
        let store = getStore();
        try {
            this.render(store.getState(), store.dispatch);
        } catch (ex) {
            console.error(ex);
        }
    }

    private render(state: SwgStore, dispatch: Dispatcher) {
        const {canvas, context} = this;
        if (!canvas) return;

        const {game, roundState} = state.gameState;
        if (!game) return;
        const {grid} = game;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.translate(-this.view.x, -this.view.y);

        const vx = this.view.xSlop;
        const vy = this.view.ySlop;

        const vwidth = this.view.widthSlop;
        const vheight = this.view.heightSlop;

        const hexes = grid.hexes.filter(
            hexagon =>
                hexagon.smallCenter.x > vx &&
                hexagon.smallCenter.x < vx + vwidth &&
                hexagon.smallCenter.y > vy &&
                hexagon.smallCenter.y < vy + vheight
        );

        for (const hexagon of hexes) {
            context.drawImage(
                HexImages.hexTypeToImage(hexagon.tileType.type, hexagon.tileType.subType),
                hexagon.smallCenter.x - HexConstants.smallWidth / 2,
                hexagon.smallCenter.y - HexConstants.smallHeight / 2,
                HexConstants.smallWidth,
                HexConstants.smallHeight
            );
        }
        for (const hexagon of hexes) {
            const hasEntity = game.entities.get1(hexagon);

            if (hexagon.factionId === '9') {
                context.fillStyle = 'rgba(0,0,0,.6)';
            } else {
                if (hexagon.factionId === '0') continue;
                if (hasEntity) {
                    context.fillStyle = HexColors.factionIdToColor(hexagon.factionId, '0', '1');
                } else {
                    context.fillStyle = HexColors.factionIdToColor(hexagon.factionId, '0', '.3');
                }
            }
            context.fill(hexagon.smallPointsSvg);
        }

        context.restore();
    }
}
