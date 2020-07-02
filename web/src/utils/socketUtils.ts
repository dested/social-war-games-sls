import {RoundState, RoundStateModelToRoundState, RoundStateRead} from '@swg-common/models/roundState';
import {Config, DataService} from '../dataServices';
import {Utils} from '@swg-common/utils/utils';
import {SchemaDefiner} from '@swg-common/schemaDefiner/schemaDefiner';
import {GameStateSchemaReaderFunction} from '@swg-common/models/gameState';

export class SocketUtils {
  static connect(
    gameId: string,
    clientId: string,
    factionToken: string /*todo faction token isnt right, its currently just id which is wrong*/,
    onMessage: (roundState: RoundState) => void
  ) {
    const socket = new WebSocket(`${Config.socketServer}?gameId=${gameId}&faction=round-state-${factionToken}`);
    socket.binaryType = 'arraybuffer';
    socket.onmessage = (message) => {
      const round = RoundStateRead(
        // todo send bytes
        new Uint8Array((message.data as string).match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16))).buffer
      );

      onMessage(round);
    };
    socket.onclose = (e) => {
      console.log('closed');
    };
    socket.onopen = () => {
      console.log('open');
    };
    //      client.subscribe();
  }
}
