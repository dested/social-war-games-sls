import {GameHexagon} from '@swg-common/game/gameHexagon';
import {GameModel} from '@swg-common/game/gameLogic';
import {Manager} from 'hammerjs';
import {gameStore} from '../store/game/store';
import {AnimationUtils} from '../utils/animationUtils';
import {DebounceUtils} from '../utils/debounceUtils';
import {HexColors} from '../utils/hexColors';
import {HexConstants} from '../utils/hexConstants';
import {GameRenderer} from './gameRenderer';

export class SmallGameRenderer {
  minimapCanvas: HTMLCanvasElement;
  canvas: HTMLCanvasElement;
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
        callback: (c) => {
          gameRendererView.setPosition(AnimationUtils.lerp(startX, endX, c), AnimationUtils.lerp(startY, endY, c));
        },
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

    this.minimapCanvas = document.createElement('canvas');
    const manager = new Manager(this.canvas); // const swipe = new Swipe();
    manager.add(new Hammer.Tap({taps: 1}));
    manager.add(new Hammer.Pan({}));

    const goToPosition = (e: HammerInput, force: boolean) => {
      if (!gameStore.game) {
        return;
      }
      const {game} = gameStore;

      const bodyRect = document.body.getBoundingClientRect();
      const elemRect = e.target.getBoundingClientRect();
      const offsetX = elemRect.left - bodyRect.left;
      const offsetY = elemRect.top - bodyRect.top;
      const position = {
        x: e.center.x - offsetX,
        y: e.center.y - offsetY,
      };

      if (position.x > this.minimapCanvas.width) {
        return false;
      }

      const distances = game.grid.hexes.array.map((h) => ({
        h,
        distance: Math.sqrt(
          (position.x - h.smallCenter.x) * (position.x - h.smallCenter.x) +
            (position.y - h.smallCenter.y) * (position.y - h.smallCenter.y)
        ),
      }));
      distances.sort((a, b) => a.distance - b.distance);
      const hex = distances[0].h;
      if (hex) {
        this.tapHex(hex, force);
      }
    };

    manager.on('tap', (e) => {
      goToPosition(e, false);
    });
    manager.on('pan', (e) => {
      DebounceUtils.wait('small-pan', 16, () => goToPosition(e, true));
    });

    setInterval(() => {
      this.forceRender();
    }, 1000 / 10);

    this.processMiniMap(gameStore.game);
  }

  forceRender() {
    try {
      this.render();
    } catch (ex) {
      console.error(ex);
    }
  }

  private render() {
    const {canvas, context} = this;
    if (!canvas) {
      return;
    }

    const {game, roundState} = gameStore;
    if (!game) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.drawImage(this.minimapCanvas, 0, 0);
    context.restore();
  }

  processMiniMap(game: GameModel) {
    const grid = game.grid;
    const context = this.minimapCanvas.getContext('2d');
    this.minimapCanvas.width = HexConstants.smallWidth * game.grid.boundsWidth;
    this.minimapCanvas.height = HexConstants.smallHeight * game.grid.boundsHeight;
    context.clearRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);
    const hexes = grid.hexes;
    for (const hexagon of hexes) {
      const hasEntity = game.entities.get1(hexagon);

      context.fillStyle = hexagon.tileType.color;

      context.fillRect(
        Math.round(hexagon.smallCenter.x - HexConstants.smallWidth / 2),
        Math.round(hexagon.smallCenter.y - HexConstants.smallHeight / 2),
        Math.round(HexConstants.smallWidth * 1.1),
        Math.round(HexConstants.smallHeight * 1.1)
      );

      if (hexagon.factionId === 7) {
        context.fillStyle = 'rgba(0,0,0,.6)';
      } else {
        if (hexagon.factionId === 0) {
          continue;
        }
        if (hasEntity) {
          context.fillStyle = HexColors.factionIdToColor(hexagon.factionId, 0, '1');
        } else {
          context.fillStyle = HexColors.factionIdToColor(hexagon.factionId, 0, '.3');
        }
      }

      context.fillRect(
        Math.round(hexagon.smallCenter.x - HexConstants.smallWidth / 2),
        Math.round(hexagon.smallCenter.y - HexConstants.smallHeight / 2),
        Math.round(HexConstants.smallWidth * 1.1),
        Math.round(HexConstants.smallHeight * 1.1)
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
  }
}
