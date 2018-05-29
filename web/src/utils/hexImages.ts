import {HexagonTileType, HexagonTypes} from '@swg-common/game';

export class HexImages {
    public static images = [
        HexagonTypes.dirt('1'),
        HexagonTypes.dirt('2'),
        HexagonTypes.dirt('3'),
        HexagonTypes.dirt('4'),
        HexagonTypes.dirt('5'),
        HexagonTypes.clay('1'),
        HexagonTypes.clay('2'),
        HexagonTypes.clay('3'),
        HexagonTypes.clay('4'),
        HexagonTypes.clay('5'),
        HexagonTypes.grass('1'),
        HexagonTypes.grass('2'),
        HexagonTypes.grass('3'),
        HexagonTypes.grass('4'),
        HexagonTypes.grass('5'),
        HexagonTypes.stone('1'),
        HexagonTypes.stone('2'),
        HexagonTypes.stone('3'),
        HexagonTypes.stone('4'),
        HexagonTypes.stone('5'),
        HexagonTypes.water('1'),
        HexagonTypes.water('2'),
        HexagonTypes.water('3'),
        HexagonTypes.water('4'),
        HexagonTypes.water('5')
    ];

    public static hexTypeToImage(type: HexagonTileType) {
        switch (type.type) {
            case 'Dirt':
                switch (type.subType) {
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
                switch (type.subType) {
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
                switch (type.subType) {
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
                switch (type.subType) {
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
                switch (type.subType) {
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
