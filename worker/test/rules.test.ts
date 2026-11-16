import { describe, expect, it } from 'vitest';
import { planPriority, planStatus } from '../src/rules';
import type { BoardItem } from '../src/types';

function item(over: Partial<BoardItem>): BoardItem {
	return {
		id: `id${over.number}`,
		number: 0,
		title: 't',
		url: '',
		open: true,
		isProject: false,
		parent: null,
		status: null,
		category: null,
		priority: null,
		kind: null,
		effort: null,
		due: null,
		updatedAt: '',
		...over,
	};
}

const board: BoardItem[] = [
	item({ number: 1, isProject: true, status: 'doing' }),
	item({ number: 2, isProject: true, status: 'backlog' }),
	item({ number: 10, parent: 1, status: 'next' }),
	item({ number: 11, parent: 1, status: 'doing' }),
	item({ number: 12, parent: 1, status: 'done', open: false }),
	item({ number: 13, parent: 2, status: 'backlog' }),
	item({ number: 20, status: 'inbox' }),
];

const numbers = (p: ReturnType<typeof planStatus>) => (p.ok ? p.writes.map((w) => w.number) : []);

describe('planStatus', () => {
	it('changes one task', () => {
		expect(planStatus(board, 'id10', 'doing')).toEqual({ ok: true, writes: [{ id: 'id10', number: 10, status: 'doing' }] });
	});
	it('does nothing when the status is the same', () => {
		expect(planStatus(board, 'id10', 'next')).toEqual({ ok: true, writes: [] });
	});
	it('pauses open tasks when a project goes to waiting', () => {
		expect(numbers(planStatus(board, 'id1', 'waiting'))).toEqual([1, 10, 11]);
	});
	it('skips tasks already at the new status', () => {
		expect(numbers(planStatus(board, 'id2', 'backlog'))).toEqual([]);
	});
	it('does not cascade on doing or done', () => {
		expect(numbers(planStatus(board, 'id1', 'done'))).toEqual([1]);
		expect(numbers(planStatus(board, 'id2', 'doing'))).toEqual([2]);
	});
	it('lets a task of a paused project only match it or be done', () => {
		expect(planStatus(board, 'id13', 'next').ok).toBe(false);
		expect(planStatus(board, 'id13', 'doing').ok).toBe(false);
		expect(planStatus(board, 'id13', 'waiting').ok).toBe(false);
		expect(planStatus(board, 'id13', 'done').ok).toBe(true);
		expect(planStatus(board, 'id13', 'backlog')).toEqual({ ok: true, writes: [] });
	});
	it('refuses statuses that do not fit the kind', () => {
		expect(planStatus(board, 'id1', 'next').ok).toBe(false);
		expect(planStatus(board, 'id1', 'inbox').ok).toBe(false);
		expect(planStatus(board, 'id10', 'bogus').ok).toBe(false);
	});
	it('keeps inbox for items without a parent', () => {
		expect(planStatus(board, 'id20', 'next').ok).toBe(false);
		expect(planStatus(board, 'id10', 'inbox').ok).toBe(false);
	});
	it('refuses an unknown item', () => {
		expect(planStatus(board, 'nope', 'done').ok).toBe(false);
	});
});

describe('planPriority', () => {
	const projects: BoardItem[] = [
		item({ number: 1, isProject: true, priority: '!!' }),
		item({ number: 2, isProject: true, priority: null }),
		item({ number: 10, parent: 1, status: 'next' }),
	];
	it('changes a project priority', () => {
		expect(planPriority(projects, 'id1', '!!!')).toEqual({ ok: true, write: { id: 'id1', number: 1, priority: '!!!' } });
	});
	it('sets a priority on a project that has none', () => {
		expect(planPriority(projects, 'id2', '-')).toEqual({ ok: true, write: { id: 'id2', number: 2, priority: '-' } });
	});
	it('does nothing when the priority is the same', () => {
		expect(planPriority(projects, 'id1', '!!')).toEqual({ ok: true, write: null });
	});
	it('refuses a task', () => {
		expect(planPriority(projects, 'id10', '!').ok).toBe(false);
	});
	it('refuses an unknown priority', () => {
		expect(planPriority(projects, 'id1', 'urgent').ok).toBe(false);
	});
	it('refuses an unknown item', () => {
		expect(planPriority(projects, 'nope', '!').ok).toBe(false);
	});
});
