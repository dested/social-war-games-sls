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
            </div>
        );
    }

    private renderVoteDetails() {
        const votesLeft = this.props.userDetails.maxVotes - this.props.userDetails.voteCount;

        return (
            <>
                <span
                    className={'bottom-button'}
                    style={{
                        backgroundColor: '#89bbff'
                    }}
                >
                    {`${votesLeft} Vote${votesLeft === 1 ? '' : 's'} Left`}
                </span>
                {this.props.isVoting && (
                    <span
                        className={'bottom-button'}
                        style={{
                            backgroundColor: '#f3f1a0'
                        }}
                    >
                        Vote Processing...
                    </span>
                )}
                {this.props.votingError && (
                    <span
                        style={{
                            backgroundColor: '#f37d87',
                            padding: 10
                        }}
                    >
                        Sorry, your vote could not be processed.
                    </span>
                )}
            </>
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
