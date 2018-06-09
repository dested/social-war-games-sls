import * as React from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {SwgStore} from '../store/reducers';
import {RouteComponentProps} from 'react-router';
import {Dispatcher, UIAction, UIActions} from '../store/actions';
import {RoundState} from '@swg-common/models/roundState';
import {GameModel} from '@swg-common/game/gameLogic';
import {HexConstants} from '../utils/hexConstants';
import {UIConstants} from '../utils/uiConstants';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {VoteResult} from '@swg-common/game/voteResult';
import {DataService} from '../dataServices';
import {HexColors} from '../utils/hexColors';
import {Factions} from '@swg-common/game/entityDetail';
import {FactionStats} from '@swg-common/models/factionStats';

interface Props extends RouteComponentProps<{}> {
    user?: HttpUser;
    roundState?: RoundState;
    userDetails?: UserDetails;
    game?: GameModel;
    isVoting?: boolean;
    votingError?: VoteResult;

    showGenerationDetails: boolean;
    showFactionDetails: boolean;

    showGenerationDetailsAction: typeof UIActions.showGenerationDetails;
    showFactionDetailsAction: typeof UIActions.showFactionDetails;

    setFactionStats: typeof UIActions.setFactionStats;
    setGenerationStats: typeof UIActions.setGenerationStats;

    factionStats: FactionStats;
    generationStats: any;
}

interface State {}

export class Component extends React.Component<Props, State> {
    constructor(props: Props, context: any) {
        super(props, context);
        this.state = {
            showGenerationDetails: false,
            showFactionDetails: false
        };
    }

    render() {
        const userDetails = this.props.userDetails;
        if (!userDetails) return null;
        const sidePanelBox = HexConstants.isMobile
            ? {
                  borderBottomLeftRadius: '20px',
                  height: '175px',
                  width: '150px',
                  position: 'absolute' as 'absolute',
                  right: 0,
                  backgroundColor: 'rgba(255,255,255,.6)',
                  padding: 10,
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'column' as 'column'
              }
            : {
                  borderBottomLeftRadius: '20px',
                  height: '300px',
                  width: '330px',
                  position: 'absolute' as 'absolute',
                  right: 0,
                  backgroundColor: 'rgba(255,255,255,.6)',
                  padding: 20,
                  display: 'flex',
                alignItems: 'center',
                flexDirection: 'column' as 'column'
              };

        if (this.props.showFactionDetails) {
            return (
                <div style={sidePanelBox}>
                    <button onClick={() => this.showFaction(false)}>Back</button>
                    {this.props.factionStats ? (
                        Factions.map(faction => {
                            const factionStat = this.props.factionStats[faction];
                            return (
                                <span
                                    key={faction}
                                    style={{
                                        display: 'flex',
                                        padding: 10,
                                        margin: 3,
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        backgroundColor: HexColors.factionIdToColor(faction, '0', '.8')
                                    }}
                                >
                                    <span>Score: {factionStat.score}</span>
                                    <span>Resources: {factionStat.resourceCount}</span>
                                    <span>{Math.round(factionStat.hexPercent * 100).toFixed(0)}% Of World</span>
                                </span>
                            );
                        })
                    ) : (
                        <span>Loading...</span>
                    )}
                </div>
            );
        } else if (this.props.showGenerationDetails) {
            return (
                <div style={sidePanelBox}>
                    <button onClick={() => this.showGeneration(false)}>Back</button>
                    <span>Generation</span>
                </div>
            );
        } else {
            return (
                <div style={sidePanelBox}>
                    <button
                        style={{
                            padding: 10,
                            margin: 3
                        }}
                        onClick={() => this.showFaction(true)}
                    >
                        Faction: {this.props.user.factionId}
                    </button>
                    <button
                        style={{
                            padding: 10,
                            margin: 3
                        }}
                        onClick={() => this.showGeneration(true)}
                    >
                        Generation: {this.props.game.generation}
                    </button>
                    <span
                        style={{
                            padding: 10,
                            margin: 3
                        }}
                    >
                        {(userDetails.maxVotes - userDetails.voteCount).toString()} Votes Left
                    </span>

                    {this.props.isVoting && (
                        <span
                            style={{
                                padding: 10,
                                margin: 3
                            }}
                        >
                            Vote Processing...
                        </span>
                    )}
                    {this.props.votingError && (
                        <span
                            style={{
                                padding: 10,
                                margin: 3
                            }}
                        >
                            Sorry, your vote could not be processed.
                        </span>
                    )}
                </div>
            );
        }
    }

    private showGeneration = async (show: boolean) => {
        this.props.setFactionStats(null);
        this.props.showGenerationDetailsAction(show);
        if (show) {
            const factionStats = await DataService.getFactionStats();
            this.props.setFactionStats(factionStats);
        }
    };
    private showFaction = async (show: boolean) => {
        this.props.setFactionStats(null);
        this.props.showFactionDetailsAction(show);
        if (show) {
            const factionStats = await DataService.getFactionStats();
            this.props.setFactionStats(factionStats);
        }
    };
}

export let GameStatsPanel = connect(
    (state: SwgStore) => ({
        user: state.appState.user,
        game: state.gameState.game,
        roundState: state.gameState.roundState,
        userDetails: state.gameState.userDetails,
        isVoting: state.gameState.isVoting,
        votingError: state.gameState.votingError,
        showGenerationDetails: state.uiState.showGenerationDetails,
        showFactionDetails: state.uiState.showFactionDetails,
        factionStats: state.uiState.factionStats,
        generationStats: state.uiState.generationStats
    }),
    {
        showGenerationDetailsAction: UIActions.showGenerationDetails,
        showFactionDetailsAction: UIActions.showFactionDetails,
        setFactionStats: UIActions.setFactionStats,
        setGenerationStats: UIActions.setGenerationStats
    }
)(withRouter(Component));
