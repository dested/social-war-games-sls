import {makeCustomSchema} from 'safe-schema';

export const customSchemaTypes = makeCustomSchema<{hexId: string; byteArray: number[]}>({
  hexId: {
    read: (buffer) => buffer.readInt16() + '-' + buffer.readInt16(),
    write: (model, buffer) => {
      const hexIdParse = /(-?\d*)-(-?\d*)/;
      const hexIdResult = hexIdParse.exec(model);
      const x = parseInt(hexIdResult[1]);
      const y = parseInt(hexIdResult[2]);
      buffer.addInt16(x);
      buffer.addInt16(y);
    },
    size: (model) => 2 + 2,
  },
  byteArray: {
    read: (reader) => {
      function byteArray(len: number, realLength: number) {
        function padLeft(data: string, size: number, paddingChar: string) {
          return (new Array(size + 1).join(paddingChar) + data).slice(-size);
        }

        let items = [];
        for (let i = 0; i < len; i++) {
          items.push(
            ...padLeft(reader.readUint32().toString(8), 10, '0')
              .split('')
              .map((a) => parseInt(a))
          );
        }
        return items.slice(0, realLength);
      }
      return byteArray(reader.readUint32(), reader.readUint32());
    },
    write: (model, buffer) => {
      const model_len = Math.ceil(model.length / 10);
      buffer.addUint32(model_len);
      buffer.addUint32(model.length);
      for (let model_i = 0; model_i < model_len; model_i++) {
        buffer.addUint32(parseInt(model.slice(model_i * 10, (model_i + 1) * 10).join(''), 8));
      }
    },
    size: (model) => 4 + 4 + Math.ceil(model.length / 10) * 4,
  },
});
