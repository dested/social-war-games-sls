export class Timer {
  private startTime: number;
  private times: {key: string; time: number; deltaTime: number}[] = [];

  constructor() {
    this.startTime = +new Date();
  }

  add(name: string) {
    const time = +new Date() - this.startTime;
    const lastTime = this.times[this.times.length - 1] ? this.times[this.times.length - 1].time : 0;
    this.times.push({
      key: name,
      time: time,
      deltaTime: time - lastTime,
    });
  }

  print() {
    return this.times.map(a => a.key + ':' + a.time).join(' | ');
  }

  printDeltas() {
    return this.times.map(a => a.key + ':' + a.deltaTime).join(' | ')+" "+(+new Date() - this.startTime);
  }
}
