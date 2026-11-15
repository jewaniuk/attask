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
