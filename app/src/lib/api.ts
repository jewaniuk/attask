import type { BoardItem } from "../../../worker/src/types";
export type { BoardItem };

/** Worker connection settings, kept in localStorage on this device. */
export interface Settings {
  /** Worker base address, no trailing slash */
  url: string;
  /** app key sent as the bearer token */
  key: string;
}

/** Reads the saved settings, empty strings if none. */
export function loadSettings(): Settings {
  return {
    url: localStorage.getItem("attask.url") ?? "",
    key: localStorage.getItem("attask.key") ?? "",
  };
}

/** Saves the settings to localStorage. */
export function saveSettings(settings: Settings): void {
  localStorage.setItem("attask.url", settings.url);
  localStorage.setItem("attask.key", settings.key);
}

/** Fetches every board item from the Worker. Throws if the Worker answers with an error. */
export async function fetchBoard(): Promise<BoardItem[]> {
  const { url, key } = loadSettings();
  const res = await fetch(`${url}/board`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`worker returned ${res.status}`);
  return res.json();
}
