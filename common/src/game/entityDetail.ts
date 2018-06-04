export interface EntityDetail {
    type: EntityType;
    solid: boolean;
    moveRadius: number;
    attackRadius: number;
    spawnRadius: number;
    attackPower: number;
    ticksToSpawn: number;
    health: number;
    healthRegenRate: number;
}

export type EntityAction = 'attack' | 'move' | 'spawn';
export type EntityType = 'infantry' | 'tank' | 'plane' | 'factory';
export type FactionId = '0' | '1' | '2' | '3' | '9';

export let Factions: FactionId[] = ['1', '2', '3'];

export class GameEntity {
    id: string;
    x: number;
    y: number;
    factionId: FactionId;
    entityType: EntityType;
    health: number;
}
export let EntityDetails: {[key in EntityType]: EntityDetail} = {
    ['factory']: {
        type: 'factory',
        moveRadius: 0,
        health: 30,
        attackRadius: 0,
        attackPower: 0,
        ticksToSpawn: 0,
        healthRegenRate: 0,
        solid: true,
        spawnRadius: 4
    },
    ['tank']: {
        type: 'tank',
        moveRadius: 6,
        health: 8,
        attackRadius: 8,
        attackPower: 3,
        ticksToSpawn: 3,
        healthRegenRate: 1,
        solid: false,
        spawnRadius: 0
    },
    ['plane']: {
        type: 'plane',
        moveRadius: 8,
        health: 2,
        attackRadius: 3,
        attackPower: 3,
        ticksToSpawn: 4,
        healthRegenRate: 1,
        solid: false,
        spawnRadius: 0
    },
    ['infantry']: {
        type: 'infantry',
        moveRadius: 4,
        health: 4,
        attackRadius: 3,
        attackPower: 1,
        ticksToSpawn: 2,
        healthRegenRate: 1,
        solid: false,
        spawnRadius: 2
    }
};
