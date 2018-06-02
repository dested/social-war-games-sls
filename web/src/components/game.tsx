import * as React from 'react';
import {Fragment} from 'react';
import {Drawing, DrawingOptions, Point} from '@swg-common/hex/hex';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {SwgStore} from '../store/reducers';
import {RouteComponentProps} from 'react-router';
import {GameEntity, GameLogic} from '@swg-common/game';
import {HexConstants} from '../utils/hexConstants';
import {GameActions, GameThunks} from '../store/game/actions';
import {DataService} from '../dataServices';
import {RoundState} from '@swg-common/models/roundState';
import {GameSidePanel} from './gameSidePanel';
import {GameRenderer} from '../drawing/gameRenderer';

interface Props extends RouteComponentProps<{}> {
    user?: HttpUser;
    selectedEntity?: GameEntity;
    game?: GameLogic;
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

        const layout = await DataService.getLayout();
        const gameState = await DataService.getGameState();
        const roundState = await DataService.getRoundState();

        let game = GameLogic.buildGame(layout, gameState);
        Drawing.update(game.grid, game.options);
        this.props.updateGame(game, roundState);

        setInterval(async () => {
            const gameState = await DataService.getGameState();
            const roundState = await DataService.getRoundState();
            let shouldUpdate = true;
            if (this.props.roundState.hash.indexOf(roundState.hash) === 0) {
                if (gameState.generation === this.props.game.generation) {
                    shouldUpdate = false;
                }
            }
            if (shouldUpdate) {
                const game = GameLogic.buildGame(layout, gameState);
                Drawing.update(game.grid, game.options);
                this.props.updateGame(game, roundState);
            }
        }, 5 * 1000);
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
