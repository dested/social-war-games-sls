export class Timer {
    private startTime: number;
    private times: {key: string; time: number}[] = [];
    constructor() {
        this.startTime = +new Date();
    }

    public add(name: string) {
        this.times.push({
            key: name,
            time: +new Date() - this.startTime
        });
    }
    public print() {
        return this.times.map(a => a.key + ':' + a.time).join(' | ');
    }
}
