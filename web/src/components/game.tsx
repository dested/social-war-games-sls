import * as React from 'react';
import {Grid, Drawing, DrawingOptions, Point} from 'swg-common/bin/hex/hex';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {HttpUser} from 'swg-common/bin/models/http/httpUser';
import {SwgStore} from '../store/reducers';
import {Dispatch} from 'redux';
import {AppAction, AppActions} from '../store/app/actions';
import {RouteComponentProps} from 'react-router';
import {GameHexagon, GameLogic, HexagonType} from '../../../server-common/src/game';
import {HexagonTile, HexagonTileBorder} from './hexagonTile';

interface Props extends RouteComponentProps<{}> {
    user?: HttpUser;
}

interface State {
    grid?: Grid<GameHexagon>;
    gridDrawing?: Drawing;
}

export class Component extends React.Component<Props, State> {
    constructor(props: Props, context: any) {
        super(props, context);
        this.state = {};
    }

    componentDidMount() {
        if (!this.props.user) {
            this.props.history.push('/login');
            return;
        }

        const options = new DrawingOptions(69, Drawing.Orientation.PointyTop, new Point(0, 0));

        let grid = GameLogic.createGame();
        let gridDrawing = new Drawing(grid, options);
        this.setState({
            grid,
            gridDrawing
        });
    }

    render() {
        const tiles = [];
        const borders = [];
        if (this.state.grid) {
            for (let i = 0; i < this.state.grid.hexes.length; i++) {
                let hex = this.state.grid.hexes[i];
                tiles.push(<HexagonTile grid={this.state.grid} hexagon={hex} />);
                borders.push(<HexagonTileBorder grid={this.state.grid} hexagon={hex} />);
            }
        }

        return <svg style={{width:'100%',height:'100%'}}>{tiles}{borders}</svg>;
    }
}

export let Game = connect(
    (state: SwgStore) => ({
        user: state.appState.user
    }),
    (dispatch: Dispatch<AppAction>) => ({})
)(withRouter(Component));
