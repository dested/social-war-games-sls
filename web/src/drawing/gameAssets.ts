import {EntityType} from '@swg-common/game/entityDetail';
import {ResourceType} from '@swg-common/game/gameResource';
import {ImageUtils} from '../utils/imageUtils';

export interface GameAsset extends UIAsset {
  centerX: number;
  centerY: number;
  rotate: boolean;
}
export interface UIAsset {
  image: HTMLImageElement;
  imageUrl: string;
  width: number;
  height: number;
}

export type GameAssetType = EntityType | ResourceType;

export let GameAssets: {[key in GameAssetType]: GameAsset};
type UIAssetKeys =
  | 'Radar'
  | 'SmallRadar'
  | 'BottomButtonFirst'
  | 'BottomButton'
  | 'BottomButtonLast'
  | 'TimerLeft'
  | 'TimeShadow'
  | 'TimerMiddle'
  | 'TimerRight';

export let UIAssets: {[key in UIAssetKeys]: UIAsset};
export let loadUI = () => {
  UIAssets = {
    Radar: {
      image: ImageUtils.preloadImage(`./assets/ui/bottom-left.png`),
      imageUrl: `./assets/ui/bottom-left.png`,
      width: 557,
      height: 529,
    },
    SmallRadar: {
      image: ImageUtils.preloadImage(`./assets/ui/small-radar.png`),
      imageUrl: `./assets/ui/small-radar.png`,
      width: 309,
      height: 309,
    },
    TimerLeft: {
      image: ImageUtils.preloadImage(`./assets/ui/timer-left.png`),
      imageUrl: `./assets/ui/timer-left.png`,
      width: 92,
      height: 149,
    },

    TimeShadow: {
      image: ImageUtils.preloadImage(`./assets/ui/timer-shadow.png`),
      imageUrl: `./assets/ui/timer-shadow.png`,
      width: 3,
      height: 8,
    },
    TimerMiddle: {
      image: ImageUtils.preloadImage(`./assets/ui/timer-middle.png`),
      imageUrl: `./assets/ui/timer-middle.png`,
      width: 45,
      height: 149,
    },
    TimerRight: {
      image: ImageUtils.preloadImage(`./assets/ui/timer-right.png`),
      imageUrl: `./assets/ui/timer-right.png`,
      width: 175,
      height: 149,
    },
    BottomButtonFirst: {
      image: ImageUtils.preloadImage(`./assets/ui/bottom-button-first.png`),
      imageUrl: `./assets/ui/bottom-button-first.png`,
      width: 539,
      height: 123,
    },
    BottomButton: {
      image: ImageUtils.preloadImage(`./assets/ui/bottom-button.png`),
      imageUrl: `./assets/ui/bottom-button.png`,
      width: 539,
      height: 123,
    },
    BottomButtonLast: {
      image: ImageUtils.preloadImage(`./assets/ui/bottom-button-last.png`),
      imageUrl: `./assets/ui/bottom-button-last.png`,
      width: 539,
      height: 123,
    },
  };
};

export let loadEntities = () => {
  GameAssets = {
    infantry: {
      image: ImageUtils.preloadImage(`./assets/entities/infantry.png`),
      imageUrl: `./assets/entities/infantry.png`,
      width: 80,
      height: 80,
      centerX: 40,
      centerY: 40,
      rotate: true,
    },
    tank: {
      image: ImageUtils.preloadImage(`./assets/entities/tank.png`),
      imageUrl: `./assets/entities/tank.png`,
      width: 80,
      height: 80,
      centerX: 40,
      centerY: 40,
      rotate: true,
    },

    plane: {
      image: ImageUtils.preloadImage(`./assets/entities/plane.png`),
      imageUrl: `./assets/entities/plane.png`,
      width: 80,
      height: 80,
      centerX: 40,
      centerY: 40,
      rotate: true,
    },

    factory: {
      image: ImageUtils.preloadImage(`./assets/entities/factory.png`),
      imageUrl: `./assets/entities/factory.png`,
      width: 120,
      height: 140,
      centerX: 60,
      centerY: 70,
      rotate: false,
    },

    bronze: {
      image: ImageUtils.preloadImage(`./assets/resources/bronze.png`),
      imageUrl: `./assets/resources/bronze.png`,
      width: 80,
      height: 102,
      centerX: 40,
      centerY: 70,
      rotate: false,
    },

    silver: {
      image: ImageUtils.preloadImage(`./assets/resources/silver.png`),
      imageUrl: `./assets/resources/silver.png`,
      width: 80,
      height: 102,
      centerX: 40,
      centerY: 70,
      rotate: false,
    },

    gold: {
      image: ImageUtils.preloadImage(`./assets/resources/gold.png`),
      imageUrl: `./assets/resources/gold.png`,
      width: 80,
      height: 102,
      centerX: 40,
      centerY: 70,
      rotate: false,
    },
  };
};
