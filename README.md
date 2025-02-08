# Super Simple Virtual DOM
The purpose is to provide a simplified explanation of how the Virtual DOM works under the hood.

## How It Works
1. Initial Render:
- The VTree is created by calling the component function.
- `create` generates the initial DOM structure and appends it to the container.

2. State Update:
- `setState` updates the state and triggers reRender.
- A new VTree is generated and diffed against the previous one.

3. DOM Update:
- The diffing process calculates the minimal changes needed.
- `modify` applies these changes to the existing DOM.


The `h` function creates virtual nodes that represent elements.

```js
function h(tag, properties, children) {
  return { tag, properties, children };
}
```

The `create` function converts VNodes into actual DOM nodes. This involves recursively traversing the VNode tree and creating corresponding DOM nodes.

```js
function create(vnode) {
  if (vnode.text !== undefined) {
    return document.createTextNode(vnode.text);
  }

  const el = document.createElement(vnode.tag);
  for (const prop in vnode.properties) {
    setPropertyOrListener(el, prop, vnode.properties[prop]);
  }

  for (const child of vnode.children || []) {
    el.appendChild(create(child));
  }

  return el;
}
```

The `diffOne` function compares two VNodes and produces a set of changes to update the DOM efficiently.

```js
function diffOne(l, r) {
  if (l.tag !== r.tag) {
    return { replace: r };
  }

  const set = {};
  for (const prop in r.properties) {
    if (r.properties[prop] !== l.properties[prop]) {
      set[prop] = r.properties[prop];
    }
  }

  const children = diffList(l.children, r.children);
  return { modify: { set, children } };
}
```

The `modify` function applies the changes produced by the diffing process to the DOM.

```js
function modify(el, diff) {
  for (const prop in diff.set) {
    setPropertyOrListener(el, prop, diff.set[prop]);
  }

  apply(el, diff.children);
}
```

The `render` function manages the creation and update of the DOM.

```js
function render(component, container) {
  const newTree = component();
  if (!currentTree) {
    // Initial render
    rootElement = create(newTree);
    container.appendChild(rootElement);
  } else {
    // Update render
    const changes = diff(currentTree, newTree);
    applyChanges(rootElement, changes);
  }

  currentTree = newTree;
}
```

## Learn More
- https://github.com/tigerabrodi/react-virtual-dom-diffing-algorithm