export class FactionUtils {
    static randomFaction() {
        // todo should try to even out the teams based on active??
        const r = Math.random() * 3;
        return Math.round(r).toString();
    }
}
