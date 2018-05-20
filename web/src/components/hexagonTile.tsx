import * as React from 'react';
import {Fragment} from 'react';
import {connect} from 'react-redux';
import {GameHexagon, GameLogic, HexagonType} from '../../../server-common/src/game';
import {Point} from 'swg-common/bin/hex/hex';

interface Props {
    hexagon: GameHexagon;
    game: GameLogic;
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
            <Fragment>
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
