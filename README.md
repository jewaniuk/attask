# attask

A mobile-first web app for viewing and editing a personal task board kept in a GitHub Project. The app is static (Svelte, hosted on GitHub Pages) and talks to a small Cloudflare Worker that holds the GitHub token, so the token never reaches the browser and the repo holds no data.

- `app/` the web app
- `worker/` the Worker (GitHub GraphQL access, auth, CORS, board rules)

See `CLAUDE.md` for how to run, test and contribute.
