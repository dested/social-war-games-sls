import {RoundState} from '@swg-common/models/roundState';
import {RoundStateParser} from '@swg-common/parsers/roundStateParser';
import {DataService} from '../dataServices';

export class SocketUtils {
  static connect(gameId: string, clientId: string, factionToken: string, onMessage: (roundState: RoundState) => void) {
    const socket = new WebSocket(`${DataService.socketServer}?gameId=${gameId}&faction=round-state-${factionToken}`);
    socket.binaryType = 'arraybuffer';
    socket.onmessage = message => {
      const round = RoundStateParser.toRoundState(
        new Uint8Array((message.data as string).match(/[\da-f]{2}/gi).map(h => parseInt(h, 16))).buffer
      );
      onMessage(round);
    };
    socket.onclose = e => {
      console.log('closed');
    };
    socket.onopen = () => {
      console.log('open');
    };
    //      client.subscribe();
  }
}
