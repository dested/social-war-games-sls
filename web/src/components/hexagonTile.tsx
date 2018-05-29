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
    private hexTypeToImage(type: HexagonTileType) {
        switch (type.type) {
            case 'Dirt':
                switch (type.subType) {
                    case '1':
                        return './assets/tiles/Dirt/dirt_06.png';
                    case '2':
                        return './assets/tiles/Dirt/dirt_12.png';
                    case '3':
                        return './assets/tiles/Dirt/dirt_14.png';
                    case '4':
                        return './assets/tiles/Dirt/dirt_15.png';
                    case '5':
                        return './assets/tiles/Dirt/dirt_16.png';
                }
                break;
            case 'Clay':
                switch (type.subType) {
                    case '1':
                        return './assets/tiles/Sand/sand_07.png';
                    case '2':
                        return './assets/tiles/Sand/sand_12.png';
                    case '3':
                        return './assets/tiles/Sand/sand_14.png';
                    case '4':
                        return './assets/tiles/Sand/sand_16.png';
                    case '5':
                        return './assets/tiles/Sand/sand_17.png';
                }
                break;
            case 'Grass':
                switch (type.subType) {
                    case '1':
                        return './assets/tiles/Grass/grass_05.png';
                    case '2':
                        return './assets/tiles/Grass/grass_10.png';
                    case '3':
                        return './assets/tiles/Grass/grass_12.png';
                    case '4':
                        return './assets/tiles/Grass/grass_15.png';
                    case '5':
                        return './assets/tiles/Grass/grass_16.png';
                }
                break;
            case 'Stone':
                switch (type.subType) {
                    case '1':
                        return './assets/tiles/Stone/stone_07.png';
                    case '2':
                        return './assets/tiles/Stone/stone_12.png';
                    case '3':
                        return './assets/tiles/Stone/stone_13.png';
                    case '4':
                        return './assets/tiles/Stone/stone_16.png';
                    case '5':
                        return './assets/tiles/Stone/stone_17.png';
                }
                break;

            case 'Water':
                switch (type.subType) {
                    case '1':
                        return './assets/tiles/Water/water_05.png';
                    case '2':
                        return './assets/tiles/Water/water_11.png';
                    case '3':
                        return './assets/tiles/Water/water_12.png';
                    case '4':
                        return './assets/tiles/Water/water_14.png';
                    case '5':
                        return './assets/tiles/Water/water_15.png';
                }
                break;
        }
    }

    shouldComponentUpdate(nextProps: Props) {
        return !this.props.roundState || this.props.roundState.hash !== nextProps.roundState.hash;
    }

    private tapHex = e => {
        if (this.props.viableHexIds && this.props.viableHexIds.find(a => a === this.props.hexagon.id)) {
            this.props.selectedViableHex(this.props.hexagon);
        } else {
            const tappedEntity = this.props.game.entities.find(
                a => a.x === this.props.hexagon.x && a.y === this.props.hexagon.y
            );
            if (tappedEntity) {
                e.stopPropagation();
                this.props.selectEntity(tappedEntity);
                /*const gameBoard = document.getElementById('game-board');
        let transform = gameBoard.style.transform;
        const matches = transform.match(/translateX\(((-?\d*.?\d*)(px)?)\) translateY\(((-?\d*.?\d*)(px)?)\)( scale\((\d*)\))?/);
        console.log(gameBoard.style.transform,matches)
        let x = parseFloat(matches[2]);
        let y = parseFloat(matches[5]);
        let scale = parseFloat(matches[8]) || 1;

        scale = 2;
        x -= window.innerWidth / 2;
        y -= window.innerHeight / 2;

        gameBoard.style.transform = `translateX(${x}px) translateY(${y}px) scale(${scale})`;*/
            } else {
                if (this.props.selectedEntity) {
                    this.props.selectEntity(null);
                }
            }
        }
    };

    render() {
        const hex = this.props.hexagon;
        return (
            <image
                onClick={this.tapHex}
                xlinkHref={this.hexTypeToImage(hex.tileType)}
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
        selectEntity: (entity: GameEntity) => void dispatch(GameActions.selectEntity(entity)),
        selectedViableHex: (hex: GameHexagon) => void dispatch(GameThunks.selectViableHex(hex))
    })
)(Component);
