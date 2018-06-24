import {EntityType} from '@swg-common/game/entityDetail';
import {ResourceType} from '@swg-common/game/gameResource';
import {ImageUtils} from '../utils/imageUtils';

interface GameAsset {
    image: HTMLImageElement;
    imageUrl: string;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
}

export type GameAssetType = EntityType | ResourceType;

export let GameAssets: {[key in GameAssetType]: GameAsset};
export let loadEntities = () => {
    GameAssets = {
        infantry: {
            image: ImageUtils.preloadImage(`./assets/entities/infantry.png`),
            imageUrl: `./assets/entities/infantry.png`,
            width: 120,
            height: 180,
            centerX: 60,
            centerY: 110
        },
        tank: {
            image: ImageUtils.preloadImage(`./assets/entities/tank.png`),
            imageUrl: `./assets/entities/tank.png`,
            width: 120,
            height: 140,
            centerX: 60,
            centerY: 70
        },

        plane: {
            image: ImageUtils.preloadImage(`./assets/entities/plane.png`),
            imageUrl: `./assets/entities/plane.png`,
            width: 120,
            height: 140,
            centerX: 60,
            centerY: 70
        },

        factory: {
            image: ImageUtils.preloadImage(`./assets/entities/factory.png`),
            imageUrl: `./assets/entities/factory.png`,
            width: 120,
            height: 140,
            centerX: 60,
            centerY: 70
        },

        bronze: {
            image: ImageUtils.preloadImage(`./assets/resources/bronze.png`),
            imageUrl: `./assets/resources/bronze.png`,
            width: 80,
            height: 102,
            centerX: 40,
            centerY: 70
        },

        silver: {
            image: ImageUtils.preloadImage(`./assets/resources/silver.png`),
            imageUrl: `./assets/resources/silver.png`,
            width: 80,
            height: 102,
            centerX: 40,
            centerY: 70
        },

        gold: {
            image: ImageUtils.preloadImage(`./assets/resources/gold.png`),
            imageUrl: `./assets/resources/gold.png`,
            width: 80,
            height: 102,
            centerX: 40,
            centerY: 70
        }
    };
};
