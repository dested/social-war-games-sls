import {getStore} from '../store';
import {SwgStore} from '../store/reducers';
import {Dispatcher, GameActions, GameThunks, UIActions} from '../store/actions';
import {Manager, Pan, Tap} from 'hammerjs';
import {HexConstants} from '../utils/hexConstants';
import * as _ from 'lodash';
import {AnimationUtils} from '../utils/animationUtils';
import {HexColors} from '../utils/hexColors';
import {Drawing, DrawingOptions} from './hexDrawing';
import {HexImages} from '../utils/hexImages';
import {GameHexagon} from '@swg-common/game/gameHexagon';
import {GameEntity} from '@swg-common/game/entityDetail';
import {ColorUtils} from '../utils/colorUtils';
import {GameView} from './gameView';
import {UIConstants} from '../utils/uiConstants';
import {GameAssets} from './gameAssets';
import {GameResource} from '@swg-common/game/gameResource';
import {Utils} from '@swg-common/utils/utils';

export class GameRenderer {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    view: GameView;

    selectEntity = (entity: GameEntity) => getStore().dispatch(GameActions.selectEntity(entity));
    selectResource = (resource: GameResource) => getStore().dispatch(GameActions.selectResource(resource));
    selectedViableHex = (hex: GameHexagon) => getStore().dispatch(GameThunks.selectViableHex(hex));

    tapHex(hexagon: GameHexagon) {
        const store = getStore();
        const state = store.getState();

        const {game, selectedEntity} = state.gameState;

        const viableHexIds: {[hexId: string]: boolean} = state.gameState.viableHexIds || {};

        let moveTo = false;

        if (viableHexIds && viableHexIds[hexagon.id]) {
            this.selectedViableHex(hexagon);
        } else {
            const tappedEntity = game.entities.get1(hexagon);
            if (tappedEntity) {
                this.selectEntity(tappedEntity);
                moveTo = true;
            } else {
                const tappedResource = game.resources.get(hexagon);
                if (tappedResource) {
                    this.selectResource(tappedResource);
                    moveTo = true;
                } else {
                    if (selectedEntity) {
                        this.selectEntity(null);
                    }
                }
            }
        }

        if (moveTo) {
            this.moveToHexagon(hexagon);
        } else {
            AnimationUtils.start({
                start: this.view.scale,
                finish: 1,
                duration: 250,
                easing: AnimationUtils.easings.easeInCubic,
                callback: c => {
                    this.view.scale = c;
                }
            });
        }
    }

    public moveToHexagon(hexagon: GameHexagon) {
        const startX = this.view.x;
        const endX = this.view.x + (hexagon.center.x - (this.view.x + this.view.width / 2));

        const startY = this.view.y;
        const endY = this.view.y + (hexagon.center.y - (this.view.y + this.view.height / 2));

        AnimationUtils.start({
            start: 0,
            finish: 1,
            duration: 250,
            easing: AnimationUtils.easings.easeInCubic,
            callback: c => {
                this.view.setPosition(AnimationUtils.lerp(startX, endX, c), AnimationUtils.lerp(startY, endY, c));
            }
        });
        AnimationUtils.start({
            start: this.view.scale,
            finish: 2,
            duration: 250,
            easing: AnimationUtils.easings.easeInCubic,
            callback: c => {
                this.view.scale = c;
            }
        });
    }

    public moveToEntity(entity: GameEntity) {
        const store = getStore();
        const state = store.getState();

        const {game} = state.gameState;
        this.moveToHexagon(game.grid.getHexAt(entity));
    }

    start(canvas: HTMLCanvasElement) {
        const store = getStore();

        if (this.canvas) return;
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');

        const manager = new Manager(this.canvas); // const swipe = new Swipe();
        manager.add(new Pan({direction: Hammer.DIRECTION_ALL, threshold: 5}));
        manager.add(new Hammer.Swipe()).recognizeWith(manager.get('pan'));
        manager.add(new Tap({taps: 1}));

        // manager.add(swipe);
        let startX = 0;
        let startY = 0;
        let startViewX = 0;
        let startViewY = 0;
        let swipeVelocity = {x: 0, y: 0};
        this.view = new GameView(this.canvas);

        manager.on('panmove', e => {
            if (e.velocity === 0) return;
            this.view.setPosition(startViewX + (startX - e.center.x), startViewY + (startY - e.center.y));
        });

        manager.on('panstart', e => {
            store.dispatch(UIActions.setUI('None'));

            swipeVelocity.x = swipeVelocity.y = 0;
            startX = e.center.x;
            startY = e.center.y;
            startViewX = this.view.x;
            startViewY = this.view.y;
        });
        manager.on('panend', e => {});

        manager.on('swipe', (ev: {velocityX: number; velocityY: number}) => {
            store.dispatch(UIActions.setUI('None'));
            swipeVelocity.x = ev.velocityX * 10;
            swipeVelocity.y = ev.velocityY * 10;
        });

        manager.on('tap', e => {
            swipeVelocity.x = swipeVelocity.y = 0;
            store.dispatch(UIActions.setUI('None'));
            const state = store.getState();
            if (!state.gameState) return;
            const {game} = state.gameState;
            const hex = Drawing.getHexAt(
                {
                    x: this.view.x + (e.center.x - e.target.offsetLeft),
                    y: this.view.y + (e.center.y - e.target.offsetTop)
                },
                game.grid,
                DrawingOptions.default
            );
            if (hex) {
                this.tapHex(hex);
            }
        });

        setInterval(() => {
            if (Math.abs(swipeVelocity.x) > 0) {
                let sign = Utils.mathSign(swipeVelocity.x);
                swipeVelocity.x += 0.7 * -sign;
                if (Utils.mathSign(swipeVelocity.x) != sign) {
                    swipeVelocity.x = 0;
                }
            }

            if (Math.abs(swipeVelocity.y) > 0) {
                let sign = Utils.mathSign(swipeVelocity.y);
                swipeVelocity.y += 0.7 * -sign;
                if (Utils.mathSign(swipeVelocity.y) != sign) {
                    swipeVelocity.y = 0;
                }
            }
            if (Math.abs(swipeVelocity.x) > 0 || Math.abs(swipeVelocity.y) > 0) {
                this.view.offsetPosition(-swipeVelocity.x, -swipeVelocity.y);
            }
        }, 1000 / 60);

        this.startRender();
    }

    private startRender() {
        requestAnimationFrame(() => {
            let store = getStore();
            try {
                this.render(store.getState(), store.dispatch);
            } catch (ex) {
                console.error(ex);
            }
            this.startRender();
        });
    }

    private render(state: SwgStore, dispatch: Dispatcher) {
        const {canvas, context} = this;
        const {game, localRoundState: roundState, selectedEntityAction, selectedEntity} = state.gameState;
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
                hexagon.center.x > vx &&
                hexagon.center.x < vx + vwidth &&
                hexagon.center.y > vy &&
                hexagon.center.y < vy + vheight
        );

        for (const hexagon of hexes) {
            context.drawImage(
                HexImages.hexTypeToImage(hexagon.tileType.type, hexagon.tileType.subType),
                hexagon.center.x - HexConstants.width / 2,
                hexagon.center.y - HexConstants.height / 2,
                HexConstants.width,
                HexConstants.height
            );
        }
        const viableHexIds = state.gameState.viableHexIds || {};

        context.strokeStyle = HexColors.defaultBorder;
        for (const hexagon of hexes) {
            const isViableHex = viableHexIds[hexagon.id];
            const hasEntity = game.entities.get1(hexagon);
            context.lineWidth = isViableHex ? 4 : 2;

            if (hexagon.factionId === '9') {
                context.fillStyle = 'rgba(0,0,0,.6)';
            } else {
                if (isViableHex) {
                    context.fillStyle = 'rgba(128,52,230,.25)';
                } else {
                    if (hexagon.factionId === '0') continue;
                    if (hasEntity) {
                        context.fillStyle = HexColors.factionIdToColor(
                            hexagon.factionId,
                            '0',
                            hasEntity === selectedEntity ? '1' : '.65'
                        );
                    } else {
                        context.fillStyle = HexColors.factionIdToColor(
                            hexagon.factionId,
                            '0',
                            hexagon.factionDuration === 1 ? '.15' : '.3'
                        );
                    }
                }
            }
            context.fill(hexagon.pointsSvg);
            context.stroke(hexagon.pointsSvg);
        }

        context.lineWidth = 4;
        context.lineJoin = 'round';
        context.lineCap = 'round';

        const wRatio = HexConstants.width / HexConstants.defaultWidth;
        const hRatio = HexConstants.height / HexConstants.defaultHeight;

        const selectedVoteEntity = selectedEntity && roundState.entities[selectedEntity.id];

        for (const hexagon of hexes) {
            const isViableHex = viableHexIds[hexagon.id];
            const hasEntity = game.entities.get1(hexagon);

            if (selectedVoteEntity && selectedVoteEntity.length > 0) {
                if (isViableHex) {
                    const isVotedHex = selectedVoteEntity.find(
                        a => a.hexId === hexagon.id && selectedEntityAction === a.action
                    );
                    if (isVotedHex) {
                        context.save();
                        const count = isVotedHex.count;
                        context.lineWidth = 6;
                        if (count < 2) {
                            context.strokeStyle = '#284a2a';
                        } else if (count < 6) {
                            context.strokeStyle = '#4e4d23';
                        } else if (count < 9) {
                            context.strokeStyle = '#602a13';
                        }
                        context.stroke(hexagon.pointsSvg);
                        context.restore();
                        continue;
                    }
                }
            }

            if (hasEntity) {
                const voteEntities = roundState.entities[hasEntity.id];
                if (voteEntities && voteEntities.length > 0) {
                    context.save();
                    const count = _.sum(voteEntities.map(a => a.count));
                    context.lineWidth = 6;
                    if (count < 2) {
                        context.strokeStyle = '#284a2a';
                    } else if (count < 6) {
                        context.strokeStyle = '#4e4d23';
                    } else if (count < 9) {
                        context.strokeStyle = '#602a13';
                    }
                    context.stroke(hexagon.pointsSvg);
                    context.restore();
                    continue;
                }

                if (hasEntity.busy) {
                    context.save();
                    context.lineWidth = 4;
                    context.strokeStyle = '#CCCCCC';
                    context.stroke(hexagon.pointsSvg);
                    context.restore();
                    continue;
                }
            }

            if (hexagon.lines.length > 0) {
                let strokedColor = hexagon.lines[0].color;
                context.beginPath();
                context.strokeStyle = strokedColor;
                for (let i = 0; i < hexagon.lines.length; i++) {
                    let line = hexagon.lines[i];
                    if (line.color !== strokedColor) {
                        context.stroke();
                        context.beginPath();
                        strokedColor = line.color;
                        context.strokeStyle = strokedColor;
                    }
                    context.moveTo(line.line[0].x, line.line[0].y);
                    context.lineTo(line.line[1].x, line.line[1].y);
                }
                context.stroke();
            }
        }

        for (let i = 0; i < game.resources.array.length; i++) {
            const resource = game.resources.array[i];
            const hex = grid.getHexAt(resource);
            const asset = GameAssets[resource.resourceType];

            context.drawImage(
                asset.image,
                hex.center.x - asset.centerX * wRatio,
                hex.center.y - asset.centerY * hRatio,
                asset.width * wRatio,
                asset.height * hRatio
            );
        }

        let rectWidth = HexConstants.width * 0.35;
        let rectHeight = HexConstants.height * 0.4;
        let fontSize = Math.round(rectWidth / 1.7);
        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        context.font = `${fontSize}px Arial`;

        for (let i = 0; i < game.entities.length; i++) {
            const entity = game.entities.getIndex(i);
            const hex = grid.getHexAt(entity);
            const asset = GameAssets[entity.entityType];

            context.drawImage(
                asset.image,
                hex.center.x - asset.centerX * wRatio,
                hex.center.y - asset.centerY * hRatio,
                asset.width * wRatio,
                asset.height * hRatio
            );
        }

        for (let i = 0; i < game.entities.length; i++) {
            const entity = game.entities.getIndex(i);
            const hex = grid.getHexAt(entity);
            let rectX = hex.center.x - HexConstants.width / 2;
            let rectY = hex.center.y;
            context.drawImage(this.roundRect(rectWidth, rectHeight, 5, 'rgba(0,0,0,.6)'), rectX, rectY);

            context.fillStyle = 'white';
            context.fillText(entity.health.toString(), rectX + rectWidth / 2 - 1, rectY + rectHeight / 1.4, rectWidth);
        }

        context.restore();

        if (HexConstants.isMobile) {
            const percent = (game.roundDuration - (game.roundEnd - +new Date())) / game.roundDuration;
            context.fillStyle = 'grey';
            context.fillRect(
                0,
                canvas.height - UIConstants.progressBarHeight,
                canvas.width,
                UIConstants.progressBarHeight
            );
            context.fillStyle = ColorUtils.lerpColor('#00FF00', '#FF0000', Math.min(percent, 1));
            context.fillRect(
                0,
                canvas.height - UIConstants.progressBarHeight,
                canvas.width * percent,
                UIConstants.progressBarHeight
            );
        } else {
            const percent = (game.roundDuration - (game.roundEnd - +new Date())) / game.roundDuration;
            context.fillStyle = 'grey';
            context.fillRect(
                UIConstants.miniMapWidth,
                canvas.height - UIConstants.progressBarHeight,
                canvas.width - UIConstants.miniMapWidth,
                UIConstants.progressBarHeight
            );
            context.fillStyle = ColorUtils.lerpColor('#00FF00', '#FF0000', Math.min(percent, 1));
            context.fillRect(
                UIConstants.miniMapWidth,
                canvas.height - UIConstants.progressBarHeight,
                (canvas.width - UIConstants.miniMapWidth) * percent,
                UIConstants.progressBarHeight
            );
        }
    }

    roundRectHash: {[key: string]: HTMLCanvasElement} = {};

    roundRect(width: number, height: number, rad: number | number[], fill: string, stroke: string = null) {
        const key = ` ${width} ${height} ${rad} ${fill} ${stroke}`;

        if (this.roundRectHash[key]) {
            return this.roundRectHash[key];
        }

        let radius: any = {tl: 0, tr: 0, br: 0, bl: 0};
        if (typeof rad === 'number') {
            radius = {tl: rad, tr: rad, br: rad, bl: rad};
        } else {
            const defaultRadius: any = {tl: 0, tr: 0, br: 0, bl: 0};
            for (let side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');

        const x = 0;
        const y = 0;

        context.beginPath();
        context.moveTo(x + radius.tl, y);
        context.lineTo(x + width - radius.tr, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        context.lineTo(x + width, y + height - radius.br);
        context.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        context.lineTo(x + radius.bl, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        context.lineTo(x, y + radius.tl);
        context.quadraticCurveTo(x, y, x + radius.tl, y);
        context.closePath();

        if (fill) {
            context.fillStyle = fill;
            context.fill();
        }
        if (stroke) {
            context.strokeStyle = stroke;
            context.stroke();
        }
        return canvas;
    }
}
