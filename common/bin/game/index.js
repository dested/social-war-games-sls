"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hex_1 = require("../hex/hex");
class GameEntity {
}
exports.GameEntity = GameEntity;
class GameLogic {
    static buildGame(layout, gameState) {
        const grid = new hex_1.Grid(0, 0, 50, 50);
        const factions = gameState.factions.split('');
        for (let i = 0; i < layout.hexes.length; i++) {
            const hex = layout.hexes[i];
            const gameHexagon = new GameHexagon(HexagonTypes.get(hex.type, hex.subType), hex.id, hex.x, hex.y);
            gameHexagon.setFactionId(factions[i]);
            grid.hexes.push(gameHexagon);
        }
        const entities = [
            ...gameState.entities['1'].map(a => ({
                factionId: '1',
                id: a.id,
                health: a.health,
                x: a.x,
                y: a.y,
                entityType: a.entityType
            })),
            ...gameState.entities['2'].map(a => ({
                factionId: '2',
                id: a.id,
                health: a.health,
                x: a.x,
                y: a.y,
                entityType: a.entityType
            })),
            ...gameState.entities['3'].map(a => ({
                factionId: '3',
                id: a.id,
                health: a.health,
                x: a.x,
                y: a.y,
                entityType: a.entityType
            }))
        ];
        return {
            generation: gameState.generation,
            grid,
            entities
        };
    }
    static createGame() {
        const grid = new hex_1.Grid(0, 0, 50, 50);
        const entities = [];
        for (let y = 0; y < 50; y++) {
            for (let x = -Math.floor(y / 2); x < 50 - Math.floor(y / 2); x++) {
                grid.hexes.push(new GameHexagon(HexagonTypes.dirt(HexagonTypes.randomSubType()), `${x}-${y}`, x, y));
            }
        }
        const center1 = grid.easyBounds(Math.floor(grid.boundsWidth * (1 / 3)), Math.floor(grid.boundsHeight * (1 / 3)));
        const center2 = grid.easyBounds(Math.floor(grid.boundsWidth * (2 / 3)), Math.floor(grid.boundsHeight * (1 / 3)));
        const center3 = grid.easyBounds(Math.floor(grid.boundsWidth * (1 / 2)) - 1, Math.floor(grid.boundsHeight * (2 / 3)));
        for (const hex of grid.getCircle(center1, 7)) {
            hex.setFactionId('1');
        }
        for (const hex of grid.getCircle(center2, 7)) {
            hex.setFactionId('2');
        }
        for (const hex of grid.getCircle(center3, 7)) {
            hex.setFactionId('3');
        }
        /*   for (let i = 0; i < 30; i++) {
            const center = grid.hexes[Math.floor(Math.random() * grid.hexes.length)];
            if (center.factionId === '0') {
                i--;
                continue;
            }
            const newSpot = grid.hexes[Math.floor(Math.random() * grid.hexes.length)];

            for (const gameHexagon of grid.getLine(center, newSpot)) {
                gameHexagon.setFactionId(center.factionId);
            }
        }*/
        for (let i = 0; i < 120; i++) {
            const center = grid.hexes[Math.floor(Math.random() * grid.hexes.length)];
            const type = Math.random() * 100 < 60
                ? HexagonTypes.grass
                : Math.random() * 100 < 50 ? HexagonTypes.clay : HexagonTypes.stone;
            for (const gameHexagon of grid.getCircle(center, Math.floor(Math.random() * 4))) {
                gameHexagon.setTileType(type(HexagonTypes.randomSubType()));
            }
        }
        for (let i = 1; i <= 3; i++) {
            const factionId = i.toString();
            for (let i = 0; i < 30; i++) {
                const hex = grid.hexes[Math.floor(Math.random() * grid.hexes.length)];
                if (hex.factionId !== factionId) {
                    i--;
                    continue;
                }
                if (entities.find(a => a.x === hex.x && a.y === hex.y))
                    continue;
                entities.push({
                    id: this.nextId(),
                    factionId: hex.factionId,
                    health: 10,
                    x: hex.x,
                    y: hex.y,
                    entityType: Math.random() * 100 < 65 ? 'infantry' : Math.random() * 100 < 60 ? 'tank' : 'plane'
                });
            }
        }
        entities.push({
            id: this.nextId(),
            factionId: '1',
            health: 20,
            x: center1.x,
            y: center1.y,
            entityType: 'factory'
        });
        entities.push({
            id: this.nextId(),
            factionId: '2',
            health: 20,
            x: center2.x,
            y: center2.y,
            entityType: 'factory'
        });
        entities.push({
            id: this.nextId(),
            factionId: '3',
            health: 20,
            x: center3.x,
            y: center3.y,
            entityType: 'factory'
        });
        const line = [
            ...grid.getLine(grid.easyBounds(3, 0), grid.easyBounds(3, 25)),
            ...grid.getLine(grid.easyBounds(4, 0), grid.easyBounds(4, 25)),
            ...grid.getLine(grid.easyBounds(5, 0), grid.easyBounds(5, 25))
        ];
        for (const gameHexagon of line) {
            gameHexagon.setTileType(HexagonTypes.water(HexagonTypes.randomSubType()));
        }
        return {
            generation: 1,
            grid,
            entities
        };
    }
    static nextId() {
        return (++this.id).toString();
    }
    static validateVote(game, vote) {
        const entity = game.entities.find(a => a.id === vote.entityId);
        if (!entity)
            return false;
        if (entity.factionId !== vote.factionId)
            return false;
        const fromHex = game.grid.hexes.find(a => a.x === entity.x && a.y === entity.y);
        if (!fromHex)
            return false;
        const toHex = game.grid.hexes.find(a => a.id === vote.hexId);
        if (!toHex)
            return false;
        const path = game.grid.findPath(fromHex, toHex);
        if (path.length === 0)
            return false;
        const entityDetails = exports.EntityDetails[entity.entityType];
        let range = 0;
        switch (vote.action) {
            case 'attack':
                range = entityDetails.attackRadius;
                break;
            case 'move':
                range = entityDetails.moveRadius;
                break;
            case 'spawn':
                range = entityDetails.spawnRadius;
                break;
        }
        if (path.length > range)
            return false;
        const toEntity = game.entities.find(a => a.x === toHex.x && a.y === toHex.y);
        switch (vote.action) {
            case 'attack':
                if (!toEntity)
                    return false;
                if (toEntity.factionId === entity.factionId) {
                    return false;
                }
                break;
            case 'move':
                if (toEntity)
                    return false;
                break;
            case 'spawn':
                if (toEntity)
                    return false;
                if (entityDetails.spawnRadius === 0)
                    return false;
                break;
        }
        return true;
    }
    static processVote(game, vote) {
        const entity = game.entities.find(a => a.id === vote.entityId);
        if (!entity)
            return false;
        if (entity.factionId !== vote.factionId)
            return false;
        const fromHex = game.grid.hexes.find(a => a.x === entity.x && a.y === entity.y);
        if (!fromHex)
            return false;
        const toHex = game.grid.hexes.find(a => a.id === vote.hexId);
        if (!toHex)
            return false;
        const path = game.grid.findPath(fromHex, toHex);
        if (path.length === 0)
            return false;
        const entityDetails = exports.EntityDetails[entity.entityType];
        let range = 0;
        switch (vote.action) {
            case 'attack':
                range = entityDetails.attackRadius;
                break;
            case 'move':
                range = entityDetails.moveRadius;
                break;
            case 'spawn':
                range = entityDetails.spawnRadius;
                break;
        }
        if (path.length > range)
            return false;
        const toEntity = game.entities.find(a => a.x === toHex.x && a.y === toHex.y);
        switch (vote.action) {
            case 'attack':
                if (!toEntity)
                    return false;
                if (toEntity.factionId === entity.factionId) {
                    return false;
                }
                break;
            case 'move':
                if (toEntity)
                    return false;
                break;
            case 'spawn':
                if (toEntity)
                    return false;
                if (entityDetails.spawnRadius === 0)
                    return false;
                break;
        }
        return true;
    }
}
GameLogic.id = 0;
exports.GameLogic = GameLogic;
class HexagonTypes {
    static randomSubType() {
        if (Math.random() * 100 < 90)
            return '1';
        return (Math.floor(Math.random() * 5) + 1).toString();
    }
    static get(type, subType) {
        switch (type) {
            case 'Dirt':
                return this.dirt(subType);
            case 'Clay':
                return this.clay(subType);
            case 'Grass':
                return this.grass(subType);
            case 'Stone':
                return this.stone(subType);
            case 'Water':
                return this.water(subType);
        }
    }
}
HexagonTypes.dirt = (subType) => ({
    type: 'Dirt',
    subType,
    cost: 1,
    blocked: false
});
HexagonTypes.grass = (subType) => ({
    type: 'Grass',
    subType,
    cost: 2,
    blocked: false
});
HexagonTypes.clay = (subType) => ({
    type: 'Clay',
    subType,
    cost: 3,
    blocked: false
});
HexagonTypes.stone = (subType) => ({
    type: 'Stone',
    subType,
    cost: 4,
    blocked: false
});
HexagonTypes.water = (subType) => ({
    type: 'Water',
    subType,
    cost: 0,
    blocked: true
});
exports.HexagonTypes = HexagonTypes;
exports.EntityDetails = {
    ['factory']: {
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
        moveRadius: 4,
        health: 8,
        attackRadius: 8,
        attackPower: 3,
        ticksToSpawn: 3,
        healthRegenRate: 1,
        solid: false,
        spawnRadius: 0
    },
    ['plane']: {
        moveRadius: 10,
        health: 2,
        attackRadius: 3,
        attackPower: 3,
        ticksToSpawn: 4,
        healthRegenRate: 1,
        solid: false,
        spawnRadius: 0
    },
    ['infantry']: {
        moveRadius: 8,
        health: 4,
        attackRadius: 3,
        attackPower: 1,
        ticksToSpawn: 2,
        healthRegenRate: 1,
        solid: false,
        spawnRadius: 2
    }
};
class GameHexagon extends hex_1.Hexagon {
    constructor(tileType, id, x, y) {
        super(x, y, tileType.cost, tileType.blocked);
        this.tileType = tileType;
        this.id = id;
        this.factionId = '0';
    }
    setTileType(tileType) {
        this.tileType = tileType;
        this.cost = tileType.cost;
        this.blocked = tileType.blocked;
    }
    setFactionId(factionId) {
        this.factionId = factionId;
    }
}
exports.GameHexagon = GameHexagon;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2FtZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9DQUFnRDtBQVFoRDtDQU9DO0FBUEQsZ0NBT0M7QUFFRDtJQUtJLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBa0IsRUFBRSxTQUFvQjtRQUNyRCxNQUFNLElBQUksR0FBRyxJQUFJLFVBQUksQ0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqRCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUU5QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDMUMsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLFdBQVcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkcsV0FBVyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFjLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNoQztRQUVELE1BQU0sUUFBUSxHQUFpQjtZQUMzQixHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDakMsU0FBUyxFQUFFLEdBQWdCO2dCQUMzQixFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO2dCQUNoQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ04sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNOLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVTthQUMzQixDQUFDLENBQUM7WUFDSCxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDakMsU0FBUyxFQUFFLEdBQWdCO2dCQUMzQixFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO2dCQUNoQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ04sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNOLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVTthQUMzQixDQUFDLENBQUM7WUFDSCxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDakMsU0FBUyxFQUFFLEdBQWdCO2dCQUMzQixFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO2dCQUNoQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ04sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNOLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVTthQUMzQixDQUFDLENBQUM7U0FDTixDQUFDO1FBRUYsT0FBTztZQUNILFVBQVUsRUFBRSxTQUFTLENBQUMsVUFBVTtZQUNoQyxJQUFJO1lBQ0osUUFBUTtTQUNYLENBQUM7SUFDTixDQUFDO0lBRUQsTUFBTSxDQUFDLFVBQVU7UUFDYixNQUFNLElBQUksR0FBRyxJQUFJLFVBQUksQ0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqRCxNQUFNLFFBQVEsR0FBaUIsRUFBRSxDQUFDO1FBRWxDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDekIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzlELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDeEc7U0FDSjtRQUVELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FDMUMsQ0FBQztRQUNGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FDMUMsQ0FBQztRQUNGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQzFDLENBQUM7UUFFRixLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQzFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDekI7UUFDRCxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQzFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDekI7UUFFRCxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQzFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDekI7UUFFRDs7Ozs7Ozs7Ozs7V0FXRztRQUVILEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDekUsTUFBTSxJQUFJLEdBQ04sSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFO2dCQUNwQixDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUs7Z0JBQ3BCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENB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