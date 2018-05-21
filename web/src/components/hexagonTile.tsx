import * as React from 'react';
import {Fragment} from 'react';
import {connect} from 'react-redux';
import {GameHexagon, GameLogic, HexagonTileType} from '../../../server-common/src/game';
import {Point} from 'swg-common/bin/hex/hex';
import {HexConstants} from '../utils/hexConstants';

interface Props {
    hexagon: GameHexagon;
    game: GameLogic;
}

interface State {}

export class HexagonTile extends React.Component<Props, State> {
    private hexTypeToImage(type: HexagonTileType) {
        switch (type.type) {
            case 'Dirt':
                switch(type.subType){
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
                switch(type.subType){
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
                switch(type.subType){
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
                switch(type.subType){
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
                }                   break;

            case 'Water':
                switch(type.subType){
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
    shouldComponentUpdate(){
        return false;
    }
    render() {
        const hex = this.props.hexagon;
        return (
            <Fragment>
                <image
                    xlinkHref={this.hexTypeToImage(hex.tileType)}
                    width={HexConstants.width}
                    height={HexConstants.height}
                    x={hex.center.x - HexConstants.width / 2}
                    y={hex.center.y - HexConstants.height / 2}
                />
          {/*      <text x={hex.center.x} y={hex.center.y}>
                    {hex.x},{hex.y}
                </text>*/}
            </Fragment>
        );
    }
}
