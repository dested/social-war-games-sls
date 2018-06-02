import {getStore} from '../store';
import {SwgStore} from '../store/reducers';
import {Dispatcher, GameActions, GameThunks} from '../store/actions';
import {Manager, Pan} from 'hammerjs';
import {HexConstants} from '../utils/hexConstants';
import {HexImages} from '../utils/hexImages';
import {Drawing, Point} from '@swg-common/hex/hex';
import * as _ from 'lodash';
import {ImageUtils} from '../utils/imageUtils';
import {GameEntity, GameHexagon} from '@swg-common/game';

type EntityAsset = {
    image: HTMLImageElement;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
};

export let EntityAssets: {[key: string]: EntityAsset};
export let loadEntities = () => {
    EntityAssets = {
        infantry: {
            image: ImageUtils.preloadImage(`./assets/infantry.png`),
            width: 120,
            height: 180,
            centerX: 60,
            centerY: 110
        },
        tank: {
            image: ImageUtils.preloadImage(`./assets/tank.png`),
            width: 120,
            height: 140,
            centerX: 60,
            centerY: 70
        },

        plane: {
            image: ImageUtils.preloadImage(`./assets/plane.png`),
            width: 120,
            height: 140,
            centerX: 60,
            centerY: 70
        },

        factory: {
            image: ImageUtils.preloadImage(`./assets/factory.png`),
            width: 120,
            height: 140,
            centerX: 60,
            centerY: 70
        }
    };
};

export class GameRenderer {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private view: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    private viewSlop = 100;

    selectEntity = (entity: GameEntity) =>
        getStore().dispatch(GameActions.selectEntity(entity));
    selectedViableHex = (hex: GameHexagon) =>
        getStore().dispatch(GameThunks.selectViableHex(hex));

    tapHex(hexagon: GameHexagon) {
        const store = getStore();
        const state = store.getState();

        const {game, roundState, selectedEntity} = state.gameState;

        const viableHexIds = state.gameState.viableHexIds || [];

        if (viableHexIds && viableHexIds.find(a => a === hexagon.id)) {
            this.selectedViableHex(hexagon);
        } else {
            const tappedEntity = game.entities.find(
                a => a.x === hexagon.x && a.y === hexagon.y
            );
            if (tappedEntity) {
                this.selectEntity(tappedEntity);
            } else {
                if (selectedEntity) {
                    this.selectEntity(null);
                }
            }
        }
    }

    start(canvas: HTMLCanvasElement) {
        if (this.canvas) return;
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');

        const manager = new Manager(this.canvas); // const swipe = new Swipe();
        manager.add(new Pan({direction: Hammer.DIRECTION_ALL, threshold: 5}));
        manager.add(new Hammer.Tap({taps: 1}));

        // manager.add(swipe);
        let startX = 0;
        let startY = 0;
        let startViewX = 0;
        let startViewY = 0;

        this.view = {
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight
        };

        manager.on('panmove', e => {
            if (e.velocity === 0) return;
            this.view.x = startViewX + (startX - e.center.x);
            this.view.y = startViewY + (startY - e.center.y);
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
                    x: this.view.x + e.center.x,
                    y: this.view.y + e.center.y
                },
                game.grid,
                game.options
            );
            if (hex) {
                this.tapHex(hex);
            }
        });
        this.startRender();
    }

    private startRender() {
        requestAnimationFrame(() => {
            let store = getStore();
            this.render(store.getState(), store.dispatch);
            this.startRender();
        });
    }

    public static factionIdToColor(
        factionId: string,
        neighborFactionId: string
    ) {
        switch (factionId) {
            case '0':
                return 'transparent';
            case '1':
                switch (neighborFactionId) {
                    case '0':
                        return 'rgba(255,0,0,1)';
                    case '1':
                        return 'rgba(2550,0,0,1)';
                    case '2':
                        return 'rgba(127,127,0,1)';
                    case '3':
                        return 'rgba(127,0,127,1)';
                }
                break;
            case '2':
                switch (neighborFactionId) {
                    case '0':
                        return 'rgba(0,255,0,1)';
                    case '1':
                        return 'rgba(127,127,0,1)';
                    case '2':
                        return 'rgba(0,255,0,1)';
                    case '3':
                        return 'rgba(0,127,127,1)';
                }
                break;
            case '3':
                switch (neighborFactionId) {
                    case '0':
                        return 'rgba(0,0,255,1)';
                    case '1':
                        return 'rgba(127,0,127,1)';
                    case '2':
                        return 'rgba(0,127,127,1)';
                    case '3':
                        return 'rgba(0,0,255,1)';
                }
                break;
        }
    }
    private static defaultBorder = 'rgba(127,127,127,0.13)';

    private render(state: SwgStore, dispatch: Dispatcher) {
        const {canvas, context} = this;
        const {game, roundState} = state.gameState;
        if (!game) return;
        const {grid} = game;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.translate(-this.view.x, -this.view.y);

        const vx = this.view.x - this.viewSlop;
        const vy = this.view.y - this.viewSlop;

        const vwidth = this.view.width + this.viewSlop * 2;
        const vheight = this.view.height + this.viewSlop * 2;

        const hexes = grid.hexes.filter(
            hexagon =>
                hexagon.center.x > vx &&
                hexagon.center.x < vx + vwidth &&
                hexagon.center.y > vy &&
                hexagon.center.y < vy + vheight
        );

        for (const hexagon of hexes) {
            context.drawImage(
                hexagon.tileType.image,
                hexagon.center.x - HexConstants.width / 2,
                hexagon.center.y - HexConstants.height / 2,
                HexConstants.width,
                HexConstants.height
            );
        }
        const viableHexIds = state.gameState.viableHexIds || [];

        for (const hexagon of hexes) {
            const isViableHex = viableHexIds.find(a => a === hexagon.id);
            const hasEntity = game.entities.find(
                a => a.x === hexagon.x && a.y === hexagon.y
            );
            context.lineWidth = isViableHex ? 4 : 2;
            context.strokeStyle = GameRenderer.defaultBorder;
            context.fillStyle = isViableHex
                ? 'rgba(128,52,230,.25)'
                : hasEntity
                    ? GameRenderer.factionIdToColor(
                          hexagon.factionId,
                          '0'
                      ).replace(',1)', ',.8)')
                    : GameRenderer.factionIdToColor(
                          hexagon.factionId,
                          '0'
                      ).replace(',1)', ',.4)');
            context.fill(hexagon.pointsSvg);
            context.stroke(hexagon.pointsSvg);

            /*
            const entity = this.props.game.entities.find(a => a.x === hexagon.x && a.y === hexagon.y);
            if (entity) {
                entities.push(<HexagonEntity key={hexagon.id + '-ent'} entity={entity}/>);
            }*/
        }

        context.lineWidth = 4;
        for (const hexagon of hexes) {
            const isViableHex = viableHexIds.find(a => a === hexagon.id);
            for (let i = 0; i < hexagon.lines.length; i++) {
                let line = hexagon.lines[i];
                context.beginPath();
                context.moveTo(line.line[0].x, line.line[0].y);
                context.lineTo(line.line[1].x, line.line[1].y);
                context.strokeStyle = line.color;
                context.stroke();
            }
        }
        context.textAlign = 'center';
        context.textBaseline = 'bottom';

        for (let i = 0; i < game.entities.length; i++) {
            const entity = game.entities[i];
            const hex = grid.getHexAt(entity);
            const asset = EntityAssets[entity.entityType];
            const wRatio = HexConstants.width / HexConstants.defaultWidth;
            const hRatio = HexConstants.height / HexConstants.defaultHeight;
            let rectX = hex.center.x - HexConstants.width / 2;
            let voteRectX = hex.center.x + HexConstants.width / 2;
            let rectY = hex.center.y;
            let rectWidth = HexConstants.width * 0.35;
            let rectHeight = HexConstants.height * 0.4;
            let fontSize = rectWidth / 2;
            const voteCount =
                roundState.entities[entity.id] &&
                _.sum(roundState.entities[entity.id].map(a => a.count));

            context.drawImage(
                asset.image,
                hex.center.x - asset.centerX * wRatio,
                hex.center.y - asset.centerY * hRatio,
                asset.width * wRatio,
                asset.height * hRatio
            );
            this.roundRect(
                rectX,
                rectY,
                rectWidth,
                rectHeight,
                5,
                'rgba(0,0,0,.6)'
            );
            context.font = `${fontSize}px`;
            context.fillStyle = 'white';
            context.fillText(
                entity.health.toString(),
                rectX + rectWidth / 2 - 1,
                rectY + rectHeight / 2 + 5,
                rectWidth
            );
            if (voteCount > 0) {
                this.roundRect(
                    voteRectX,
                    rectY,
                    rectWidth,
                    rectHeight,
                    5,
                    'grey'
                );
                context.font = `${fontSize}px`;
                context.fillStyle = 'white';
                context.fillText(
                    voteCount.toString(),
                    voteRectX + rectWidth / 2 - 1,
                    rectY + rectHeight / 2 + 5,
                    rectWidth
                );
            }
        }

        context.restore();

        const percent =
            (60 * 1000 - (game.roundEnd - +new Date())) / (60 * 1000);
        context.fillStyle = 'grey';
        context.fillRect(0, canvas.height - 40, canvas.width, 40);
        context.fillStyle = 'green';
        context.fillRect(0, canvas.height - 40, canvas.width * percent, 40);
    }

    roundRect(
        x: number,
        y: number,
        width: number,
        height: number,
        rad: number | number[],
        fill: string,
        stroke: string = null
    ) {
        let radius = {tl: 0, tr: 0, br: 0, bl: 0};
        if (typeof rad === 'number') {
            radius = {tl: rad, tr: rad, br: rad, bl: rad};
        } else {
            const defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
            for (let side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }
        this.context.beginPath();
        this.context.moveTo(x + radius.tl, y);
        this.context.lineTo(x + width - radius.tr, y);
        this.context.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        this.context.lineTo(x + width, y + height - radius.br);
        this.context.quadraticCurveTo(
            x + width,
            y + height,
            x + width - radius.br,
            y + height
        );
        this.context.lineTo(x + radius.bl, y + height);
        this.context.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        this.context.lineTo(x, y + radius.tl);
        this.context.quadraticCurveTo(x, y, x + radius.tl, y);
        this.context.closePath();
        if (fill) {
            this.context.fillStyle = fill;
            this.context.fill();
        }
        if (stroke) {
            this.context.strokeStyle = stroke;
            this.context.stroke();
        }
    }
}
