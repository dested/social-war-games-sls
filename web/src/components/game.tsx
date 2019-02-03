import {inject, observer} from 'mobx-react';
import {Fragment} from 'react';
import * as React from 'react';
import {RouteComponentProps} from 'react-router';
import {withRouter} from 'react-router-dom';
import {GameRenderer} from '../drawing/gameRenderer';
import {Drawing, DrawingOptions} from '../drawing/hexDrawing';
import {SmallGameRenderer} from '../drawing/smallGameRenderer';
import {GameStore, GameStoreName, GameStoreProps} from '../store/game/store';
import {MainStoreName, MainStoreProps} from '../store/main/store';
import {HexConstants} from '../utils/hexConstants';
import {UIConstants} from '../utils/uiConstants';
import {ActionPanel} from './actionPanel';
import {GameStatsPanel} from './gameStatsPanel';
import {UIPanel} from './uiPanel';

interface Props extends RouteComponentProps<{}>, MainStoreProps, GameStoreProps {}

interface State {}

@inject(MainStoreName, GameStoreName)
@observer
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
    if (!this.props.mainStore.user) {
      this.props.history.push('/login');
      return;
    }
    this.props.gameStore.setGameRenderer(this.gameRenderer, this.smallGameRenderer);
    GameStore.startGame();

    window.addEventListener(
      'resize',
      () => {
        this.gameRenderer.canvas.width = window.innerWidth;
        this.gameRenderer.canvas.height = window.innerHeight;
        this.gameRenderer.view.setBounds(window.innerWidth, window.innerHeight);
        this.smallGameRenderer.canvas.width = window.innerWidth;
        this.smallGameRenderer.canvas.height = UIConstants.miniMapHeight();

        HexConstants.smallHeight =
          ((UIConstants.miniMapHeight() - 100) / this.props.gameStore.game.grid.boundsHeight) * 1.3384;
        HexConstants.smallWidth = UIConstants.miniMapWidth() / this.props.gameStore.game.grid.boundsWidth;

        DrawingOptions.defaultSmall = {
          width: HexConstants.smallWidth,
          height: HexConstants.smallHeight,
          size: HexConstants.smallHeight / 2 - 1,
          orientation: Drawing.Orientation.PointyTop,
        };

        for (const hex of this.props.gameStore.game.grid.hexes) {
          hex.smallCenter = Drawing.getCenter(hex, DrawingOptions.defaultSmall);
        }

        this.smallGameRenderer.forceRender();
      },
      true
    );
  }

  render() {
    if (
      !this.props.gameStore.gameReady ||
      this.props.gameStore.imagesLoading === undefined ||
      this.props.gameStore.imagesLoading > 0 ||
      Number.isNaN(this.props.gameStore.imagesLoading)
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
        {(this.props.gameStore.selectedEntity || this.props.gameStore.selectedResource) && <ActionPanel />}
        <GameStatsPanel smallGameRenderer={this.smallGameRenderer} />
      </Fragment>
    );
  }
}

export let Game = withRouter(Component);
