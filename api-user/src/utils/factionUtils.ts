import {FactionId} from '@swg-common/game/entityDetail';

export class FactionUtils {
    static randomFaction(): FactionId {
        // todo should try to even out the teams based on active??
        return (Math.floor(Math.random() * 3) + 1).toString() as FactionId;
    }
}
