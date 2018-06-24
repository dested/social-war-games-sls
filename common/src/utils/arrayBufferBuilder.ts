import {Utils} from './utils';

export class ArrayBufferBuilder {
    private array: {value: number; float: boolean; unsigned?: boolean; size: 8 | 16 | 32 | 64}[] = [];

    addFloat32(value: number) {
        this.array.push({
            value,
            float: true,
            size: 32
        });
    }

    addFloat64(value: number) {
        this.array.push({
            value,
            float: true,
            size: 64
        });
    }

    addInt8(value: number) {
        this.array.push({
            value,
            float: false,
            size: 8
        });
    }

    addInt16(value: number) {
        this.array.push({
            value,
            float: false,
            size: 16
        });
    }

    addInt32(value: number) {
        this.array.push({
            value,
            float: false,
            size: 32
        });
    }

    addUint8(value: number) {
        this.array.push({
            value,
            float: false,
            unsigned: true,
            size: 8
        });
    }

    addUint16(value: number) {
        this.array.push({
            value,
            float: false,
            unsigned: true,
            size: 16
        });
    }

    addUint32(value: number) {
        this.array.push({
            value,
            float: false,
            unsigned: true,
            size: 32
        });
    }

    buildBuffer(): Buffer {
        const size = Utils.sum(this.array, a => a.size / 8);
        const buffer = new ArrayBuffer(size);
        const view = new DataView(buffer);
        let curPosition = 0;
        for (const ele of this.array) {
            if (ele.float) {
                switch (ele.size) {
                    case 32:
                        view.setFloat32(curPosition, ele.value);
                        curPosition += 4;
                        break;
                    case 64:
                        view.setFloat64(curPosition, ele.value);
                        curPosition += 8;
                        break;
                }
            } else {
                if (ele.unsigned) {
                    switch (ele.size) {
                        case 8:
                            view.setUint8(curPosition, ele.value);
                            curPosition += 1;
                            break;
                        case 16:
                            view.setUint16(curPosition, ele.value);
                            curPosition += 2;
                            break;
                        case 32:
                            view.setUint32(curPosition, ele.value);
                            curPosition += 4;
                            break;
                    }
                } else {
                    switch (ele.size) {
                        case 8:
                            view.setInt8(curPosition, ele.value);
                            curPosition += 1;
                            break;
                        case 16:
                            view.setInt16(curPosition, ele.value);
                            curPosition += 2;
                            break;
                        case 32:
                            view.setInt32(curPosition, ele.value);
                            curPosition += 4;
                            break;
                    }
                }
            }
        }
        return Buffer.from(buffer);
    }
}

export class ArrayBufferReader {
    private index: number;
    private dv: DataView;

    constructor(private buffer: Uint8Array) {
        this.dv = new DataView(new Uint8Array(buffer).buffer);
        this.index = 0;
    }

    readFloat32(): number {
        const result = this.dv.getFloat32(this.index);
        this.index += 4;
        return result;
    }

    readFloat64(): number {
        const result = this.dv.getFloat64(this.index);
        this.index += 8;
        return result;
    }

    readInt8(): number {
        const result = this.dv.getInt8(this.index);
        this.index += 1;
        return result;
    }

    readInt16(): number {
        const result = this.dv.getInt16(this.index);
        this.index += 2;
        return result;
    }

    readInt32(): number {
        const result = this.dv.getInt32(this.index);
        this.index += 4;
        return result;
    }

    readUint8(): number {
        const result = this.dv.getUint8(this.index);
        this.index += 1;
        return result;
    }

    readUint16(): number {
        const result = this.dv.getUint16(this.index);
        this.index += 2;
        return result;
    }

    readUint32(): number {
        const result = this.dv.getUint32(this.index);
        this.index += 4;
        return result;
    }
}
