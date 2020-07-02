import {EntityAction, EntityDetails, GameEntity} from '@swg-common/game/entityDetail';
import {ResourceDetails} from '@swg-common/game/gameResource';
import {Utils} from '@swg-common/utils/utils';
import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {Fragment, SFC} from 'react';
import {RouteComponentProps} from 'react-router';
import {withRouter} from 'react-router-dom';
import {GameAssets} from '../drawing/gameAssets';
import {GameStore, GameStoreName, GameStoreProps} from '../store/game/store';
import {MainStoreName, MainStoreProps} from '../store/main/store';
import {ColorUtils} from '../utils/colorUtils';
import './actionPanel.css';
import './global.css';

interface Props extends RouteComponentProps<{}>, MainStoreProps, GameStoreProps {}

interface State {}

@inject(MainStoreName, GameStoreName)
@observer
export class Component extends React.Component<Props, State> {
  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {};
  }

  render() {
    if (this.props.gameStore.selectedEntity) {
      return this.renderEntity();
    } else if (this.props.gameStore.selectedResource) {
      return this.renderResource();
    }
  }

  private renderResource() {
    const resource = this.props.gameStore.selectedResource;
    const resourceDetails = ResourceDetails[resource.resourceType];

    const currentFaction = this.props.gameStore.game.grid.getHexAt(resource).factionId;

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
    const entity = this.props.gameStore.selectedEntity;
    const entityDetails = EntityDetails[entity.entityType];
    debugger;
    const myEntity = this.props.mainStore.user.factionId === entity.factionId;

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

    const selected = this.props.gameStore.selectedEntityAction;

    switch (entity.entityType) {
      case 'infantry':
        return (
          <Fragment>
            <div className={`action-button-holder`}>
              <div
                className={`button action-button ${selected === 'move' && 'selected-button'}`}
                onClick={() => GameStore.startEntityAction(entity, 'move')}
              >
                Move
              </div>
              {moveCount > 0 && <Badge count={moveCount} />}
            </div>
            <div className="action-button-holder">
              <div
                className={`button action-button ${selected === 'attack' && 'selected-button'}`}
                onClick={() => GameStore.startEntityAction(entity, 'attack')}
              >
                Attack
              </div>
              {attackCount > 0 && <Badge count={attackCount} />}
            </div>
            <div className="action-button-holder">
              <div
                className={`button action-button ${selected === 'mine' && 'selected-button'}`}
                onClick={() => GameStore.startEntityAction(entity, 'mine')}
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
                onClick={() => GameStore.startEntityAction(entity, 'move')}
              >
                Move
              </div>
              {moveCount > 0 && <Badge count={moveCount} />}
            </div>
            <div className="action-button-holder">
              <div
                className={`button action-button ${selected === 'attack' && 'selected-button'}`}
                onClick={() => GameStore.startEntityAction(entity, 'attack')}
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
                onClick={() => GameStore.startEntityAction(entity, 'move')}
              >
                Move
              </div>
              {moveCount > 0 && <Badge count={moveCount} />}
            </div>
            <div className="action-button-holder">
              <div
                className={`button action-button ${selected === 'attack' && 'selected-button'}`}
                onClick={() => GameStore.startEntityAction(entity, 'attack')}
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
                onClick={() => GameStore.startEntityAction(entity, 'spawn-infantry')}
              >
                Spawn Infantry
              </div>
              {spawnInfantryCount > 0 && <Badge count={spawnInfantryCount} />}
            </div>
            <div className="action-button-holder">
              <div
                className={`button action-button ${selected === 'spawn-tank' && 'selected-button'}`}
                onClick={() => GameStore.startEntityAction(entity, 'spawn-tank')}
              >
                Spawn Tank
              </div>
              {spawnTankCount > 0 && <Badge count={spawnTankCount} />}
            </div>
            <div className="action-button-holder">
              <div
                className={`button action-button ${selected === 'spawn-plane' && 'selected-button'}`}
                onClick={() => GameStore.startEntityAction(entity, 'spawn-plane')}
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
    return this.props.gameStore.roundState.entities[entity.id]
      ? Utils.sum(this.props.gameStore.roundState.entities[entity.id].filter(a => a.action === action), a => a.count)
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

export let ActionPanel = withRouter(Component);
