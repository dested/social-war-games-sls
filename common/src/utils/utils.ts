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

    static timeout(timeout: number): Promise<void> {
        return new Promise(res => {
            setTimeout(() => {
                res();
            }, timeout);
        });
    }
}
