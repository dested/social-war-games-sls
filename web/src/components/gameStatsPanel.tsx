import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {Fragment} from 'react';
import {RouteComponentProps} from 'react-router';
import {withRouter} from 'react-router-dom';
import {SmallGameRenderer} from '../drawing/smallGameRenderer';
import {GameStoreName, GameStoreProps} from '../store/game/store';
import {MainStoreName, MainStoreProps} from '../store/main/store';
import {UI, UIStore, UIStoreName, UIStoreProps} from '../store/ui/store';
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

  render() {
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
            width={window.innerWidth}
            height={UIConstants.miniMapHeight()}
          />
        </div>

        {/*<div
                    style={{
                        position: 'absolute',
                        left: UIConstants.miniMapWidth + 3,
                        bottom: UIConstants.progressBarHeight,
                        display: 'flex'
                    }}
                >
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
                    <div
                        onClick={() => this.setUI('Bases')}
                        className={'bottom-button'}
                        style={{backgroundColor: '#f3ecea'}}
                    >
                        Bases
                    </div>
                    <div
                        onClick={() => this.setUI('Ladder')}
                        className={'bottom-button'}
                        style={{backgroundColor: '#f3ecea'}}
                    >
                        Ladder
                    </div>
                    {this.props.userDetails && this.renderVoteDetails()}
                </div>*/}
      </Fragment>
    );
  }

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
        {this.props.gameStore.votingError && (
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
