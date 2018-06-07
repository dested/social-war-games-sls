import * as React from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {SwgStore} from '../store/reducers';
import {RouteComponentProps} from 'react-router';
import {GameThunks} from '../store/game/actions';
import {Dispatcher} from '../store/actions';
import {RoundState} from '@swg-common/models/roundState';
import {GameModel} from '@swg-common/game/gameLogic';
import {EntityAction, EntityDetails, GameEntity} from '@swg-common/game/entityDetail';
import {HexColors} from '../utils/hexColors';
import {ColorUtils} from '../utils/colorUtils';
import {GameAssets} from '../drawing/gameAssets';
import {GameResource, ResourceDetails} from '@swg-common/game/gameResource';
import {HexConstants} from '../utils/hexConstants';

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
                  width: `${resource.currentCount / resourceDetails.startingCount * 100}%`,
                  backgroundColor: ColorUtils.lerpColor(
                      '#FF0000',
                      '#00FF00',
                      resource.currentCount / resourceDetails.startingCount
                  )
              }
            : {
                  borderRadius: '20px',
                  width: `${resource.currentCount / resourceDetails.startingCount * 100}%`,
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
                  height: myEntity ? '368px' : '300px',
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
                  backgroundColor: HexColors.factionIdToColor(entity.factionId, '0', '.8')
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
                  backgroundColor: HexColors.factionIdToColor(entity.factionId, '0', '.8')
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
                  width: `${entity.health / entityDetails.health * 100}%`,
                  backgroundColor: ColorUtils.lerpColor('#FF0000', '#00FF00', entity.health / entityDetails.health)
              }
            : {
                  borderRadius: '20px',
                  width: `${entity.health / entityDetails.health * 100}%`,
                  backgroundColor: ColorUtils.lerpColor('#FF0000', '#00FF00', entity.health / entityDetails.health)
              };

        const entityImage = HexConstants.isMobile ? {width: '50px'} : {width: '120px'};

        return (
            <div style={sidePanelBox}>
                <div style={sidePanelEntityCircle}>
                    <img src={GameAssets[entity.entityType].imageUrl} style={entityImage} />
                </div>
                <div style={healthBar}>
                    <div style={healthBarInner} />
                </div>
                {myEntity && this.renderActions(entity)}
            </div>
        );
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
                            <span>Spawn Infantry ({EntityDetails.infantry.spawnCost})₽</span>
                        </div>
                        <div
                            style={{
                                ...actionButton,
                                backgroundColor: 'green',
                                ...(this.props.selectedEntityAction === 'spawn-tank' && selectedButton)
                            }}
                            onClick={() => this.props.startEntityAction(entity, 'spawn-tank')}
                        >
                            <span>Spawn Tank ({EntityDetails.tank.spawnCost})₽</span>
                        </div>
                        <div
                            style={{
                                ...actionButton,
                                backgroundColor: 'green',
                                ...(this.props.selectedEntityAction === 'spawn-plane' && selectedButton)
                            }}
                            onClick={() => this.props.startEntityAction(entity, 'spawn-plane')}
                        >
                            <span>Spawn Plane ({EntityDetails.plane.spawnCost})₽</span>
                        </div>
                    </div>
                );
        }
    }
}

export let GameSidePanel = connect(
    (state: SwgStore) => ({
        user: state.appState.user,
        game: state.gameState.game,
        roundState: state.gameState.roundState,
        selectedEntity: state.gameState.selectedEntity,
        selectedResource: state.gameState.selectedResource,
        selectedEntityAction: state.gameState.selectedEntityAction
    }),
    (dispatch: Dispatcher) => ({
        startEntityAction: (entity: GameEntity, action: EntityAction) =>
            void dispatch(GameThunks.startEntityAction(entity, action))
    })
)(withRouter(Component));
