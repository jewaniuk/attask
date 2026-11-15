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

/** Normalises what the user typed: adds `http://` if missing and drops trailing slashes. */
export function workerBase(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  return /^https?:\/\//.test(trimmed) ? trimmed : `http://${trimmed}`;
}

/** Fetches every board item from the Worker. Throws an error saying what is wrong if the settings are empty, the Worker is unreachable, or it answers badly. */
export async function fetchBoard(): Promise<BoardItem[]> {
  const { url, key } = loadSettings();
  if (!url.trim() || !key) throw new Error("enter the worker url and app key in Settings");
  const base = workerBase(url);
  let res: Response;
  try {
    res = await fetch(`${base}/board`, {
      headers: { Authorization: `Bearer ${key}` },
    });
  } catch {
    throw new Error(`can't reach ${base} (wrong address, worker not running, or origin not in ALLOWED_ORIGINS)`);
  }
  if (res.status === 401) throw new Error("the app key is wrong");
  if (!res.ok) throw new Error(`worker returned ${res.status}`);
  return res.json();
}
