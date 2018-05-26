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
    cost: 0,
    blocked: false
});
HexagonTypes.grass = (subType) => ({
    type: 'Grass',
    subType,
    cost: 1,
    blocked: false
});
HexagonTypes.stone = (subType) => ({
    type: 'Stone',
    subType,
    cost: 3,
    blocked: false
});
HexagonTypes.clay = (subType) => ({
    type: 'Clay',
    subType,
    cost: 2,
    blocked: false
});
HexagonTypes.water = (subType) => ({
    type: 'Water',
    subType,
    cost: 0,
    blocked: true
});
exports.HexagonTypes = HexagonTypes;
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