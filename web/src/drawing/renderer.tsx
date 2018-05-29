export namespace dom {
  export namespace JSX {
    export interface IntrinsicElements {
      canvas: { foo:number };
      image: { foo:number};
    }
    export interface Element {
      elementName: string;
      children: Element[];
      props: {};
    }
  }
}

export function dom(elementName: string, props: {}, ...children: dom.JSX.Element[]): dom.JSX.Element {
  return {
    elementName,
    props,
    children
  }
}
