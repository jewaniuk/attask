import { PAUSED_STATUSES as PAUSED, allowedStatuses, type BoardItem } from './types';

/** One Status write the Worker must make on the board. */
export interface StatusWrite {
	/** project item id */
	id: string;
	/** issue number, for the log and for closing when the status is `done` */
	number: number;
	status: string;
}

/** What the Worker should do for a request, or why it refuses. */
export type Plan = { ok: true; writes: StatusWrite[] } | { ok: false; reason: string };

function find(items: BoardItem[], id: string): BoardItem | undefined {
	return items.find((i) => i.id === id);
}

/**
 * Plans a Status change, applying the board rules from `~/tasks/CLAUDE.md`.
 *
 * Args:
 * 	items: The whole board.
 * 	id: Project item id of the item to change.
 * 	status: The requested status.
 *
 * Returns:
 * 	The writes to make (the item itself, plus its open tasks when a project is paused), empty if nothing changes; or a refusal with the reason.
 */
export function planStatus(items: BoardItem[], id: string, status: string): Plan {
	const item = find(items, id);
	if (!item) return { ok: false, reason: 'no such item' };

	if (!allowedStatuses(item, items).includes(status)) {
		return { ok: false, reason: `#${item.number} can't be ${status} here` };
	}

	const writes: StatusWrite[] = [];
	if (item.status !== status) writes.push({ id: item.id, number: item.number, status });

	if (item.isProject && PAUSED.includes(status)) {
		for (const task of items) {
			if (task.open && !task.isProject && task.parent === item.number && task.status !== status) {
				writes.push({ id: task.id, number: task.number, status });
			}
		}
	}
	return { ok: true, writes };
}
