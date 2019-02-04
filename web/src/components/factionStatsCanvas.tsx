import {Factions, GameEntity, OfFaction} from '@swg-common/game/entityDetail';
import {FactionStat, FactionStats} from '@swg-common/models/factionStats';
import {Utils} from '@swg-common/utils/utils';
import * as React from 'react';
import {HexColors} from '../utils/hexColors';
import {Point} from '@swg-common/utils/hexUtils';

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

    const field: keyof FactionStat = 's';

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
          y: height - padding * 2 - (factionStat[faction][field] - min) * ySize,
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
