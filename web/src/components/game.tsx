import * as React from 'react';
import {Fragment} from 'react';
import {Grid, Point} from '@swg-common/hex/hex';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {SwgStore} from '../store/reducers';
import {RouteComponentProps} from 'react-router';
import {GameEntity, GameHexagon, GameLogic, GameModel} from '@swg-common/game';
import {HexConstants} from '../utils/hexConstants';
import {GameActions, GameThunks} from '../store/game/actions';
import {DataService} from '../dataServices';
import {RoundState} from '@swg-common/models/roundState';
import {GameSidePanel} from './gameSidePanel';
import {GameRenderer} from '../drawing/gameRenderer';
import {GameLayout} from '@swg-common/models/gameLayout';
import {GameState} from '@swg-common/models/gameState';
import {Drawing, DrawingOptions} from '../drawing/hexDrawing';

interface Props extends RouteComponentProps<{}> {
    user?: HttpUser;
    selectedEntity?: GameEntity;
    game?: GameModel;
    imagesLoading?: number;
    roundState?: RoundState;
    updateGame: typeof GameActions.updateGame;
    startLoading: typeof GameThunks.startLoading;
}

interface State {
    viewX: number;
    viewY: number;
}

export class Component extends React.Component<Props, State> {
    private gameRenderer: GameRenderer;
    private layout: GameLayout;
    private grid: Grid<GameHexagon>;
    private gameState: GameState;
    constructor(props: Props, context: any) {
        super(props, context);
        this.gameRenderer = new GameRenderer();
    }

    async componentDidMount() {
        if (!this.props.user) {
            this.props.history.push('/login');
            return;
        }
        this.props.startLoading();

        this.layout = await DataService.getLayout();
        this.gameState = await DataService.getGameState(
            this.props.user.factionId
        );
        const roundState = await DataService.getRoundState(
            this.props.user.factionId
        );
        this.grid = new Grid<GameHexagon>(0, 0, 100, 100);
        let game = GameLogic.buildGame(this.grid, this.layout, this.gameState);
        Drawing.update(game.grid, DrawingOptions.default);
        this.props.updateGame(game, roundState);

        this.getNewState(roundState.nextUpdate - +new Date());
    }
    private getNewState(timeout: number) {
        setTimeout(async () => {
            try {
                const roundState = await DataService.getRoundState(
                    this.props.user.factionId
                );
                let shouldUpdate = true;
                if (this.props.roundState.hash.indexOf(roundState.hash) === 0) {
                    if (roundState.generation === this.props.game.generation) {
                        shouldUpdate = false;
                    }
                }
                if (roundState.generation !== this.props.game.generation) {
                    this.gameState = await DataService.getGameState(
                        this.props.user.factionId
                    );
                    shouldUpdate = true;
                }
                if (shouldUpdate) {
                    const game = GameLogic.buildGame(
                        this.grid,
                        this.layout,
                        this.gameState
                    );
                    Drawing.update(game.grid, DrawingOptions.default);
                    this.props.updateGame(game, roundState);
                }
                this.getNewState(roundState.nextUpdate - +new Date());
            } catch (ex) {
                console.error(ex);
                this.getNewState(5000);
            }
        }, Math.max(timeout + 1000, 500));
    }

    render() {
        if (
            this.props.imagesLoading === undefined ||
            this.props.imagesLoading > 0 ||
            Number.isNaN(this.props.imagesLoading)
        ) {
            return (
                <div style={{width: '30%', height: '30%', margin: 'auto'}}>
                    Images Left: {this.props.imagesLoading}
                </div>
            );
        }
        return (
            <Fragment>
                <canvas
                    ref={e => this.gameRenderer.start(e)}
                    width={window.innerWidth}
                    height={window.innerHeight}
                />
                {this.props.selectedEntity && <GameSidePanel />}
            </Fragment>
        );
    }
}

export let Game = connect(
    (state: SwgStore) => ({
        user: state.appState.user,
        imagesLoading: state.gameState.imagesLoading,
        game: state.gameState.game,
        roundState: state.gameState.roundState,
        selectedEntity: state.gameState.selectedEntity
    }),
    {
        updateGame: GameActions.updateGame,
        startLoading: GameThunks.startLoading
    }
)(withRouter(Component));
