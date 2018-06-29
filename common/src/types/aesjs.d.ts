declare module 'aes-js' {
    namespace ModeOfOperation {
        // tslint:disable-next-line
        class ctr {
            constructor(arr: number[]);

            encrypt(params: number[] | Uint8Array | Buffer): number[];

            decrypt(params: number[] | Buffer | Uint8Array): number[];
        }
    }
}
