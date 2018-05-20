import * as React from 'react';
import {Fragment} from 'react';
import {connect} from 'react-redux';
import {GameHexagon, GameLogic, HexagonType} from '../../../server-common/src/game';
import {Point} from 'swg-common/bin/hex/hex';
import {GameEntity} from '../../../server-common/bin/game';

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
        src: `./assets/castle_large.png`,
        width: 100,
        height: 119,
        centerX: 50,
        centerY: 84
    },
    tank: {
        src: `./assets/castle_large.png`,
        width: 100,
        height: 119,
        centerX: 50,
        centerY: 84
    },

    plane: {
        src: `./assets/castle_large.png`,
        width: 100,
        height: 119,
        centerX: 50,
        centerY: 84
    },

    factory: {
        src: `./assets/castle_large.png`,
        width: 100,
        height: 119,
        centerX: 50,
        centerY: 74
    }
};

export class HexagonEntity extends React.Component<Props, State> {
    render() {
        const entity = this.props.entity;
        const hex = this.props.game.grid.getHexAt(entity);
        const asset = EntityAssets[entity.entityType];
        return (
            <Fragment>
                <image
                    xlinkHref={asset.src}
                    width={asset.width}
                    height={asset.height}
                    x={hex.center.x - asset.centerX}
                    y={hex.center.y - asset.centerY}
                />
            </Fragment>
        );
    }
}
