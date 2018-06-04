import {GameState, GameStateEntityMap} from '@swg-common/models/gameState';
import {RoundState} from '@swg-common/models/roundState';
import {S3Manager} from '@swg-server-common/s3/s3Manager';
import {GameLayout} from '@swg-common/models/gameLayout';
import {Point, PointHashKey} from '@swg-common/hex/hex';
import {HashArray} from '@swg-common/utils/hashArray';
import {GameModel} from '@swg-common/game/gameLogic';
import {EntityDetails, FactionId, GameEntity} from '@swg-common/game/entityDetail';

export class S3Splitter {
    static async output(
        game: GameModel,
        layout: GameLayout,
        gameState: GameState,
        roundState: RoundState,
        outputGameState: boolean
    ) {
        // console.time('factionId split');
        const factions = ['1', '2', '3'];
        const factionList = gameState.factions.split('');
        const emptyEntityList = new HashArray<GameEntity, Point>(PointHashKey);
        for (let i = 0; i < factions.length; i++) {
            const factionId = factions[i] as FactionId;
            const visibleHexes = new HashArray<Point>(PointHashKey);

            for (let h = 0; h < layout.hexes.length; h++) {
                const hex = layout.hexes[h];
                if (factionId === factionList[h]) {
                    for (const gameHexagon of game.grid.getCircle(hex, 2)) {
                        visibleHexes.push(gameHexagon);
                    }
                }
            }

            const factionEntities = gameState.entities[factionId];
            if (!factionEntities) {
                console.log(gameState.entities, factionId);
            }

            for (let i = 0; i < factionEntities.length; i++) {
                const entity = factionEntities[i];
                const entityDetails = EntityDetails[entity.entityType];
                const radius = Math.max(
                    entityDetails.attackRadius,
                    entityDetails.moveRadius,
                    entityDetails.spawnRadius
                );
                const hexAt = game.grid.getHexAt(entity);
                visibleHexes.pushRange(game.grid.getRange(hexAt, radius, emptyEntityList).map(a => a));
            }

            const factionGameState = this.filterItems(layout, gameState, visibleHexes);

            const gameStateJson = JSON.stringify(factionGameState);
            const roundStateJson = JSON.stringify(roundState);
            if (outputGameState) {
                /*await*/ S3Manager.uploadJson(`game-state-${factionId}.json`, gameStateJson);
            }
            /*await*/ S3Manager.uploadJson(`round-state-${factionId}.json`, roundStateJson);
        }
        // console.timeEnd('factionId split');
    }

    private static filterItems(layout: GameLayout, gameState: GameState, visibleHexes: HashArray<Point>): GameState {
        const entities = gameState.entities;

        const factions = ['1', '2', '3'];
        const visibleEntities: GameStateEntityMap = {
            '0': [],
            '1': [],
            '2': [],
            '3': [],
            '9': []
        };
        for (let i = 0; i < factions.length; i++) {
            const faction = factions[i] as FactionId;
            for (let i = 0; i < entities[faction].length; i++) {
                const entity = entities[faction][i];
                if (visibleHexes.exists(entity)) {
                    visibleEntities[faction].push(entity);
                }
            }
        }

        const factionStr = [];
        for (let h = 0; h < layout.hexes.length; h++) {
            const hex = layout.hexes[h];
            if (visibleHexes.exists(hex)) {
                factionStr.push(gameState.factions[h]);
            } else {
                factionStr.push(9);
            }
        }
        return {...gameState, entities: visibleEntities, factions: factionStr.join('')};
    }
}
