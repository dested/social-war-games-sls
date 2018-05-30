export namespace dCanvas {
  export namespace JSX {
    export interface IntrinsicElements {
      canvas: { key:string };
      text: {};
      image: { foo: number };
    }
    export interface Element {
      elementName: string;
      children: Element[];
      props: {};
    }
  }
}

export function dCanvas(elementName: string | Function, props: {}, ...children: dCanvas.JSX.Element[]): dCanvas.JSX.Element {
  if (typeof (elementName) === 'string') {
    return {
      elementName,
      props,
      children
    }
  }else{
    return elementName(props,children);
  }
}

//https://github.com/dempfi/typescript-jsx-as-dsl/blob/master/src/template.ts
//https://www.typescriptlang.org/docs/handbook/jsx.html
