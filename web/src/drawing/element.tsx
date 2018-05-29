/** @jsx dom */
import { dom } from "./renderer"

function foo() {
  return <canvas foo={12}>
    <image foo={17}></image>
    <image foo={17}></image>
    <image foo={17}></image>
    <Foo foo={17}>
      <image foo={17}></image>
    </Foo>
  </canvas>;
}


function Foo(options: { foo: number }, children: any) {
  return <image foo={12}>{children}</image>
}
