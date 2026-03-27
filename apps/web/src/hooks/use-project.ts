import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "taskmd:selected-project";

// Notify all hook instances when the value changes within this tab
let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function useProject() {
  const project = useSyncExternalStore(subscribe, getSnapshot);

  const setProject = useCallback((next: string | null) => {
    if (next) {
      localStorage.setItem(STORAGE_KEY, next);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    notify();
  }, []);

  return { project, setProject };
}
