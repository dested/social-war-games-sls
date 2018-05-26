import * as React from 'react';
import {Fragment} from 'react';
import {connect} from 'react-redux';
import {GameHexagon, GameLogic, HexagonTileType} from 'swg-common/bin/game';
import {Point} from 'swg-common/bin/hex/hex';
import {SwgStore} from '../store/reducers';

interface Props {
    hexagon: GameHexagon;
    game: GameLogic;
    viableHexIds?: string[];
}

interface State {}
class ComponentTileBorder extends React.Component<Props, State> {
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

    private get isViableHex() {
        if (!this.props.viableHexIds) return false;
        let hexId = this.props.hexagon.id;
        return this.props.viableHexIds.find(a => a === hexId);
    }

    shouldComponentUpdate(nextProps: Props) {
        if (nextProps.viableHexIds !== this.props.viableHexIds) return true;

        if (nextProps.viableHexIds && nextProps.viableHexIds.find(a => a === nextProps.hexagon.id)) {
            return true;
        }
        return false;
    }

    render() {
        if (this.isViableHex) return [];

        const hex = this.props.hexagon;
        const neighbor = this.props.game.grid.getNeighbors(hex);

        const lines: {line: [Point, Point]; color: string}[] = [];
        for (let i = 0; i < hex.points.length; i++) {
            const p1 = hex.points[i];
            const p2 = hex.points[(i + 1) % 6];
            if (!neighbor[i] || neighbor[i].factionId !== hex.factionId) {
                lines.push({
                    line: [p1, p2],
                    color: ComponentTileBorder.factionIdToColor(
                        hex.factionId,
                        !neighbor[i] ? '0' : neighbor[i].factionId
                    )
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

export let HexagonTileBorder = connect((state: SwgStore) => ({
    viableHexIds: state.gameState.viableHexIds
}))(ComponentTileBorder);

class ComponentDefaultTileBorder extends React.Component<Props, State> {
    private static defaultBorder = 'rgba(127,127,127,0.13)';
    private get isViableHex() {
        if (!this.props.viableHexIds) return false;
        let hexId = this.props.hexagon.id;
        return this.props.viableHexIds.find(a => a === hexId);
    }
    shouldComponentUpdate(nextProps: Props) {
        if (nextProps.viableHexIds !== this.props.viableHexIds) return true;

        if (nextProps.viableHexIds && nextProps.viableHexIds.find(a => a === nextProps.hexagon.id)) {
            return true;
        }
        return false;
    }
    render() {
        const hex = this.props.hexagon;
        let isViableHex = this.isViableHex;
        return (
            <polygon
                style={{pointerEvents: 'none'}}
                key={'default-border'}
                stroke={ComponentDefaultTileBorder.defaultBorder}
                strokeWidth={isViableHex ? 4 : 2}
                fill={
                    isViableHex
                        ? 'rgba(128,52,230,.25)'
                        : ComponentTileBorder.factionIdToColor(hex.factionId, '0').replace(',1)', ',.4)')
                }
                points={hex.pointsSvg}
            />
        );
    }
}

export let HexagonDefaultTileBorder = connect((state: SwgStore) => ({
    viableHexIds: state.gameState.viableHexIds
}))(ComponentDefaultTileBorder);
