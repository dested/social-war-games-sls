import * as React from 'react';
import {Fragment} from 'react';
import {connect} from 'react-redux';
import {GameHexagon, GameLogic, HexagonTileType} from '../../../server-common/src/game';
import {Point} from 'swg-common/bin/hex/hex';

interface Props {
    hexagon: GameHexagon;
    game: GameLogic;
}

interface State {}
export class HexagonTileBorder extends React.Component<Props, State> {
    public static factionIdToColor(factionId: string, neighborFactionId: string) {
        switch (factionId) {
            case '0':
                return 'transparent';
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
    shouldComponentUpdate() {
        return false;
    }
    render() {
        const hex = this.props.hexagon;
        const neighbor = this.props.game.grid.getNeighbors(hex);

        const lines: {line: [Point, Point]; color: string}[] = [];
        for (let i = 0; i < hex.points.length; i++) {
            const p1 = hex.points[i];
            const p2 = hex.points[(i + 1) % 6];
            if (!neighbor[i] || neighbor[i].factionId !== hex.factionId) {
                lines.push({
                    line: [p1, p2],
                    color: HexagonTileBorder.factionIdToColor(hex.factionId, !neighbor[i] ? '0' : neighbor[i].factionId)
                });
            }
        }

        return lines.map((l, i) => (
            <line
                key={i}
                x1={l.line[0].x}
                y1={l.line[0].y}
                x2={l.line[1].x}
                y2={l.line[1].y}
                stroke={l.color}
                strokeWidth={4}
            />
        ));
    }
}

export class HexagonDefaultTileBorder extends React.Component<Props, State> {
    private static defaultBorder = 'rgba(127,127,127,0.13)';
    shouldComponentUpdate() {
        return false;
    }
    render() {
        const hex = this.props.hexagon;
        return (
            <polygon
                key={'default-border'}
                stroke={HexagonDefaultTileBorder.defaultBorder}
                strokeWidth={2}
                fill={HexagonTileBorder.factionIdToColor(hex.factionId, '0').replace(',1)',',.4)')}
                points={hex.pointsSvg}
            />
        );
    }
}
