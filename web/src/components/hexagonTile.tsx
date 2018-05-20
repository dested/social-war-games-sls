import * as React from 'react';
import {Fragment} from 'react';
import {connect} from 'react-redux';
import {GameHexagon, HexagonType} from '../../../server-common/src/game';
import {Point, Grid} from 'swg-common/bin/hex/hex';

interface Props {
    hexagon: GameHexagon;
    grid: Grid<GameHexagon>;
}

interface State {}

export class HexagonTile extends React.Component<Props, State> {
    private hexTypeToImage(type: HexagonType) {
        switch (type.type) {
            case 'Dirt':
                return '06';
            case 'Clay':
                return '04';
            case 'Grass':
                return '02';
            case 'Stone':
                return '03';
        }
    }
    render() {
        const hex = this.props.hexagon;
        return (
            <Fragment key={hex.id}>
                <image
                    xlinkHref={`./assets/dirt_${this.hexTypeToImage(hex.type)}.png`}
                    width={120}
                    height={140}
                    x={hex.center.x - 120 / 2}
                    y={hex.center.y - 140 / 2}
                />
                <text x={hex.center.x} y={hex.center.y}>
                    {hex.x},{hex.y}
                </text>
            </Fragment>
        );
    }
}

export class HexagonTileBorder extends React.Component<Props, State> {
    private factionIdToColor(factionId: string, neighborFactionId: string) {
        switch (factionId) {
            case '0':
                return null;
            case '1':
                switch (neighborFactionId) {
                    case '0':
                        return 'rgba(255,0,0,1)';
                    case '1':
                        return 'rgba(2550,0,0,1)';
                    case '2':
                        return 'rgba(127,127,0,1)';
                    case '3':
                        return 'rgba(127,0,127,1)';
                }
                break;
            case '2':
                switch (neighborFactionId) {
                    case '0':
                        return 'rgba(0,255,0,1)';
                    case '1':
                        return 'rgba(127,127,0,1)';
                    case '2':
                        return 'rgba(0,255,0,1)';
                    case '3':
                        return 'rgba(0,127,127,1)';
                }
                break;
            case '3':
                switch (neighborFactionId) {
                    case '0':
                        return 'rgba(0,0,255,1)';
                    case '1':
                        return 'rgba(127,0,127,1)';
                    case '2':
                        return 'rgba(0,127,127,1)';
                    case '3':
                        return 'rgba(0,0,255,1)';
                }
                break;
        }
    }

    render() {
        const hex = this.props.hexagon;
        if (hex.factionId === '0') return [];

        const neighbor = this.props.grid.getNeighbors(hex);
        /*        console.log('---');
        console.log(hex.x + ',' + hex.y+','+hex.factionId);
        console.log(neighbor.map(a => a.x + ',' + a.y+','+a.factionId).join(' '));
        console.log('---');*/

        /*
        console.log('---');
        console.log(Math.round(hex.center.x) + ',' + Math.round(hex.center.y));
        console.log(hex.points.map(a => Math.round(a.x) + ',' + Math.round(a.y)).join(' '));
        console.log('---');
*/

        const lines: {line: [Point, Point]; color: string}[] = [];
        for (let i = 0; i < hex.points.length; i++) {
            const p1 = hex.points[i];
            const p2 = hex.points[(i + 1) % 6];
            const noNeighbor = !neighbor[i] || neighbor[i].factionId === '0';
            if (noNeighbor || neighbor[i].factionId !== hex.factionId) {
                lines.push({
                    line: [p1, p2],
                    color: this.factionIdToColor(hex.factionId, noNeighbor ? '0' : neighbor[i].factionId)
                });
            }
        }

        return lines.map(l => (
            <line
                x1={l.line[0].x}
                y1={l.line[0].y}
                x2={l.line[1].x}
                y2={l.line[1].y}
                style={{
                    stroke: l.color,
                    strokeWidth: 4
                }}
            />
        ));
    }
}
