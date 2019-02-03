import {GameEntity} from '@swg-common/game/entityDetail';
import {GameHexagon} from '@swg-common/game/gameHexagon';
import {GameModel} from '@swg-common/game/gameLogic';
import {GameResource} from '@swg-common/game/gameResource';
import {Grid} from '@swg-common/hex/hex';
import {HttpUser} from '@swg-common/models/http/httpUser';
import * as React from 'react';
import {Fragment} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps} from 'react-router';
import {withRouter} from 'react-router-dom';
import {GameRenderer} from '../drawing/gameRenderer';
import {Drawing, DrawingOptions} from '../drawing/hexDrawing';
import {SmallGameRenderer} from '../drawing/smallGameRenderer';
import {GameActions, GameThunks} from '../store/game/actions';
import {SwgStore} from '../store/reducers';
import {HexConstants} from '../utils/hexConstants';
import {UIConstants} from '../utils/uiConstants';
import {ActionPanel} from './actionPanel';
import {GameStatsPanel} from './gameStatsPanel';
import {UIPanel} from './uiPanel';

interface Props extends RouteComponentProps<{}> {
  user?: HttpUser;
  selectedEntity?: GameEntity;
  selectedResource?: GameResource;
  game: GameModel;
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

    window.addEventListener(
      'resize',
      () => {
        this.gameRenderer.canvas.width = window.innerWidth;
        this.gameRenderer.canvas.height = window.innerHeight;
        this.gameRenderer.view.setBounds(window.innerWidth, window.innerHeight);
        this.smallGameRenderer.canvas.width = window.innerWidth;
        this.smallGameRenderer.canvas.height = UIConstants.miniMapHeight();

        HexConstants.smallHeight = ((UIConstants.miniMapHeight() - 100) / this.props.game.grid.boundsHeight) * 1.3384;
        HexConstants.smallWidth = UIConstants.miniMapWidth() / this.props.game.grid.boundsWidth;

        DrawingOptions.defaultSmall = {
          width: HexConstants.smallWidth,
          height: HexConstants.smallHeight,
          size: HexConstants.smallHeight / 2 - 1,
          orientation: Drawing.Orientation.PointyTop,
        };

        for (const hex of this.props.game.grid.hexes) {
          hex.smallCenter = Drawing.getCenter(hex, DrawingOptions.defaultSmall);
        }

        this.smallGameRenderer.forceRender();
      },
      true
    );
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
          height={window.innerHeight}
        />
        <UIPanel />
        {(this.props.selectedEntity || this.props.selectedResource) && <ActionPanel />}
        <GameStatsPanel smallGameRenderer={this.smallGameRenderer} />
      </Fragment>
    );
  }
}

export let Game = connect(
  (state: SwgStore) => ({
    gameReady: state.gameState.gameReady,
    game: state.gameState.game,
    user: state.appState.user,
    imagesLoading: state.gameState.imagesLoading,
    selectedEntity: state.gameState.selectedEntity,
    selectedResource: state.gameState.selectedResource,
  }),
  {
    setGameRenderer: GameActions.setGameRenderer,
    startGame: GameThunks.startGame,
  }
)(withRouter(Component));
