import {EntityAction, EntityDetails, GameEntity} from '@swg-common/game/entityDetail';
import {GameModel} from '@swg-common/game/gameLogic';
import {GameResource, ResourceDetails} from '@swg-common/game/gameResource';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {RoundState} from '@swg-common/models/roundState';
import {Utils} from '@swg-common/utils/utils';
import * as React from 'react';
import {Fragment, SFC} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps} from 'react-router';
import {withRouter} from 'react-router-dom';
import {GameAssets} from '../drawing/gameAssets';
import {Dispatcher} from '../store/actions';
import {GameThunks} from '../store/game/actions';
import {SwgStore} from '../store/reducers';
import {ColorUtils} from '../utils/colorUtils';
import {HexColors} from '../utils/hexColors';
import {HexConstants} from '../utils/hexConstants';
import './actionPanel.css';
import './global.css';

interface Props extends RouteComponentProps<{}> {
  user?: HttpUser;
  selectedEntity?: GameEntity;
  selectedResource?: GameResource;
  selectedEntityAction?: EntityAction;
  roundState?: RoundState;
  game?: GameModel;
  startEntityAction: typeof GameThunks.startEntityAction;
}

interface State {}

export class Component extends React.Component<Props, State> {
  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {};
  }

  render() {
    if (this.props.selectedEntity) {
      return this.renderEntity();
    } else if (this.props.selectedResource) {
      return this.renderResource();
    }
  }

  private renderResource() {
    const resource = this.props.selectedResource;
    const resourceDetails = ResourceDetails[resource.resourceType];

    const currentFaction = this.props.game.grid.getHexAt(resource).factionId;

    const healthPercent = resource.currentCount / resourceDetails.startingCount;
    const healthColor = ColorUtils.lerpColor(
      '#FF0000',
      '#00FF00',
      resource.currentCount / resourceDetails.startingCount
    );

    return (
      <div className={`window-z action-window small-action-window`}>
        <div className="window-border action-window-left small-action-window-left" />
        <div className="window-border action-window-right small-action-window-right" />
        <div className="action-window-inner">
          <div className="action-health-bar-outer">
            <div
              className="action-health-bar-inner"
              style={{
                height: `${healthPercent * 100}%`,
                backgroundColor: healthColor,
              }}
            />
          </div>
          <div className="radar">
            <img className="radar-icon" src={GameAssets[resource.resourceType].imageUrl} />
          </div>
        </div>
      </div>
    );
  }

  private renderEntity() {
    const entity = this.props.selectedEntity;
    const entityDetails = EntityDetails[entity.entityType];
    const myEntity = this.props.user.factionId === entity.factionId;

    const healthPercent = entity.health / entityDetails.health;
    const healthColor = ColorUtils.lerpColor('#FF0000', '#00FF00', healthPercent);
    const imageUrl = GameAssets[entity.entityType].imageUrl;

    return (
      <div className={`flex-row window-z action-window ${!myEntity && 'small-action-window'}`}>
        <div className={`window-border action-window-left ${!myEntity && 'small-action-window-left'}`} />
        <div className={`window-border action-window-right ${!myEntity && 'small-action-window-right'}`} />
        <div className="action-window-inner">
          {myEntity && <div className="black-box action-list-box">{this.renderActions(entity)}</div>}
          <div className="action-health-bar-outer">
            <div
              className="action-health-bar-inner"
              style={{
                height: `${healthPercent * 100}%`,
                backgroundColor: healthColor,
              }}
            />
          </div>
          <div className={`radar-outer`}>
            <img className="radar-icon" src={imageUrl} />
            <div
              className={`radar radar-${entity.factionId}`}
              style={{backgroundImage: 'url(./assets/ui/small-radar.png)'}}
            />
          </div>
        </div>
      </div>
    );
  }

  private renderActions(entity: GameEntity) {
    if (entity.busy) {
      return (
        <span style={{color: '#cccccc', fontSize: 22}}>
          Busy for {entity.busy.ticks} more tick{entity.busy.ticks === 1 ? '' : 's'}
        </span>
      );
    }

    const attackCount = this.getActionCount(entity, 'attack');
    const moveCount = this.getActionCount(entity, 'move');
    const mineCount = this.getActionCount(entity, 'mine');
    const spawnInfantryCount = this.getActionCount(entity, 'spawn-infantry');
    const spawnTankCount = this.getActionCount(entity, 'spawn-tank');
    const spawnPlaneCount = this.getActionCount(entity, 'spawn-plane');

    const selected = this.props.selectedEntityAction;

    switch (entity.entityType) {
      case 'infantry':
        return (
          <Fragment>
            <div className={`action-button-holder`}>
              <div
                className={`button action-button ${selected === 'move' && 'selected-button'}`}
                onClick={() => this.props.startEntityAction(entity, 'move')}
              >
                Move
              </div>
              {moveCount > 0 && <Badge count={moveCount} />}
            </div>
            <div className="action-button-holder">
              <div
                className={`button action-button ${selected === 'attack' && 'selected-button'}`}
                onClick={() => this.props.startEntityAction(entity, 'attack')}
              >
                Attack
              </div>
              {attackCount > 0 && <Badge count={attackCount} />}
            </div>
            <div className="action-button-holder">
              <div
                className={`button action-button ${selected === 'mine' && 'selected-button'}`}
                onClick={() => this.props.startEntityAction(entity, 'mine')}
              >
                Mine
              </div>
              {mineCount > 0 && <Badge count={mineCount} />}
            </div>
          </Fragment>
        );
      case 'tank':
        return (
          <Fragment>
            <div className="action-button-holder">
              <div
                className={`button action-button ${selected === 'move' && 'selected-button'}`}
                onClick={() => this.props.startEntityAction(entity, 'move')}
              >
                Move
              </div>
              {moveCount > 0 && <Badge count={moveCount} />}
            </div>
            <div className="action-button-holder">
              <div
                className={`button action-button ${selected === 'attack' && 'selected-button'}`}
                onClick={() => this.props.startEntityAction(entity, 'attack')}
              >
                Attack
              </div>
              {attackCount > 0 && <Badge count={attackCount} />}
            </div>
            <div className={`fake-button`}>&nbsp;</div>
          </Fragment>
        );

      case 'plane':
        return (
          <Fragment>
            <div className="action-button-holder">
              <div
                className={`button action-button ${selected === 'move' && 'selected-button'}`}
                onClick={() => this.props.startEntityAction(entity, 'move')}
              >
                Move
              </div>
              {moveCount > 0 && <Badge count={moveCount} />}
            </div>
            <div className="action-button-holder">
              <div
                className={`button action-button ${selected === 'attack' && 'selected-button'}`}
                onClick={() => this.props.startEntityAction(entity, 'attack')}
              >
                Attack
              </div>
              {attackCount > 0 && <Badge count={attackCount} />}
            </div>

            <div className={`fake-button`}>&nbsp;</div>
          </Fragment>
        );
      case 'factory':
        return (
          <Fragment>
            <div className={`action-button-holder`}>
              <div
                className={`button action-button ${selected === 'spawn-infantry' && 'selected-button'}`}
                onClick={() => this.props.startEntityAction(entity, 'spawn-infantry')}
              >
                Spawn Infantry
              </div>
              {spawnInfantryCount > 0 && <Badge count={spawnInfantryCount} />}
            </div>
            <div className="action-button-holder">
              <div
                className={`button action-button ${selected === 'spawn-tank' && 'selected-button'}`}
                onClick={() => this.props.startEntityAction(entity, 'spawn-tank')}
              >
                Spawn Tank
              </div>
              {spawnTankCount > 0 && <Badge count={spawnTankCount} />}
            </div>
            <div className="action-button-holder">
              <div
                className={`button action-button ${selected === 'spawn-plane' && 'selected-button'}`}
                onClick={() => this.props.startEntityAction(entity, 'spawn-plane')}
              >
                Spawn Plane
              </div>
              {spawnPlaneCount > 0 && <Badge count={spawnPlaneCount} />}
            </div>
          </Fragment>
        );
    }
  }

  private getActionCount(entity: GameEntity, action: EntityAction) {
    return this.props.roundState.entities[entity.id]
      ? Utils.sum(this.props.roundState.entities[entity.id].filter(a => a.action === action), a => a.count)
      : 0;
  }
}

export let Badge: SFC<{count: number}> = ({count}) => {
  return (
    <span
      style={{
        borderRadius: '50%',
        width: '34px',
        height: '34px',
        margin: '5px',
        color: 'white',
        background: '#9b2d2d',
        padding: '.5em',
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'center',
      }}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
};

export let ActionPanel = connect(
  (state: SwgStore) => ({
    user: state.appState.user,
    game: state.gameState.game,
    roundState: state.gameState.localRoundState,
    selectedEntity: state.gameState.selectedEntity,
    selectedResource: state.gameState.selectedResource,
    selectedEntityAction: state.gameState.selectedEntityAction,
  }),
  (dispatch: Dispatcher) => ({
    startEntityAction: GameThunks.startEntityAction,
  })
)(withRouter(Component));
