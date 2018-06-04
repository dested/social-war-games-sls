import {Utils} from '../utils/utils';

export type TileType = 'Dirt' | 'Grass' | 'Stone' | 'Clay' | 'Water';
export type TileSubType = '1' | '2' | '3' | '4' | '5';

export interface HexagonTileType {
    type: TileType;
    subType: TileSubType;
    cost: number;
    blocked: boolean;
}

export class HexagonTypes {
    static preloadTypes() {
        return [
            HexagonTypes.get('Dirt', '1'),
            HexagonTypes.get('Dirt', '2'),
            HexagonTypes.get('Dirt', '3'),
            HexagonTypes.get('Dirt', '4'),
            HexagonTypes.get('Dirt', '5'),
            HexagonTypes.get('Clay', '1'),
            HexagonTypes.get('Clay', '2'),
            HexagonTypes.get('Clay', '3'),
            HexagonTypes.get('Clay', '4'),
            HexagonTypes.get('Clay', '5'),
            HexagonTypes.get('Stone', '1'),
            HexagonTypes.get('Stone', '2'),
            HexagonTypes.get('Stone', '3'),
            HexagonTypes.get('Stone', '4'),
            HexagonTypes.get('Stone', '5'),
            HexagonTypes.get('Water', '1'),
            HexagonTypes.get('Water', '2'),
            HexagonTypes.get('Water', '3'),
            HexagonTypes.get('Water', '4'),
            HexagonTypes.get('Water', '5'),
            HexagonTypes.get('Grass', '1'),
            HexagonTypes.get('Grass', '2'),
            HexagonTypes.get('Grass', '3'),
            HexagonTypes.get('Grass', '4'),
            HexagonTypes.get('Grass', '5')
        ];
    }

    static dirt: (subType: TileSubType) => HexagonTileType = (subType: TileSubType) => ({
        type: 'Dirt',
        subType,
        cost: 1,
        blocked: false
    });

    static grass: (subType: TileSubType) => HexagonTileType = (subType: TileSubType) => ({
        type: 'Grass',
        subType,
        cost: 2,
        blocked: false
    });

    static clay: (subType: TileSubType) => HexagonTileType = (subType: TileSubType) => ({
        type: 'Clay',
        subType,
        cost: 3,
        blocked: false
    });

    static stone: (subType: TileSubType) => HexagonTileType = (subType: TileSubType) => ({
        type: 'Stone',
        subType,
        cost: 4,
        blocked: false
    });

    static water: (subType: TileSubType) => HexagonTileType = (subType: TileSubType) => ({
        type: 'Water',
        subType,
        cost: 0,
        blocked: true
    });

    static randomSubType(): TileSubType {
        if (Utils.random(90)) return '1';
        return (Math.floor(Math.random() * 5) + 1).toString() as TileSubType;
    }

    private static cache: {[key: string]: HexagonTileType} = {};

    static get(type: TileType, subType: TileSubType): HexagonTileType {
        if (this.cache[type + subType]) {
            return this.cache[type + subType];
        }
        switch (type) {
            case 'Dirt':
                return (this.cache[type + subType] = this.dirt(subType));
            case 'Clay':
                return (this.cache[type + subType] = this.clay(subType));
            case 'Grass':
                return (this.cache[type + subType] = this.grass(subType));
            case 'Stone':
                return (this.cache[type + subType] = this.stone(subType));
            case 'Water':
                return (this.cache[type + subType] = this.water(subType));
        }
    }
}
