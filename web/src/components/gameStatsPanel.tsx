import {GameLogic} from '@swg-common/game/gameLogic';
import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {Fragment} from 'react';
import {RouteComponentProps} from 'react-router';
import {withRouter} from 'react-router-dom';
import {DataService} from '../dataServices';
import {Drawing, DrawingOptions} from '../drawing/hexDrawing';
import {SmallGameRenderer} from '../drawing/smallGameRenderer';
import {gameStore, GameStoreName, GameStoreProps} from '../store/game/store';
import {mainStore, MainStoreName, MainStoreProps} from '../store/main/store';
import {UI, UIStore, UIStoreName, UIStoreProps} from '../store/ui/store';
import {HexConstants} from '../utils/hexConstants';
import {UIConstants} from '../utils/uiConstants';

interface Props extends RouteComponentProps<{}>, MainStoreProps, GameStoreProps, UIStoreProps {
  smallGameRenderer: SmallGameRenderer;
}

interface State {}

@inject(MainStoreName, GameStoreName, UIStoreName)
@observer
export class Component extends React.Component<Props, State> {
  constructor(props: Props, context: any) {
    super(props, context);
    (window as any).gameStatsPanel = this;
    this.state = {};
  }

  componentWillMount(): void {
    setInterval(() => {
      this.forceUpdate();
    }, 50);
  }

  render() {
    const game = this.props.gameStore.gameState;
    const percent = (game.roundDuration - (game.roundEnd - +new Date())) / game.roundDuration;

    return (
      <Fragment>
        <div>
          <canvas
            id="minimap"
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
            }}
            ref={e => this.props.smallGameRenderer.start(e, this.props.gameStore.gameRenderer)}
            width={UIConstants.miniMapWidth()}
            height={UIConstants.miniMapHeight()}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: UIConstants.miniMapWidth() + 3,
            bottom: 0,
            display: 'flex',
          }}
        >
          <div
            onClick={() => this.setUI('FactionStats')}
            className={'bottom-button'}
            style={{backgroundColor: '#f3ecea'}}
          >
            Percent Done: {(percent * 100).toFixed(0)}
          </div>
          <div
            onClick={() => this.setUI('FactionStats')}
            className={'bottom-button'}
            style={{backgroundColor: '#f3ecea'}}
          >
            Factions Stats
          </div>
          <div
            onClick={() => this.setUI('RoundStats')}
            className={'bottom-button'}
            style={{backgroundColor: '#f3ecea'}}
          >
            Round Stats
          </div>
          <div onClick={() => this.setUI('Bases')} className={'bottom-button'} style={{backgroundColor: '#f3ecea'}}>
            Bases
          </div>
          <div onClick={() => this.setUI('Ladder')} className={'bottom-button'} style={{backgroundColor: '#f3ecea'}}>
            Ladder
          </div>
          <div onClick={() => this.updateGen(-1)} className={'bottom-button'} style={{backgroundColor: '#f3ecea'}}>
            Go Back
          </div>
          <div onClick={() => this.updateGen(1)} className={'bottom-button'} style={{backgroundColor: '#f3ecea'}}>
            Go Forward
          </div>
          {this.props.gameStore.userDetails && this.renderVoteDetails()}
        </div>
      </Fragment>
    );
  }

  private updateGen = async (generationUpdate: number) => {
    const gameState = await DataService.getGameState(
      mainStore.user.factionId,
      gameStore.gameState.generation + generationUpdate,
      gameStore.userDetails.factionToken
    );
    gameStore.setGameState(gameState);
    const game = GameLogic.buildGameFromState(gameStore.layout, gameState);

    HexConstants.smallHeight = (UIConstants.miniMapHeight() / game.grid.boundsHeight) * 1.3384;
    HexConstants.smallWidth = UIConstants.miniMapWidth() / game.grid.boundsWidth;

    DrawingOptions.defaultSmall = {
      width: HexConstants.smallWidth,
      height: HexConstants.smallHeight,
      size: HexConstants.smallHeight / 2 - 1,
      orientation: Drawing.Orientation.PointyTop,
    };

    Drawing.update(game.grid, DrawingOptions.default, DrawingOptions.defaultSmall);

    const emptyRoundState = {
      nextUpdateTime: 0,
      nextGenerationTick: game.roundEnd,
      thisUpdateTime: 0,
      generation: game.generation,
      entities: {},
    };

    gameStore.updateGame(game, {...emptyRoundState}, {...emptyRoundState});
    gameStore.setLastRoundActionsFromNotes(gameState, mainStore.user.factionId, game.grid);

    gameStore.smallGameRenderer.forceRender();
  };

  private renderVoteDetails() {
    const votesLeft = this.props.gameStore.userDetails.maxVotes - this.props.gameStore.userDetails.voteCount;

    return (
      <>
        <span
          className={'bottom-button'}
          style={{
            backgroundColor: '#89bbff',
          }}
        >
          {`${votesLeft} Vote${votesLeft === 1 ? '' : 's'} Left`}
        </span>
        {this.props.gameStore.isVoting && (
          <span
            className={'bottom-button'}
            style={{
              backgroundColor: '#f3f1a0',
            }}
          >
            Vote Processing...
          </span>
        )}
        {this.props.gameStore.votingResultError && (
          <span
            style={{
              backgroundColor: '#f37d87',
              padding: 10,
            }}
          >
            Sorry, your vote could not be processed.
          </span>
        )}
      </>
    );
  }

  private setUI = async (ui: UI) => {
    await UIStore.setUI(ui);
  };
}

export let GameStatsPanel = withRouter(Component);
