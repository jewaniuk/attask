import { closeNotPlanned, createIssue, deleteIssue, fetchBoard, fetchDetail, writePriority, writeStatuses } from './github';
import { planPriority, planStatus } from './rules';

async function route(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);

	if (request.headers.get('Authorization') !== `Bearer ${env.APP_KEY}`) {
		return new Response('unauthorized', { status: 401 });
	}

	if (request.method === 'GET' && url.pathname === '/board') {
		return Response.json(await fetchBoard(env.GITHUB_TOKEN));
	}

	const detail = url.pathname.match(/^\/issues\/(\d+)\/detail$/);
	if (request.method === 'GET' && detail) {
		return Response.json(await fetchDetail(env.GITHUB_TOKEN, Number(detail[1])));
	}

	const edit = url.pathname.match(/^\/items\/([\w-]+)\/status$/);
	if (request.method === 'POST' && edit) {
		const body: any = await request.json();
		const items = await fetchBoard(env.GITHUB_TOKEN);
		const plan = planStatus(items, edit[1], String(body.status));
		if (!plan.ok) return Response.json({ error: plan.reason }, { status: 409 });
		await writeStatuses(env.GITHUB_TOKEN, plan.writes);
		return Response.json({ writes: plan.writes });
	}

	const prio = url.pathname.match(/^\/items\/([\w-]+)\/priority$/);
	if (request.method === 'POST' && prio) {
		const body: any = await request.json();
		const items = await fetchBoard(env.GITHUB_TOKEN);
		const plan = planPriority(items, prio[1], String(body.priority));
		if (!plan.ok) return Response.json({ error: plan.reason }, { status: 409 });
		if (plan.write) await writePriority(env.GITHUB_TOKEN, plan.write);
		return Response.json({ priority: plan.write?.priority ?? null });
	}

	if (request.method === 'POST' && url.pathname === '/tasks') {
		const body: any = await request.json();
		const title = typeof body.title === 'string' ? body.title.trim() : '';
		if (!title) return Response.json({ error: 'title is empty' }, { status: 400 });
		return Response.json(await createIssue(env.GITHUB_TOKEN, title));
	}

	const drop = url.pathname.match(/^\/issues\/(\d+)\/not-planned$/);
	if (request.method === 'POST' && drop) {
		// a triaged, open task only: inbox tasks are deleted instead, projects are never dropped from here
		const number = Number(drop[1]);
		const item = (await fetchBoard(env.GITHUB_TOKEN)).find((i) => i.number === number);
		if (!item || !item.open || item.status === 'inbox' || item.isProject) {
			return Response.json({ error: 'only open, triaged tasks can be closed as not planned' }, { status: 409 });
		}
		await closeNotPlanned(env.GITHUB_TOKEN, number);
		return new Response(null, { status: 204 });
	}

	const remove = url.pathname.match(/^\/issues\/(\d+)$/);
	if (request.method === 'DELETE' && remove) {
		// only inbox tasks: a task already triaged, or a project, is never deleted from here
		const number = Number(remove[1]);
		const item = (await fetchBoard(env.GITHUB_TOKEN)).find((i) => i.number === number);
		if (!item || item.status !== 'inbox' || item.isProject) {
			return Response.json({ error: 'only inbox tasks can be deleted' }, { status: 409 });
		}
		await deleteIssue(env.GITHUB_TOKEN, number);
		return new Response(null, { status: 204 });
	}

	return new Response('not found', { status: 404 });
}

export default {
	async fetch(request, env): Promise<Response> {
		const origin = request.headers.get('Origin') ?? '';
		const allowed = env.ALLOWED_ORIGINS.split(',').includes(origin);

		// the browser sends an OPTIONS "preflight" first because of the Authorization header
		const res = request.method === 'OPTIONS' ? new Response(null, { status: 204 }) : await route(request, env);

		const out = new Response(res.body, res); // copy so the headers can be changed
		if (allowed) {
			out.headers.set('Access-Control-Allow-Origin', origin);
			out.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
			out.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
		}
		return out;
	},
} satisfies ExportedHandler<Env>;
