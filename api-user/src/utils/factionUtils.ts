import {FactionId} from '@swg-common/game';

export class FactionUtils {
    static randomFaction() : FactionId{
        // todo should try to even out the teams based on active??
        const r = Math.random() * 3;
        return Math.floor(r).toString() as FactionId;
    }
}
