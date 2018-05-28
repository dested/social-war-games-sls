import * as React from 'react';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import { GameEntity, GameHexagon, GameLogic, HexagonTileType } from '@swg-common/game';
import { Point } from '@swg-common/hex/hex';
import { HexConstants } from '../utils/hexConstants';
import { Dispatch } from 'redux';
import { AppAction, AppActions } from '../store/app/actions';
import { GameAction, GameActions } from '../store/game/actions';
import { Dispatcher } from '../store/actions';
import { SwgStore } from '../store/reducers';
import { RoundState } from '@swg-common/models/roundState';
import * as _ from 'lodash';

interface Props {
    entity: GameEntity;
    game: GameLogic;
    roundState: RoundState;
    selectEntity: (entity: GameEntity) => void;
}

interface State { }

type EntityAsset = {
    src: string;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
};

export let EntityAssets: { [key: string]: EntityAsset } = {
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

export class Component extends React.Component<Props, State> {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        const entity = this.props.entity;
        const hex = this.props.game.grid.getHexAt(entity);
        const asset = EntityAssets[entity.entityType];
        const wRatio = HexConstants.width / HexConstants.defaultWidth;
        const hRatio = HexConstants.height / HexConstants.defaultHeight;
        let rectX = hex.center.x - HexConstants.width / 3;
        let voteRectX = hex.center.x + HexConstants.width / 3;
        let rectY = hex.center.y;
        let rectWidth = HexConstants.width * 0.35;
        let rectHeight = HexConstants.height * 0.4;
        let fontSize = rectWidth / 2;

        const voteCount =this.props.roundState.entities[entity.id] &&  _.sum(this.props.roundState.entities[entity.id].map(a => a.count))

        return (
            <Fragment>
                <image
                    style={{ pointerEvents: 'none' }}
                    xlinkHref={asset.src}
                    width={asset.width * wRatio}
                    height={asset.height * hRatio}
                    x={hex.center.x - asset.centerX * wRatio}
                    y={hex.center.y - asset.centerY * hRatio}
                />
                <rect x={rectX} y={rectY} width={rectWidth} height={rectHeight}
                    fill={'black'} rx={'5'} ry={'5'} />
                <text
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize={fontSize}
                    width={rectWidth}
                    x={rectX + rectWidth / 2}
                    y={rectY + rectHeight / 2 + 1}
                    fill={'white'}
                >
                    {entity.health}
                </text>
                {
                    voteCount > 0 &&
                    <>
                        <rect fill={'grey'} x={voteRectX} y={rectY} width={rectWidth} height={rectHeight} rx={'5'} ry={'5'} />
                        <text
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fontSize={fontSize}
                            width={rectWidth}
                            x={voteRectX + rectWidth / 2}
                            y={rectY + rectHeight / 2 + 1}
                            fill={'white'}
                        >
                            {voteCount}
                        </text>
                    </>
                }
            </Fragment>
        );
    }
}

export let HexagonEntity = connect(
    (state: SwgStore) => ({
        game: state.gameState.game,
        roundState: state.gameState.roundState,
    }),
    (dispatch: Dispatcher) => ({
        selectEntity: (entity: GameEntity) => void dispatch(GameActions.selectEntity(entity))
    })
)(Component);
