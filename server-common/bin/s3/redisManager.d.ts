export declare class RedisManager {
    private client;
    static setup(): Promise<RedisManager>;
    getKey(key: string): string;
    get<T>(key: string): Promise<T>;
    set<T>(key: string, value: T): Promise<T>;
    expire(key: string, duration: number): Promise<void>;
    incr(key: string): Promise<{}>;
}
