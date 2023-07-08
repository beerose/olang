import { useSyncExternalStore } from "react";

let url: URL;
const listeners: (() => void)[] = [];

function createVerySimpleRouter() {
  const pushState = window.history.pushState;
  history.pushState = (data, _unused, uri) => {
    pushState.call(history, data, "", uri);
    url = new URL(uri);
    listeners.forEach((listener) => listener());
  };

  window.addEventListener("popstate", () => {
    url = new URL(window.location.href);
    listeners.forEach((listener) => listener());
  });

  window.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) return;
    event.preventDefault();
    history.pushState({}, "", event.target.href);
  });
}

if (typeof window !== "undefined") {
  url = new URL(window.location.href);
  createVerySimpleRouter();
}

const subscribe = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

const getSnapshot = (): URL => {
  return url;
};

export function useRouter() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
