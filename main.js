import { create, diffOne, modify } from "../vdom.js";
import { App } from "./App.js";

// React-like internals
let currentState = [];
let currentStateIndex = 0;

export function useState(initialValue) {
  const stateIndex = currentStateIndex++;
  if (currentState[stateIndex] === undefined) {
    currentState[stateIndex] = initialValue;
  }
  const setState = (newValue) => {
    currentState[stateIndex] = newValue;
    reRender();
  };
  return [currentState[stateIndex], setState];
}

function resetStateIndex() {
  currentStateIndex = 0;
}

// Rendering logic
let currentVTree = null;
let rootElement = null;
let rootContainer = null;

function render(component, container) {
  resetStateIndex();

  const newVTree = component();
  if (!currentVTree) {
    // Initial render
    rootElement = create(newVTree);
    container.appendChild(rootElement);
  } else {
    // Diff and update
    const patches = diffOne(currentVTree, newVTree);
    if (patches.modify) {
      modify(rootElement, patches.modify);
    } else if (patches.replace) {
      const newRoot = create(patches.replace);
      rootElement.replaceWith(newRoot);
      rootElement = newRoot;
    }
  }
  currentVTree = newVTree;
  rootContainer = container;
}

function reRender() {
  if (rootContainer) {
    render(App, rootContainer);
  }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  render(App, document.getElementById("app"));
});
