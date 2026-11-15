import { describe, expect, it } from 'vitest';
import { planParent, planStatus } from '../src/rules';
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
	it('refuses next or doing under a paused project', () => {
		expect(planStatus(board, 'id13', 'next').ok).toBe(false);
		expect(planStatus(board, 'id13', 'doing').ok).toBe(false);
		expect(planStatus(board, 'id13', 'waiting').ok).toBe(true);
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

describe('planParent', () => {
	it('gives backlog under an active project', () => {
		expect(planParent(board, 'id20', 1)).toEqual({ ok: true, status: 'backlog' });
	});
	it('copies a paused parent status', () => {
		expect(planParent(board, 'id20', 2)).toEqual({ ok: true, status: 'backlog' });
		const waiting = [...board, item({ number: 3, isProject: true, status: 'waiting' })];
		expect(planParent(waiting, 'id20', 3)).toEqual({ ok: true, status: 'waiting' });
	});
	it('refuses a task that has a parent, a project, or a non-project parent', () => {
		expect(planParent(board, 'id10', 1).ok).toBe(false);
		expect(planParent(board, 'id1', 2).ok).toBe(false);
		expect(planParent(board, 'id20', 10).ok).toBe(false);
	});
});
