import type { StatusWrite } from './rules';
import type { BoardItem, ItemDetail } from './types';

const PROJECT_ID = 'PVT_kwHOA965uc4BrYgp';
const STATUS_FIELD_ID = 'PVTSSF_lAHOA965uc4BrYgpzhpre8k';
// Status option ids, from ~/tasks/CLAUDE.md
const STATUS_OPTIONS: Record<string, string> = {
	inbox: 'f75ad846',
	backlog: '47fc9ee4',
	next: '98236657',
	doing: '181b5ff2',
	waiting: '4870a0fc',
	done: '023ca80c',
};

/** Runs one GraphQL request against GitHub and returns its `data`. Throws if GitHub reports errors. */
async function graphql(token: string, query: string, variables: Record<string, unknown>): Promise<any> {
	const res = await fetch('https://api.github.com/graphql', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'attask-worker' },
		body: JSON.stringify({ query, variables }),
	});
	const json: any = await res.json();
	if (json.errors) throw new Error(JSON.stringify(json.errors));
	return json.data;
}

const QUERY = `
query($cursor: String) {
	user(login: "jewaniuk") {
		projectV2(number: 4) {
			items(first: 100, after: $cursor) {
				pageInfo { hasNextPage endCursor }
				nodes {
					id
					fieldValues(first: 20) {
						nodes {
							... on ProjectV2ItemFieldSingleSelectValue { name field { ... on ProjectV2FieldCommon { name } } }
							... on ProjectV2ItemFieldDateValue { date field { ... on ProjectV2FieldCommon { name } } }
						}
					}
					content {
						... on Issue {
							number title url state
							labels(first: 10) { nodes { name } }
							parent { number }
						}
					}
				}
			}
		}
	}
}`;

/**
 * Fetches every item on board #4, following pagination.
 *
 * Args:
 * 	token: GitHub token with the `repo` and `project` scopes.
 *
 * Returns:
 * 	One flattened `BoardItem` per issue. Items that are not issues are skipped.
 */
export async function fetchBoard(token: string): Promise<BoardItem[]> {
	const items: BoardItem[] = [];
	let cursor: string | null = null;

	while (true) {
		const data = await graphql(token, QUERY, { cursor });

		const page = data.user.projectV2.items;
		for (const node of page.nodes) {
			if (!node.content?.number) continue; // drafts and prs has no issue number

			const fields: Record<string, string> = {};
			for (const fv of node.fieldValues.nodes) {
				if (fv.field) fields[fv.field.name] = fv.name ?? fv.date;
			}

			items.push({
				id: node.id,
				number: node.content.number,
				title: node.content.title,
				url: node.content.url,
				open: node.content.state === 'OPEN',
				isProject: node.content.labels.nodes.some((l: { name: string }) => l.name === 'project'),
				parent: node.content.parent?.number ?? null,
				status: fields['Status'] ?? null,
				category: fields['Category'] ?? null,
				priority: fields['Priority'] ?? null,
				kind: fields['Kind'] ?? null,
				effort: fields['Effort'] ?? null,
				due: fields['Due'] ?? null,
			});
		}

		if (!page.pageInfo.hasNextPage) return items;
		cursor = page.pageInfo.endCursor;
	}
}

/**
 * Sets the Status of several items in one GraphQL request, so they apply together.
 *
 * Args:
 * 	token: GitHub token.
 * 	writes: The changes from `planStatus`.
 */
export async function writeStatuses(token: string, writes: StatusWrite[]): Promise<void> {
	if (writes.length === 0) return;
	const mutations = writes.map(
		(w, i) => `m${i}: updateProjectV2ItemFieldValue(input: {
			projectId: "${PROJECT_ID}", itemId: "${w.id}", fieldId: "${STATUS_FIELD_ID}",
			value: { singleSelectOptionId: "${STATUS_OPTIONS[w.status]}" }
		}) { clientMutationId }`,
	);
	await graphql(token, `mutation { ${mutations.join('\n')} }`, {});
}

/**
 * Fetches an issue's body and comments, rendered to HTML by GitHub.
 *
 * Args:
 * 	token: GitHub token.
 * 	number: Issue number.
 */
export async function fetchDetail(token: string, number: number): Promise<ItemDetail> {
	const query = `
	query($n: Int!) {
		repository(owner: "jewaniuk", name: "tasks") {
			issue(number: $n) {
				bodyHTML
				comments(first: 50) { nodes { createdAt bodyHTML } }
			}
		}
	}`;
	const issue = (await graphql(token, query, { n: number })).repository.issue;
	return { bodyHtml: issue.bodyHTML, comments: issue.comments.nodes.map((c: any) => ({ createdAt: c.createdAt, bodyHtml: c.bodyHTML })) };
}

/**
 * Creates an issue in `jewaniuk/tasks`. A GitHub rule adds it to the board as `inbox` a few seconds later, so the status is not set here.
 *
 * Args:
 * 	token: GitHub token.
 * 	title: Issue title.
 *
 * Returns:
 * 	The new issue's number and address.
 */
export async function createIssue(token: string, title: string): Promise<{ number: number; url: string }> {
	const res = await fetch('https://api.github.com/repos/jewaniuk/tasks/issues', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'attask-worker' },
		body: JSON.stringify({ title }),
	});
	if (!res.ok) throw new Error(`github returned ${res.status}`);
	const issue: any = await res.json();
	return { number: issue.number, url: issue.html_url };
}
