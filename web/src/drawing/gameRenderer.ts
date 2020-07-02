import {GameEntity} from '@swg-common/game/entityDetail';
import {GameHexagon} from '@swg-common/game/gameHexagon';
import {GameResource} from '@swg-common/game/gameResource';
import {FacingDirection} from '@swg-common/utils/hexUtils';
import {Utils} from '@swg-common/utils/utils';
import {Manager, Pan, Tap} from 'hammerjs';
import {GameStore, gameStore} from '../store/game/store';
import {UIStore} from '../store/ui/store';
import {AnimationUtils} from '../utils/animationUtils';
import {HexColors} from '../utils/hexColors';
import {HexConstants} from '../utils/hexConstants';
import {HexImages} from '../utils/hexImages';
import {GameAssets} from './gameAssets';
import {GameView} from './gameView';
import {Drawing, DrawingOptions} from './hexDrawing';

export class GameRenderer {
  canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  view: GameView;

  selectEntity = (entity: GameEntity) => gameStore.selectEntity(entity);
  selectResource = (resource: GameResource) => gameStore.selectResource(resource);
  selectedViableHex = (hex: GameHexagon) => GameStore.selectViableHex(hex);
  swipeVelocity: {x: number; y: number};

  tapHex(hexagon: GameHexagon) {
    this.swipeVelocity.x = 0;
    this.swipeVelocity.y = 0;

    const {game, selectedEntity} = gameStore;

    const viableHexIds: {[hexId: string]: boolean} = gameStore.viableHexIds || {};

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
        callback: (c) => {
          this.view.scale = c;
        },
      });
    }
  }

  moveToHexagon(hexagon: GameHexagon) {
    const startX = this.view.x;
    const endX = this.view.x + (hexagon.center.x - (this.view.x + this.view.width / 2));

    const startY = this.view.y;
    const endY = this.view.y + (hexagon.center.y - (this.view.y + this.view.height / 2));

    AnimationUtils.start({
      start: 0,
      finish: 1,
      duration: 250,
      easing: AnimationUtils.easings.easeInCubic,
      callback: (c) => {
        this.view.setPosition(AnimationUtils.lerp(startX, endX, c), AnimationUtils.lerp(startY, endY, c));
      },
    });
    AnimationUtils.start({
      start: this.view.scale,
      finish: 2,
      duration: 250,
      easing: AnimationUtils.easings.easeInCubic,
      callback: (c) => {
        this.view.scale = c;
      },
    });
  }

  moveToEntity(entity: GameEntity) {
    const {game} = gameStore;
    this.moveToHexagon(game.grid.getHexAt(entity));
  }

  start(canvas: HTMLCanvasElement) {
    if (this.canvas) {
      return;
    }
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
    this.swipeVelocity = {x: 0, y: 0};

    this.view = new GameView(this.canvas, gameStore.game);

    manager.on('panmove', (e) => {
      if (e.velocity === 0) {
        return;
      }
      this.view.setPosition(startViewX + (startX - e.center.x), startViewY + (startY - e.center.y));
    });

    manager.on('panstart', (e) => {
      UIStore.setUI('None');

      this.swipeVelocity.x = this.swipeVelocity.y = 0;
      startX = e.center.x;
      startY = e.center.y;
      startViewX = this.view.x;
      startViewY = this.view.y;
    });

    manager.on('panend', (e) => {});

    manager.on('swipe', (ev: {velocityX: number; velocityY: number}) => {
      UIStore.setUI('None');
      this.swipeVelocity.x = ev.velocityX * 10;
      this.swipeVelocity.y = ev.velocityY * 10;
    });

    manager.on('tap', (e) => {
      this.swipeVelocity.x = this.swipeVelocity.y = 0;
      UIStore.setUI('None');
      if (!gameStore.game) {
        return;
      }
      const {game} = gameStore;
      const hex = Drawing.getHexAt(
        {
          x: this.view.x + (e.center.x - e.target.offsetLeft),
          y: this.view.y + (e.center.y - e.target.offsetTop),
        },
        game.grid,
        DrawingOptions.default
      );
      if (hex) {
        this.tapHex(hex);
      }
    });

    setInterval(() => {
      if (Math.abs(this.swipeVelocity.x) > 0) {
        const sign = Utils.mathSign(this.swipeVelocity.x);
        this.swipeVelocity.x += 0.7 * -sign;
        if (Utils.mathSign(this.swipeVelocity.x) !== sign) {
          this.swipeVelocity.x = 0;
        }
      }

      if (Math.abs(this.swipeVelocity.y) > 0) {
        const sign = Utils.mathSign(this.swipeVelocity.y);
        this.swipeVelocity.y += 0.7 * -sign;
        if (Utils.mathSign(this.swipeVelocity.y) !== sign) {
          this.swipeVelocity.y = 0;
        }
      }
      if (Math.abs(this.swipeVelocity.x) > 0 || Math.abs(this.swipeVelocity.y) > 0) {
        this.view.offsetPosition(-this.swipeVelocity.x, -this.swipeVelocity.y);
      }
    }, 1000 / 60);

    this.startRender();
  }

  private startRender() {
    requestAnimationFrame(() => {
      try {
        this.render();
      } catch (ex) {
        console.error(ex);
      }
      this.startRender();
    });
  }

  private render() {
    const {canvas, context} = this;
    const {game, localRoundState: roundState, selectedEntityAction, selectedEntity} = gameStore;
    if (!game) {
      return;
    }
    const {grid} = game;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(-this.view.x, -this.view.y);

    const vx = this.view.xSlop;
    const vy = this.view.ySlop;

    const vwidth = this.view.widthSlop;
    const vheight = this.view.heightSlop;

    const visibleHexes = grid.hexes.filter(
      (hexagon) =>
        hexagon.center.x > vx &&
        hexagon.center.x < vx + vwidth &&
        hexagon.center.y > vy &&
        hexagon.center.y < vy + vheight
    );

    for (const hexagon of visibleHexes) {
      context.drawImage(
        HexImages.hexTypeToImage(hexagon.tileType.type, hexagon.tileType.subType),
        hexagon.center.x - HexConstants.width / 2,
        hexagon.center.y - HexConstants.height / 2,
        HexConstants.width,
        HexConstants.height
      );
      // context.fillText(hexagon.id, hexagon.center.x, hexagon.center.y);
    }
    const viableHexIds = gameStore.viableHexIds || {};

    context.strokeStyle = HexColors.defaultBorder;
    for (const hexagon of visibleHexes) {
      const isViableHex = viableHexIds[hexagon.id];
      const hasEntity = game.entities.get1(hexagon);
      context.lineWidth = isViableHex ? 4 : 2;

      if (hexagon.factionId === 7) {
        context.fillStyle = 'rgba(0,0,0,.6)';
      } else {
        if (isViableHex) {
          context.fillStyle = 'rgba(226,238,54,.25)';
        } else {
          if (hexagon.factionId === 0) {
            continue;
          }
          if (hasEntity) {
            if (selectedEntity && hasEntity.id === selectedEntity.id) {
              context.fillStyle = '#f1f1f1';
            } else {
              context.fillStyle = HexColors.factionIdToColor(hexagon.factionId, 0, '1');
            }
          } else {
            context.fillStyle = HexColors.factionIdToColor(
              hexagon.factionId,
              0,
              hexagon.factionDuration === 1 ? '.3' : '.8'
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

    for (const hexagon of visibleHexes) {
      const isViableHex = viableHexIds[hexagon.id];
      const hasEntity = game.entities.get1(hexagon);

      if (selectedVoteEntity && selectedVoteEntity.length > 0) {
        if (isViableHex) {
          const isVotedHex = selectedVoteEntity.find(
            (a) => a.hexId === hexagon.id && selectedEntityAction === a.action
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
          const count = Utils.sum(voteEntities, (a) => a.count);
          context.strokeStyle = '#dfdfdf';
          if (count < 2) {
            context.lineWidth = 2;
          } else if (count < 6) {
            context.lineWidth = 4;
          } else if (count < 9) {
            context.lineWidth = 6;
          }
          context.stroke(hexagon.pointsSvg);
          context.restore();
          continue;
        }

        if (hasEntity.busy) {
          context.save();
          context.lineWidth = 5;
          context.strokeStyle = '#9a9a9a';
          context.stroke(hexagon.pointsSvg);
          context.restore();
          continue;
        }
      }

      if (hexagon.lines.length > 0) {
        let strokedColor = hexagon.lines[0].color;
        context.beginPath();
        context.strokeStyle = strokedColor;
        for (const line of hexagon.lines) {
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

    for (const action of gameStore.lastRoundActions) {
      if (!action.toHex) {
        continue;
      }
      const fromHex = action.fromHex;
      const toHex = action.toHex;
      if (!visibleHexes.includes(fromHex) && !visibleHexes.includes(toHex)) {
        continue;
      }
      switch (action.action) {
        case 'move':
          context.strokeStyle = 'blue';
          break;
        case 'attack':
          context.strokeStyle = 'red';
          break;
        case 'mine':
          context.strokeStyle = 'green';
          break;
        case 'spawn-infantry':
        case 'spawn-tank':
        case 'spawn-plane':
          context.strokeStyle = 'purple';
          break;
      }
      context.beginPath();
      context.lineWidth = 5;
      context.lineCap = 'round';
      context.moveTo(action.x1, action.y1);
      context.lineTo(action.x2, action.y2);
      context.stroke();
      context.closePath();
    }

    for (const resource of game.resources) {
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

    const rectWidth = HexConstants.width * 0.3;
    const rectHeight = HexConstants.height * 0.35;
    const fontSize = Math.round(rectWidth / 1.7);
    context.textAlign = 'center';
    context.textBaseline = 'bottom';
    context.font = `${fontSize}px Arial`;

    for (let i = 0; i < game.entities.length; i++) {
      const entity = game.entities.getIndex(i);
      const hex = grid.getHexAt(entity);
      const asset = GameAssets[entity.entityType];
      let degrees = 0;
      switch (entity.facingDirection) {
        case FacingDirection.TopLeft:
          degrees = 4 * 60;
          break;
        case FacingDirection.TopRight:
          degrees = 5 * 60;
          break;
        case FacingDirection.BottomLeft:
          degrees = 2 * 60;
          break;
        case FacingDirection.BottomRight:
          degrees = 1 * 60;
          break;
        case FacingDirection.Left:
          degrees = 3 * 60;
          break;
        case FacingDirection.Right:
          degrees = 0 * 60;
          break;
      }
      context.save();
      context.translate(hex.center.x, hex.center.y);
      if (asset.rotate) {
        context.rotate(degrees * 0.0174533);
      }

      context.drawImage(
        asset.image,
        -asset.centerX * wRatio,
        -asset.centerY * hRatio,
        asset.width * wRatio,
        asset.height * hRatio
      );
      context.restore();
    }

    for (let i = 0; i < game.entities.length; i++) {
      const entity = game.entities.getIndex(i);
      const hex = grid.getHexAt(entity);
      const rectX = hex.center.x - HexConstants.width / 2;
      const rectY = hex.center.y;
      context.drawImage(this.roundRect(rectWidth, rectHeight, 5, 'rgba(0,0,0,.6)'), rectX, rectY);
      context.fillStyle = 'white';
      context.fillText(entity.health.toString(), rectX + rectWidth / 2 - 1, rectY + rectHeight / 1.4, rectWidth);
    }

    context.restore();
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
      for (const side in defaultRadius) {
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
