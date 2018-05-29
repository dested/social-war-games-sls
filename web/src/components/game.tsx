import * as React from 'react';
import {Fragment} from 'react';
import {Drawing, DrawingOptions, Point} from '@swg-common/hex/hex';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {SwgStore} from '../store/reducers';
import {Dispatch} from 'redux';
import {AppAction, AppActions} from '../store/app/actions';
import {RouteComponentProps} from 'react-router';
import {EntityAction, GameEntity, GameLogic} from '@swg-common/game';
import {HexagonTile} from './hexagonTile';
import {HexagonEntity} from './hexagonEntities';
import {HexagonDefaultTileBorder, HexagonTileBorder} from './hexagonTileBorder';
import {Manager, Swipe, Pan} from 'hammerjs';
import {HexConstants} from '../utils/hexConstants';
import {DebounceUtils} from '../utils/debounceUtils';
import {GameAction, GameActions, GameThunks} from '../store/game/actions';
import {Dispatcher} from '../store/actions';
import {DataService} from '../dataServices';
import {RoundState} from '@swg-common/models/roundState';
import {GameSidePanel} from './gameSidePanel';

interface Props extends RouteComponentProps<{}> {
    user?: HttpUser;
    selectedEntity?: GameEntity;
    game?: GameLogic;
    imagesLoading?: number;
    roundState?: RoundState;
    updateGame: typeof GameActions.updateGame;
    startLoading: typeof GameThunks.startLoading;
}

interface State {
    viewX: number;
    viewY: number;
}

export class Component extends React.Component<Props, State> {
    constructor(props: Props, context: any) {
        super(props, context);
        this.state = {
            viewX: 0,
            viewY: 0
        };
    }

    async componentDidMount() {
        if (!this.props.user) {
            this.props.history.push('/login');
            return;
        }

        const manager = new Manager(document.body);
        this.props.startLoading();

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
            });
        });
        manager.on('panstart', e => {
            startX = e.center.x;
            startY = e.center.y;
            startViewX = this.state.viewX;
            startViewY = this.state.viewY;
        });
        manager.on('panend', e => {});
        const options = new DrawingOptions(HexConstants.height / 2 - 1, Drawing.Orientation.PointyTop, new Point(0, 0));

        const layout = await DataService.getLayout();
        const gameState = await DataService.getGameState();
        const roundState = await DataService.getRoundState();

        let game = GameLogic.buildGame(layout, gameState);

        new Drawing(game.grid, options);
        this.props.updateGame(game, roundState);

        setInterval(async () => {
            const gameState = await DataService.getGameState();
            const roundState = await DataService.getRoundState();
            let shouldUpdate = true;
            if (this.props.roundState.hash.indexOf(roundState.hash) === 0) {
                if (gameState.generation === this.props.game.generation) {
                    shouldUpdate = false;
                }
            }
            if (shouldUpdate) {
                const game = GameLogic.buildGame(layout, gameState);
                new Drawing(game.grid, options);
                this.props.updateGame(game, roundState);
            }
        }, 5 * 1000);
        setInterval(() => {
            this.forceUpdate();
        }, 1000);
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
        if (this.props.imagesLoading > 0) {
            return (
                <div style={{width: '30%', height: '30%', margin: 'auto'}}>Images Left: {this.props.imagesLoading}</div>
            );
        }
        let percent = '100%';
        if (this.props.game) {
            for (const hexagon of this.props.game.grid.hexes) {
                if (
                    hexagon.center.x > view.x &&
                    hexagon.center.x < view.x + view.width &&
                    hexagon.center.y > view.y &&
                    hexagon.center.y < view.y + view.height
                ) {
                    tiles.push(<HexagonTile key={hexagon.id + '-tile'} hexagon={hexagon} />);
                    borders.push(<HexagonTileBorder key={hexagon.id + '-border'} hexagon={hexagon} />);
                    defaultBorders.push(
                        <HexagonDefaultTileBorder key={hexagon.id + '-default-border'} hexagon={hexagon} />
                    );
                    const entity = this.props.game.entities.find(a => a.x === hexagon.x && a.y === hexagon.y);
                    if (entity) {
                        entities.push(<HexagonEntity key={hexagon.id + '-ent'} entity={entity} />);
                    }
                }
            }
            percent = (60 * 1000 - (this.props.game.roundEnd - +new Date())) / (60 * 1000) * 100 + '%';
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
                <div
                    style={{
                        width: '100%',
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                        height: 30,
                        backgroundColor: 'grey'
                    }}
                >
                    <div
                        style={{
                            width: percent,
                            position: 'absolute',
                            bottom: 0,
                            height: 30,
                            backgroundColor: 'green'
                        }}
                    />
                </div>
                {this.props.selectedEntity && <GameSidePanel />}
            </Fragment>
        );
    }
}

export let Game = connect(
    (state: SwgStore) => ({
        user: state.appState.user,
        imagesLoading: state.gameState.imagesLoading,
        game: state.gameState.game,
        roundState: state.gameState.roundState,
        selectedEntity: state.gameState.selectedEntity
    }),
    {
        updateGame: GameActions.updateGame,
        startLoading: GameThunks.startLoading
    }
)(withRouter(Component));
