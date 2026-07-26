# Contributing to Linux Commands Hub

This project was rebuilt from a static `commands.md` list into a Next.js + MongoDB web app — a searchable command reference with a protected admin panel. `commands.md` is retired as the place to add new commands; its content was migrated into the app's database-backed schema during the rebuild — use one of the paths below instead of editing it directly.

## Access tiers

Not every contribution path touches the database directly:

| Tier                   | Who                  | How                                                                                                                       |
| ---------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Maintainers/Admins** | Small, invited group | Admin UI (single-add form, CSV bulk import) — direct database write                                                       |
| **Everyone else**      | Anyone               | Pull requests, the public suggestion form, or proposing an issue — no database access, reviewed the same way a code PR is |

If you're not on the admin allowlist, that's normal — nothing below requires it.

## Ways to contribute

### 1. Code

Standard fork → branch → PR flow against the app itself.

```bash
git clone https://github.com/peculiarrichard/linux-commands.git
cd linux-commands
npm install
cp .env.example .env   # fill in MONGODB_URI at minimum
docker compose up -d   # local MongoDB — skip if using Atlas
npm run dev
```

Before opening a PR, run the same checks CI runs:

```bash
npm run lint && npm run typecheck && npm run format:check && npm test && npm run build
```

Good areas to jump into: frontend, backend/API, devops, design, QA, i18n, security. Issues are labeled by area — look for [`good first issue`](https://github.com/peculiarrichard/linux-commands/labels/good%20first%20issue) if you're new here.

### 2. Suggest a command — no code, no Git required

Run the app and visit `/suggest` (or the deployed site once one exists). No login needed. Every suggestion lands in an admin moderation queue — a maintainer reviews it before anything is drafted or published. Nothing is published automatically from this form.

### 3. Propose an issue

Anyone can open an issue proposing what they'd like to work on or see added — a new recipe idea, etymology research for a specific command, a cross-platform flag note, a UI polish idea — using the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md). Proposing an issue doesn't grant database or merge access; it's how work becomes visible and avoids duplicated effort before a PR exists.

## Writing etymology / rationale content

Almost nobody else in this space leads with "why is it called that" — it's the project's actual differentiator, so it's worth doing well:

- **The actual origin, not a guess.** "Short for X" is a description, not etymology, if X is just the plain-English expansion of the name. The interesting version answers: who wrote it, when, and _why that specific name_.
- **Cite where you got it.** Every non-trivial rationale needs at least one real source URL — the GNU/POSIX manual's history section, Unix history archives, the Jargon File, mailing list archives, or a well-cited secondary source. Don't repeat unsourced "fun facts" that copy-paste across blog posts.
- **A short, honest entry beats a longer, unverifiable one.** If you can't find a source you'd stand behind, keep digging or keep it simple.
- Write for someone who already knows what the command does — the rationale is the one paragraph that makes the name click, not a re-explanation of what the command does (that's the description field's job).

## Guidelines

- Don't duplicate existing commands, recipes, or open issues — search first.
- Keep PRs scoped; explain the _why_ in the description, not just the _what_.

Happy contributing!
