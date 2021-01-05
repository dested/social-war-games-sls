import {
  RoundState,
  RoundStateModelToRoundState,
  RoundStateSchemaGenerator,
  RoundStateToModel,
} from '@swg-common/models/roundState';
import {Config, DataService} from '../dataServices';

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
      const round = RoundStateSchemaGenerator.fromBuffer(
        // todo send bytes
        new Uint8Array((message.data as string).match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16))).buffer
      );

      onMessage(RoundStateModelToRoundState(round));
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
