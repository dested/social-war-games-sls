import {HexagonTileType, HexagonTypes, TileSubType, TileType} from '@swg-common/game';
import {getStore} from '../store';
import {GameActions} from '../store/game/actions';

export class HexImages {
    public static hexTypeToImage(type: TileType, subType: TileSubType) {
        let url: string;
        switch (type) {
            case 'Dirt':
                switch (subType) {
                    case '1':
                        url = './assets/tiles/Dirt/dirt_06.png';
                        break;
                    case '2':
                        url = './assets/tiles/Dirt/dirt_12.png';
                        break;
                    case '3':
                        url = './assets/tiles/Dirt/dirt_14.png';
                        break;
                    case '4':
                        url = './assets/tiles/Dirt/dirt_15.png';
                        break;
                    case '5':
                        url = './assets/tiles/Dirt/dirt_16.png';
                        break;
                }
                break;
            case 'Clay':
                switch (subType) {
                    case '1':
                        url = './assets/tiles/Sand/sand_07.png';
                        break;
                    case '2':
                        url = './assets/tiles/Sand/sand_12.png';
                        break;
                    case '3':
                        url = './assets/tiles/Sand/sand_14.png';
                        break;
                    case '4':
                        url = './assets/tiles/Sand/sand_16.png';
                        break;
                    case '5':
                        url = './assets/tiles/Sand/sand_17.png';
                        break;
                }
                break;
            case 'Grass':
                switch (subType) {
                    case '1':
                        url = './assets/tiles/Grass/grass_05.png';
                        break;
                    case '2':
                        url = './assets/tiles/Grass/grass_10.png';
                        break;
                    case '3':
                        url = './assets/tiles/Grass/grass_12.png';
                        break;
                    case '4':
                        url = './assets/tiles/Grass/grass_15.png';
                        break;
                    case '5':
                        url = './assets/tiles/Grass/grass_16.png';
                        break;
                }
                break;
            case 'Stone':
                switch (subType) {
                    case '1':
                        url = './assets/tiles/Stone/stone_07.png';
                        break;
                    case '2':
                        url = './assets/tiles/Stone/stone_12.png';
                        break;
                    case '3':
                        url = './assets/tiles/Stone/stone_13.png';
                        break;
                    case '4':
                        url = './assets/tiles/Stone/stone_16.png';
                        break;
                    case '5':
                        url = './assets/tiles/Stone/stone_17.png';
                        break;
                }
                break;

            case 'Water':
                switch (subType) {
                    case '1':
                        url = './assets/tiles/Water/water_05.png';
                        break;
                    case '2':
                        url = './assets/tiles/Water/water_11.png';
                        break;
                    case '3':
                        url = './assets/tiles/Water/water_12.png';
                        break;
                    case '4':
                        url = './assets/tiles/Water/water_14.png';
                        break;
                    case '5':
                        url = './assets/tiles/Water/water_15.png';
                        break;
                }
                break;
        }
        const image = new Image();
        image.src = url;
        getStore().dispatch(GameActions.setImagesLoadingAction(getStore().getState().gameState.imagesLoading + 1));
        image.onload = () => {
            getStore().dispatch(GameActions.setImagesLoadingAction(getStore().getState().gameState.imagesLoading - 1));
        };
        return image;
    }
}
