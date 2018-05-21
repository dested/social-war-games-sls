import * as React from 'react';
import {Fragment} from 'react';
import {connect} from 'react-redux';
import {GameHexagon, GameLogic, HexagonTileType} from '../../../server-common/src/game';
import {Point} from 'swg-common/bin/hex/hex';
import {GameEntity} from '../../../server-common/bin/game';
import {HexConstants} from '../utils/hexConstants';

interface Props {
    entity: GameEntity;
    game: GameLogic;
}

interface State {}

type EntityAsset = {
    src: string;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
};

export let EntityAssets: {[key: string]: EntityAsset} = {
    infantry: {
        src: `./assets/infantry.png`,
        width: 120,
        height: 180,
        centerX: 60,
        centerY: 110
    },
    tank: {
        src: `./assets/tank.png`,
        width: 120,
        height: 140,
        centerX: 60,
        centerY: 70
    },

    plane: {
        src: `./assets/plane.png`,
        width: 120,
        height: 140,
        centerX: 60,
        centerY: 70
    },

    factory: {
        src: `./assets/factory.png`,
        width: 120,
        height: 140,
        centerX: 60,
        centerY: 70
    }
};

export class HexagonEntity extends React.Component<Props, State> {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        const entity = this.props.entity;
        const hex = this.props.game.grid.getHexAt(entity);
        const asset = EntityAssets[entity.entityType];
        const wRatio = HexConstants.width / HexConstants.defaultWidth;
        const hRatio = HexConstants.height / HexConstants.defaultHeight;
        return (
            <Fragment>
                <image
                    xlinkHref={asset.src}
                    width={asset.width * wRatio}
                    height={asset.height * hRatio}
                    x={hex.center.x - asset.centerX * wRatio}
                    y={hex.center.y - asset.centerY * hRatio}
                />
            </Fragment>
        );
    }
}
