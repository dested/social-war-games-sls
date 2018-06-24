import {GameHexagon} from '@swg-common/game/gameHexagon';
import {Manager, Pan} from 'hammerjs';
import {getStore} from '../store';
import {Dispatcher} from '../store/actions';
import {SwgStore} from '../store/reducers';
import {AnimationUtils} from '../utils/animationUtils';
import {DebounceUtils} from '../utils/debounceUtils';
import {HexColors} from '../utils/hexColors';
import {HexConstants} from '../utils/hexConstants';
import {HexImages} from '../utils/hexImages';
import {UIConstants} from '../utils/uiConstants';
import {GameRenderer} from './gameRenderer';
import {GameView} from './gameView';
import {Drawing, DrawingOptions} from './hexDrawing';

export class SmallGameRenderer {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private gameRenderer: GameRenderer;

    tapHex(hexagon: GameHexagon, force: boolean) {
        const gameRendererView = this.gameRenderer.view;

        const startX = gameRendererView.x;
        const endX = gameRendererView.x + (hexagon.center.x - (gameRendererView.x + gameRendererView.width / 2));

        const startY = gameRendererView.y;
        const endY = gameRendererView.y + (hexagon.center.y - (gameRendererView.y + gameRendererView.height / 2));

        this.gameRenderer.swipeVelocity.x = 0;
        this.gameRenderer.swipeVelocity.y = 0;

        if (force) {
            gameRendererView.setPosition(endX, endY);
        } else {
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
    }

    start(canvas: HTMLCanvasElement, gameRenderer: GameRenderer) {
        if (this.canvas) {
            return;
        }
        this.gameRenderer = gameRenderer;
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');

        const manager = new Manager(this.canvas); // const swipe = new Swipe();
        manager.add(new Hammer.Tap({taps: 1}));
        manager.add(new Hammer.Pan({}));

        const goToPosition = (e: HammerInput, force: boolean) => {
            const store = getStore();
            const state = store.getState();
            if (!state.gameState) {
                return;
            }
            const {game} = state.gameState;

            const bodyRect = document.body.getBoundingClientRect();
            const elemRect = e.target.getBoundingClientRect();
            const offsetX = elemRect.left - bodyRect.left;
            const offsetY = elemRect.top - bodyRect.top;

            const position = {
                x: e.center.x - offsetX,
                y: e.center.y - offsetY
            };

            const distances = game.grid.hexes.array.map(h => ({
                h,
                distance: Math.sqrt(
                    (position.x - h.smallCenter.x) * (position.x - h.smallCenter.x) +
                        (position.y - h.smallCenter.y) * (position.y - h.smallCenter.y)
                )
            }));
            distances.sort((a, b) => a.distance - b.distance);
            const hex = distances[0].h;

            if (hex) {
                this.tapHex(hex, force);
            }
        };

        manager.on('tap', e => {
            goToPosition(e, false);
        });
        manager.on('pan', e => {
            DebounceUtils.wait('small-pan', 16, () => goToPosition(e, true));
        });

        this.forceRender();
    }

    forceRender() {
        const store = getStore();
        try {
            this.render(store.getState(), store.dispatch);
        } catch (ex) {
            console.error(ex);
        }
    }

    private render(state: SwgStore, dispatch: Dispatcher) {
        const {canvas, context} = this;
        if (!canvas) {
            return;
        }

        const {game, roundState} = state.gameState;
        if (!game) {
            return;
        }
        const {grid} = game;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();

        const hexes = grid.hexes;

        for (const hexagon of hexes) {
            const hasEntity = game.entities.get1(hexagon);

            context.fillStyle = hexagon.tileType.color;
            context.fillRect(
                hexagon.smallCenter.x - HexConstants.smallWidth / 2,
                hexagon.smallCenter.y - HexConstants.smallHeight / 2,
                HexConstants.smallWidth,
                HexConstants.smallHeight
            );

            if (hexagon.factionId === '9') {
                context.fillStyle = 'rgba(0,0,0,.6)';
            } else {
                if (hexagon.factionId === '0') {
                    continue;
                }
                if (hasEntity) {
                    context.fillStyle = HexColors.factionIdToColor(hexagon.factionId, '0', '1');
                } else {
                    context.fillStyle = HexColors.factionIdToColor(hexagon.factionId, '0', '.3');
                }
            }

            context.fillRect(
                hexagon.smallCenter.x - HexConstants.smallWidth / 2,
                hexagon.smallCenter.y - HexConstants.smallHeight / 2,
                HexConstants.smallWidth,
                HexConstants.smallHeight
            );

            /*
            context.drawImage(
                HexImages.hexTypeToImage(hexagon.tileType.type, hexagon.tileType.subType),
                hexagon.smallCenter.x - HexConstants.smallWidth / 2,
                hexagon.smallCenter.y - HexConstants.smallHeight / 2,
                HexConstants.smallWidth,
                HexConstants.smallHeight
            );
*/
        }

        context.restore();
    }
}
