import * as _ from 'lodash';
import {RedisManager} from '@swg-server-common/redis/redisManager';
import {GameState} from '@swg-common/models/gameState';
import {Config} from '@swg-server-common/config';
import {DataManager} from '@swg-server-common/db/dataManager';
import {DBVote, VoteCountResult} from '@swg-server-common/db/models/dbVote';
import {GameLayout} from '@swg-common/models/gameLayout';
import {S3Splitter} from './s3Splitter';
import {StateManager} from './stateManager';
import {GameLogic, GameModel, ProcessedVote} from '@swg-common/game/gameLogic';
import {VoteResult} from '@swg-common/game/voteResult';
import {
    EntityAction,
    EntityDetails,
    EntityTypeNames,
    FactionNames,
    Factions,
    GameEntity
} from '@swg-common/game/entityDetail';
import {FactionStats} from '@swg-common/models/factionStats';
import {S3Manager} from '@swg-server-common/s3/s3Manager';
import {Utils} from '@swg-common/utils/utils';
import {VoteNote} from '@swg-common/models/voteNote';
import {GameResource} from '@swg-common/game/gameResource';
import {FactionRoundStats, RoundStats} from '@swg-common/models/roundStats';
import {DBRoundStats} from '@swg-server-common/db/models/dbRoundStats';
import {DBUserRoundStats} from '@swg-server-common/db/models/dbUserRoundStats';
import {SocketManager} from './socketManager';

export class Worker {
    private static redisManager: RedisManager;

    static start() {
        this.work().catch(er => {
            console.error(er);
            process.exit(0);
        });
    }

    static async work() {
        console.log('booting');
        this.redisManager = await RedisManager.setup();
        await DataManager.openDbConnection();
        await SocketManager.open();

        console.log('connected to redis');

        await this.processNewRound();

        const stdin = process.openStdin();

        stdin.addListener('data', d => {
            this.processNewRound();
        });
    }

    private static async processNewRound() {
        try {
            console.time('round end');
            console.log('round end');
            await this.redisManager.set('stop', true);
            const generation = await this.redisManager.get<number>('game-generation');
            console.log('gen gen ' + generation);

            const game = GameLogic.buildGameFromState(
                await this.redisManager.get<GameLayout>('layout'),
                await this.redisManager.get<GameState>('game-state')
            );

            const preVoteEntities = JSON.parse(JSON.stringify(game.entities.array));
            const preVoteResources = JSON.parse(JSON.stringify(game.resources.array));

            const voteCounts = (await DBVote.getVoteCount(generation)).sort(
                (left, right) => _.sumBy(left.actions, a => a.count) - _.sumBy(right.actions, a => a.count)
            );

            for (const gameEntity of game.entities.filter(a => a.busy)) {
                gameEntity.busy.ticks--;
                if (gameEntity.busy.ticks === 0) {
                    const voteResult = GameLogic.processVote(
                        game,
                        {
                            factionId: gameEntity.factionId,
                            action: gameEntity.busy.action,
                            hexId: gameEntity.busy.hexId,
                            entityId: gameEntity.id,
                            voteCount: 0
                        },
                        true
                    );

                    if (voteResult !== VoteResult.Success) {
                        console.log('Busy vote failed:', voteResult);
                    }
                    gameEntity.busy = undefined;
                }
            }

            const winningVotes: ProcessedVote[] = [];
            for (const voteCount of voteCounts) {
                const actions = _.orderBy(voteCount.actions, a => a.count, 'desc');
                for (let index = 0; index < actions.length; index++) {
                    const action = actions[index];
                    const entity = game.entities.get2({id: voteCount._id});
                    if (!entity) {
                        // TODO REPLACE WITH DEAD ENTITY
                        continue;
                    }
                    const vote: ProcessedVote = {
                        entityId: voteCount._id,
                        action: action.action,
                        factionId: entity.factionId,
                        hexId: action.hexId,
                        voteCount: action.count
                    };

                    let voteResult = GameLogic.validateVote(game, vote);
                    if (voteResult === VoteResult.Success) {
                        voteResult = GameLogic.processVote(game, vote, false);
                        if (voteResult !== VoteResult.Success) {
                            console.log('Process vote failed:', voteResult);
                            continue;
                        }
                        winningVotes.push(vote);
                        break;
                    } else {
                        console.log('Vote failed:', voteResult);
                    }
                }
            }

            this.postVoteTasks(game);

            console.log('Executed Votes', winningVotes.length);

            this.writeFactionStats(game);
            await this.buildRoundStats(game, preVoteEntities, preVoteResources, winningVotes, voteCounts);

            console.log('gen gen1 ' + (await this.redisManager.get<number>('game-generation')) + ' ' + game.generation);

            game.generation++;
            await this.redisManager.incr('game-generation');

            const newGameState = StateManager.buildGameState(game);

            const roundState = StateManager.buildRoundState(game.generation, +new Date() + Config.gameDuration, []);
            await this.redisManager.set<number>('nextGenerationUpdate', +new Date() + Config.gameDuration);
            console.log(`GENERATION ${game.generation}`);
            await S3Splitter.output(game, game.layout, newGameState, roundState, true);

            await this.redisManager.set('game-state', newGameState);
            await this.redisManager.set('stop', false);

            if (game.generation < 10000000) {
                setTimeout(() => {
                    this.processNewRound();
                }, Config.gameDuration);
            }

            for (
                let roundUpdateTick = Config.roundUpdateDuration;
                roundUpdateTick < Config.gameDuration;
                roundUpdateTick += Config.roundUpdateDuration
            ) {
                setTimeout(() => {
                    this.processRoundUpdate();
                }, roundUpdateTick);
            }

            console.timeEnd('round end');
            this.cleanupVotes();
            DBUserRoundStats.buildLadder(generation);
        } catch (ex) {
            console.error(ex);
        }
    }

    private static postVoteTasks(game: GameModel) {
        for (let i = 0; i < game.entities.array.length; i++) {
            const entity = game.entities.array[i];
            const details = EntityDetails[entity.entityType];
            if (details.healthRegenRate >= 0) {
                entity.healthRegenStep++;
                if (entity.healthRegenStep >= details.healthRegenRate) {
                    if (entity.health < details.health) {
                        entity.health++;
                        entity.healthRegenStep = 0;
                    }
                    entity.healthRegenStep = 0;
                }
            }

            if (entity.entityType === 'factory') {
                for (const gameHexagon of game.grid.getCircle({x: entity.x, y: entity.y}, 5)) {
                    gameHexagon.setFactionId(entity.factionId, 3);
                }
            }
        }

        for (let i = 0; i < game.entities.array.length; i++) {
            const entity = game.entities.array[i];
            const details = EntityDetails[entity.entityType];
            if (entity.entityType !== 'factory') {
                for (const gameHexagon of game.grid.getCircle({x: entity.x, y: entity.y}, 1)) {
                    gameHexagon.setFactionId(entity.factionId, 3);
                }
            }
        }

        for (let i = 0; i < game.entities.array.length; i++) {
            const entity = game.entities.array[i];
            const details = EntityDetails[entity.entityType];
            if (entity.entityType !== 'factory') {
                game.grid.getHexAt({x: entity.x, y: entity.y}).setFactionId(entity.factionId, 3);
            }
        }

        const hexes = game.grid.hexes.array;
        for (let h = 0; h < hexes.length; h++) {
            const hex = hexes[h];
            if (hex.factionDuration === 1) {
                hex.factionDuration = 0;
                hex.factionId = '0';
            } else if (hex.factionDuration > 0) {
                hex.factionDuration--;
            }
        }
    }

    private static async processRoundUpdate() {
        try {
            console.time('round update');
            console.log('update round state');
            const generation = await this.redisManager.get<number>('game-generation', 1);
            const gameState = await this.redisManager.get<GameState>('game-state');
            const layout = await this.redisManager.get<GameLayout>('layout');
            const nextGenerationUpdate = await this.redisManager.get<number>('nextGenerationUpdate');
            const game = GameLogic.buildGameFromState(layout, gameState);

            const voteCounts = await DBVote.getVoteCount(generation);
            await S3Splitter.output(
                game,
                layout,
                gameState,
                StateManager.buildRoundState(generation, nextGenerationUpdate, voteCounts),
                false
            );
            console.timeEnd('round update');
        } catch (ex) {
            console.error(ex);
        }
    }

    private static async cleanupVotes() {
        try {
            console.log('destroying votes');
            const generation = await this.redisManager.get<number>('game-generation', 1);

            // todo, aggregate votes and store them for users later
            await DBVote.db.deleteMany(DBVote.db.query.parse((a, gen) => a.generation < gen, generation - 2));
        } catch (ex) {
            console.error(ex);
        }
    }

    private static writeFactionStats(game: GameModel) {
        const factionStats: FactionStats = Utils.mapToObj(Factions, faction => {
            const factionHexes = game.grid.hexes.map(a => a.factionId);
            const hexCount = factionHexes.filter(a => a === faction).length;
            return {
                hexCount,
                hexPercent: hexCount / factionHexes.length,
                resourceCount: game.factionDetails[faction].resourceCount,
                score: GameLogic.calculateScore(game, faction)
            };
        });

        S3Manager.uploadJson(`faction-stats.json`, JSON.stringify(factionStats));
    }

    private static async buildRoundStats(
        game: GameModel,
        preVoteEntities: GameEntity[],
        preVoteResources: GameResource[],
        winningVotes: ProcessedVote[],
        voteCounts: VoteCountResult[]
    ) {
        const userStats = await DBVote.getRoundUserStats(game.generation);

        const actionToWeight = (a: EntityAction) => {
            switch (a) {
                case 'attack':
                    return 0;
                case 'mine':
                    return 1;
                case 'spawn-plane':
                    return 2;
                case 'spawn-tank':
                    return 3;
                case 'spawn-infantry':
                    return 4;
                case 'move':
                    return 5;
            }
            return 100;
        };

        const notes = Utils.mapMany(
            winningVotes.sort((a, b) => actionToWeight(a.action) - actionToWeight(b.action)),
            a => this.buildNote(a, game, preVoteEntities, preVoteResources)
        );

        const userStatsGrouped = Utils.arrayToDictionary(userStats, a => a._id.userId);

        const playersVoted = Utils.groupByReduce(
            userStats,
            a => a._id.factionId,
            a => Object.keys(Utils.groupBy(a, a => a._id.userId))
        );

        const roundStats: RoundStats = {
            generation: game.generation,
            winningVotes: Utils.mapToObj(Factions, faction => winningVotes.filter(a => a.factionId === faction)),
            playersVoted: Utils.mapObjToObj(playersVoted, (_, p) => p.length),
            scores: Utils.mapToObj(Factions, faction => GameLogic.calculateScore(game, faction)),
            hotEntities: Utils.mapToObj(Factions, faction =>
                voteCounts
                    .filter(vote => preVoteEntities.find(ent => ent.id === vote._id).factionId === faction)
                    .sort(
                        (vote1, vote2) =>
                            Utils.sum(vote1.actions, v => v.count) - Utils.sum(vote2.actions, v => v.count)
                    )
                    .map(vote => ({id: vote._id, count: Utils.sum(vote.actions, v => v.count)}))
                    .slice(0, 10)
            ),
            notes: Utils.mapToObj(Factions, faction => notes.filter(a => a.factionId === faction))
        };

        const dbRoundStats = new DBRoundStats(roundStats);
        /*await*/ DBRoundStats.db.insertDocument(dbRoundStats);

        const players = Utils.flattenArray(Utils.mapObjToArray(playersVoted, (_, ar) => ar));

        for (let i = 0; i < players.length; i++) {
            const player = players[i];

            const votesByUser = userStatsGrouped[player];

            const votesCast = votesByUser ? votesByUser.count : 0;

            const winningUserVotes = votesByUser.votes.filter(v =>
                winningVotes.find(w => w.action === v.action && w.hexId === v.hexId && w.entityId === v.entityId)
            );

            const votesWon = winningUserVotes.length;
            let damageDone = 0;
            let unitsDestroyed = 0;
            let unitsCreated = 0;
            let resourcesMined = 0;
            let distanceMoved = 0;

            for (const winningUserVote of winningUserVotes) {
                const fromEntity = preVoteEntities.find(a => a.id === winningUserVote.entityId);
                const fromHex = game.grid.hexes.get(fromEntity);
                const toHex = game.grid.hexes.find(a => a.id === winningUserVote.hexId);

                switch (winningUserVote.action) {
                    case 'attack': {
                        const toEntity = preVoteEntities.find(a => a.x === toHex.x && a.y === toHex.y);
                        const toEntityResult = game.entities.get2(toEntity);
                        damageDone += toEntityResult ? toEntity.health - toEntityResult.health : toEntity.health;
                        unitsDestroyed += toEntityResult ? 0 : 1;
                        break;
                    }

                    case 'move': {
                        distanceMoved += game.grid.getDistance(fromHex, toHex);
                        break;
                    }
                    case 'mine': {
                        const resource = preVoteResources.find(a => a.x === toHex.x && a.y === toHex.y);
                        let resourceCount = 0;
                        switch (resource.resourceType) {
                            case 'bronze':
                                resourceCount = 1;
                                break;
                            case 'silver':
                                resourceCount = 2;
                                break;
                            case 'gold':
                                resourceCount = 3;
                                break;
                        }
                        resourcesMined += resourceCount;
                        break;
                    }
                    case 'spawn-plane':
                    case 'spawn-infantry':
                    case 'spawn-tank': {
                        unitsCreated++;
                    }
                }
            }

            /*await*/ DBUserRoundStats.addUserRoundStat(player, {
                generation: game.generation,
                votesWon,
                votesCast,
                damageDone,
                unitsDestroyed,
                unitsCreated,
                resourcesMined,
                distanceMoved
            });
        }

        this.splitRoundStats(roundStats, game.generation);
    }

    private static buildNote(
        vote: ProcessedVote,
        game: GameModel,
        preVoteEntities: GameEntity[],
        preVoteResources: GameResource[]
    ): VoteNote[] {
        const fromEntity = preVoteEntities.find(a => a.id === vote.entityId);
        const fromHex = game.grid.hexes.get(fromEntity);
        const toHex = game.grid.hexes.find(a => a.id === vote.hexId);
        switch (vote.action) {
            case 'attack': {
                const toEntity = preVoteEntities.find(a => a.x === toHex.x && a.y === toHex.y);
                const toEntityResult = game.entities.get2(toEntity);
                const damage = toEntityResult ? toEntity.health - toEntityResult.health : toEntity.health;
                const result = `for ${damage} damage` + (!toEntityResult ? ' and destroyed it' : '');
                return [
                    {
                        note:
                            `Our {fromEntityId:${EntityTypeNames[fromEntity.entityType]}} attacked ` +
                            `${FactionNames[toEntity.factionId]}'s ` +
                            `{toEntityId:${EntityTypeNames[toEntity.entityType]}} ` +
                            `(at {toHexId:${toHex.x},${toHex.y}}) ${result}. `,
                        factionId: fromEntity.factionId,
                        fromEntityId: fromEntity.id,
                        toEntityId: toEntity.id,
                        toHexId: toHex.id,
                        fromHexId: fromHex.id,
                        voteCount: vote.voteCount
                    },

                    {
                        note:
                            `${FactionNames[fromEntity.factionId]}'s ` +
                            `{fromEntityId:${EntityTypeNames[fromEntity.entityType]}} ` +
                            `attacked our {toEntityId:${EntityTypeNames[toEntity.entityType]}} ` +
                            `(at {toHexId:${toHex.x},${toHex.y}}) ${result}. `,
                        factionId: toEntity.factionId,
                        fromEntityId: fromEntity.id,
                        toEntityId: toEntity.id,
                        toHexId: toHex.id,
                        fromHexId: fromHex.id,
                        voteCount: vote.voteCount
                    }
                ];
            }

            case 'move': {
                const distance = game.grid.getDistance(fromHex, toHex);
                const direction = game.grid.getDirection(fromHex, toHex);
                return [
                    {
                        note:
                            `Our {fromEntityId:${EntityTypeNames[fromEntity.entityType]}} ` +
                            `moved ${distance} space${distance === 1 ? '' : 's'} ${direction}.`,
                        factionId: fromEntity.factionId,
                        fromEntityId: fromEntity.id,
                        toEntityId: null,
                        toHexId: toHex.id,
                        fromHexId: fromHex.id,
                        voteCount: vote.voteCount
                    }
                ];
            }
            case 'mine': {
                const resource = preVoteResources.find(a => a.x === toHex.x && a.y === toHex.y);
                const resourceResult = game.resources.find(a => a.x === toHex.x && a.y === toHex.y);
                let resourceCount = 0;
                switch (resource.resourceType) {
                    case 'bronze':
                        resourceCount = 1;
                        break;
                    case 'silver':
                        resourceCount = 2;
                        break;
                    case 'gold':
                        resourceCount = 3;
                        break;
                }

                const remaining = resourceResult
                    ? `It has ${resourceResult.currentCount} remaining. `
                    : `It has been depleted. `;

                return [
                    {
                        note: `We mined ${resourceCount} resource at {toHexId:${toHex.x},${toHex.y}}. ` + remaining,
                        factionId: fromEntity.factionId,
                        fromEntityId: fromEntity.id,
                        toEntityId: null,
                        toHexId: toHex.id,
                        fromHexId: fromHex.id,
                        voteCount: vote.voteCount
                    }
                ];
            }

            case 'spawn-infantry':
            case 'spawn-tank':
            case 'spawn-plane': {
                let spawnName: string;
                let turns: number;
                switch (vote.action) {
                    case 'spawn-infantry':
                        spawnName = EntityTypeNames['infantry'];
                        turns = EntityDetails['infantry'].ticksToSpawn;
                        break;
                    case 'spawn-tank':
                        spawnName = EntityTypeNames['tank'];
                        turns = EntityDetails['tank'].ticksToSpawn;
                        break;
                    case 'spawn-plane':
                        spawnName = EntityTypeNames['plane'];
                        turns = EntityDetails['plane'].ticksToSpawn;
                        break;
                }

                return [
                    {
                        note:
                            `Our {fromEntityId:${EntityTypeNames['factory']}} ` +
                            `has begun constructing a new ${spawnName}. ` +
                            `It will be ready in ${turns} rounds.`,
                        factionId: fromEntity.factionId,
                        fromEntityId: fromEntity.id,
                        toEntityId: null,
                        toHexId: toHex.id,
                        fromHexId: fromHex.id,
                        voteCount: vote.voteCount
                    }
                ];
            }
        }
    }

    private static splitRoundStats(roundStats: RoundStats, generation: number) {
        for (const faction of Factions) {
            const factionRoundStats: FactionRoundStats = {
                totalPlayersVoted: Utils.sum(Factions, f => roundStats.playersVoted[f] || 0),
                generation: roundStats.generation,
                hotEntities: roundStats.hotEntities[faction],
                winningVotes: roundStats.winningVotes[faction],
                playersVoted: roundStats.playersVoted[faction] || 0,
                score: roundStats.scores[faction],
                notes: roundStats.notes[faction]
            };

            /*await*/ S3Manager.uploadJson(
                `round-outcomes/round-outcome-${generation}-${faction}.json`,
                JSON.stringify(factionRoundStats)
            );
        }
    }
}
