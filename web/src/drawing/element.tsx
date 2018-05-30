/** @jsx dCanvas */
import {dCanvas} from './dCanvas';
import {GameHexagon, GameLogic} from '@swg-common/game';
import {HexConstants} from '../utils/hexConstants';
import {HexImages} from '../utils/hexImages';

export function foo(game: GameLogic, view: {x: number; y: number; width: number; height: number}) {
    return (
        <canvas key={'level'} view={view} width={window.innerWidth} height={window.innerHeight}>
            {game.grid.hexes
                .filter(
                    hex =>
                        hex.center.x > view.x &&
                        hex.center.x < view.x + view.width &&
                        hex.center.y > view.y &&
                        hex.center.y < view.y + view.height
                )
                .map(hex => hexagon(hex))}
        </canvas>
    );
}

function hexagon(hex: GameHexagon) {
    return (
        <image
            src={HexImages.hexTypeToImage(hex.tileType.type, hex.tileType.subType)}
            width={HexConstants.width}
            height={HexConstants.height}
            x={hex.center.x - HexConstants.width / 2}
            y={hex.center.y - HexConstants.height / 2}
        />
    );
}
