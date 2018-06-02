/*
import * as React from 'react';
import {Fragment} from 'react';
import {connect} from 'react-redux';
import {GameEntity, GameHexagon, GameLogic, HexagonTileType} from '@swg-common/game';
import {Point} from '@swg-common/hex/hex';
import {HexConstants} from '../utils/hexConstants';
import {SwgStore} from '../store/reducers';
import {Dispatcher} from '../store/actions';
import {GameActions, GameThunks} from '../store/game/actions';
import {RoundState} from '@swg-common/models/roundState';
import {HexImages} from '../utils/hexImages';

interface Props {
    hexagon: GameHexagon;
    game: GameLogic;
    roundState: RoundState;
    selectedEntity?: GameEntity;
    viableHexIds: string[];
    selectedViableHex: (hex: GameHexagon) => void;
    selectEntity: (entity: GameEntity) => void;
}

interface State {}

class Component extends React.Component<Props, State> {
    shouldComponentUpdate(nextProps: Props) {
        return !this.props.roundState || this.props.roundState.hash !== nextProps.roundState.hash;
    }

    private tapHex = e => {

    };

    render() {
        const hex = this.props.hexagon;
        return (
            <image
                onClick={this.tapHex}
                xlinkHref={HexImages.hexTypeToImage(hex.tileType.type, hex.tileType.subType)}
                width={HexConstants.width}
                height={HexConstants.height}
                x={hex.center.x - HexConstants.width / 2}
                y={hex.center.y - HexConstants.height / 2}
            />
        );
    }
}

export let HexagonTile = connect(
    (state: SwgStore) => ({
        viableHexIds: state.gameState.viableHexIds,
        game: state.gameState.game,
        roundState: state.gameState.roundState,
        selectedEntity: state.gameState.selectedEntity
    }),
    (dispatch: Dispatcher) => ({

    })
)(Component);
*/
