import {GameState, GameStateEntityMap, GameStateResource} from '@swg-common/models/gameState';
import {RoundState, RoundStateEntityVote} from '@swg-common/models/roundState';
import {S3Manager} from '@swg-server-common/s3/s3Manager';
import {Point, PointHashKey} from '@swg-common/hex/hex';
import {DoubleHashArray, HashArray} from '@swg-common/utils/hashArray';
import {GameLogic, GameModel} from '@swg-common/game/gameLogic';
import {EntityDetails, Factions, GameEntity, PlayableFactionId} from '@swg-common/game/entityDetail';
import {GameLayout} from '@swg-common/models/gameLayout';
import {SocketManager} from './socketManager';
import {RoundStateParser} from '@swg-common/utils/RoundStateParser';

export class S3Splitter {
    static async output(
        game: GameModel,
        layout: GameLayout,
        gameState: GameState,
        roundState: RoundState,
        outputGameState: boolean
    ) {
        // console.time('faction split');
        const emptyEntityList = new DoubleHashArray<GameEntity, Point, {id: number}>(PointHashKey, e => e.id);

        for (const faction of Factions) {
            const visibleHexes = new HashArray<Point>(PointHashKey);

            for (let h = 0; h < layout.hexes.length; h++) {
                const hex = layout.hexes[h];
                if (faction === GameLogic.getFactionId(gameState.factions, h)) {
                    for (const gameHexagon of game.grid.getCircle(hex, 2)) {
                        visibleHexes.push(gameHexagon);
                    }
                }
            }

            const factionEntities = gameState.entities[faction];

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

            const [factionGameState, factionRoundState] = this.filterItems(
                layout,
                gameState,
                roundState,
                faction,
                visibleHexes
            );

            const gameStateJson = JSON.stringify(factionGameState);
            const roundStateJson = RoundStateParser.fromRoundState(factionRoundState);
            if (outputGameState) {
                await S3Manager.uploadJson(`game-state-${faction}.json`, gameStateJson);
            }
            /*await*/ SocketManager.publish(`round-state-${faction}`, roundStateJson);
            // /*await*/ S3Manager.uploadJson(`round-state-${faction}.json`, roundStateJson);
        }
        // console.timeEnd('faction split');
    }

    private static filterItems(
        layout: GameLayout,
        gameState: GameState,
        roundState: RoundState,
        factionId: PlayableFactionId,
        visibleHexes: HashArray<Point>
    ): [GameState, RoundState] {
        const entities = gameState.entities;
        const visibleEntityVotes: {[id: string]: RoundStateEntityVote[]} = {};
        const visibleResources: GameStateResource[] = [];

        const visibleEntities: GameStateEntityMap = {
            '1': [],
            '2': [],
            '3': []
        };

        const visibleFactionDetails = {...gameState.factionDetails};

        for (const faction of Factions) {
            if (faction !== factionId) {
                delete visibleFactionDetails[faction];
            }
        }

        for (const resource of gameState.resources) {
            if (visibleHexes.exists(resource)) {
                visibleResources.push(resource);
            }
        }

        for (let i = 0; i < Factions.length; i++) {
            const faction = Factions[i];
            for (let i = 0; i < entities[faction].length; i++) {
                const entity = entities[faction][i];

                if (visibleHexes.exists(entity)) {
                    if (faction !== factionId) {
                        visibleEntities[faction].push({...entity, busy: null});
                    } else {
                        visibleEntities[faction].push(entity);
                    }
                }

                if (faction === factionId) {
                    if (roundState.entities[entity.id]) {
                        visibleEntityVotes[entity.id] = roundState.entities[entity.id];
                    }
                }
            }
        }

        const factionStr = [];
        for (let h = 0; h < layout.hexes.length; h++) {
            const hex = layout.hexes[h];
            if (visibleHexes.exists(hex)) {
                factionStr.push(GameLogic.getFactionId(gameState.factions, h));
                factionStr.push(GameLogic.getFactionDuration(gameState.factions, h));
            } else {
                factionStr.push(9);
                factionStr.push(0);
            }
        }

        return [
            {
                ...gameState,
                resources: visibleResources,
                factionDetails: visibleFactionDetails,
                entities: visibleEntities,
                factions: factionStr.join('')
            },
            {...roundState, entities: visibleEntityVotes}
        ];
    }
}
