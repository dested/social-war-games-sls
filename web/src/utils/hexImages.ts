import {HexagonTileType, HexagonTypes, TileSubType, TileType} from '@swg-common/game';

export class HexImages {
    public static hexTypeToImage(type: TileType, subType: TileSubType) {
        switch (type) {
            case 'Dirt':
                switch (subType) {
                    case '1':
                        return './assets/tiles/Dirt/dirt_06.png';
                    case '2':
                        return './assets/tiles/Dirt/dirt_12.png';
                    case '3':
                        return './assets/tiles/Dirt/dirt_14.png';
                    case '4':
                        return './assets/tiles/Dirt/dirt_15.png';
                    case '5':
                        return './assets/tiles/Dirt/dirt_16.png';
                }
                break;
            case 'Clay':
                switch (subType) {
                    case '1':
                        return './assets/tiles/Sand/sand_07.png';
                    case '2':
                        return './assets/tiles/Sand/sand_12.png';
                    case '3':
                        return './assets/tiles/Sand/sand_14.png';
                    case '4':
                        return './assets/tiles/Sand/sand_16.png';
                    case '5':
                        return './assets/tiles/Sand/sand_17.png';
                }
                break;
            case 'Grass':
                switch (subType) {
                    case '1':
                        return './assets/tiles/Grass/grass_05.png';
                    case '2':
                        return './assets/tiles/Grass/grass_10.png';
                    case '3':
                        return './assets/tiles/Grass/grass_12.png';
                    case '4':
                        return './assets/tiles/Grass/grass_15.png';
                    case '5':
                        return './assets/tiles/Grass/grass_16.png';
                }
                break;
            case 'Stone':
                switch (subType) {
                    case '1':
                        return './assets/tiles/Stone/stone_07.png';
                    case '2':
                        return './assets/tiles/Stone/stone_12.png';
                    case '3':
                        return './assets/tiles/Stone/stone_13.png';
                    case '4':
                        return './assets/tiles/Stone/stone_16.png';
                    case '5':
                        return './assets/tiles/Stone/stone_17.png';
                }
                break;

            case 'Water':
                switch (subType) {
                    case '1':
                        return './assets/tiles/Water/water_05.png';
                    case '2':
                        return './assets/tiles/Water/water_11.png';
                    case '3':
                        return './assets/tiles/Water/water_12.png';
                    case '4':
                        return './assets/tiles/Water/water_14.png';
                    case '5':
                        return './assets/tiles/Water/water_15.png';
                }
                break;
        }
    }
}
