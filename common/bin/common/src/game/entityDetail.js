"use strict";
exports.__esModule = true;
var _a;
exports.Factions = ['1', '2', '3'];
exports.FactionNames = { '1': 'Red', '2': 'Green', '3': 'Purple' };
exports.EntityTypeNames = {
    infantry: 'Infantry',
    tank: 'Tank',
    plane: 'Plane',
    factory: 'Factory'
};
exports.EntityDetails = (_a = {},
    _a['factory'] = {
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
    _a['tank'] = {
        type: 'tank',
        moveRadius: 6,
        health: 8,
        attackRadius: 8,
        mineRadius: 0,
        attackPower: 3,
        ticksToSpawn: 3,
        healthRegenRate: 3,
        spawnCost: 6,
        solid: false,
        spawnRadius: 0
    },
    _a['plane'] = {
        type: 'plane',
        moveRadius: 8,
        health: 2,
        attackRadius: 3,
        mineRadius: 0,
        attackPower: 3,
        ticksToSpawn: 4,
        healthRegenRate: 3,
        spawnCost: 10,
        solid: false,
        spawnRadius: 0
    },
    _a['infantry'] = {
        type: 'infantry',
        moveRadius: 4,
        health: 4,
        mineRadius: 2,
        attackRadius: 3,
        attackPower: 1,
        ticksToSpawn: 2,
        spawnCost: 4,
        healthRegenRate: 3,
        solid: false,
        spawnRadius: 2
    },
    _a);
