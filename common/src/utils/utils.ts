export class Utils {
    static arrayToDictionary<T>(array: T[], callback: (t: T) => string | number): {[key: string]: T} {
        return array.reduce(
            (a, b) => {
                a[callback(b)] = b;
                return a;
            },
            {} as any
        );
    }

    static mathSign(f: number) {
        if (f < 0) return -1;
        else if (f > 0) return 1;
        return 0;
    }

    static random(chance: number) {
        return Math.random() * 100 < chance;
    }

    static timeout(timeout: number): Promise<void> {
        return new Promise(res => {
            setTimeout(() => {
                res();
            }, timeout);
        });
    }
}
