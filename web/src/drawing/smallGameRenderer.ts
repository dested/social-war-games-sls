import {GameHexagon} from '@swg-common/game/gameHexagon';
import {GameModel} from '@swg-common/game/gameLogic';
import {Manager, Pan} from 'hammerjs';
import {gameStore} from '../store/game/store';
import {UI, UIStore, uiStore} from '../store/ui/store';
import {AnimationUtils} from '../utils/animationUtils';
import {ColorUtils} from '../utils/colorUtils';
import {DebounceUtils} from '../utils/debounceUtils';
import {HexColors} from '../utils/hexColors';
import {HexConstants} from '../utils/hexConstants';
import {HexImages} from '../utils/hexImages';
import {UIConstants} from '../utils/uiConstants';
import {UIAsset, UIAssets} from './gameAssets';
import {GameRenderer} from './gameRenderer';
import {GameView} from './gameView';
import {Drawing, DrawingOptions} from './hexDrawing';

export class SmallGameRenderer {
  minimapCanvas: HTMLCanvasElement;
  canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private gameRenderer: GameRenderer;
  private buttons: {
    asset: UIAsset;
    left: number;
    top: number;
    width: number;
    height: number;
    text: string;
    color: string;
    textX: number;
    textY: number;
    font: string;
    ui: UI;
  }[];

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
      if (!gameStore.gameState) {
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

      for (const button of this.buttons) {
        if (
          position.x > button.left &&
          position.x < button.left + button.width &&
          position.y > button.top &&
          position.y < button.top + button.height
        ) {
          if (uiStore.ui === button.ui) {
            UIStore.setUI('None');
          } else {
            UIStore.setUI(button.ui);
          }
          return false;
        }
      }

      if (position.x > this.minimapCanvas.width) {
        return false;
      }
      position.y -= 100 * 0.75;

      const distances = game.grid.hexes.array.map(h => ({
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

    manager.on('tap', e => {
      goToPosition(e, false);
    });
    manager.on('pan', e => {
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
    const {grid} = game;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();

    const shrinko = 100;
    const scaleY = (UIAssets.Radar.height + shrinko) / canvas.height;

    const timerLeftStart = UIAssets.Radar.width / scaleY;
    const timerMiddleStart = timerLeftStart + UIAssets.TimerLeft.width / scaleY;
    const timerRightStart = canvas.width - UIAssets.TimerRight.width / scaleY;

    const timerTopStart = canvas.height - UIAssets.TimerLeft.height / scaleY;
    const timerTopRimStart = timerTopStart - 10 / scaleY;
    const timerTopStartWithoutTransparent = canvas.height - (UIAssets.TimerLeft.height / scaleY) * 0.8;

    const timerWidth = canvas.width - UIAssets.Radar.width / scaleY;
    const timerHeight = UIAssets.TimerLeft.height / scaleY;

    const buttonStartX = 500 / scaleY - 5;
    const buttonScaleX = 4000 / (canvas.width - buttonStartX);

    const textSize = (UIAssets.BottomButtonFirst.height / scaleY) * 0.7;
    const smallTextSize = (UIAssets.BottomButtonFirst.height / scaleY) * 0.4;
    const votesLeft = gameStore.userDetails.maxVotes - gameStore.userDetails.voteCount;

    this.buttons = [
      {
        asset: UIAssets.BottomButtonFirst,
        left: buttonStartX,
        top: timerTopRimStart - UIAssets.BottomButtonFirst.height / scaleY,
        width: UIAssets.BottomButtonFirst.width / buttonScaleX,
        height: UIAssets.BottomButtonFirst.height / scaleY,
        text: 'FACTIONS',
        color: '#494949',
        textX: UIAssets.BottomButtonFirst.width / buttonScaleX / 2,
        textY: UIAssets.BottomButtonFirst.height / scaleY / 2 + 6,
        font: `${textSize}px Teko`,
        ui: 'FactionStats',
      },
      {
        asset: UIAssets.BottomButton,
        left: buttonStartX + (UIAssets.BottomButton.width - 54) / buttonScaleX,
        top: timerTopRimStart - UIAssets.BottomButton.height / scaleY,
        width: UIAssets.BottomButton.width / buttonScaleX,
        height: UIAssets.BottomButton.height / scaleY,
        text: 'ROUND',
        color: '#494949',
        textX: UIAssets.BottomButton.width / buttonScaleX / 2,
        textY: UIAssets.BottomButton.height / scaleY / 2 + 6,
        font: `${textSize}px Teko`,
        ui: 'RoundStats',
      },
      {
        asset: UIAssets.BottomButton,
        left: buttonStartX + ((UIAssets.BottomButton.width - 54) / buttonScaleX) * 2,
        top: timerTopRimStart - UIAssets.BottomButton.height / scaleY,
        width: UIAssets.BottomButton.width / buttonScaleX,
        height: UIAssets.BottomButton.height / scaleY,
        text: 'BASES',
        color: '#494949',
        textX: UIAssets.BottomButton.width / buttonScaleX / 2,
        textY: UIAssets.BottomButton.height / scaleY / 2 + 6,
        font: `${textSize}px Teko`,
        ui: 'Bases',
      },
      {
        asset: UIAssets.BottomButton,
        left: buttonStartX + ((UIAssets.BottomButton.width - 54) / buttonScaleX) * 3,
        top: timerTopRimStart - UIAssets.BottomButton.height / scaleY,
        width: UIAssets.BottomButton.width / buttonScaleX,
        height: UIAssets.BottomButton.height / scaleY,
        text: 'LADDER',
        color: '#494949',
        textX: UIAssets.BottomButton.width / buttonScaleX / 2,
        textY: UIAssets.BottomButton.height / scaleY / 2 + 6,
        font: `${textSize}px Teko`,
        ui: 'Ladder',
      },
      {
        asset: UIAssets.BottomButtonLast,
        left: buttonStartX + ((UIAssets.BottomButtonLast.width - 54) / buttonScaleX) * 4,
        top: timerTopRimStart - UIAssets.BottomButtonLast.height / scaleY,
        width: UIAssets.BottomButtonLast.width / buttonScaleX,
        height: UIAssets.BottomButtonLast.height / scaleY,
        text: `${votesLeft} Vote${votesLeft === 1 ? '' : 's'} Left`.toUpperCase(),
        color: '#ff2222',
        textX: UIAssets.BottomButton.width / buttonScaleX / 2 + 15,
        textY: UIAssets.BottomButton.height / scaleY / 2 + 7,
        font: `${smallTextSize}px Teko`,
        ui: 'Votes',
      },
    ];

    context.save();
    context.translate(0, shrinko * 0.75);
    context.drawImage(this.minimapCanvas, 0, 0);
    context.restore();

    const selectedFont = '#3FB88A';

    for (let i = this.buttons.length - 1; i >= 0; i--) {
      const button = this.buttons[i];
      context.drawImage(button.asset.image, button.left, button.top, button.width, button.height);
      context.fillStyle = uiStore.ui === button.ui ? selectedFont : button.color;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = button.font;
      context.fillText(button.text, button.left + button.textX, button.top + button.textY);
    }

    context.drawImage(
      UIAssets.Radar.image,
      0,
      canvas.height - UIAssets.Radar.height / scaleY,
      UIAssets.Radar.width / scaleY,
      UIAssets.Radar.height / scaleY
    );

    const percent = (game.roundDuration - (game.roundEnd - +new Date())) / game.roundDuration;

    context.fillStyle = '#494949';
    context.fillRect(timerLeftStart + 10, timerTopStartWithoutTransparent, timerWidth, timerHeight);
    context.fillStyle = ColorUtils.lerpColor('#00FF00', '#FF0000', Math.min(percent, 1));
    context.fillRect(timerLeftStart + 10, timerTopStartWithoutTransparent, timerWidth * percent, timerHeight);

    context.fillStyle = '#D7D7D7';
    context.fillRect(timerLeftStart - 1, timerTopRimStart, timerWidth, 11 / scaleY);

    for (let i = timerLeftStart; i < canvas.width; i += UIAssets.TimeShadow.width / scaleY) {
      context.drawImage(
        UIAssets.TimeShadow.image,
        i,
        timerTopStart - 10 / scaleY - 9 / scaleY,
        Math.min(canvas.width, UIAssets.TimeShadow.width / scaleY),
        UIAssets.TimeShadow.height / scaleY
      );
    }

    context.drawImage(
      UIAssets.TimerLeft.image,
      timerLeftStart,
      timerTopStart,
      UIAssets.TimerLeft.width / scaleY,
      UIAssets.TimerLeft.height / scaleY
    );

    for (let i = timerMiddleStart; i < timerRightStart; i += UIAssets.TimerMiddle.width / scaleY) {
      context.drawImage(
        UIAssets.TimerMiddle.image,
        i,
        timerTopStart,
        Math.min(timerRightStart - i, UIAssets.TimerMiddle.width / scaleY),
        UIAssets.TimerMiddle.height / scaleY
      );
    }

    context.drawImage(
      UIAssets.TimerRight.image,
      timerRightStart,
      timerTopStart,
      UIAssets.TimerRight.width / scaleY,
      UIAssets.TimerRight.height / scaleY
    );

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
  }
}
