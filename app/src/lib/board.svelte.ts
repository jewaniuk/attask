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
