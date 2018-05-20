export declare class Utils {
    static arrayToDictionary<T>(array: T[], callback: (t: T) => string | number): {
        [key: string]: T;
    };
    static timeout(timeout: number): Promise<void>;
}
