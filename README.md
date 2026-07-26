# Linux Commands Hub

A searchable reference for Linux commands — what they do, and why they're called that.

## What this is

This project started as a single Markdown file and has been rebuilt into a full web app: a browsable, searchable command reference backed by MongoDB, with a protected admin panel, a public read API, and a CLI companion.

## Version 1 — static reference (original)

- All content lived in one file, [`commands.md`](commands.md), rendered by GitHub's file viewer.
- No search beyond your browser's `Ctrl`+`F`. No accounts, no database, no UI.
- Contribution model: fork → edit `commands.md` → open a PR.

`commands.md` is retired as the place to add new commands — see [CONTRIBUTING.md](CONTRIBUTING.md) for the current paths.

## Version 2 — searchable web app (current)

Built with Next.js (App Router) + TypeScript + Tailwind v4, MongoDB via Mongoose.

- **Browse & search** — a command grid with category filtering and server-rendered search, plus a ⌘K fuzzy command palette ([Fuse.js](https://fusejs.io/)) for fast jumps. Every list view — the command grid, recipes, admin tables, CSV import previews, revision history — is paginated.
- **Command detail pages** — description, a "Why it's called that" etymology callout with cited sources, an options table, worked examples, and a collapsed-by-default cross-platform flag comparison (GNU / BSD / macOS / BusyBox).
- **Etymology content** — the naming history is sourced, not repeated folklore: every non-trivial rationale cites a real URL (Unix history archives, the Jargon File, GNU/POSIX manuals). `grep`, `awk`, `sed`, and `tar` are seeded as worked examples.
- **Recipes** — multi-command one-liners for real tasks (`find . -mtime +7 -delete`), cross-linked from the commands they use.
- **Admin panel** (GitHub OAuth, restricted to an allowlist) — single add/edit with a live preview and full revision history, CSV bulk import (preview → confirm, partial-success-per-row, audit-logged), recipe management, and a suggestion moderation queue.
- **Public suggestion form** (`/suggest`, no login) — a way for non-Git contributors to propose a command; every submission is reviewed before anything is published.
- **Public read API** (`/api/v1`) — versioned, cached, rate-limited, and paginated:
  - `GET /api/v1/commands` — list, filterable by `q` (search) and `category`; add `page`/`pageSize` to paginate (omit both to get the full catalog in one response).
  - `GET /api/v1/commands/:slug` — full command detail.
  - `GET /api/v1/categories` — category list.
- **CLI companion** ([`cli/`](cli/)) — `linux-commands <slug>` / `linux-commands search <query> [--page N]`, consuming the public API. See [`cli/README.md`](cli/README.md).

Not built, and deliberately so for now: an in-browser "try it" terminal was scoped and the recommendation was explicitly _against_ real execution, in favor of a client-side scripted walkthrough that never runs anything. A handful of smaller gaps (theme toggle, related-commands picker, recipe revision history, that scripted terminal walkthrough, a shared rate-limit store for the public API) are filed as open issues, labeled by area — good places to start if you want to contribute code.

## Running the app locally

Requires Node 22+ and either Docker or a MongoDB Atlas connection string.

```bash
git clone https://github.com/peculiarrichard/linux-commands.git
cd linux-commands
npm install
cp .env.example .env   # fill in MONGODB_URI at minimum
docker compose up -d   # starts a local MongoDB — skip if using Atlas
npm run dev
```

The app runs at `http://localhost:3000`. Without a `MONGODB_URI` set, every page still runs and renders a friendly "no database connected yet" state rather than crashing — useful for exploring the UI before wiring up a real database.

Other scripts: `npm run lint`, `npm run typecheck`, `npm run format`, `npm test`, `npm run build`.

### CLI companion

```bash
cd cli
npm install
npm run dev -- grep
```

See [`cli/README.md`](cli/README.md) for full usage.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — code PRs, the public suggestion form, and proposing an issue are all open to anyone; direct database access (the admin panel) is restricted to a small allowlisted group. Issues labeled [`good first issue`](https://github.com/peculiarrichard/linux-commands/labels/good%20first%20issue) are a good place to start.

## License

This project is licensed under the [MIT License](LICENSE).
