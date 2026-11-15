/** One issue on board #4 with its field values flattened. */
export interface BoardItem {
	/** project item id, needed when editing fields */
	id: string;
	number: number;
	title: string;
	url: string;
	/** false once the issue is closed */
	open: boolean;
	/** true when the issue has the `project` label */
	isProject: boolean;
	/** issue number of the parent project, null for projects and inbox items */
	parent: number | null;
	status: string | null;
	category: string | null;
	priority: string | null;
	kind: string | null;
	effort: string | null;
	/** YYYY-MM-DD */
	due: string | null;
}

/** An issue's body and comments, as HTML rendered (and sanitized) by GitHub. */
export interface ItemDetail {
	bodyHtml: string;
	comments: { createdAt: string; bodyHtml: string }[];
}

/** Priorities a project may have, highest first. */
export const PRIORITIES: string[] = ['!!!', '!!', '!', '-'];

/** Statuses a project may have. */
export const PROJECT_STATUSES: string[] = ['backlog', 'doing', 'waiting', 'done'];

/** Statuses a task may have. */
export const TASK_STATUSES: string[] = ['inbox', 'backlog', 'next', 'doing', 'waiting', 'done'];

/** Statuses that pause a task or, for a project, pause its tasks. */
export const PAUSED_STATUSES: string[] = ['backlog', 'waiting'];

/**
 * The statuses an item may be set to, given the board rules: a project takes any project status; an inbox task (no parent) stays inbox; a task of a paused project can only match it or be done; any other task takes any task status but inbox.
 *
 * Args:
 * 	item: The item to change.
 * 	items: The whole board, to find the item's parent project.
 */
export function allowedStatuses(item: BoardItem, items: BoardItem[]): string[] {
	if (item.isProject) return PROJECT_STATUSES;
	if (item.parent === null) return ['inbox'];
	const parent = items.find((i) => i.isProject && i.number === item.parent);
	if (parent?.status && PAUSED_STATUSES.includes(parent.status)) return [parent.status, 'done'];
	return TASK_STATUSES.filter((s) => s !== 'inbox');
}
