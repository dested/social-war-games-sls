import * as React from 'react';
import {Fragment} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {SwgStore} from '../store/reducers';
import {RouteComponentProps} from 'react-router';
import {GameActions, GameThunks} from '../store/game/actions';
import {GameSidePanel} from './gameSidePanel';
import {GameRenderer} from '../drawing/gameRenderer';
import {GameEntity} from '@swg-common/game/entityDetail';
import {SmallGameRenderer} from '../drawing/smallGameRenderer';
import {UIConstants} from '../utils/uiConstants';
import {GameResource} from '@swg-common/game/gameResource';
import {HexConstants} from '../utils/hexConstants';
import {GameStatsPanel} from './gameStatsPanel';
import {UIPanel} from './uiPanel';
import {Grid} from '@swg-common/hex/hex';
import {GameHexagon} from '@swg-common/game/gameHexagon';

interface Props extends RouteComponentProps<{}> {
    user?: HttpUser;
    selectedEntity?: GameEntity;
    selectedResource?: GameResource;

    imagesLoading?: number;
    gameReady: boolean;
    startGame: typeof GameThunks.startGame;
    setGameRenderer: typeof GameActions.setGameRenderer;
}

interface State {}

export class Component extends React.Component<Props, State> {
    private gameRenderer: GameRenderer;
    private smallGameRenderer: SmallGameRenderer;

    constructor(props: Props, context: any) {
        super(props, context);
        this.gameRenderer = new GameRenderer();
        this.smallGameRenderer = new SmallGameRenderer();
        this.state = {};
    }

    async componentDidMount() {
        if (!this.props.user) {
            this.props.history.push('/login');
            return;
        }
        this.props.setGameRenderer(this.gameRenderer, this.smallGameRenderer);
        this.props.startGame();
    }

    render() {
        if (
            !this.props.gameReady ||
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
                        ref={e => this.smallGameRenderer.start(e, this.gameRenderer)}
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
                            backgroundColor: 'black',
                        }}
                        ref={e => this.smallGameRenderer.start(e, this.gameRenderer)}
                        width={UIConstants.miniMapWidth}
                        height={UIConstants.miniMapHeight}
                    />
                )}

                <UIPanel />
                {(this.props.selectedEntity || this.props.selectedResource) && <GameSidePanel />}
                <GameStatsPanel />
            </Fragment>
        );
    }
}

export let Game = connect(
    (state: SwgStore) => ({
        gameReady: state.gameState.gameReady,
        user: state.appState.user,
        imagesLoading: state.gameState.imagesLoading,
        selectedEntity: state.gameState.selectedEntity,
        selectedResource: state.gameState.selectedResource
    }),
    {
        setGameRenderer: GameActions.setGameRenderer,
        startGame: GameThunks.startGame
    }
)(withRouter(Component));
