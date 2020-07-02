import {GameEntity} from '@swg-common/game/entityDetail';
import {VoteNote} from '@swg-common/models/voteNote';
import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {RouteComponentProps} from 'react-router';
import {withRouter} from 'react-router-dom';
import {GameAssets} from '../drawing/gameAssets';
import {GameStoreName, GameStoreProps} from '../store/game/store';
import {MainStoreName, MainStoreProps} from '../store/main/store';
import {UIStore, UIStoreName, UIStoreProps} from '../store/ui/store';
import {HexColors} from '../utils/hexColors';
import {FactionStatsCanvas} from './factionStatsCanvas';
import './uiPanel.css';

interface Props extends RouteComponentProps<{}>, MainStoreProps, GameStoreProps, UIStoreProps {}

interface State {}

@inject(MainStoreName, GameStoreName, UIStoreName)
@observer
export class Component extends React.Component<Props, State> {
  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {};
    (window as any).uiStatsPanel = this;
  }

  render() {
    if (this.props.uiStore.ui === 'None') {
      return null;
    }

    return (
      <div className={`main-window`}>
        <div className={`window-border main-window-border`}>
          <div className={`flex-row`}>
            <div className="main-window-title-holder">
              <div className={`main-window-title-border`} />
              <div className={`main-window-title`}>{this.props.uiStore.ui}</div>
            </div>
          </div>

          <div className={`main-window-inner`}>
            {(this.props.uiStore.ui === 'Ladder' && this.renderLadder()) ||
              (this.props.uiStore.ui === 'FactionStats' && this.renderFactionStats()) ||
              (this.props.uiStore.ui === 'Bases' && this.renderBases()) ||
              (this.props.uiStore.ui === 'RoundStats' && this.renderRoundStats())}
          </div>
        </div>
      </div>
    );
  }

  private renderLadder() {
    if (!this.props.uiStore.ladder) {
      return 'loading';
    }

    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        {this.props.uiStore.ladder.ladder.map((l) => (
          <span key={l._id}>
            {l.rank + 1}: {l.userName || l._id} - {l.score}
          </span>
        ))}
      </div>
    );
  }

  private renderFactionStats() {
    if (!this.props.uiStore.factionStats) {
      return 'loading';
    }

    return <FactionStatsCanvas factionStats={this.props.uiStore.factionStats} />;
  }

  private renderBases() {
    const entityCircle = {
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '10px',
    };

    const entityImage = {width: '50px'};

    return this.props.gameStore.game.entities.array
      .filter((a) => a.factionId === this.props.mainStore.user.factionId && a.entityType === 'factory')
      .map((factory) => {
        return (
          <div
            key={factory.id}
            onClick={() => this.navigateToEntity(factory)}
            style={{
              ...entityCircle,
              cursor: 'hand',
              backgroundColor: HexColors.factionIdToColor(factory.factionId, 0, '.8'),
            }}
          >
            <img src={GameAssets[factory.entityType].imageUrl} style={entityImage} />
          </div>
        );
      });
  }

  private renderRoundStats() {
    const factionRoundStats = this.props.uiStore.factionRoundStats;
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
      margin: '10px',
    };

    const entityImage = {width: '50px'};

    return (
      <div style={{display: 'flex', height: '100%'}}>
        <div style={{flex: 2, display: 'flex', flexDirection: 'column'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <button onClick={() => this.updateRound(factionRoundStats.generation - 1)}>&lt;</button>
            {factionRoundStats.generation < this.props.gameStore.game.generation - 1 && (
              <button onClick={() => this.updateRound(factionRoundStats.generation + 1)}>&gt;</button>
            )}
          </div>

          <span>Round {factionRoundStats.generation} Outcome:</span>
          <span>
            {factionRoundStats.totalPlayersVoted.toString()} Players Voted, {factionRoundStats.playersVoted} in your
            faction.
          </span>
          <span>Score: {factionRoundStats.score}</span>
        </div>
        <div style={{flex: 1, overflow: 'scroll'}}>
          <span>Hot Units</span>
          <div style={{display: 'flex', flexDirection: 'column', flexWrap: 'wrap'}}>
            {factionRoundStats.hotEntities.map((e: any) => {
              const ent = this.props.gameStore.game.entities.get2(e);
              if (!ent) {
                return null;
              }
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
                    backgroundColor: color,
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

          {factionRoundStats.notes.map((a: any) => this.renderNote(a))}
        </div>
      </div>
    );
  }

  private navigateToEntity(ent: GameEntity) {
    this.props.gameStore.gameRenderer.moveToEntity(ent);
  }

  goToEntity(entityId: number) {
    const entity = this.props.gameStore.game.entities.get2({id: entityId});
    if (entity) {
      this.props.gameStore.gameRenderer.moveToEntity(entity);
    }
  }

  goToHex(hexId: string) {
    this.props.gameStore.gameRenderer.moveToHexagon(this.props.gameStore.game.grid.hexes.find((a) => a.id === hexId));
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
        `<a href="javascript:${linkTap}" style="display:inline-block;text-decoration: none; color:grey; ">${match[2]}</a>`
      );
      match = noteParser.exec(note);
    }

    return (
      <span style={{margin: 15, textAlign: 'center'}} key={a.fromEntityId} dangerouslySetInnerHTML={{__html: clean}} />
    );
  }

  private updateRound = async (generation: number) => {
    await UIStore.getFactionRoundStats(generation);
  };
}

export let UIPanel = withRouter(Component);
