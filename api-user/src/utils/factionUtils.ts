import {FactionId} from '@swg-common/game/entityDetail';

export class FactionUtils {
    static randomFaction(): FactionId {
        return (Math.floor(Math.random() * 3) + 1).toString() as FactionId;
    }
}
