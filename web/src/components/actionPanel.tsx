import {EntityAction, EntityDetails, GameEntity} from '@swg-common/game/entityDetail';
import {GameModel} from '@swg-common/game/gameLogic';
import {GameResource, ResourceDetails} from '@swg-common/game/gameResource';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {RoundState} from '@swg-common/models/roundState';
import {Utils} from '@swg-common/utils/utils';
import * as React from 'react';
import {SFC} from 'react';
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
        return (
            <div
                className="flex-row window-z action-window"
                style={{top: 50, height: 100, position: 'absolute', right: 50}}
            >
                <div className="action-window-left window-border">hi</div>
                <div className="action-window-right window-border">hi</div>
                <div className="action-window-inner">
                    <div className="black-box">
                        <div className="button action">Attack</div>
                        <div className="button action">Move</div>
                        <div className="button action">Mine</div>
                    </div>
                    <div className="health-bar" />
                    <div className="radar" />
                </div>
            </div>
        );
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

        const sidePanelBox = HexConstants.isMobile
            ? {
                  height: '175px',
                  borderBottomLeftRadius: '20px',
                  width: '150px',
                  position: 'absolute' as 'absolute',
                  right: 0,
                  backgroundColor: 'rgba(255,255,255,.6)',
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'column' as 'column'
              }
            : {
                  height: '300px',
                  borderBottomLeftRadius: '40px',
                  width: '330px',
                  position: 'absolute' as 'absolute',
                  right: 0,
                  backgroundColor: 'rgba(255,255,255,.6)',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column' as 'column'
              };

        const sidePanelEntityCircle = HexConstants.isMobile
            ? {
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '10px',
                  backgroundColor: HexColors.factionIdToColor(currentFaction, '0', '.8')
              }
            : {
                  borderRadius: '50%',
                  width: '180px',
                  height: '180px',
                  display: 'flex',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '10px',
                  backgroundColor: HexColors.factionIdToColor(currentFaction, '0', '.8')
              };

        const healthBar = HexConstants.isMobile
            ? {
                  display: 'flex',
                  borderRadius: '10px',
                  border: 'solid 2px black',
                  backgroundColor: 'rgba(50,50,50,1)',
                  height: '20px'
              }
            : {
                  display: 'flex',
                  borderRadius: '20px',
                  border: 'solid 2px black',
                  backgroundColor: 'rgba(50,50,50,1)',
                  height: '40px'
              };
        const healthBarInner = HexConstants.isMobile
            ? {
                  borderRadius: '10px',
                  width: `${(resource.currentCount / resourceDetails.startingCount) * 100}%`,
                  backgroundColor: ColorUtils.lerpColor(
                      '#FF0000',
                      '#00FF00',
                      resource.currentCount / resourceDetails.startingCount
                  )
              }
            : {
                  borderRadius: '20px',
                  width: `${(resource.currentCount / resourceDetails.startingCount) * 100}%`,
                  backgroundColor: ColorUtils.lerpColor(
                      '#FF0000',
                      '#00FF00',
                      resource.currentCount / resourceDetails.startingCount
                  )
              };

        const entityImage = HexConstants.isMobile ? {width: '50px'} : {width: '120px'};

        return (
            <div style={sidePanelBox}>
                <div style={sidePanelEntityCircle}>
                    <img src={GameAssets[resource.resourceType].imageUrl} style={entityImage} />
                </div>
                <div style={healthBar}>
                    <div style={healthBarInner} />
                </div>
            </div>
        );
    }

    private renderEntity() {
        const entity = this.props.selectedEntity;
        const entityDetails = EntityDetails[entity.entityType];
        const myEntity = this.props.user.factionId === entity.factionId;

        const healthColor = ColorUtils.lerpColor('#FF0000', '#00FF00', entity.health / entityDetails.health);
        const imageUrl = GameAssets[entity.entityType].imageUrl;

        return (
            <div className={'flex-row'} style={{top: 50, height: 100, position: 'absolute', right: 50}}>
                <div
                    className={'window-border-left'}
                    style={{
                        width: 200
                    }}
                >
                    hi
                </div>

                <div className={'window-border-right'}>ho</div>
            </div>
        );

        /*(
            <div style={sidePanelBox}>
                <div style={sidePanelEntityCircle}>
                    <img src={imageUrl} style={entityImage} />
                </div>
                <div style={healthBar}>
                    <div style={healthBarInner} />
                </div>
                {myEntity && this.renderActions(entity)}
            </div>
        )*/
    }

    private renderActions(entity: GameEntity) {
        if (entity.busy) {
            return (
                <span>
                    Busy for {entity.busy.ticks} more tick{entity.busy.ticks === 1 ? '' : 's'}
                </span>
            );
        }

        const actionButton = HexConstants.isMobile
            ? {
                  width: 50,
                  margin: 10,
                  position: 'relative' as any,
                  borderRadius: 10,
                  alignItems: 'center',
                  height: 35,
                  color: 'white',
                  justifyContent: 'center',
                  display: 'flex'
              }
            : {
                  width: 100,
                  margin: 10,
                  position: 'relative' as any,
                  borderRadius: 10,
                  alignItems: 'center',
                  height: 100,
                  color: 'white',
                  justifyContent: 'center',
                  display: 'flex'
              };

        const outer = HexConstants.isMobile
            ? {
                  display: 'flex',
                  justifyContent: 'center',
                  fontSize: '13px'
              }
            : {
                  display: 'flex',
                  justifyContent: 'center',
                  fontSize: '25px'
              };

        const selectedButton = HexConstants.isMobile
            ? {
                  border: 'solid 3px black'
              }
            : {
                  border: 'solid 5px black'
              };

        const attackCount = this.getActionCount(entity, 'attack');
        const moveCount = this.getActionCount(entity, 'move');
        const mineCount = this.getActionCount(entity, 'mine');
        const spawnInfantryCount = this.getActionCount(entity, 'spawn-infantry');
        const spawnTankCount = this.getActionCount(entity, 'spawn-tank');
        const spawnPlaneCount = this.getActionCount(entity, 'spawn-plane');

        switch (entity.entityType) {
            case 'infantry':
                return (
                    <div style={outer}>
                        <div
                            style={{
                                ...actionButton,
                                backgroundColor: 'red',
                                ...(this.props.selectedEntityAction === 'attack' && selectedButton)
                            }}
                            onClick={() => this.props.startEntityAction(entity, 'attack')}
                        >
                            <span>Attack</span>
                            {attackCount > 0 && <Badge count={attackCount} />}
                        </div>
                        <div
                            style={{
                                ...actionButton,
                                backgroundColor: 'purple',
                                ...(this.props.selectedEntityAction === 'mine' && selectedButton)
                            }}
                            onClick={() => this.props.startEntityAction(entity, 'mine')}
                        >
                            <span>Mine</span>
                            {mineCount > 0 && <Badge count={mineCount} />}
                        </div>
                        <div
                            style={{
                                ...actionButton,
                                backgroundColor: 'blue',
                                ...(this.props.selectedEntityAction === 'move' && selectedButton)
                            }}
                            onClick={() => this.props.startEntityAction(entity, 'move')}
                        >
                            <span>Move</span>
                            {moveCount > 0 && <Badge count={moveCount} />}
                        </div>
                    </div>
                );
            case 'tank':
                return (
                    <div style={outer}>
                        <div
                            style={{
                                ...actionButton,
                                backgroundColor: 'red',
                                ...(this.props.selectedEntityAction === 'attack' && selectedButton)
                            }}
                            onClick={() => this.props.startEntityAction(entity, 'attack')}
                        >
                            <span>Attack</span>
                            {attackCount > 0 && <Badge count={attackCount} />}
                        </div>
                        <div
                            style={{
                                ...actionButton,
                                backgroundColor: 'blue',
                                ...(this.props.selectedEntityAction === 'move' && selectedButton)
                            }}
                            onClick={() => this.props.startEntityAction(entity, 'move')}
                        >
                            <span>Move</span>
                            {moveCount > 0 && <Badge count={moveCount} />}
                        </div>
                    </div>
                );
            case 'plane':
                return (
                    <div style={outer}>
                        <div
                            style={{
                                ...actionButton,
                                backgroundColor: 'red',
                                ...(this.props.selectedEntityAction === 'attack' && selectedButton)
                            }}
                            onClick={() => this.props.startEntityAction(entity, 'attack')}
                        >
                            <span>Attack</span>
                            {attackCount > 0 && <Badge count={attackCount} />}
                        </div>
                        <div
                            style={{
                                ...actionButton,
                                backgroundColor: 'blue',
                                ...(this.props.selectedEntityAction === 'move' && selectedButton)
                            }}
                            onClick={() => this.props.startEntityAction(entity, 'move')}
                        >
                            <span>Move</span>
                            {moveCount > 0 && <Badge count={moveCount} />}
                        </div>
                    </div>
                );
            case 'factory':
                return (
                    <div style={outer}>
                        <div
                            style={{
                                ...actionButton,
                                backgroundColor: 'green',
                                ...(this.props.selectedEntityAction === 'spawn-infantry' && selectedButton)
                            }}
                            onClick={() => this.props.startEntityAction(entity, 'spawn-infantry')}
                        >
                            <span style={{fontSize: 17}}>Spawn Infantry ({EntityDetails.infantry.spawnCost})</span>
                            {spawnInfantryCount > 0 && <Badge count={spawnInfantryCount} />}
                        </div>
                        <div
                            style={{
                                ...actionButton,
                                backgroundColor: 'green',
                                ...(this.props.selectedEntityAction === 'spawn-tank' && selectedButton)
                            }}
                            onClick={() => this.props.startEntityAction(entity, 'spawn-tank')}
                        >
                            <span style={{fontSize: 17}}>Spawn Tank ({EntityDetails.tank.spawnCost})₽</span>
                            {spawnTankCount > 0 && <Badge count={spawnTankCount} />}
                        </div>
                        <div
                            style={{
                                ...actionButton,
                                backgroundColor: 'green',
                                ...(this.props.selectedEntityAction === 'spawn-plane' && selectedButton)
                            }}
                            onClick={() => this.props.startEntityAction(entity, 'spawn-plane')}
                        >
                            <span style={{fontSize: 17}}>Spawn Plane ({EntityDetails.plane.spawnCost})₽</span>
                            {spawnPlaneCount > 0 && <Badge count={spawnPlaneCount} />}
                        </div>
                    </div>
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
                position: 'absolute',
                borderRadius: '50%',
                background: '#9b2d2d',
                top: '-.5em',
                right: '-.5em',
                padding: '.5em',
                fontSize: '16px',
                fontWeight: 'bold'
            }}
        >
            {count}
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
        selectedEntityAction: state.gameState.selectedEntityAction
    }),
    (dispatch: Dispatcher) => ({
        startEntityAction: (entity: GameEntity, action: EntityAction) =>
            void dispatch(GameThunks.startEntityAction(entity, action))
    })
)(withRouter(Component));
