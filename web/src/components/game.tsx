import {GameEntity} from '@swg-common/game/entityDetail';
import {GameHexagon} from '@swg-common/game/gameHexagon';
import {GameResource} from '@swg-common/game/gameResource';
import {Grid} from '@swg-common/hex/hex';
import {HttpUser} from '@swg-common/models/http/httpUser';
import * as React from 'react';
import {Fragment} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps} from 'react-router';
import {withRouter} from 'react-router-dom';
import {GameRenderer} from '../drawing/gameRenderer';
import {DrawingOptions} from '../drawing/hexDrawing';
import {SmallGameRenderer} from '../drawing/smallGameRenderer';
import {GameActions, GameThunks} from '../store/game/actions';
import {SwgStore} from '../store/reducers';
import {HexConstants} from '../utils/hexConstants';
import {UIConstants} from '../utils/uiConstants';
import {GameSidePanel} from './gameSidePanel';
import {GameStatsPanel} from './gameStatsPanel';
import {UIPanel} from './uiPanel';

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
                            backgroundColor: '#454545',
                            borderTop: 'solid 5px black'
                        }}
                        ref={e => this.smallGameRenderer.start(e, this.gameRenderer)}
                        width={UIConstants.miniMapWidth}
                        height={UIConstants.miniMapHeight}
                    />
                ) : (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            backgroundColor: 'black',
                            borderTopRightRadius: 25
                        }}
                    >
                        <canvas
                            id="minimap"
                            style={{
                                borderTop: 'solid 3px black',
                                borderRight: 'solid 3px black',
                                borderTopRightRadius: 25
                            }}
                            ref={e => this.smallGameRenderer.start(e, this.gameRenderer)}
                            width={UIConstants.miniMapWidth}
                            height={UIConstants.miniMapHeight}
                        />
                        <div
                            style={{
                                width: 50,
                                height: 50,
                                border: 'white solid 2px',
                                position: 'absolute',
                                left: 100,
                                top: 100
                            }}
                        />
                    </div>
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
