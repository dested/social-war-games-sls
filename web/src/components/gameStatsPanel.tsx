import * as React from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {SwgStore} from '../store/reducers';
import {RouteComponentProps} from 'react-router';
import {UI, UIActions} from '../store/actions';
import {RoundState} from '@swg-common/models/roundState';
import {GameModel} from '@swg-common/game/gameLogic';
import {UIConstants} from '../utils/uiConstants';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {VoteResult} from '@swg-common/game/voteResult';
import {UIThunks} from '../store/ui/actions';

interface Props extends RouteComponentProps<{}> {
    user?: HttpUser;
    roundState?: RoundState;
    userDetails?: UserDetails;
    game?: GameModel;
    isVoting?: boolean;
    votingError?: VoteResult;
    ui: UI;
    setUI: typeof UIThunks.setUI;
}

interface State {}

export class Component extends React.Component<Props, State> {
    constructor(props: Props, context: any) {
        super(props, context);
        (window as any).gameStatsPanel = this;
        this.state = {};
    }

    render() {
        return (
            <div
                style={{
                    position: 'absolute',
                    left: UIConstants.miniMapWidth + 5,
                    bottom: UIConstants.progressBarHeight,
                    display: 'flex'
                }}
            >
                <div
                    onClick={() => this.setUI('FactionStats')}
                    style={{padding: 10, height: 40, backgroundColor: '#59ccf3'}}
                >
                    Factions Stats
                </div>
                <div
                    onClick={() => this.setUI('RoundStats')}
                    style={{padding: 10, height: 40, backgroundColor: '#c0f353'}}
                >
                    Round Stats
                </div>
                <div onClick={() => this.setUI('Bases')} style={{padding: 10, height: 40, backgroundColor: '#7971f3'}}>
                    Bases
                </div>
                <div onClick={() => this.setUI('Ladder')} style={{padding: 10, height: 40, backgroundColor: '#f0c2f3'}}>
                    Ladder
                </div>
                {this.props.userDetails && (
                    <>
                        <span
                            style={{
                                backgroundColor: '#3b75f3',
                                padding: 10
                            }}
                        >
                            {(this.props.userDetails.maxVotes - this.props.userDetails.voteCount).toString()} Votes Left
                        </span>
                        {this.props.isVoting && (
                            <span
                                style={{
                                    backgroundColor: '#3b75f3',
                                    padding: 10
                                }}
                            >
                                Vote Processing...
                            </span>
                        )}
                        {this.props.votingError && (
                            <span
                                style={{
                                    backgroundColor: '#3b75f3',
                                    padding: 10
                                }}
                            >
                                Sorry, your vote could not be processed.
                            </span>
                        )}
                    </>
                )}
            </div>
        );
    }

    private setUI(ui: UI) {
        this.props.setUI(ui);
    }
}

export let GameStatsPanel = connect(
    (state: SwgStore) => ({
        user: state.appState.user,
        game: state.gameState.game,
        roundState: state.gameState.localRoundState,
        userDetails: state.gameState.userDetails,
        isVoting: state.gameState.isVoting,
        votingError: state.gameState.votingError,
        gameRenderer: state.gameState.gameRenderer,
        ui: state.uiState.ui
    }),
    {
        setUI: UIThunks.setUI
    }
)(withRouter(Component));
