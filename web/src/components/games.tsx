import {HttpGame} from '@swg-common/models/http/httpGame';
import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {RouteComponentProps} from 'react-router';
import {Link, withRouter} from 'react-router-dom';
import {DataService} from '../dataServices';
import {GameStoreName, GameStoreProps} from '../store/game/store';
import {MainStoreName, MainStoreProps} from '../store/main/store';

interface Props extends RouteComponentProps<{}>, MainStoreProps, GameStoreProps {}

interface State {
  games: HttpGame[];
}

@inject(MainStoreName, GameStoreName)
@observer
class Component extends React.Component<Props, State> {
  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      games: null,
    };
  }
  async componentWillMount() {
    const response = await DataService.getGames();
    this.setState({games: response.games});
  }

  render() {
    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            padding: 20,
            display: 'flex',
            background: 'rgba(255,255,255,.2)',
            borderRadius: 10,
            flexDirection: 'column',
            width: '40vw',
            height: '40vh',
            justifyContent: 'center',
          }}
        >
          Games:
          {!this.state.games
            ? `Loading Games...`
            : this.state.games.map(a => (
                <button
                  key={a.gameId}
                  onClick={() => {
                    this.selectGame(a);
                  }}
                >
                  Game {a.gameId} (Duration: {a.roundDuration})
                </button>
              ))}
        </div>
      </div>
    );
  }

  private selectGame(game: HttpGame) {
    this.props.gameStore.setCurrentGameId(game.gameId);
    this.props.history.push('/');
  }
}

export let Games = withRouter(Component);
