import { describe, expect, it } from "vitest";
import type { BoardItem } from "./api";
import { dueSoon, nextList, type NextFilters } from "./next";

function item(over: Partial<BoardItem>): BoardItem {
    return {
        id: `id${over.number}`,
        number: 0,
        title: "t",
        url: "",
        open: true,
        isProject: false,
        parent: null,
        status: null,
        category: null,
        priority: null,
        kind: null,
        effort: null,
        due: null,
        updatedAt: "",
        blocked: false,
        ...over,
    };
}

// two doing projects in different categories and priorities, one paused
const board: BoardItem[] = [
    item({ number: 1, isProject: true, status: "doing", category: "degree", priority: "!" }),
    item({ number: 2, isProject: true, status: "doing", category: "personal", priority: "!!!" }),
    item({ number: 3, isProject: true, status: "waiting", category: "degree", priority: "!!!" }),
    item({ number: 10, parent: 1, status: "next", effort: "1h" }),
    item({ number: 11, parent: 2, status: "next", effort: "half-day" }),
    item({ number: 12, parent: 1, status: "doing", effort: "15m", updatedAt: "2026-11-01T00:00:00Z" }),
    item({ number: 13, parent: 2, status: "doing", updatedAt: "2026-11-10T00:00:00Z" }),
    item({ number: 14, parent: 2, status: "backlog", effort: "15m" }),
    item({ number: 15, parent: 1, status: "backlog", effort: "half-day" }),
    item({ number: 16, parent: 3, status: "waiting", effort: "15m" }),
    item({ number: 17, parent: 1, status: "next", effort: "15m", kind: "hardware" }),
    item({ number: 18, parent: 1, status: "next", effort: "multi-day" }),
    item({ number: 19, parent: 1, status: "done", open: false }),
    item({ number: 24, parent: 2, status: "next", effort: "15m", blocked: true }),
];

const all: NextFilters = { time: "any", place: "lab", category: "all", backlog: true };
const numbers = (items: BoardItem[]): number[] => items.map((i) => i.number);

describe("nextList", () => {
    it("orders doing by recency, next by project priority, backlog last, and leaves out blocked tasks", () => {
        expect(numbers(nextList(board, all))).toEqual([13, 12, 11, 10, 17, 18, 14, 15]);
    });
    it("leaves out backlog when the toggle is off", () => {
        expect(numbers(nextList(board, { ...all, backlog: false }))).toEqual([13, 12, 11, 10, 17, 18]);
    });
    it("caps effort by the time toggle and drops tasks with no effort", () => {
        expect(numbers(nextList(board, { ...all, time: "1h" }))).toEqual([12, 10, 17, 14]);
        expect(numbers(nextList(board, { ...all, time: "15m" }))).toEqual([12, 17, 14]);
    });
    it("hides lab kinds at home", () => {
        expect(numbers(nextList(board, { ...all, place: "home" }))).not.toContain(17);
    });
    it("filters by the project's category", () => {
        expect(numbers(nextList(board, { ...all, category: "personal" }))).toEqual([13, 11, 14]);
    });
});

describe("dueSoon", () => {
    const dated: BoardItem[] = [
        ...board,
        item({ number: 20, parent: 3, status: "waiting", due: "2026-11-20" }),
        item({ number: 21, parent: 2, status: "next", due: "2026-11-10" }),
        item({ number: 22, parent: 1, status: "next", due: "2026-11-23" }),
        item({ number: 23, parent: 1, status: "done", open: false, due: "2026-11-16" }),
    ];
    it("keeps open tasks overdue or due within 7 days, soonest first", () => {
        expect(numbers(dueSoon(dated, "all", "2026-11-15"))).toEqual([21, 20]);
        expect(numbers(dueSoon(dated, "all", "2026-11-16"))).toEqual([21, 20, 22]);
    });
    it("filters by the project's category only", () => {
        expect(numbers(dueSoon(dated, "degree", "2026-11-16"))).toEqual([20, 22]);
    });
});
