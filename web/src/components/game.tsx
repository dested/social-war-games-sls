import * as React from 'react';
import {Fragment} from 'react';
import {Grid, Drawing, DrawingOptions, Point} from 'swg-common/bin/hex/hex';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {HttpUser} from 'swg-common/bin/models/http/httpUser';
import {SwgStore} from '../store/reducers';
import {Dispatch} from 'redux';
import {AppAction, AppActions} from '../store/app/actions';
import {RouteComponentProps} from 'react-router';
import {EntityAction, GameEntity, GameLogic} from '../../../common/src/game';
import {HexagonTile} from './hexagonTile';
import {HexagonEntity} from './hexagonEntities';
import {HexagonDefaultTileBorder, HexagonTileBorder} from './hexagonTileBorder';
import {Manager, Swipe, Pan} from 'hammerjs';
import {HexConstants} from '../utils/hexConstants';
import {DebounceUtils} from '../utils/debounceUtils';
import {GameAction, GameActions, GameThunks} from '../store/game/actions';
import {Dispatcher} from '../store/actions';

interface Props extends RouteComponentProps<{}> {
    user?: HttpUser;
    isVoting?: boolean;
    selectedEntity?: GameEntity;
    setGame: (game: GameLogic) => void;
    startEntityAction: (entity: GameEntity, action: EntityAction) => void;
}

interface State {
    viewX: number;
    viewY: number;
    game?: GameLogic;
    gridDrawing?: Drawing;
}

export class Component extends React.Component<Props, State> {
    constructor(props: Props, context: any) {
        super(props, context);
        this.state = {
            viewX: 0,
            viewY: 0
        };
    }

    componentDidMount() {
        if (!this.props.user) {
            this.props.history.push('/login');
            return;
        }

        const manager = new Manager(document.body);
        // const swipe = new Swipe();
        manager.add(new Pan({direction: Hammer.DIRECTION_ALL, threshold: 5}));
        // manager.add(swipe);
        let startX = 0;
        let startY = 0;
        let startViewX = 0;
        let startViewY = 0;
        manager.on('panmove', e => {
            if (e.velocity === 0) return;
            this.setState({
                viewX: startViewX + (startX - e.center.x),
                viewY: startViewY + (startY - e.center.y)
            }); /*
            DebounceUtils.wait('pan', 16, () => {
                this.setState({
                    viewX: startViewX + (startX - e.center.x),
                    viewY: startViewY + (startY - e.center.y)
                });
            });*/
        });
        manager.on('panstart', e => {
            startX = e.center.x;
            startY = e.center.y;
            startViewX = this.state.viewX;
            startViewY = this.state.viewY;
        });
        manager.on('panend', e => {});
        /*        manager.on('swipe', e => {
            deltaX = deltaX + e.deltaX;
            deltaY = deltaY + e.deltaY;
            this.setState({
                viewX: deltaX,
                viewY: deltaY
            });
        })*/ const options = new DrawingOptions(
            HexConstants.height / 2 - 1,
            Drawing.Orientation.PointyTop,
            new Point(0, 0)
        );

        let game = GameLogic.createGame();
        let gridDrawing = new Drawing(game.grid, options);
        this.setState({
            game,
            gridDrawing
        });
        this.props.setGame(game);
    }

    render() {
        const tiles = [];
        const borders = [];
        const defaultBorders = [];
        const entities = [];
        const viewSlop = 100;
        const view = {
            x: this.state.viewX - viewSlop,
            y: this.state.viewY - viewSlop,
            width: window.innerWidth + viewSlop * 2,
            height: window.innerHeight + viewSlop * 2
        };

        if (this.state.game) {
            for (const hexagon of this.state.game.grid.hexes) {
                if (
                    hexagon.center.x > view.x &&
                    hexagon.center.x < view.x + view.width &&
                    hexagon.center.y > view.y &&
                    hexagon.center.y < view.y + view.height
                ) {
                    tiles.push(<HexagonTile key={hexagon.id + '-tile'} game={this.state.game} hexagon={hexagon} />);
                    borders.push(
                        <HexagonTileBorder key={hexagon.id + '-border'} game={this.state.game} hexagon={hexagon} />
                    );
                    defaultBorders.push(
                        <HexagonDefaultTileBorder
                            key={hexagon.id + '-default-border'}
                            game={this.state.game}
                            hexagon={hexagon}
                        />
                    );
                    const entity = this.state.game.entities.find(a => a.x === hexagon.x && a.y === hexagon.y);
                    if (entity) {
                        entities.push(
                            <HexagonEntity key={hexagon.id + '-ent'} game={this.state.game} entity={entity} />
                        );
                    }
                }
            }
        }
        return (
            <Fragment>
                <svg style={{width: '100%', height: '100%'}}>
                    <g
                        id={'game-board'}
                        style={{
                            transform: `translateX(${-(view.x + viewSlop)}px) translateY(${-(view.y + viewSlop)}px)`
                        }}
                    >
                        {tiles}
                        {defaultBorders}
                        {borders}
                        {entities}
                    </g>
                </svg>
                {this.props.selectedEntity && this.renderSidePanel()}
            </Fragment>
        );
    }

    private renderSidePanel() {
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
                {actions}
                {this.props.isVoting === true && 'Submitting your vote!'}
            </div>
        );
    }
}

export let Game = connect(
    (state: SwgStore) => ({
        user: state.appState.user,
        isVoting: state.gameState.isVoting,
        selectedEntity: state.gameState.selectedEntity
    }),
    (dispatch: Dispatcher) => ({
        setGame: (game: GameLogic) => void dispatch(GameActions.setGame(game)),
        startEntityAction: (entity: GameEntity, action: EntityAction) =>
            void dispatch(GameThunks.startEntityAction(entity, action))
    })
)(withRouter(Component));
