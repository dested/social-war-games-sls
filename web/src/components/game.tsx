import * as React from 'react';
import {Grid, Drawing, DrawingOptions, Point} from 'swg-common/bin/hex/hex';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {HttpUser} from '../../../common/bin/models/http/httpUser';
import {SwgStore} from '../store/reducers';
import {Dispatch} from 'redux';
import {AppAction, AppActions} from '../store/app/actions';
import {RouteComponentProps} from 'react-router';

interface Props extends RouteComponentProps<{}> {
    user?: HttpUser;
}

interface State {
    grid?: any;
    gridDrawing?: any;
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

        const options = new DrawingOptions(
            70,
            Drawing.Orientation.PointyTop,
            new Point(window.innerWidth / 2, window.innerHeight / 2)
        );

        let grid = new Grid(15);
        let gridDrawing = new Drawing(grid, options);
        this.setState({
            grid,
            gridDrawing
        });
    }

    render() {
        const divs = [];
        if (this.state.grid) {
            console.log(this.state.grid);
            for (let i = 0; i < this.state.grid.hexes.length; i++) {
                let hex = this.state.grid.hexes[i];
                divs.push(
                    <img
                        key={i}
                        style={{position: 'absolute', width: 120, height: 140, left: hex.center.x - 120 / 2, top: hex.center.y - 140 / 2}}
                        src={`./assets/dirt_${this.items()[Math.floor((Math.random() * this.items().length))]}.png`}
                    />
                );
            }
        }

        return divs;
    }

    public items() {
        return [
            '02',
            '03',
            '04',
            '05',
            '06',
            '07',
            '08',
            '09',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
            '18',
        ]
    }
}

export let Game = connect(
    (state: SwgStore) => ({
        user: state.appState.user
    }),
    (dispatch: Dispatch<AppAction>) => ({})
)(withRouter(Component));
