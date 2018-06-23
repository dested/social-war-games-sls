import * as React from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {HttpUser} from '@swg-common/models/http/httpUser';
import {SwgStore} from '../store/reducers';
import {RouteComponentProps} from 'react-router';
import {UI, UIActions, UIThunks} from '../store/actions';
import {RoundState} from '@swg-common/models/roundState';
import {GameModel} from '@swg-common/game/gameLogic';
import {Factions, GameEntity, OfFaction} from '@swg-common/game/entityDetail';
import {HexColors} from '../utils/hexColors';
import {GameAssets} from '../drawing/gameAssets';
import {HexConstants} from '../utils/hexConstants';
import {VoteResult} from '@swg-common/game/voteResult';
import {FactionRoundStats} from '@swg-common/models/roundStats';
import {FactionStat, FactionStats} from '@swg-common/models/factionStats';
import {GameRenderer} from '../drawing/gameRenderer';
import {UserDetails} from '@swg-common/models/http/userDetails';
import {padding} from 'glamor/utils';
import {LadderResponse} from '@swg-common/models/http/userController';
import {VoteNote} from '@swg-common/models/voteNote';
import {Fragment} from 'react';
import {Utils} from '@swg-common/utils/utils';
import {Point} from '@swg-common/hex/hex';

interface Props {
    factionStats: FactionStats[];
}

interface State {}

export class FactionStatsCanvas extends React.Component<Props, State> {
    canvas = React.createRef<HTMLCanvasElement>();

    constructor(props: Props, context: any) {
        super(props, context);
        this.state = {};
    }
    componentDidMount() {
        this.updateCanvas();
    }
    updateCanvas() {
        const ctx = this.canvas.current.getContext('2d');

        const padding = 20;

        const width = 300;
        const height = 300;

        const field: keyof FactionStat = 'score';

        const factionStats = this.props.factionStats;
        const all = Utils.mapMany(factionStats, a => Factions.map(f => a[f][field]));
        const max = Math.max(...all);
        const min = Math.min(...all);

        const lines: OfFaction<Point[]> = {'1': [], '2': [], '3': []};
        let x = 0;
        const len = factionStats.length;
        const xSize = (width - padding * 2) / len;
        const ySize = (height - padding * 2) / (max - min === 0 ? 2 : max - min);
        for (const factionStat of factionStats) {
            for (const faction of Factions) {
                lines[faction].push({
                    x: x * xSize,
                    y: height - padding * 2 - (factionStat[faction][field] - min) * ySize
                });
            }
            x++;
        }
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.save();
        ctx.translate(20, 20);
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        for (const faction of Factions) {
            ctx.beginPath();
            ctx.moveTo(lines[faction][0].x, lines[faction][0].y);
            for (const point of lines[faction]) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.strokeStyle = HexColors.factionIdToColor(faction);
            ctx.stroke();
        }
        ctx.restore();
    }
    render() {
        return <canvas ref={this.canvas} width={300} height={300} />;
    }
}
