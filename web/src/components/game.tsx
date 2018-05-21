import * as React from 'react';
import {Grid, Drawing, DrawingOptions, Point} from 'swg-common/bin/hex/hex';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {HttpUser} from 'swg-common/bin/models/http/httpUser';
import {SwgStore} from '../store/reducers';
import {Dispatch} from 'redux';
import {AppAction, AppActions} from '../store/app/actions';
import {RouteComponentProps} from 'react-router';
import {GameLogic} from '../../../server-common/src/game';
import {HexagonTile} from './hexagonTile';
import {HexagonEntity} from './hexagonEntities';
import {HexagonDefaultTileBorder, HexagonTileBorder} from './hexagonTileBorder';
import {Manager, Swipe, Pan} from 'hammerjs';
import {HexConstants} from '../utils/hexConstants';
import {DebounceUtils} from '../utils/debounceUtils';

interface Props extends RouteComponentProps<{}> {
    user?: HttpUser;
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
            DebounceUtils.wait('pan', 16, () => {
                this.setState({
                    viewX: startViewX + (startX - e.center.x),
                    viewY: startViewY + (startY - e.center.y)
                });
            });
        });
        manager.on('panstart', e => {
            startX = e.center.x;
            startY = e.center.y;
            startViewX = this.state.viewX;
            startViewY = this.state.viewY;
        });
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
            <svg style={{width: '100%', height: '100%'}}>
                <g style={{transform: `translateX(${-(view.x + viewSlop)}px) translateY(${-(view.y + viewSlop)}px)`}}>
                    {tiles}
                    {defaultBorders}
                    {borders}
                    {entities}
                </g>
            </svg>
        );
    }
}

export let Game = connect(
    (state: SwgStore) => ({
        user: state.appState.user
    }),
    (dispatch: Dispatch<AppAction>) => ({})
)(withRouter(Component));
