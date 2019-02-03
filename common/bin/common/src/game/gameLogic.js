"use strict";
exports.__esModule = true;
var config_1 = require("../../../server-common/src/config");
var hex_1 = require("../hex/hex");
var hashArray_1 = require("../utils/hashArray");
var utils_1 = require("../utils/utils");
var entityDetail_1 = require("./entityDetail");
var gameHexagon_1 = require("./gameHexagon");
var gameResource_1 = require("./gameResource");
var hexagonTypes_1 = require("./hexagonTypes");
var voteResult_1 = require("./voteResult");
var GameLogic = /** @class */ (function () {
    function GameLogic() {
    }
    GameLogic.calculateScore = function (game, faction) {
        var factionHexes = game.grid.hexes.map(function (a) { return a.factionId; });
        var hexCount = factionHexes.filter(function (a) { return a === faction; }).length;
        var entities = game.entities.filter(function (a) { return a.factionId === faction; });
        var score = 0;
        score += hexCount;
        score += 3 * game.factionDetails[faction].resourceCount;
        score += 5 * entities.filter(function (a) { return a.entityType === 'factory'; }).length;
        score += 3 * entities.filter(function (a) { return a.entityType === 'plane'; }).length;
        score += 2 * entities.filter(function (a) { return a.entityType === 'tank'; }).length;
        score += 1 * entities.filter(function (a) { return a.entityType === 'infantry'; }).length;
        return score;
    };
    GameLogic.calculateUserScore = function (userStats, currentGeneration) {
        var score = 0;
        var generationsPerDay = (24 * 60 * 60) / config_1.Config.gameDuration;
        var valuableGenerations = generationsPerDay * 2.5;
        for (var _i = 0, _a = userStats.roundsParticipated; _i < _a.length; _i++) {
            var r = _a[_i];
            var roundScore = 0;
            roundScore += r.votesCast * 0.1;
            roundScore += r.votesWon * 0.5;
            roundScore += r.damageDone * 3;
            roundScore += r.unitsDestroyed * 6;
            roundScore += r.unitsCreated * 4;
            roundScore += r.resourcesMined * 3.5;
            roundScore += r.distanceMoved * 1.2;
            var genDiff = currentGeneration - r.generation;
            var worth = (valuableGenerations - genDiff) / valuableGenerations;
            score += roundScore / worth;
        }
        return Math.round(score);
    };
    GameLogic.nextId = function (entities) {
        var _loop_1 = function () {
            var random = Math.floor(Math.random() * 10000);
            if (!entities.find(function (a) { return a.id === random; })) {
                return { value: random };
            }
        };
        while (true) {
            var state_1 = _loop_1();
            if (typeof state_1 === "object")
                return state_1.value;
        }
    };
    GameLogic.createDebugGame = function () {
        var entitiesPerBase = [
            entityDetail_1.EntityDetails.factory,
            entityDetail_1.EntityDetails.tank,
            entityDetail_1.EntityDetails.tank,
            entityDetail_1.EntityDetails.tank,
            entityDetail_1.EntityDetails.tank,
            entityDetail_1.EntityDetails.tank,
            entityDetail_1.EntityDetails.tank,
            entityDetail_1.EntityDetails.tank,
            entityDetail_1.EntityDetails.infantry,
            entityDetail_1.EntityDetails.infantry,
            entityDetail_1.EntityDetails.infantry,
            entityDetail_1.EntityDetails.infantry,
            entityDetail_1.EntityDetails.infantry,
            entityDetail_1.EntityDetails.infantry,
            entityDetail_1.EntityDetails.infantry,
            entityDetail_1.EntityDetails.infantry,
            entityDetail_1.EntityDetails.plane,
            entityDetail_1.EntityDetails.plane,
            entityDetail_1.EntityDetails.plane,
            entityDetail_1.EntityDetails.plane,
        ];
        var baseRadius = 5;
        var numberOfBasesPerFaction = 15;
        var boardWidth = 200;
        var boardHeight = 200;
        var grid = new hex_1.Grid(0, 0, boardWidth, boardHeight);
        var entities = [];
        for (var y = 0; y < grid.boundsHeight; y++) {
            for (var x = -Math.floor(y / 2); x < grid.boundsWidth - Math.floor(y / 2); x++) {
                grid.hexes.push(new gameHexagon_1.GameHexagon(hexagonTypes_1.HexagonTypes.dirt(hexagonTypes_1.HexagonTypes.randomSubType()), x + "-" + y, x, y));
            }
        }
        for (var _i = 0, Factions_1 = entityDetail_1.Factions; _i < Factions_1.length; _i++) {
            var faction = Factions_1[_i];
            for (var base = 0; base < numberOfBasesPerFaction; base++) {
                var x = Math.round(Math.random() * (grid.boundsWidth - 14) + 7);
                var y = Math.round(Math.random() * (grid.boundsHeight - 14) + 7);
                var center = grid.easyPoint(x, y);
                var baseHexes = grid.getCircle(center, baseRadius);
                for (var _a = 0, baseHexes_1 = baseHexes; _a < baseHexes_1.length; _a++) {
                    var hex = baseHexes_1[_a];
                    hex.setFactionId(faction, 3);
                }
                var innerBaseHexes = grid.getCircle(center, baseRadius - 1);
                entities.push({
                    id: this.nextId(entities),
                    factionId: faction,
                    health: 1,
                    x: center.x,
                    y: center.y,
                    entityType: entitiesPerBase[0].type,
                    healthRegenStep: entitiesPerBase[0].healthRegenRate
                });
                var _loop_2 = function (i) {
                    var hex = innerBaseHexes[Math.floor(Math.random() * innerBaseHexes.length)];
                    if (entities.find(function (a) { return a.x === hex.x && a.y === hex.y; })) {
                        i--;
                        return out_i_1 = i, "continue";
                    }
                    entities.push({
                        id: this_1.nextId(entities),
                        factionId: faction,
                        health: 1,
                        x: hex.x,
                        y: hex.y,
                        entityType: entitiesPerBase[i].type,
                        healthRegenStep: 0
                    });
                    out_i_1 = i;
                };
                var this_1 = this, out_i_1;
                for (var i = 1; i < entitiesPerBase.length; i++) {
                    _loop_2(i);
                    i = out_i_1;
                }
            }
        }
        var resourceLimits = [
            { type: 'bronze', count: 80 },
            { type: 'silver', count: 40 },
            { type: 'gold', count: 20 },
        ];
        var resources = [];
        for (var _b = 0, resourceLimits_1 = resourceLimits; _b < resourceLimits_1.length; _b++) {
            var resource = resourceLimits_1[_b];
            for (var i = 0; i < resource.count; i++) {
                var center = grid.hexes.getIndex(Math.floor(Math.random() * grid.hexes.length));
                var resourceDetail = gameResource_1.ResourceDetails[resource.type];
                var gameResource = {
                    x: center.x,
                    y: center.y,
                    resourceType: resource.type,
                    currentCount: resourceDetail.startingCount
                };
                center.setTileType(hexagonTypes_1.HexagonTypes.get(center.tileType.type, '1'));
                resources.push(gameResource);
            }
        }
        var factionDetails = {
            '1': {
                resourceCount: 10
            },
            '2': {
                resourceCount: 10
            },
            '3': {
                resourceCount: 10
            }
        };
        return {
            roundDuration: config_1.Config.gameDuration,
            roundStart: +new Date(),
            roundEnd: +new Date() + config_1.Config.gameDuration,
            generation: 10000001,
            resources: hashArray_1.HashArray.create(resources, hex_1.PointHashKey),
            entities: hashArray_1.DoubleHashArray.create(entities, hex_1.PointHashKey, function (e) { return e.id; }),
            factionDetails: factionDetails,
            layout: null,
            grid: grid
        };
    };
    GameLogic.createGame = function () {
        var entitiesPerBase = [
            entityDetail_1.EntityDetails.factory,
            entityDetail_1.EntityDetails.tank,
            entityDetail_1.EntityDetails.tank,
            entityDetail_1.EntityDetails.tank,
            entityDetail_1.EntityDetails.tank,
            entityDetail_1.EntityDetails.infantry,
            entityDetail_1.EntityDetails.infantry,
            entityDetail_1.EntityDetails.infantry,
            entityDetail_1.EntityDetails.infantry,
            entityDetail_1.EntityDetails.infantry,
            entityDetail_1.EntityDetails.plane,
        ];
        var baseRadius = 5;
        var numberOfBasesPerFaction = 9;
        var boardWidth = 200;
        var boardHeight = 200;
        var grid = new hex_1.Grid(0, 0, boardWidth, boardHeight);
        var entities = [];
        for (var y = 0; y < grid.boundsHeight; y++) {
            for (var x = -Math.floor(y / 2); x < grid.boundsWidth - Math.floor(y / 2); x++) {
                grid.hexes.push(new gameHexagon_1.GameHexagon(hexagonTypes_1.HexagonTypes.dirt(hexagonTypes_1.HexagonTypes.randomSubType()), x + "-" + y, x, y));
            }
        }
        var allHexes = grid.getCircle(grid.easyPoint(boardWidth / 2, boardHeight / 2), boardWidth / 2);
        var allHexes7In = grid.getCircle(grid.easyPoint(boardWidth / 2, boardHeight / 2), boardWidth / 2 - 7);
        for (var i = grid.hexes.array.length - 1; i >= 0; i--) {
            var hex = grid.hexes.array[i];
            if (!allHexes.includes(hex)) {
                grid.hexes.removeItem(hex);
            }
        }
        var tries = 0;
        var factionCenters = [];
        for (var _i = 0, Factions_2 = entityDetail_1.Factions; _i < Factions_2.length; _i++) {
            var faction = Factions_2[_i];
            var myFactionCenters = [];
            var _loop_3 = function (base) {
                if (tries > 100) {
                    console.log('try again');
                    return { value: void 0 };
                }
                var center = utils_1.Utils.randomElement(allHexes7In);
                if (factionCenters.some(function (a) { return grid.getDistance({ x: center.x, y: center.y }, a) < baseRadius * 2.5; })) {
                    base--;
                    tries++;
                    return out_base_1 = base, "continue";
                }
                if (myFactionCenters.some(function (a) { return grid.getDistance({ x: center.x, y: center.y }, a) < baseRadius * 2.5 * 3; })) {
                    base--;
                    tries++;
                    return out_base_1 = base, "continue";
                }
                myFactionCenters.push(center);
                factionCenters.push(center);
                var baseHexes = grid.getCircle(center, baseRadius);
                for (var _i = 0, baseHexes_2 = baseHexes; _i < baseHexes_2.length; _i++) {
                    var hex = baseHexes_2[_i];
                    hex.setFactionId(faction, 3);
                }
                var innerBaseHexes = grid.getCircle(center, baseRadius - 1);
                entities.push({
                    id: this_2.nextId(entities),
                    factionId: faction,
                    health: entitiesPerBase[0].health,
                    x: center.x,
                    y: center.y,
                    entityType: entitiesPerBase[0].type,
                    healthRegenStep: entitiesPerBase[0].healthRegenRate
                });
                var _loop_5 = function (i) {
                    var hex = innerBaseHexes[Math.floor(Math.random() * innerBaseHexes.length)];
                    if (entities.find(function (a) { return a.x === hex.x && a.y === hex.y; })) {
                        i--;
                        return out_i_3 = i, "continue";
                    }
                    entities.push({
                        id: this_2.nextId(entities),
                        factionId: faction,
                        health: entitiesPerBase[i].health,
                        x: hex.x,
                        y: hex.y,
                        entityType: entitiesPerBase[i].type,
                        healthRegenStep: entitiesPerBase[i].healthRegenRate
                    });
                    out_i_3 = i;
                };
                var out_i_3;
                for (var i = 1; i < entitiesPerBase.length; i++) {
                    _loop_5(i);
                    i = out_i_3;
                }
                out_base_1 = base;
            };
            var this_2 = this, out_base_1;
            for (var base = 0; base < numberOfBasesPerFaction; base++) {
                var state_2 = _loop_3(base);
                base = out_base_1;
                if (typeof state_2 === "object")
                    return state_2.value;
            }
        }
        for (var i = 0; i < 120; i++) {
            var center = grid.hexes.getIndex(Math.floor(Math.random() * grid.hexes.length));
            var type = utils_1.Utils.random(60) ? hexagonTypes_1.HexagonTypes.grass : utils_1.Utils.random(50) ? hexagonTypes_1.HexagonTypes.clay : hexagonTypes_1.HexagonTypes.stone;
            for (var _a = 0, _b = grid.getCircle(center, Math.floor(Math.random() * 8)); _a < _b.length; _a++) {
                var gameHexagon = _b[_a];
                if (utils_1.Utils.random(100 - grid.getDistance(gameHexagon, center) * 2)) {
                    gameHexagon.setTileType(type(hexagonTypes_1.HexagonTypes.randomSubType()));
                }
            }
        }
        var resourceLimits = [
            { type: 'bronze', count: 80 },
            { type: 'silver', count: 40 },
            { type: 'gold', count: 20 },
        ];
        var resources = [];
        for (var _c = 0, resourceLimits_2 = resourceLimits; _c < resourceLimits_2.length; _c++) {
            var resource = resourceLimits_2[_c];
            var _loop_4 = function (i) {
                var center = grid.hexes.getIndex(Math.floor(Math.random() * grid.hexes.length));
                if (factionCenters.some(function (a) { return grid.getDistance({ x: center.x, y: center.y }, a) <= baseRadius + 1; })) {
                    i--;
                    return out_i_2 = i, "continue";
                }
                var resourceDetail = gameResource_1.ResourceDetails[resource.type];
                var gameResource = {
                    x: center.x,
                    y: center.y,
                    resourceType: resource.type,
                    currentCount: resourceDetail.startingCount
                };
                center.setTileType(hexagonTypes_1.HexagonTypes.get(center.tileType.type, '1'));
                resources.push(gameResource);
                out_i_2 = i;
            };
            var out_i_2;
            for (var i = 0; i < resource.count; i++) {
                _loop_4(i);
                i = out_i_2;
            }
        }
        for (var i = 0; i < 0; i++) {
            var start = utils_1.Utils.randomElement(allHexes);
            var far = grid.getRange(grid.getHexAt(start), Math.floor(Math.random() * 80) + 30, new hashArray_1.DoubleHashArray(hex_1.PointHashKey, function (e) { return e.id; }));
            var number = Math.floor((far.length / 4) * 3 + (far.length / 4) * Math.random());
            var end = far[number];
            var line = grid.getThickLine(start, end, Math.floor(Math.random() * 4) + 3);
            if (line.some(function (a) { return a.factionId !== '0'; })) {
                i--;
                continue;
            }
            for (var _d = 0, line_1 = line; _d < line_1.length; _d++) {
                var gameHexagon = line_1[_d];
                if (utils_1.Utils.random(95)) {
                    gameHexagon.setTileType(hexagonTypes_1.HexagonTypes.water(hexagonTypes_1.HexagonTypes.randomSubType()));
                }
            }
        }
        var factionDetails = {
            '1': {
                resourceCount: 10
            },
            '2': {
                resourceCount: 10
            },
            '3': {
                resourceCount: 10
            }
        };
        return {
            roundDuration: config_1.Config.gameDuration,
            roundStart: +new Date(),
            roundEnd: +new Date() + config_1.Config.gameDuration,
            generation: 1,
            resources: hashArray_1.HashArray.create(resources, hex_1.PointHashKey),
            entities: hashArray_1.DoubleHashArray.create(entities, hex_1.PointHashKey, function (e) { return e.id; }),
            factionDetails: factionDetails,
            layout: null,
            grid: grid
        };
    };
    GameLogic.buildGameFromState = function (layout, gameState) {
        var grid = new hex_1.Grid(0, 0, layout.boardWidth, layout.boardHeight);
        grid.hexes = new hashArray_1.HashArray(hex_1.PointHashKey);
        for (var i = 0; i < layout.hexes.length; i++) {
            var hex = layout.hexes[i];
            var gameHexagon = new gameHexagon_1.GameHexagon(hexagonTypes_1.HexagonTypes.get(hex.type, hex.subType), hex.id, hex.x, hex.y);
            gameHexagon.setFactionId(GameLogic.getFactionId(gameState.factions, i), GameLogic.getFactionDuration(gameState.factions, i));
            grid.hexes.push(gameHexagon);
        }
        var resources = gameState.resources.map(function (a) { return ({
            x: a.x,
            y: a.y,
            resourceType: a.type,
            currentCount: a.count
        }); });
        var entities = gameState.entities['1'].map(function (a) { return ({
            factionId: '1',
            busy: a.busy,
            id: a.id,
            health: a.health,
            x: a.x,
            y: a.y,
            entityType: a.entityType,
            healthRegenStep: a.healthRegenStep
        }); }).concat(gameState.entities['2'].map(function (a) { return ({
            factionId: '2',
            busy: a.busy,
            id: a.id,
            health: a.health,
            x: a.x,
            y: a.y,
            entityType: a.entityType,
            healthRegenStep: a.healthRegenStep
        }); }), gameState.entities['3'].map(function (a) { return ({
            factionId: '3',
            busy: a.busy,
            id: a.id,
            health: a.health,
            x: a.x,
            y: a.y,
            entityType: a.entityType,
            healthRegenStep: a.healthRegenStep
        }); }));
        return {
            roundDuration: gameState.roundDuration,
            roundStart: gameState.roundStart,
            roundEnd: gameState.roundEnd,
            generation: gameState.generation,
            factionDetails: gameState.factionDetails,
            resources: hashArray_1.HashArray.create(resources, hex_1.PointHashKey),
            entities: hashArray_1.DoubleHashArray.create(entities, hex_1.PointHashKey, function (e) { return e.id; }),
            layout: layout,
            grid: grid
        };
    };
    GameLogic.validateVote = function (game, vote) {
        var fromEntity = game.entities.get2({ id: vote.entityId });
        if (!fromEntity) {
            return voteResult_1.VoteResult.EntityNotFound;
        }
        if (fromEntity.busy) {
            return voteResult_1.VoteResult.EntityIsBusy;
        }
        if (vote.factionId !== undefined && fromEntity.factionId !== vote.factionId) {
            return voteResult_1.VoteResult.FactionMismatch;
        }
        var fromHex = game.grid.hexes.get(fromEntity);
        if (!fromHex) {
            return voteResult_1.VoteResult.FromHexNotFound;
        }
        var toHex = game.grid.hexes.find(function (a) { return a.id === vote.hexId; });
        if (!toHex) {
            return voteResult_1.VoteResult.ToHexNotFound;
        }
        var entityHash = this.getEntityHash(vote.action, game);
        var path = game.grid.findPath(fromHex, toHex, entityHash);
        if (path.length === 0) {
            return voteResult_1.VoteResult.PathIsZero;
        }
        var entityDetails = entityDetail_1.EntityDetails[fromEntity.entityType];
        var range = 0;
        switch (vote.action) {
            case 'attack':
                range = entityDetails.attackRadius;
                break;
            case 'move':
                range = entityDetails.moveRadius;
                break;
            case 'mine':
                range = entityDetails.mineRadius;
                break;
            case 'spawn-infantry':
            case 'spawn-tank':
            case 'spawn-plane':
                range = entityDetails.spawnRadius;
                break;
        }
        if (path.length > range) {
            return voteResult_1.VoteResult.PathOutOfRange;
        }
        var toEntity = game.entities.get1(toHex);
        var toResource = game.resources.get(toHex);
        switch (vote.action) {
            case 'attack':
                if (!toEntity) {
                    return voteResult_1.VoteResult.NoEntityToAttack;
                }
                if (toEntity.factionId === fromEntity.factionId) {
                    return voteResult_1.VoteResult.AttackFactionMismatch;
                }
                break;
            case 'move':
                if (toEntity) {
                    return voteResult_1.VoteResult.MoveSpotNotEmpty;
                }
                if (toResource) {
                    return voteResult_1.VoteResult.MoveSpotNotEmpty;
                }
                break;
            case 'mine':
                if (!toResource) {
                    return voteResult_1.VoteResult.NoResourceToMine;
                }
                break;
            case 'spawn-infantry':
            case 'spawn-tank':
            case 'spawn-plane':
                if (toEntity) {
                    return voteResult_1.VoteResult.SpawnSpotNotEmpty;
                }
                if (toResource) {
                    return voteResult_1.VoteResult.SpawnSpotNotEmpty;
                }
                if (entityDetails.spawnRadius === 0) {
                    return voteResult_1.VoteResult.EntityCannotSpawn;
                }
                var resourceCount = game.factionDetails[fromEntity.factionId].resourceCount;
                var spawnEntity = void 0;
                switch (vote.action) {
                    case 'spawn-infantry':
                        spawnEntity = entityDetail_1.EntityDetails.infantry;
                        break;
                    case 'spawn-tank':
                        spawnEntity = entityDetail_1.EntityDetails.tank;
                        break;
                    case 'spawn-plane':
                        spawnEntity = entityDetail_1.EntityDetails.plane;
                        break;
                }
                if (resourceCount < spawnEntity.spawnCost) {
                    return voteResult_1.VoteResult.NotEnoughResources;
                }
                break;
        }
        return voteResult_1.VoteResult.Success;
    };
    GameLogic.processVote = function (game, vote, fromBusy) {
        var fromEntity = game.entities.get2({ id: vote.entityId });
        if (!fromEntity) {
            return voteResult_1.VoteResult.EntityNotFound;
        }
        if (!fromBusy && fromEntity.busy) {
            return voteResult_1.VoteResult.EntityIsBusy;
        }
        if (vote.factionId !== undefined && fromEntity.factionId !== vote.factionId) {
            return voteResult_1.VoteResult.FactionMismatch;
        }
        var fromHex = game.grid.hexes.get(fromEntity);
        if (!fromHex) {
            return voteResult_1.VoteResult.FromHexNotFound;
        }
        var toHex = game.grid.hexes.find(function (a) { return a.id === vote.hexId; });
        if (!toHex) {
            return voteResult_1.VoteResult.ToHexNotFound;
        }
        var entityHash = this.getEntityHash(vote.action, game);
        var path = game.grid.findPath(fromHex, toHex, entityHash);
        if (path.length === 0) {
            return voteResult_1.VoteResult.PathIsZero;
        }
        var entityDetails = entityDetail_1.EntityDetails[fromEntity.entityType];
        var range = 0;
        switch (vote.action) {
            case 'attack':
                range = entityDetails.attackRadius;
                break;
            case 'move':
                range = entityDetails.moveRadius;
                break;
            case 'mine':
                range = entityDetails.mineRadius;
                break;
            case 'spawn-infantry':
            case 'spawn-tank':
            case 'spawn-plane':
                range = entityDetails.spawnRadius;
                break;
        }
        if (path.length > range) {
            return voteResult_1.VoteResult.PathOutOfRange;
        }
        var toEntity = game.entities.get1(toHex);
        var toResource = game.resources.get(toHex);
        switch (vote.action) {
            case 'attack':
                if (!toEntity) {
                    return voteResult_1.VoteResult.NoEntityToAttack;
                }
                if (toEntity.factionId === fromEntity.factionId) {
                    return voteResult_1.VoteResult.AttackFactionMismatch;
                }
                var damage = Math.floor(Math.random() * entityDetails.attackPower) + 1;
                toEntity.health -= damage;
                toEntity.healthRegenStep = 0;
                if (toEntity.health <= 0) {
                    game.entities.removeItem(toEntity);
                }
                break;
            case 'move':
                if (toEntity) {
                    return voteResult_1.VoteResult.MoveSpotNotEmpty;
                }
                if (toResource) {
                    return voteResult_1.VoteResult.MoveSpotNotEmpty;
                }
                for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
                    var pItem = path_1[_i];
                    for (var _a = 0, _b = game.grid.getCircle(pItem, 1); _a < _b.length; _a++) {
                        var gameHexagon = _b[_a];
                        gameHexagon.setFactionId(fromEntity.factionId, 3);
                    }
                }
                game.entities.moveKey1(fromEntity, fromEntity, toHex);
                fromEntity.x = toHex.x;
                fromEntity.y = toHex.y;
                break;
            case 'mine':
                if (toEntity) {
                    return voteResult_1.VoteResult.MoveSpotNotEmpty;
                }
                if (!toResource) {
                    return voteResult_1.VoteResult.NoResourceToMine;
                }
                if (!fromBusy) {
                    fromEntity.busy = {
                        ticks: 1,
                        action: 'mine',
                        hexId: vote.hexId
                    };
                }
                else {
                    for (var _c = 0, path_2 = path; _c < path_2.length; _c++) {
                        var pItem = path_2[_c];
                        for (var _d = 0, _e = game.grid.getCircle(pItem, 1); _d < _e.length; _d++) {
                            var gameHexagon = _e[_d];
                            gameHexagon.setFactionId(fromEntity.factionId, 3);
                        }
                    }
                    toResource.currentCount--;
                    if (toResource.currentCount <= 0) {
                        game.resources.removeItem(toResource);
                    }
                    switch (toResource.resourceType) {
                        case 'bronze':
                            game.factionDetails[fromEntity.factionId].resourceCount += 1;
                            break;
                        case 'silver':
                            game.factionDetails[fromEntity.factionId].resourceCount += 2;
                            break;
                        case 'gold':
                            game.factionDetails[fromEntity.factionId].resourceCount += 3;
                            break;
                    }
                }
                break;
            case 'spawn-infantry':
            case 'spawn-tank':
            case 'spawn-plane':
                if (toEntity) {
                    return voteResult_1.VoteResult.SpawnSpotNotEmpty;
                }
                if (toResource) {
                    return voteResult_1.VoteResult.SpawnSpotNotEmpty;
                }
                if (entityDetails.spawnRadius === 0) {
                    return voteResult_1.VoteResult.EntityCannotSpawn;
                }
                var resourceCount = game.factionDetails[fromEntity.factionId].resourceCount;
                var spawnEntity = void 0;
                switch (vote.action) {
                    case 'spawn-infantry':
                        spawnEntity = entityDetail_1.EntityDetails.infantry;
                        break;
                    case 'spawn-tank':
                        spawnEntity = entityDetail_1.EntityDetails.tank;
                        break;
                    case 'spawn-plane':
                        spawnEntity = entityDetail_1.EntityDetails.plane;
                        break;
                }
                if (resourceCount < spawnEntity.spawnCost) {
                    return voteResult_1.VoteResult.NotEnoughResources;
                }
                if (!fromBusy) {
                    fromEntity.busy = {
                        ticks: spawnEntity.ticksToSpawn,
                        action: vote.action,
                        hexId: vote.hexId
                    };
                }
                else {
                    game.factionDetails[fromEntity.factionId].resourceCount -= spawnEntity.spawnCost;
                    game.entities.push({
                        x: toHex.x,
                        y: toHex.y,
                        factionId: fromEntity.factionId,
                        id: this.nextId(game.entities.array),
                        health: spawnEntity.health,
                        entityType: spawnEntity.type,
                        healthRegenStep: spawnEntity.healthRegenRate
                    });
                }
                break;
        }
        return voteResult_1.VoteResult.Success;
    };
    GameLogic.getEntityHash = function (action, game) {
        var entityHash;
        switch (action) {
            case 'attack':
                entityHash = new hashArray_1.DoubleHashArray(hex_1.PointHashKey, function (e) { return e.id; });
                break;
            case 'move':
                entityHash = game.entities;
                break;
            case 'mine':
                entityHash = game.entities;
                break;
            case 'spawn-infantry':
            case 'spawn-tank':
            case 'spawn-plane':
                entityHash = game.entities;
                break;
        }
        return entityHash;
    };
    GameLogic.getFactionId = function (factions, index) {
        return factions.charAt(index * 2);
    };
    GameLogic.getFactionDuration = function (factions, index) {
        return parseInt(factions.charAt(index * 2 + 1));
    };
    GameLogic.id = 0;
    return GameLogic;
}());
exports.GameLogic = GameLogic;
