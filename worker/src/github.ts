import type { BoardItem } from './types';

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
		const res = await fetch('https://api.github.com/graphql', {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'attask-worker' },
			body: JSON.stringify({ query: QUERY, variables: { cursor } }),
		});
		const json: any = await res.json();
		if (json.errors) throw new Error(JSON.stringify(json.errors));

		const page = json.data.user.projectV2.items;
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
