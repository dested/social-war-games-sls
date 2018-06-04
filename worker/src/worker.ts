import * as _ from 'lodash';
import {RedisManager} from '@swg-server-common/redis/redisManager';
import {GameState} from '@swg-common/models/gameState';
import {Config} from '@swg-server-common/config';
import {DataManager} from '@swg-server-common/db/dataManager';
import {Grid} from '@swg-common/hex/hex';
import {DBVote} from '@swg-server-common/db/models/dbVote';
import {GameLayout} from '@swg-common/models/gameLayout';
import {S3Splitter} from './s3Splitter';
import {StateManager} from './stateManager';
import {GameHexagon} from '@swg-common/game/gameHexagon';
import {GameLogic} from '@swg-common/game/gameLogic';
import {VoteResult} from '@swg-common/game/voteResult';
import {FactionId} from '@swg-common/game/entityDetail';

export class Worker {
    private static redisManager: RedisManager;
    private static update = 0;

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
        console.log('connected to redis');

        await this.processNewRound();

        setInterval(() => {
            this.processNewRound();
        }, Config.gameDuration);

        this.update = 0;
        setInterval(() => {
            this.processRoundUpdate();
        }, Config.roundUpdateDuration);

        setInterval(() => {
            this.cleanupVotes();
        }, Config.gameDuration * 2);
    }

    private static async processNewRound() {
        try {
            console.time('round end');
            console.log('round end');
            await this.redisManager.set('stop', true);
            const generation = await this.redisManager.get<number>('game-generation');

            const layout = await this.redisManager.get<GameLayout>('layout');
            let gameState = await this.redisManager.get<GameState>('game-state');
            const game = GameLogic.buildGame(layout, gameState);

            const voteCounts = (await DBVote.getVoteCount(generation)).sort(
                (left, right) => _.sumBy(left.actions, a => a.count) - _.sumBy(right.actions, a => a.count)
            );

            const winningVotes = [];
            for (const voteCount of voteCounts) {
                const actions = _.orderBy(voteCount.actions, a => a.count, 'desc');
                for (let index = 0; index < actions.length; index++) {
                    const action = actions[index];
                    const vote = {
                        entityId: voteCount._id,
                        action: action.action,
                        factionId: undefined as FactionId,
                        hexId: action.hexId
                    };

                    let voteResult = GameLogic.validateVote(game, vote);
                    if (voteResult === VoteResult.Success) {
                        voteResult = GameLogic.processVote(game, vote);
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

            console.log('Executed Votes', winningVotes);
            game.generation++;

            gameState = StateManager.buildGameState(game);
            const roundState = StateManager.buildRoundState(game.generation, []);
            console.log(roundState);
            await S3Splitter.output(game, layout, gameState, roundState, true);
            await this.redisManager.set('game-state', gameState);
            await this.redisManager.incr('game-generation');
            await this.redisManager.set('stop', false);
            console.timeEnd('round end');
        } catch (ex) {
            console.error(ex);
        }
    }

    private static async processRoundUpdate() {
        this.update++;
        if (this.update % (Config.gameDuration / Config.roundUpdateDuration) === 0) {
            return;
        }
        try {
            console.time('round update');
            console.log('update round state');
            const generation = (await this.redisManager.get<number>('game-generation')) || 1;
            const gameState = await this.redisManager.get<GameState>('game-state');
            const layout = await this.redisManager.get<GameLayout>('layout');
            const game = GameLogic.buildGame( layout, gameState);

            const voteCounts = await DBVote.getVoteCount(generation);
            await S3Splitter.output(
                game,
                layout,
                gameState,
                StateManager.buildRoundState(generation, voteCounts),
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
            const generation = (await this.redisManager.get<number>('game-generation')) || 1;

            // todo, aggregate votes and store them for users later
            await DBVote.db.deleteMany(DBVote.db.query.parse((a, gen) => a.generation < gen, generation - 2));
        } catch (ex) {
            console.error(ex);
        }
    }
}
