"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hex_1 = require("swg-common/bin/hex/hex");
const hex_2 = require("../../../common/src/hex/hex");
class GameLogic {
    static createGame() {
        const grid = new hex_1.Grid();
        for (let y = 0; y < 30; y++) {
            for (let x = -y; x < 30 - y; x++) {
                grid.hexes.push(new GameHexagon(HexagonTypes.dirt, (Math.random() * 5656468).toString(), x, y));
            }
        }
        const line = grid.getLine(new hex_2.Axial());
        for (let y = 0; y < 30; y++) {
            for (let x = 3 - y; x < 7 - y; x++) {
                grid.getHexAt({ x, y }).setType(HexagonTypes.grass);
            }
        }
        for (let i = 0; i < 40; i++) {
            grid.hexes[Math.floor(Math.random() * grid.hexes.length)].setType(HexagonTypes.stone);
        }
        for (let i = 0; i < 40; i++) {
            grid.hexes[Math.floor(Math.random() * grid.hexes.length)].setType(HexagonTypes.clay);
        }
        return grid;
    }
}
exports.GameLogic = GameLogic;
class HexagonTypes {
}
HexagonTypes.dirt = {
    type: 'Dirt',
    cost: 0,
    blocked: false
};
HexagonTypes.grass = {
    type: 'Grass',
    cost: 1,
    blocked: false
};
HexagonTypes.stone = {
    type: 'Stone',
    cost: 4,
    blocked: false
};
HexagonTypes.clay = {
    type: 'Clay',
    cost: 3,
    blocked: false
};
exports.HexagonTypes = HexagonTypes;
class GameHexagon extends hex_2.Hexagon {
    constructor(type, id, x, y) {
        super(x, y, type.cost, type.blocked);
        this.type = type;
        this.id = id;
    }
    setType(type) {
        this.type = type;
        this.cost = type.cost;
        this.blocked = type.blocked;
    }
}
exports.GameHexagon = GameHexagon;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZ2FtZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUE0QztBQUM1QyxxREFBMkQ7QUFFM0Q7SUFDSSxNQUFNLENBQUMsVUFBVTtRQUNiLE1BQU0sSUFBSSxHQUFHLElBQUksVUFBSSxFQUFlLENBQUM7UUFDckMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN6QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLFdBQVcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2hHO1NBQ0o7UUFFRCxNQUFNLElBQUksR0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksV0FBSyxFQUFFLENBQUMsQ0FBQTtRQUVwQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDckQ7U0FDSjtRQUNELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN6RjtRQUNELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4RjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSjtBQXhCRCw4QkF3QkM7QUFVRDs7QUFDVyxpQkFBSSxHQUFnQjtJQUN2QixJQUFJLEVBQUUsTUFBTTtJQUNaLElBQUksRUFBRSxDQUFDO0lBQ1AsT0FBTyxFQUFFLEtBQUs7Q0FDakIsQ0FBQztBQUNLLGtCQUFLLEdBQWdCO0lBQ3hCLElBQUksRUFBRSxPQUFPO0lBQ2IsSUFBSSxFQUFFLENBQUM7SUFDUCxPQUFPLEVBQUUsS0FBSztDQUNqQixDQUFDO0FBQ0ssa0JBQUssR0FBZ0I7SUFDeEIsSUFBSSxFQUFFLE9BQU87SUFDYixJQUFJLEVBQUUsQ0FBQztJQUNQLE9BQU8sRUFBRSxLQUFLO0NBQ2pCLENBQUM7QUFDSyxpQkFBSSxHQUFnQjtJQUN2QixJQUFJLEVBQUUsTUFBTTtJQUNaLElBQUksRUFBRSxDQUFDO0lBQ1AsT0FBTyxFQUFFLEtBQUs7Q0FDakIsQ0FBQztBQXBCTixvQ0FxQkM7QUFFRCxpQkFBeUIsU0FBUSxhQUFPO0lBQ3BDLFlBQW1CLElBQWlCLEVBQVMsRUFBVSxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQ3pFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRHRCLFNBQUksR0FBSixJQUFJLENBQWE7UUFBUyxPQUFFLEdBQUYsRUFBRSxDQUFRO0lBRXZELENBQUM7SUFFRCxPQUFPLENBQUMsSUFBaUI7UUFDckIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUNoQyxDQUFDO0NBQ0o7QUFWRCxrQ0FVQyJ9