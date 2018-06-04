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
import {EntityAssets} from '../drawing/gameRenderer';
import {HexColors} from '../utils/hexColors';
import {ColorUtils} from '../utils/colorUtils';

interface Props extends RouteComponentProps<{}> {
    user?: HttpUser;
    selectedEntity?: GameEntity;
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
        const entity = this.props.selectedEntity;
        const entityDetails = EntityDetails[entity.entityType];
        const myEntity = this.props.user.factionId === entity.factionId;
        return (
            <div
                style={{
                    height: myEntity ? '368px' : '300px',
                    borderBottomLeftRadius: '40px',
                    width: '330px',
                    position: 'absolute',
                    right: 0,
                    backgroundColor: 'rgba(255,255,255,.6)',
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div
                    style={{
                        borderRadius: '50%',
                        width: '180px',
                        height: '180px',
                        display: 'flex',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: '10px',
                        backgroundColor: HexColors.factionIdToColor(entity.factionId, '0', '.8')
                    }}
                >
                    <img src={EntityAssets[entity.entityType].imageUrl} style={{width: '120px'}} />
                </div>
                <div
                    style={{
                        display: 'flex',
                        borderRadius: '20px',
                        border: 'solid 2px black',
                        backgroundColor: 'rgba(50,50,50,1)',
                        height: '40px'
                    }}
                >
                    <div
                        style={{
                            borderRadius: '20px',
                            width: `${entity.health / entityDetails.health * 100}%`,
                            backgroundColor: ColorUtils.lerpColor(
                                '#FF0000',
                                '#00FF00',
                                entity.health / entityDetails.health
                            )
                        }}
                    />
                </div>
                {myEntity && this.renderActions(entity)}
            </div>
        );
    }

    private renderActions(entity) {
        const actionButton = {
            width: 100,
            margin: 10,
            borderRadius: 10,
            alignItems: 'center',
            height: 100,
            color: 'white',
            justifyContent: 'center',

            display: 'flex'
        };
        const outer = {
            display: 'flex',
            justifyContent: 'center',
            fontSize: '25px'
        };

        switch (entity.entityType) {
            case 'infantry':
                return (
                    <div style={outer}>
                        <div
                            style={{...actionButton, backgroundColor: 'red'}}
                            onClick={() => this.props.startEntityAction(entity, 'attack')}
                        >
                            <span>Attack</span>
                        </div>
                        <div
                            style={{...actionButton, backgroundColor: 'blue'}}
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
                            style={{...actionButton, backgroundColor: 'red'}}
                            onClick={() => this.props.startEntityAction(entity, 'attack')}
                        >
                            <span>Attack</span>
                        </div>
                        <div
                            style={{...actionButton, backgroundColor: 'blue'}}
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
                            style={{...actionButton, backgroundColor: 'red'}}
                            onClick={() => this.props.startEntityAction(entity, 'attack')}
                        >
                            <span>Attack</span>
                        </div>
                        <div
                            style={{...actionButton, backgroundColor: 'blue'}}
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
                                backgroundColor: 'green'
                            }}
                            onClick={() => this.props.startEntityAction(entity, 'spawn')}
                        >
                            <span>Spawn</span>
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
        selectedEntity: state.gameState.selectedEntity
    }),
    (dispatch: Dispatcher) => ({
        startEntityAction: (entity: GameEntity, action: EntityAction) =>
            void dispatch(GameThunks.startEntityAction(entity, action))
    })
)(withRouter(Component));
