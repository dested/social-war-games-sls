export class Timer {
  private startTime: number;
  times: {key: string; time: number; deltaTime: number}[] = [];

  constructor() {
    this.startTime = +new Date();
  }

  add(name: string) {
    const time = +new Date() - this.startTime;
    const lastTime = this.times[this.times.length - 1] ? this.times[this.times.length - 1].time : 0;
    this.times.push({
      key: name,
      time,
      deltaTime: time - lastTime,
    });
  }

  print() {
    return this.times.map(a => a.key + ': ' + a.time).join(' | ');
  }

  printDeltas() {
    return this.times.map(a => a.key + ':' + a.deltaTime).join(' | ') + ' ' + (+new Date() - this.startTime);
  }

  static aggregate(timers: Timer[]) {
    const result = timers.reduce(
      (prev, cur) => {
        for (const time of cur.times) {
          if (!prev[time.key]) {
            prev[time.key] = [];
          }
          prev[time.key].push(time.deltaTime);
        }
        return prev;
      },
      {} as any
    );

    for (const resultElement in result) {
      console.log(
        resultElement,
        result[resultElement].reduce((p: number, c: number) => p + c, 0) / result[resultElement].length
      );
    }
  }
}
