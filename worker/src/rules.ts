import { PAUSED_STATUSES as PAUSED, PROJECT_STATUSES, TASK_STATUSES, type BoardItem } from './types';

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

	const allowed = item.isProject ? PROJECT_STATUSES : TASK_STATUSES;
	if (!allowed.includes(status)) {
		return { ok: false, reason: `${item.isProject ? 'a project' : 'a task'} can't be ${status}` };
	}

	if (!item.isProject) {
		if (item.parent === null && status !== 'inbox') return { ok: false, reason: 'give it a parent project first' };
		if (item.parent !== null && status === 'inbox') return { ok: false, reason: 'only items without a parent are inbox' };
		const parent = items.find((i) => i.isProject && i.number === item.parent);
		if (parent?.status && PAUSED.includes(parent.status) && (status === 'next' || status === 'doing')) {
			return { ok: false, reason: `its project is ${parent.status}` };
		}
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

/** What the Worker should do to give an inbox task a parent: the parent to set and the status the task then gets. */
export type ParentPlan = { ok: true; status: string } | { ok: false; reason: string };

/**
 * Plans giving an inbox task a parent project.
 *
 * Args:
 * 	items: The whole board.
 * 	id: Project item id of the task.
 * 	parent: Issue number of the project to become its parent.
 *
 * Returns:
 * 	The status the task gets (the parent's status if it is paused, else `backlog`), or a refusal.
 */
export function planParent(items: BoardItem[], id: string, parent: number): ParentPlan {
	const item = find(items, id);
	if (!item) return { ok: false, reason: 'no such item' };
	if (item.isProject) return { ok: false, reason: 'a project has no parent' };
	if (item.parent !== null) return { ok: false, reason: 'it already has a parent' };

	const project = items.find((i) => i.isProject && i.open && i.number === parent);
	if (!project) return { ok: false, reason: 'the parent must be an open project' };

	return { ok: true, status: project.status && PAUSED.includes(project.status) ? project.status : 'backlog' };
}
