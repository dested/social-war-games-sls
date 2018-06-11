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
import {Factions, GameEntity} from '@swg-common/game/entityDetail';
import {FactionStats} from '@swg-common/models/factionStats';
import {FactionRoundStats} from '@swg-common/models/roundStats';
import {GameAssets} from '../drawing/gameAssets';
import {GameRenderer} from '../drawing/gameRenderer';
import {VoteNote} from '@swg-common/models/voteNote';
import {LadderResponse} from '@swg-common/models/http/userController';

interface Props extends RouteComponentProps<{}> {
    user?: HttpUser;
    roundState?: RoundState;
    userDetails?: UserDetails;
    game?: GameModel;
    isVoting?: boolean;
    votingError?: VoteResult;

    showFactionRoundStats: boolean;
    showFactionDetails: boolean;

    showFactionRoundStatsAction: typeof UIActions.showFactionRoundStats;
    showFactionDetailsAction: typeof UIActions.showFactionDetails;

    setFactionStats: typeof UIActions.setFactionStats;
    setFactionRoundStats: typeof UIActions.setFactionRoundStats;

    factionStats: FactionStats;
    factionRoundStats: FactionRoundStats;
    gameRenderer: GameRenderer;
}

interface State {
    viewHotUnits: boolean;
    viewRoundNotes: boolean;
    viewLadder: boolean;
    ladderResponse: LadderResponse;
}

export class Component extends React.Component<Props, State> {
    constructor(props: Props, context: any) {
        super(props, context);
        (window as any).gameStatsPanel = this;
        this.state = {
            viewHotUnits: false,
            viewRoundNotes: false,
            viewLadder: false,
            ladderResponse: null
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
        if (this.state.viewLadder) {
            return (
                <div style={sidePanelBox}>
                    <button onClick={() => this.showLadder(false)}>Back</button>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        {this.state.ladderResponse
                            ? this.state.ladderResponse.ladder.map(l => (
                                <span key={l._id}>
                                          {l.rank+1}: {l.userName || l._id} - {l.score}
                                      </span>
                            ))
                            : 'loading'}
                    </div>
                </div>
            );
        }

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
        } else if (this.props.showFactionRoundStats) {
            const factionRoundStats = this.props.factionRoundStats;
            if (!factionRoundStats) {
                return <div style={sidePanelBox}>Retrieving</div>;
            }
            if (this.state.viewRoundNotes) {
                return (
                    <div style={sidePanelBox}>
                        <button onClick={this.hideRoundNotes}>Back</button>
                        {factionRoundStats.notes.map(a => this.renderNote(a))}
                    </div>
                );
            } else if (this.state.viewHotUnits) {
                const hotEntityCircle = {
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '10px'
                };

                const entityImage = {width: '50px'};

                return (
                    <div style={sidePanelBox}>
                        <button onClick={this.hideHotUnits}>Back</button>
                        <div style={{display: 'flex', flexDirection: 'column', flexWrap: 'wrap'}}>
                            {factionRoundStats.hotEntities.map(e => {
                                const ent = this.props.game.entities.get2(e);
                                let color: string;
                                if (e.count < 2) {
                                    color = '#284a2a';
                                } else if (e.count < 6) {
                                    color = '#4e4d23';
                                } else if (e.count < 9) {
                                    color = '#602a13';
                                }
                                return (
                                    <div
                                        key={e.id}
                                        onClick={() => this.navigateToEntity(ent)}
                                        style={{
                                            ...hotEntityCircle,
                                            cursor: 'hand',
                                            backgroundColor: color
                                        }}
                                    >
                                        <img src={GameAssets[ent.entityType].imageUrl} style={entityImage} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div style={sidePanelBox}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <button onClick={() => this.updateRound(factionRoundStats.generation - 1)}>&lt;</button>

                            <button onClick={() => this.showRound(false)}>Back</button>

                            {factionRoundStats.generation < this.props.game.generation && (
                                <button onClick={() => this.updateRound(factionRoundStats.generation + 1)}>&gt;</button>
                            )}
                        </div>

                        <span>Round {factionRoundStats.generation} Outcome:</span>
                        <span>
                            {factionRoundStats.totalPlayersVoted.toString()} Players Voted,{' '}
                            {factionRoundStats.playersVoted} in your faction.
                        </span>
                        <span>Score: {factionRoundStats.score}</span>
                        <button onClick={this.showHotUnits}>View Hot Units</button>
                        <button onClick={this.showRoundNotes}>View Round Notes</button>
                    </div>
                );
            }
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
                        onClick={() => this.showRound(true)}
                    >
                        Round {this.props.game.generation}
                    </button>
                    <button
                        style={{
                            padding: 10,
                            margin: 3
                        }}
                        onClick={() => this.showLadder(true)}
                    >
                        Ladder
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

    private showLadder = async (show: boolean) => {
        this.setState({viewLadder: show});
        if (show) {
            this.setState({ladderResponse: await DataService.getLadder()});
        }
    };

    private showRound = async (show: boolean) => {
        this.props.setFactionRoundStats(null);
        this.props.showFactionRoundStatsAction(show);
        if (show) {
            const factionRoundStats = await DataService.getFactionRoundStats(
                this.props.game.generation - 1,
                this.props.user.factionId
            );
            this.props.setFactionRoundStats(factionRoundStats);
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

    private showHotUnits = () => {
        this.setState({viewHotUnits: true});
    };

    private hideHotUnits = () => {
        this.setState({viewHotUnits: false});
    };

    private showRoundNotes = () => {
        this.setState({viewRoundNotes: true});
    };

    private hideRoundNotes = () => {
        this.setState({viewRoundNotes: false});
    };

    private async updateRound(newGeneration: number) {
        this.props.setFactionRoundStats(null);
        this.props.showFactionRoundStatsAction(true);
        const factionRoundStats = await DataService.getFactionRoundStats(newGeneration, this.props.user.factionId);
        this.props.setFactionRoundStats(factionRoundStats);
    }

    private navigateToEntity(ent: GameEntity) {
        this.props.gameRenderer.moveToEntity(ent);
    }

    public goToEntity(entityId: string) {
        const entity = this.props.game.entities.get2({id: entityId});
        if (entity) this.props.gameRenderer.moveToEntity(entity);
    }

    public goToHex(hexId: string) {
        this.props.gameRenderer.moveToHexagon(this.props.game.grid.hexes.find(a => a.id === hexId));
    }

    private renderNote(a: VoteNote) {
        const note = a.note;
        let clean = a.note;
        const noteParser = /{(\w*):([\w,]*)}/g;
        let match = noteParser.exec(note);
        while (match != null) {
            let linkTap: string;

            switch (match[1]) {
                case 'fromEntityId':
                    linkTap = `window.gameStatsPanel.goToEntity('${a.fromEntityId}')`;
                    break;
                case 'toEntityId':
                    linkTap = `window.gameStatsPanel.goToEntity('${a.toEntityId}')`;
                    break;
                case 'toHexId':
                    linkTap = `window.gameStatsPanel.goToHex('${a.toHexId}')`;
                    break;
                case 'fromHexId':
                    linkTap = `window.gameStatsPanel.goToHex('${a.fromHexId}')`;
                    break;
            }
            clean = clean.replace(
                match[0],
                `<button style="display:inline-block; " onClick="${linkTap}">${match[2]}</button>`
            );
            match = noteParser.exec(note);
        }

        return <span key={a.fromEntityId} dangerouslySetInnerHTML={{__html: clean}} />;
    }
}

export let GameStatsPanel = connect(
    (state: SwgStore) => ({
        user: state.appState.user,
        game: state.gameState.game,
        roundState: state.gameState.roundState,
        userDetails: state.gameState.userDetails,
        isVoting: state.gameState.isVoting,
        votingError: state.gameState.votingError,
        gameRenderer: state.gameState.gameRenderer,

        showFactionRoundStats: state.uiState.showFactionRoundStats,
        showFactionDetails: state.uiState.showFactionDetails,
        factionStats: state.uiState.factionStats,
        factionRoundStats: state.uiState.factionRoundStats
    }),
    {
        showFactionRoundStatsAction: UIActions.showFactionRoundStats,
        showFactionDetailsAction: UIActions.showFactionDetails,
        setFactionStats: UIActions.setFactionStats,
        setFactionRoundStats: UIActions.setFactionRoundStats
    }
)(withRouter(Component));
