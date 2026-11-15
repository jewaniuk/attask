import { fetchBoard } from './github';

async function route(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);

	if (request.headers.get('Authorization') !== `Bearer ${env.APP_KEY}`) {
		return new Response('unauthorized', { status: 401 });
	}

	if (request.method === 'GET' && url.pathname === '/board') {
		return Response.json(await fetchBoard(env.GITHUB_TOKEN));
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
