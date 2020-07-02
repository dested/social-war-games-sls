import {CustomSchemaTypes} from '@swg-common/schemaDefiner/schemaDefinerTypes';

export const customSchemaTypes: CustomSchemaTypes<{hexId: string}> = {
  hexId: {
    read: (buffer) => {
      return buffer.readInt16() + '-' + buffer.readInt16();
    },
    write: (model, buffer) => {
      const hexIdParse = /(-?\d*)-(-?\d*)/;
      const hexIdResult = hexIdParse.exec(model);
      const x = parseInt(hexIdResult[1]);
      const y = parseInt(hexIdResult[2]);
      buffer.addInt16(x);
      buffer.addInt16(y);
    },
    size: (model) => {
      return 2 + 2;
    },
  },
};
