import * as React from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {SwgStore} from '../store/reducers';
import {RouteComponentProps} from 'react-router';
import {EntityAction, GameEntity, GameLogic} from '@swg-common/game';
import {GameThunks} from '../store/game/actions';
import {Dispatcher} from '../store/actions';
import {RoundState} from '@swg-common/models/roundState';

interface Props extends RouteComponentProps<{}> {
    user?: HttpUser;
    isVoting?: boolean;
    selectedEntity?: GameEntity;
    roundState?: RoundState;
    game?: GameLogic;
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
        let actions;
        const actionButton = {
            width: 100,
            margin: 10,
            borderRadius: 5,
            alignItems: 'center',
            justifyContent: 'center',
            height: 100,
            color: 'white',
            display: 'flex'
        };

        switch (entity.entityType) {
            case 'infantry':
                actions = (
                    <div style={{display: 'flex'}}>
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
                break;
            case 'tank':
                actions = (
                    <div style={{display: 'flex'}}>
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
                break;
            case 'plane':
                actions = (
                    <div style={{display: 'flex'}}>
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
                break;
            case 'factory':
                actions = (
                    <div style={{display: 'flex'}}>
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
                break;
        }

        return (
            <div
                style={{
                    height: '100%',
                    width: '30%',
                    position: 'absolute',
                    right: 0,
                    backgroundColor: 'rgba(255,255,255,.8)',
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <span>{entity.entityType}</span>
                <span>Health: {entity.health}</span>
                <span>Faction: {entity.factionId}</span>
                {this.props.user.factionId === entity.factionId && actions}
                {this.props.isVoting === true && 'Submitting your vote!'}
            </div>
        );
    }
}

export let GameSidePanel = connect(
    (state: SwgStore) => ({
        user: state.appState.user,
        isVoting: state.gameState.isVoting,
        game: state.gameState.game,
        roundState: state.gameState.roundState,
        selectedEntity: state.gameState.selectedEntity
    }),
    (dispatch: Dispatcher) => ({
        startEntityAction: (entity: GameEntity, action: EntityAction) =>
            void dispatch(GameThunks.startEntityAction(entity, action))
    })
)(withRouter(Component));
