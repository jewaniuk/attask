import { fetchBoard, fetchDetail, setParent, writeStatuses } from './github';
import { planParent, planStatus } from './rules';

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

	const edit = url.pathname.match(/^\/items\/([\w-]+)\/(status|parent)$/);
	if (request.method === 'POST' && edit) {
		const [, id, action] = edit;
		const body: any = await request.json();
		const items = await fetchBoard(env.GITHUB_TOKEN);

		if (action === 'status') {
			const plan = planStatus(items, id, String(body.status));
			if (!plan.ok) return Response.json({ error: plan.reason }, { status: 409 });
			await writeStatuses(env.GITHUB_TOKEN, plan.writes);
			return Response.json({ writes: plan.writes });
		}

		const plan = planParent(items, id, Number(body.parent));
		if (!plan.ok) return Response.json({ error: plan.reason }, { status: 409 });
		const task = items.find((i) => i.id === id)!;
		await setParent(env.GITHUB_TOKEN, Number(body.parent), task.number);
		const writes = [{ id, number: task.number, status: plan.status }];
		await writeStatuses(env.GITHUB_TOKEN, writes);
		return Response.json({ writes });
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
			out.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
		}
		return out;
	},
} satisfies ExportedHandler<Env>;
