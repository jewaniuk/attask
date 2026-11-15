import { fetchBoard, type BoardItem } from "./api";

/** Board state shared by every component. Fill it with `loadBoard`. */
export const board: { items: BoardItem[]; error: string } = $state({
    items: [],
    error: "",
});

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
