# linux-commands-cli

Terminal companion for the Linux Commands Hub — look up a command without leaving your terminal. Consumes the project's [public read API](../docs/public-api.md); it's a separate, self-contained package (own `package.json`, own `tsconfig.json`, own `node_modules`) rather than part of the main Next.js app, since it's meant to eventually ship independently (its own npm package once someone wants to publish it — not done yet, see `docs/progress.md`).

## Usage

```bash
linux-commands grep                          # show details for a command
linux-commands search "list files"           # search by name/description (10 results per page)
linux-commands search "list files" --page 2  # next page of results
linux-commands --help
```

By default it talks to `http://localhost:3000`. Point it at a real deployment with:

```bash
LINUX_COMMANDS_API_URL=https://your-deployment.example.com linux-commands grep
```

## Local development

```bash
cd cli
npm install
npm run dev -- grep       # runs directly via tsx, no build step
npm run build              # compiles to dist/
npm link                   # try the built binary as `linux-commands` globally
```

## Design notes

- **Zero runtime dependencies.** ANSI coloring is three hand-rolled escape codes (`src/format.ts`) rather than pulling in `chalk` for something this small.
- **Argument parsing is a pure function** (`src/args.ts`, `parseArgs`) separated from the fetch/print logic specifically so it's unit-testable without a network call — see `src/__tests__/args.test.ts`, which is picked up by the root repo's `npm test` (Vitest scans the whole repo, not just `app/`).
- Not published to npm — that's a deliberate, separate decision for a maintainer to make later, not something bundled into building the package itself.
