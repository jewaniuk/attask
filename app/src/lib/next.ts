import { EFFORTS, priorityRank, type BoardItem } from "../../../worker/src/types";

/** Choices of the time toggle: the largest effort to show, or `any` for every task including those with no effort. */
export const TIMES: string[] = ["15m", "1h", "half-day", "any"];

/** Choices of the place toggle. */
export const PLACES: string[] = ["home", "lab"];

/** Task kinds that need the lab, hidden at `home`. */
export const LAB_KINDS: string[] = ["hardware", "experiment"];

/** Efforts small enough that a `backlog` task makes the Next list. */
const QUICK_EFFORTS: string[] = ["15m", "1h"];

/** How far ahead a due date counts as soon, in days. */
const DUE_SOON_DAYS = 7;

/** The toggles of the Next page. */
export interface NextFilters {
    /** one of `TIMES` */
    time: string;
    /** one of `PLACES` */
    place: string;
    /** a category name, or `all` */
    category: string;
}

// the task's project, or undefined for inbox tasks
function projectOf(items: BoardItem[], task: BoardItem): BoardItem | undefined {
    return items.find((i) => i.isProject && i.number === task.parent);
}

// true when the task's project is in the category; every task is in `all`
function inCategory(items: BoardItem[], task: BoardItem, category: string): boolean {
    return category === "all" || projectOf(items, task)?.category === category;
}

// true when the task's effort is no larger than the time toggle
function fitsTime(task: BoardItem, time: string): boolean {
    if (time === "any") return true;
    return task.effort !== null && EFFORTS.indexOf(task.effort) <= EFFORTS.indexOf(time);
}

// the date `days` after a YYYY-MM-DD date, in the same form
function addDays(date: string, days: number): string {
    const d = new Date(`${date}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}

/**
 * Open tasks that are overdue or due within 7 days, soonest first. Not filtered by time or place.
 *
 * Args:
 *     items: The whole board.
 *     category: A category name, or `all`.
 *     today: Today's local date, YYYY-MM-DD.
 */
export function dueSoon(items: BoardItem[], category: string, today: string): BoardItem[] {
    const limit = addDays(today, DUE_SOON_DAYS);
    return items
        .filter((t) => t.open && !t.isProject && t.due !== null && t.due <= limit && inCategory(items, t, category))
        .sort((a, b) => a.due!.localeCompare(b.due!) || a.number - b.number);
}

/**
 * What can be done now: open tasks of `doing` projects that pass the toggles, in order of `doing` (most recently updated first), then `next` (by project priority, then number), then `backlog` tasks of effort `15m` or `1h` (same order).
 *
 * Args:
 *     items: The whole board.
 *     filters: The toggles.
 */
export function nextList(items: BoardItem[], filters: NextFilters): BoardItem[] {
    const group = (t: BoardItem): number => ["doing", "next", "backlog"].indexOf(t.status ?? "");
    const project = (t: BoardItem): BoardItem | undefined => projectOf(items, t);
    return items
        .filter(
            (t) =>
                t.open &&
                !t.isProject &&
                project(t)?.status === "doing" &&
                group(t) !== -1 &&
                (t.status !== "backlog" || QUICK_EFFORTS.includes(t.effort ?? "")) &&
                inCategory(items, t, filters.category) &&
                fitsTime(t, filters.time) &&
                (filters.place === "lab" || !LAB_KINDS.includes(t.kind ?? "")),
        )
        .sort((a, b) => {
            if (group(a) !== group(b)) return group(a) - group(b);
            if (a.status === "doing") return b.updatedAt.localeCompare(a.updatedAt);
            return priorityRank(project(a)!.priority) - priorityRank(project(b)!.priority) || a.number - b.number;
        });
}
