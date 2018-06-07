export interface EntityDetail {
    type: EntityType;
    solid: boolean;
    moveRadius: number;
    attackRadius: number;
    spawnRadius: number;
    mineRadius: number;
    attackPower: number;
    ticksToSpawn: number;
    spawnCost: number;
    health: number;
    healthRegenRate: number;
}

export type EntityAction = 'attack' | 'move' | 'spawn-infantry' | 'spawn-tank' | 'spawn-plane' | 'mine';
export type EntityType = 'infantry' | 'tank' | 'plane' | 'factory';
export type Faction = '0' | '9' | PlayableFactionId;
export type PlayableFactionId = '1' | '2' | '3';

export let Factions: PlayableFactionId[] = ['1', '2', '3'];

export type GameEntityBusyDetails = {
    ticks: number;
    action: EntityAction;
    hexId: string;
};

export interface GameEntity {
    id: string;
    x: number;
    y: number;
    factionId: PlayableFactionId;
    busy?: GameEntityBusyDetails;
    entityType: EntityType;
    health: number;
    healthRegenStep: number;
}
export let EntityDetails: {[key in EntityType]: EntityDetail} = {
    ['factory']: {
        type: 'factory',
        moveRadius: 0,
        health: 30,
        mineRadius: 0,
        attackRadius: 0,
        attackPower: 0,
        ticksToSpawn: 0,
        healthRegenRate: -1,
        spawnCost: 0,
        solid: true,
        spawnRadius: 4
    },
    ['tank']: {
        type: 'tank',
        moveRadius: 6,
        health: 8,
        attackRadius: 8,
        mineRadius: 0,
        attackPower: 3,
        ticksToSpawn: 3,
        healthRegenRate: 2,
        spawnCost: 6,
        solid: false,
        spawnRadius: 0
    },
    ['plane']: {
        type: 'plane',
        moveRadius: 8,
        health: 2,
        attackRadius: 3,
        mineRadius: 0,
        attackPower: 3,
        ticksToSpawn: 4,
        healthRegenRate: 2,
        spawnCost: 10,
        solid: false,
        spawnRadius: 0
    },
    ['infantry']: {
        type: 'infantry',
        moveRadius: 4,
        health: 4,
        mineRadius: 3,
        attackRadius: 3,
        attackPower: 1,
        ticksToSpawn: 2,
        spawnCost: 4,
        healthRegenRate: 2,
        solid: false,
        spawnRadius: 2
    }
};
