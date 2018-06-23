import * as React from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {SwgStore} from '../store/reducers';
import {RouteComponentProps} from 'react-router';
import {UI, UIActions, UIThunks} from '../store/actions';
import {RoundState} from '@swg-common/models/roundState';
import {GameModel} from '@swg-common/game/gameLogic';
import {Factions, GameEntity} from '@swg-common/game/entityDetail';
import {HexColors} from '../utils/hexColors';
import {GameAssets} from '../drawing/gameAssets';
import {HexConstants} from '../utils/hexConstants';
import {VoteResult} from '@swg-common/game/voteResult';
import {FactionRoundStats} from '@swg-common/models/roundStats';
import {FactionStats} from '@swg-common/models/factionStats';
import {GameRenderer} from '../drawing/gameRenderer';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {padding} from 'glamor/utils';
import {LadderResponse} from '@swg-common/models/http/userController';
import {VoteNote} from '@swg-common/models/voteNote';
import {Fragment} from 'react';
import {Utils} from '@swg-common/utils/utils';
import {FactionStatsCanvas} from './factionStatsCanvas';

interface Props extends RouteComponentProps<{}> {
    user?: HttpUser;
    roundState?: RoundState;
    userDetails?: UserDetails;
    game?: GameModel;

    ui: UI;

    ladder: LadderResponse;
    factionStats: FactionStats[];
    factionRoundStats: FactionRoundStats;
    getFactionRoundStats: typeof UIThunks.getFactionRoundStats;

    gameRenderer: GameRenderer;
}

interface State {}

export class Component extends React.Component<Props, State> {
    constructor(props: Props, context: any) {
        super(props, context);
        this.state = {};
        (window as any).uiStatsPanel = this;
    }

    render() {
        if (this.props.ui === 'None') {
            return null;
        }

        const margin = 100;

        const box = {
            height: `50vh`,
            borderRadius: '40px',
            width: `30vw`,
            padding: 50,
            position: 'absolute' as 'absolute',
            marginLeft: margin / 2,
            marginTop: margin / 2,
            backgroundColor: 'rgba(255,255,255,.9)',
            display: 'flex',
            flexDirection: 'column' as 'column'
        };
        return (
            <div style={box}>
                {(this.props.ui === 'Ladder' && this.renderLadder()) ||
                    (this.props.ui === 'FactionStats' && this.renderFactionStats()) ||
                    (this.props.ui === 'Bases' && this.renderBases()) ||
                    (this.props.ui === 'RoundStats' && this.renderRoundStats())}
            </div>
        );
    }

    private renderLadder() {
        if (!this.props.ladder) {
            return 'loading';
        }

        return (
            <div style={{display: 'flex', flexDirection: 'column'}}>
                {this.props.ladder.ladder.map(l => (
                    <span key={l._id}>
                        {l.rank + 1}: {l.userName || l._id} - {l.score}
                    </span>
                ))}
            </div>
        );
    }
    private renderFactionStats() {
        if (!this.props.factionStats) {
            return 'loading';
        }

        return <FactionStatsCanvas factionStats={this.props.factionStats} />;
    }

    private renderBases() {
        const entityCircle = {
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '10px'
        };

        const entityImage = {width: '50px'};

        return this.props.game.entities.array
            .filter(a => a.factionId === this.props.user.factionId && a.entityType === 'factory')
            .map(factory => {
                return (
                    <div
                        key={factory.id}
                        onClick={() => this.navigateToEntity(factory)}
                        style={{
                            ...entityCircle,
                            cursor: 'hand',
                            backgroundColor: HexColors.factionIdToColor(factory.factionId, '0', '.8')
                        }}
                    >
                        <img src={GameAssets[factory.entityType].imageUrl} style={entityImage} />
                    </div>
                );
            });
    }

    private renderRoundStats() {
        const factionRoundStats = this.props.factionRoundStats;
        if (!factionRoundStats) {
            return 'loading';
        }

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
            <div style={{display: 'flex', height: '100%'}}>
                <div style={{flex: 2, display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <button onClick={() => this.updateRound(factionRoundStats.generation - 1)}>&lt;</button>
                        {factionRoundStats.generation < this.props.game.generation - 1 && (
                            <button onClick={() => this.updateRound(factionRoundStats.generation + 1)}>&gt;</button>
                        )}
                    </div>

                    <span>Round {factionRoundStats.generation} Outcome:</span>
                    <span>
                        {factionRoundStats.totalPlayersVoted.toString()} Players Voted, {factionRoundStats.playersVoted}{' '}
                        in your faction.
                    </span>
                    <span>Score: {factionRoundStats.score}</span>
                </div>
                <div style={{flex: 1, overflow: 'scroll'}}>
                    <span>Hot Units</span>
                    <div style={{display: 'flex', flexDirection: 'column', flexWrap: 'wrap'}}>
                        {factionRoundStats.hotEntities.map(e => {
                            const ent = this.props.game.entities.get2(e);
                            if (!ent) return null;
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
                <div style={{flex: 2, overflow: 'scroll', display: 'flex', flexDirection: 'column'}}>
                    <span>Notes</span>

                    {factionRoundStats.notes.map(a => this.renderNote(a))}
                </div>
            </div>
        );
    }

    private navigateToEntity(ent: GameEntity) {
        this.props.gameRenderer.moveToEntity(ent);
    }

    public goToEntity(entityId: number) {
        const entity = this.props.game.entities.get2({id: entityId});
        if (entity) this.props.gameRenderer.moveToEntity(entity);
    }

    public goToHex(hexId: string) {
        this.props.gameRenderer.moveToHexagon(this.props.game.grid.hexes.find(a => a.id === hexId));
    }

    private renderNote(a: VoteNote) {
        const note = a.note;
        let clean = a.note;
        const noteParser = /{(\w*):([-\w,]*)}/g;
        let match = noteParser.exec(note);
        while (match != null) {
            let linkTap: string;

            switch (match[1]) {
                case 'fromEntityId':
                    linkTap = `window.uiStatsPanel.goToEntity('${a.fromEntityId}')`;
                    break;
                case 'toEntityId':
                    linkTap = `window.uiStatsPanel.goToEntity('${a.toEntityId}')`;
                    break;
                case 'toHexId':
                    linkTap = `window.uiStatsPanel.goToHex('${a.toHexId}')`;
                    break;
                case 'fromHexId':
                    linkTap = `window.uiStatsPanel.goToHex('${a.fromHexId}')`;
                    break;
            }
            clean = clean.replace(
                match[0],
                `<a href="javascript:${linkTap}" style="display:inline-block;text-decoration: none; color:grey; ">${
                    match[2]
                }</a>`
            );
            match = noteParser.exec(note);
        }

        return (
            <span
                style={{margin: 15, textAlign: 'center'}}
                key={a.fromEntityId}
                dangerouslySetInnerHTML={{__html: clean}}
            />
        );
    }

    private updateRound(generation: number) {
        this.props.getFactionRoundStats(generation);
    }
}

export let UIPanel = connect(
    (state: SwgStore) => ({
        user: state.appState.user,
        game: state.gameState.game,
        roundState: state.gameState.localRoundState,
        userDetails: state.gameState.userDetails,
        gameRenderer: state.gameState.gameRenderer,

        ladder: state.uiState.ladder,
        factionStats: state.uiState.factionStats,
        factionRoundStats: state.uiState.factionRoundStats,

        ui: state.uiState.ui
    }),
    {
        getFactionRoundStats: UIThunks.getFactionRoundStats
    }
)(withRouter(Component));
