import * as React from 'react';
import {Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {SwgStore} from '../store/reducers';
import {RouteComponentProps} from 'react-router';
import {GameActions, GameThunks} from '../store/game/actions';
import {DataService} from '../dataServices';
import {RoundState} from '@swg-common/models/roundState';
import {GameSidePanel} from './gameSidePanel';
import {GameRenderer} from '../drawing/gameRenderer';
import {GameLayout} from '@swg-common/models/gameLayout';
import {GameState} from '@swg-common/models/gameState';
import {Drawing, DrawingOptions} from '../drawing/hexDrawing';
import {GameLogic, GameModel, ProcessedVote} from '@swg-common/game/gameLogic';
import {GameEntity} from '@swg-common/game/entityDetail';
import {SmallGameRenderer} from '../drawing/smallGameRenderer';
import {UIConstants} from '../utils/uiConstants';
import {GameResource} from '@swg-common/game/gameResource';
import {HexConstants} from '../utils/hexConstants';
import {GameStatsPanel} from './gameStatsPanel';
import {UIActions} from '../store/ui/actions';

interface Props extends RouteComponentProps<{}> {
    user?: HttpUser;
    selectedEntity?: GameEntity;
    selectedResource?: GameResource;
    game?: GameModel;
    imagesLoading?: number;
    localVotes?: (ProcessedVote & {processedTime: number})[];
    roundState?: RoundState;
    resetLocalVotes: typeof GameActions.resetLocalVotes;

    updateGame: typeof GameActions.updateGame;
    updateUserDetails: typeof GameActions.updateUserDetails;
    startLoading: typeof GameThunks.startLoading;
    setGameRenderer: typeof GameActions.setGameRenderer;

    setFactionStats: typeof UIActions.setFactionStats;
    selectEntity: typeof GameActions.selectEntity;
    setFactionRoundStats: typeof UIActions.setFactionRoundStats;

    showFactionDetails: boolean;
    showFactionRoundStats: boolean;
}

interface State {
    ready: boolean;
}

export class Component extends React.Component<Props, State> {
    private gameRenderer: GameRenderer;
    private miniGameRenderer: SmallGameRenderer;
    private layout: GameLayout;
    private gameState: GameState;
    private game: GameModel;
    constructor(props: Props, context: any) {
        super(props, context);
        this.gameRenderer = new GameRenderer();
        this.miniGameRenderer = new SmallGameRenderer();
        this.state = {
            ready: false
        };
    }

    async componentDidMount() {
        if (!this.props.user) {
            this.props.history.push('/login');
            return;
        }
        this.props.startLoading();

        this.props.setGameRenderer(this.gameRenderer);

        this.layout = await DataService.getLayout();
        this.gameState = await DataService.getGameState(this.props.user.factionId);
        const roundState = await DataService.getRoundState(this.props.user.factionId);
        this.game = GameLogic.buildGameFromState(this.layout, this.gameState);
        Drawing.update(this.game.grid, DrawingOptions.default, DrawingOptions.defaultSmall);
        this.props.updateGame(this.game, roundState);
        this.miniGameRenderer.forceRender();
        this.getNewState(roundState.nextUpdateTime - +new Date());
        this.setState({ready: true});
        const userDetails = await DataService.currentUserDetails();
        this.props.updateUserDetails(userDetails);
    }

    private getNewState(timeout: number) {
        setTimeout(async () => {
            try {
                const roundState = await DataService.getRoundState(this.props.user.factionId);

                if (roundState.generation !== this.props.game.generation) {
                    this.props.selectEntity(null);
                    await this.props.resetLocalVotes();
                    this.gameState = await DataService.getGameState(this.props.user.factionId);
                    const userDetails = await DataService.currentUserDetails();
                    this.props.updateUserDetails(userDetails);
                    if (this.props.showFactionDetails) {
                        this.props.setFactionStats(null);
                        const factionStats = await DataService.getFactionStats();
                        this.props.setFactionStats(factionStats);
                    }
                    if (this.props.showFactionRoundStats) {
                        this.props.setFactionRoundStats(null);
                        const factionRoundStats = await DataService.getFactionRoundStats(
                            this.props.game.generation,
                            this.props.user.factionId
                        );
                        this.props.setFactionRoundStats(factionRoundStats);
                    }
                    this.game = GameLogic.buildGameFromState(this.layout, this.gameState);
                    Drawing.update(this.game.grid, DrawingOptions.default, DrawingOptions.defaultSmall);
                }


                this.props.updateGame(this.game, roundState);
                this.miniGameRenderer.forceRender();

                this.getNewState(roundState.nextUpdateTime - +new Date());
            } catch (ex) {
                console.error(ex);
                this.getNewState(5000);
            }
        }, Math.max(timeout + 1000, 500));
    }

    render() {
        if (
            !this.state.ready ||
            this.props.imagesLoading === undefined ||
            this.props.imagesLoading > 0 ||
            Number.isNaN(this.props.imagesLoading)
        ) {
            return <div className="loading" />;
        }

        return (
            <Fragment>
                <canvas
                    id="big-game"
                    ref={e => this.gameRenderer.start(e)}
                    width={window.innerWidth}
                    height={window.innerHeight - (HexConstants.isMobile ? UIConstants.miniMapHeight : 0)}
                />
                {HexConstants.isMobile ? (
                    <canvas
                        id="minimap"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'black',
                            borderTop: 'solid 5px black'
                        }}
                        ref={e => this.miniGameRenderer.start(e, this.gameRenderer)}
                        width={UIConstants.miniMapWidth}
                        height={UIConstants.miniMapHeight}
                    />
                ) : (
                    <canvas
                        id="minimap"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            borderTopRightRadius: '70%',
                            backgroundColor: 'black',
                            borderTop: 'solid 5px black',
                            borderRight: 'solid 5px black'
                        }}
                        ref={e => this.miniGameRenderer.start(e, this.gameRenderer)}
                        width={UIConstants.miniMapWidth}
                        height={UIConstants.miniMapHeight}
                    />
                )}

                {this.props.selectedEntity || this.props.selectedResource ? <GameSidePanel /> : <GameStatsPanel />}
            </Fragment>
        );
    }
}

export let Game = connect(
    (state: SwgStore) => ({
        user: state.appState.user,
        imagesLoading: state.gameState.imagesLoading,
        localVotes: state.gameState.localVotes,
        game: state.gameState.game,
        roundState: state.gameState.roundState,
        selectedEntity: state.gameState.selectedEntity,
        selectedResource: state.gameState.selectedResource,
        showFactionDetails: state.uiState.showFactionDetails,
        showFactionRoundStats: state.uiState.showFactionRoundStats
    }),
    {
        setGameRenderer: GameActions.setGameRenderer,
        resetLocalVotes: GameActions.resetLocalVotes,
        updateGame: GameActions.updateGame,
        selectEntity: GameActions.selectEntity,
        startLoading: GameThunks.startLoading,
        updateUserDetails: GameActions.updateUserDetails,
        setFactionStats: UIActions.setFactionStats,
        setFactionRoundStats: UIActions.setFactionRoundStats
    }
)(withRouter(Component));
