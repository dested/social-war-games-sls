/** @jsx dCanvas */
import { dCanvas } from "./dCanvas"
import { render } from "./renderer"

function foo() {
  const m = [1, 2, 3, 4];
  return <canvas foo={12}>
    <image foo={17}></image>
    {m.map(a => <image foo={a}></image>)}
    <text>f</text>
    <image foo={17}></image>
    <Foo foo={17}>
      <image foo={17}></image>
    </Foo>
  </canvas>;
}


function Foo(options: { foo: number }, children: any) {
  return <image foo={12}>{children}</image>
}

render(foo());
