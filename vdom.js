function h(tag, properties, children) {
  return { tag, properties, children };
}

function text(content) {
  return { text: content };
}

function eventName(str) {
  if (str.indexOf("on") === 0) {
    return str.slice(2).toLowerCase();
  }
  return null;
}

function listener(event) {
  const handler = event.currentTarget._ui.listeners[event.type];
  if (handler) {
    handler(event);
  }
}

function setListener(el, event, handle) {
  if (el._ui.listeners[event] === undefined) {
    el.addEventListener(event, listener);
  }
  // Prevents multiple instances of the same event listener
  el._ui.listeners[event] = handle;
}

function setProperty(prop, value, el) {
  if (prop === "className") {
    el.setAttribute("class", value);
  } else if (prop === "style" && typeof value === "object") {
    Object.assign(el.style, value);
  } else {
    el.setAttribute(prop, value);
  }
}

function diffOne(l, r) {
  const isText = l.text !== undefined;
  if (isText) {
    return l.text !== r.text ? { replace: r } : { noop: true };
  }

  if (l.tag !== r.tag) {
    return { replace: r };
  }

  const remove = [];
  for (const prop in l.properties) {
    if (r.properties[prop] === undefined) {
      remove.push(prop);
    }
  }

  const set = {};
  for (const prop in r.properties) {
    if (r.properties[prop] !== l.properties[prop]) {
      set[prop] = r.properties[prop];
    }
  }

  const children = diffList(l.children, r.children);

  return { modify: { remove, set, children } };
}

function diffList(ls, rs) {
  const length = Math.max(ls.length, rs.length);
  return Array.from({ length })
    .map((_, i) =>
      ls[i] === undefined
        ? { create: rs[i] }
        : rs[i] === undefined
        ? { remove: true }
        : diffOne(ls[i], rs[i])
    );
}

function create(vnode) {
  if (vnode.text !== undefined) {
    return document.createTextNode(vnode.text);
  }

  const el = document.createElement(vnode.tag);
  el._ui = { listeners: {} };

  for (const prop in vnode.properties) {
    const event = eventName(prop);
    const value = vnode.properties[prop];

    if (event !== null) {
      setListener(el, event, value);
    } else {
      setProperty(prop, value, el);
    }
  }

  for (const childVNode of vnode.children || []) {
    const child = create(childVNode);
    el.appendChild(child);
  }

  return el;
}

function modify(el, diff) {
  for (const prop of diff.remove) {
    const event = eventName(prop);
    if (event === null) {
      el.removeAttribute(prop);
    } else {
      el._ui.listeners[event] = undefined;
      el.removeEventListener(event, listener);
    }
  }

  for (const prop in diff.set) {
    const value = diff.set[prop];
    const event = eventName(prop);

    if (event !== null) {
      setListener(el, event, value);
    } else {
      setProperty(prop, value, el);
    }
  }

  apply(el, diff.children);
}

function apply(el, childrenDiff) {
  const children = Array.from(el.childNodes);

  childrenDiff.forEach((diff, i) => {
    const action = Object.keys(diff)[0];
    switch (action) {
      case "remove":
        children[i].remove();
        break;

      case "modify":
        modify(children[i], diff.modify);
        break;

      case "create": {
        const child = create(diff.create);
        el.appendChild(child);
        break;
      }

      case "replace": {
        const child = create(diff.replace);
        children[i].replaceWith(child);
        break;
      }

      case "noop":
        break;
    }
  });
}

export { h, text, diffOne, create, modify };
