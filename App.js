import { h, text } from "./vdom.js";
import { useState } from "./main.js";

export function Counter({ initialCount }) {
  const [count, setCount] = useState(initialCount);

  return h("div", { className: "container" }, [
    h("h1", { style: { color: count > 5 ? "red" : "black" } }, [
      text("Counter Demo"),
    ]),
    h("p", {}, [text(`Current count: ${count}`)]),
    h(
      "button",
      {
        onclick: () => setCount(count + 1),
        style: { marginRight: "10px" },
      },
      [text("Increment")]
    ),
    h(
      "button",
      {
        onclick: () => setCount(count - 1),
      },
      [text("Decrement")]
    ),
  ]);
}

export function App() {
  return h("div", {}, [Counter({ initialCount: 0 })]);
}
