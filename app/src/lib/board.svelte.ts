import { closeTaskNotPlanned, deleteTask, fetchBoard, postPriority, postStatus, type BoardItem, type StatusWrite } from "./api";

/** Board state shared by every component. Fill it with `loadBoard`. `busy` is true while a deletion is waiting on the Worker, so the sheet shows a spinner and stays open. */
export const board: { items: BoardItem[]; error: string; selected: number | null; busy: boolean } = $state({
    items: [],
    error: "",
    selected: null,
    busy: false,
});

/** The card being dragged between columns (mouse only), or `null`. Set by `Card`, read by `Board` to dim the columns that refuse it. */
export const drag: { item: BoardItem | null } = $state({ item: null });

/** Opens the detail sheet for a task, or closes it with `null`. */
export function select(number: number | null): void {
    board.selected = number;
}

/** Fetches the board from the Worker into `board`, putting any failure in `board.error`. */
export async function loadBoard(): Promise<void> {
    try {
        board.items = await fetchBoard();
        board.error = "";
    } catch (e) {
        board.error = String(e);
    }
}

/** Open projects, in board order. */
export function openProjects(items: BoardItem[]): BoardItem[] {
    return items.filter((i) => i.isProject && i.open);
}

/** Category names that have an open project, sorted. */
export function categoryNames(items: BoardItem[]): string[] {
    const names = openProjects(items).map((p) => p.category);
    return [...new Set(names.filter((n): n is string => n !== null))].sort();
}

/** Open projects in one category, highest priority first, then board number. */
export function projectsIn(items: BoardItem[], category: string): BoardItem[] {
    return openProjects(items)
        .filter((p) => p.category === category)
        .sort((a, b) => rank(a.priority) - rank(b.priority) || a.number - b.number);
}

/** Open tasks of one project, in issue order. */
export function tasksOf(items: BoardItem[], project: number): BoardItem[] {
    return items
        .filter((i) => i.open && !i.isProject && i.parent === project)
        .sort((a, b) => a.number - b.number);
}

// position of a priority value, highest first; items without one go last
function rank(priority: string | null): number {
    const order = ["!!!", "!!", "!", "-"];
    const at = priority === null ? -1 : order.indexOf(priority);
    return at === -1 ? order.length : at;
}

// shows what the Worker changed; a done task is closed by the board, so it leaves the open lists
function apply(writes: StatusWrite[]): void {
    for (const w of writes) {
        const item = board.items.find((i) => i.id === w.id);
        if (item) {
            item.status = w.status;
            item.open = w.status !== "done";
        }
    }
}

/** Sets an item's status: the card moves at once, then the Worker's answer (including tasks paused with a project) is applied. If the Worker refuses, the card goes back and the reason is put in `board.error`. */
export async function changeStatus(item: BoardItem, status: string): Promise<void> {
    const before = { status: item.status, open: item.open };
    apply([{ id: item.id, number: item.number, status }]);
    try {
        apply(await postStatus(item.id, status));
        board.error = "";
    } catch (e) {
        item.status = before.status;
        item.open = before.open;
        board.error = e instanceof Error ? e.message : String(e);
    }
}

/** Sets a project's priority: the chip changes at once. If the Worker refuses, it goes back and the reason is put in `board.error`. */
export async function changePriority(item: BoardItem, priority: string): Promise<void> {
    const before = item.priority;
    item.priority = priority;
    try {
        await postPriority(item.id, priority);
        board.error = "";
    } catch (e) {
        item.priority = before;
        board.error = e instanceof Error ? e.message : String(e);
    }
}

/** Permanently deletes an inbox task: the Worker deletes the issue, then the task leaves the board and its sheet closes. A refusal is put in `board.error` and the task stays. */
export async function removeTask(item: BoardItem): Promise<void> {
    board.busy = true;
    try {
        await deleteTask(item.number);
        board.items = board.items.filter((i) => i.id !== item.id);
        board.selected = null;
        board.error = "";
    } catch (e) {
        board.error = e instanceof Error ? e.message : String(e);
    } finally {
        board.busy = false;
    }
}

/** Closes a triaged task as not planned: the Worker closes the issue, then the task leaves the open lists and its sheet closes. A refusal is put in `board.error` and the task stays. */
export async function dropTask(item: BoardItem): Promise<void> {
    board.busy = true;
    try {
        await closeTaskNotPlanned(item.number);
        item.open = false;
        item.status = "done";
        board.selected = null;
        board.error = "";
    } catch (e) {
        board.error = e instanceof Error ? e.message : String(e);
    } finally {
        board.busy = false;
    }
}

/** Open tasks without a project, newest first. */
export function inboxTasks(items: BoardItem[]): BoardItem[] {
    return items.filter((i) => i.open && !i.isProject && i.status === "inbox").sort((a, b) => b.number - a.number);
}

/** Tasks to do now, per category: `next` or `doing` tasks of `doing` projects, ordered by project priority, then `doing` before `next`. */
export function nextTasks(items: BoardItem[]): { category: string; tasks: BoardItem[] }[] {
    const groups: { category: string; tasks: BoardItem[] }[] = [];
    for (const category of categoryNames(items)) {
        const projects = projectsIn(items, category).filter((p) => p.status === "doing");
        const tasks = projects.flatMap((p) =>
            tasksOf(items, p.number)
                .filter((t) => t.status === "next" || t.status === "doing")
                .sort((a, b) => Number(b.status === "doing") - Number(a.status === "doing") || a.number - b.number),
        );
        if (tasks.length > 0) groups.push({ category, tasks });
    }
    return groups;
}
