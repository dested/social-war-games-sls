import {ArrayBufferBuilder, ArrayBufferReader} from '@swg-common/schemaDefiner/parsers/arrayBufferBuilder';

export type Discriminate<T, TField extends keyof T, TValue extends T[TField]> = T extends {[field in TField]: TValue}
  ? T
  : never;
export type SDEnum<T extends string> = {[key in T]: number} & {flag: 'enum'};
export type SDNumberEnum<T extends number> = {[key in T]: number} & {flag: 'number-enum'};
export type SDBitmask<T> = {[keyT in keyof T]-?: number} & {flag: 'bitmask'};
export type SDArray<TElements> = {elements: TElements; flag: 'array-uint8' | 'array-uint16'};
export type SDTypeLookupElements<TElements extends {type: string}, TCustoms> = {
  elements: {
    [key in TElements['type']]: SDTypeLookup<TElements, key, TCustoms>;
  };
  flag: 'type-lookup';
};
export type SDTypeLookup<TItem extends {type: string}, TKey extends TItem['type'], TCustoms> = SDSimpleObject<
  Omit<Discriminate<TItem, 'type', TKey>, 'type'>,
  TCustoms
>;
export type SDTypeElement<TItem extends {type: string}, TCustoms> = SDSimpleObject<Omit<TItem, 'type'>, TCustoms>;

export type SDSimpleObject<TItem, TCustoms = never> = {
  [keyT in OptionalPropertyOf<TItem>]: {element: SDElement<Required<TItem>, keyT, TCustoms>; flag: 'optional'};
} &
  {
    [keyT in RequiredPropertyOf<TItem>]: SDElement<Required<TItem>, keyT, TCustoms>;
  };

type OptionalPropertyOf<T> = Exclude<
  {
    [K in keyof T]: T extends Record<K, T[K]> ? never : K;
  }[keyof T],
  undefined
>;
type RequiredPropertyOf<T> = Exclude<
  {
    [K in keyof T]: T extends Record<K, T[K]> ? K : never;
  }[keyof T],
  undefined
>;

type Simple<T, TCustoms> = T extends string
  ? 'string' | SDEnum<T> | TCustoms
  : T extends number
  ? 'uint8' | 'uint16' | 'uint32' | 'int8' | 'int16' | 'int32' | 'float32' | 'float64' | SDNumberEnum<T> | TCustoms
  : T extends boolean | TCustoms
  ? 'boolean'
  : never;

export type SDElement<T, TKey extends keyof T, TCustoms> = T[TKey] extends string | boolean | number
  ? Simple<T[TKey], TCustoms>
  : T[TKey] extends Array<any>
  ? T[TKey][number] extends number
    ? SDArray<Simple<T[TKey][number], TCustoms>> | {flag: 'byte-array'; elements: 'bit'}
    : T[TKey][number] extends string | boolean
    ? SDArray<Simple<T[TKey][number], TCustoms>>
    : T[TKey][number] extends {type: string}
    ? SDArray<SDTypeLookupElements<T[TKey][number], TCustoms>> | SDArray<SDSimpleObject<T[TKey][number], TCustoms>>
    : SDArray<SDSimpleObject<T[TKey][number], TCustoms>>
  : T[TKey] extends {[key in keyof T[TKey]]: boolean}
  ? SDBitmask<T[TKey]>
  : T[TKey] extends {type: string}
  ? SDTypeLookupElements<T[TKey], TCustoms> | SDSimpleObject<T[TKey], TCustoms>
  : T[TKey] extends {}
  ? SDSimpleObject<T[TKey], TCustoms>
  : never;

export type ABFlags =
  | {flag: 'enum'}
  | {flag: 'number-enum'}
  | {element: any; flag: 'optional'}
  | {flag: 'bitmask'}
  | {elements: any; flag: 'array-uint16'}
  | {elements: number; flag: 'byte-array'}
  | {elements: any; flag: 'array-uint8'}
  | {elements: {[key: string]: ABSchemaDef}; flag: 'type-lookup'}
  | ({flag: undefined} & {[key: string]: any});
export type ABSchemaDef = ABFlags | string;

export type CustomSchemaTypes<TTypes> = {
  [key in keyof TTypes]: {
    read: (buffer: ArrayBufferReader) => TTypes[key];
    write: (model: TTypes[key], buffer: ArrayBufferBuilder) => void;
    size: (model: TTypes[key]) => number;
  };
};
