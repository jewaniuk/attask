import type { BoardItem, ItemDetail } from "../../../worker/src/types";
export type { BoardItem, ItemDetail };

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

/** Calls the Worker with the saved settings and returns the parsed JSON. Throws an error saying what is wrong if the settings are empty, the Worker is unreachable, or it refuses or answers badly. */
async function request<T>(path: string, body?: object, method: string = body ? "POST" : "GET"): Promise<T> {
  const { url, key } = loadSettings();
  if (!url.trim() || !key) throw new Error("enter the worker url and app key in Settings");
  const base = workerBase(url);
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method,
      headers: { Authorization: `Bearer ${key}` },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(`can't reach ${base} (wrong address, worker not running, or origin not in ALLOWED_ORIGINS)`);
  }
  if (res.status === 401) throw new Error("the app key is wrong");
  // 409 is a board rule saying no, with its reason
  if (res.status === 409) throw new Error(((await res.json()) as { error: string }).error);
  if (!res.ok) throw new Error(`worker returned ${res.status}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

/** One Status the Worker changed, which may include tasks paused along with a project. */
export interface StatusWrite {
  id: string;
  number: number;
  status: string;
}

/** Fetches every board item from the Worker. */
export function fetchBoard(): Promise<BoardItem[]> {
  return request("/board");
}

/** Fetches an issue's body and comments as HTML. */
export function fetchDetail(number: number): Promise<ItemDetail> {
  return request(`/issues/${number}/detail`);
}

/** Asks the Worker to set an item's status. Returns every status it changed. Throws the board rule's reason if it refuses. */
export async function postStatus(id: string, status: string): Promise<StatusWrite[]> {
  return (await request<{ writes: StatusWrite[] }>(`/items/${id}/status`, { status })).writes;
}

/** Asks the Worker to create a task with this title. It lands in the inbox on the board a few seconds later. Returns the new issue's number and address. */
export function postTask(title: string): Promise<{ number: number; url: string }> {
  return request("/tasks", { title });
}

/** Asks the Worker to permanently delete an inbox task's issue. Throws the Worker's reason if it refuses. */
export function deleteTask(number: number): Promise<void> {
  return request(`/issues/${number}`, undefined, "DELETE");
}

/** Asks the Worker to close a triaged task's issue as not planned. Throws the Worker's reason if it refuses. */
export function closeTaskNotPlanned(number: number): Promise<void> {
  return request(`/issues/${number}/not-planned`, {});
}
