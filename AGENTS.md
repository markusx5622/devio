# AGENTS.md — Devio

This file is the authoritative specification for any AI coding agent working in this repository. Read it in full before making any change. When this file conflicts with an issue, flag the conflict in the PR description and do not proceed silently.

## Project overview

Devio is a Statistical Process Control (SPC) analysis tool for manufacturing and quality engineers. Users upload process measurement data (CSV or XLSX) and the application produces:

- Control charts (X̄-R, X̄-S, I-MR in v1; attribute charts p, np, c, u in v2)
- Detection of Nelson / Western Electric rule violations
- Process capability and performance indices (Cp, Cpk, Pp, Ppk)
- AI-generated Six Sigma DMAIC reports

The application is a Next.js 15 app deployed on Vercel. Statistical calculations run server-side in pure TypeScript. No native dependencies, no database in v1.

## Tech stack (do not change without explicit issue approval)

- **Runtime**: Node.js 20+, pnpm as package manager
- **Framework**: Next.js 15, App Router, React Server Components by default
- **Language**: TypeScript 5+ in strict mode
- **React**: 19+
- **Styling**: Tailwind CSS v4, CSS-first configuration in `src/app/globals.css` using `@theme`. There is no `tailwind.config.ts` file
- **Animations**: Framer Motion v12
- **Charts**: Recharts
- **Data parsing**: Papaparse (CSV), ExcelJS / `exceljs` (Excel)
- **Validation**: Zod
- **AI**: `@anthropic-ai/sdk`, model `claude-sonnet-4-6` in production API calls
- **Testing**: Vitest + @testing-library/react + jsdom
- **Icons**: lucide-react only

Adding a dependency requires explicit mention in the issue. Do not install libraries that replace utilities writable in under 30 lines of TypeScript.

## Code conventions

### Naming

- **Components**: PascalCase files, e.g. `ControlChart.tsx`, grouped in `src/components/{feature}/`
- **Non-component modules**: kebab-case, e.g. `western-electric-rules.ts`
- **Tests**: colocated as `*.test.ts` or `*.test.tsx`
- **Routes**: follow Next.js App Router conventions (`page.tsx`, `layout.tsx`, `route.ts`)

### TypeScript

- No `any`. Use `unknown` with type narrowing when a type is genuinely unknown
- Prefer discriminated unions over optional fields with magic values
- Public APIs of modules are exported with explicit return types
- Domain types live in `src/lib/spc/types.ts` and are imported from there everywhere. Do not duplicate domain types

### Pure functions for all statistics

Everything under `src/lib/spc/stats/`, `src/lib/spc/charts/`, `src/lib/spc/capability/`, and `src/lib/spc/rules/` must be pure: no I/O, no side effects, deterministic output for identical input. This rule is non-negotiable because it enables unit testing and allows the engine to be reused outside the web app.

### Error handling

Parsers and API handlers return `Result<T, SpcError>` (see `src/lib/utils/result.ts`). Do not throw from pure functions. Do not silently swallow errors. API routes respond with JSON discriminated unions: `{ ok: true, data: ... } | { ok: false, error: { code, message } }`.

### Imports

- Absolute imports via `@/*` alias (configured in `tsconfig.json`)
- Order: React / Next → third-party → internal `@/lib` → internal `@/components` → local relative
- No barrel `index.ts` files except at the top of feature directories where they measurably help DX

### Styling

- Tailwind utility classes in JSX
- No inline `style` attributes except for dynamically computed values that cannot be expressed with utilities
- Design tokens live once in `src/app/globals.css` inside `@theme`
- Respect `prefers-color-scheme`; use semantic CSS variables instead of ad-hoc `dark:` class combinations

## Testing requirements

Every function in `src/lib/spc/` ships with unit tests. Use Montgomery's *Introduction to Statistical Quality Control* datasets as reference fixtures where possible; cite the chapter and example number in a comment above the fixture. Tests are colocated with the implementation. `pnpm test` must pass before a PR can be merged.

UI components with non-trivial logic need component tests (React Testing Library). Pure presentation components do not.

## Domain glossary (SPC)

Use these abbreviations consistently in code, comments, and UI copy.

- `CL` — Center Line (process mean)
- `UCL`, `LCL` — Upper / Lower Control Limit (statistical, derived from variation)
- `USL`, `LSL` — Upper / Lower Specification Limit (requirement, given by engineering)
- `Cp`, `Cpk` — Short-term process capability indices
- `Pp`, `Ppk` — Long-term process performance indices
- `A2`, `A3`, `D3`, `D4`, `B3`, `B4`, `c4`, `d2`, `E2` — Shewhart control chart constants, tabulated in `src/lib/spc/constants.ts`
- `Subgroup` — a rational sample of measurements taken together
- Nelson Rules 1–8 — the canonical set of out-of-control detection rules; these supersede the original Western Electric set. Implement all eight.

## Commit conventions (Conventional Commits)

Format: `<type>(<scope>): <subject>`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `style`
Scopes: `spc`, `ui`, `api`, `ai`, `landing`, `config`, `deps`
Subject: imperative mood, no trailing period, under 72 characters

Examples:

- `feat(spc): implement X-bar R chart calculator`
- `fix(ui): correct violation tooltip position on mobile`
- `docs(architecture): add sequence diagram for analysis pipeline`

A PR has a single primary commit type in its title. Multi-type PRs should be split.

## Pull request rules

- One issue per PR. Do not bundle unrelated changes
- PR title matches the primary commit's Conventional Commit format
- Fill out the PR template completely
- Copy the acceptance checklist from the issue into the PR body and check items off as verified
- Never force-push a branch that has received review
- Do not merge your own PRs; wait for the repo owner's approval

## What NOT to do

- Do not modify `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `tsconfig.json`, `eslint.config.*`, `vitest.config.ts`, `postcss.config.mjs`, or any `.github/workflows/*` file unless the issue explicitly requests it
- Do not install new dependencies to solve small utility problems
- Do not introduce ORMs, databases, or authentication in v1; Devio v1 is stateless
- Do not use `console.log` in committed code
- Do not mix SPC algorithm code with UI code; the engine in `src/lib/spc/` must remain framework-agnostic
- Do not leave `TODO` comments without an associated GitHub issue reference
- Do not generate mock data inside production modules; test fixtures live under `src/lib/spc/__fixtures__/`

## Guidance for AI coding agents specifically

This project is built almost entirely through GitHub Copilot. When you propose an implementation:

- Cite the SPC textbook source (Montgomery; Grant & Leavenworth; Wheeler) for any formula or constant you introduce
- If an issue is ambiguous, raise the ambiguity in the PR body rather than guessing silently
- If an issue conflicts with this file or with `docs/ARCHITECTURE.md`, flag the conflict and stop
- When the task touches more than three files or modifies more than two modules, open the PR as a draft and describe your plan in the body before writing code

## Repository structure

```
devio/
├── AGENTS.md                        # this file
├── README.md
├── LICENSE
├── .env.example
├── .github/
│   ├── copilot-instructions.md      # context for Copilot chat (Ask mode)
│   ├── pull_request_template.md
│   └── ISSUE_TEMPLATE/
│       └── feature.yml
├── docs/
│   └── ARCHITECTURE.md              # created in Phase 1
├── public/
│   └── demo/                        # sample datasets (Phase 5)
├── src/
│   ├── app/                         # Next.js routes and API handlers
│   ├── components/                  # React components, grouped by feature
│   └── lib/
│       ├── spc/                     # pure SPC engine
│       ├── ai/                      # Claude integration
│       └── utils/                   # Result type, formatters, shared helpers
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── eslint.config.mjs
├── vitest.config.ts
└── package.json
```

## Project phases

- **Phase 0** — Repository bootstrap, developer ergonomics, CI basics
- **Phase 1** — SPC architecture: domain types, algorithm interfaces, `docs/ARCHITECTURE.md`
- **Phase 2** — Statistical engine: parsers, stats utilities, chart calculators, violation rules, capability indices
- **Phase 3** — Dashboard UI: upload flow, chart components, capability cards, report preview
- **Phase 4** — AI layer: Claude integration for DMAIC reports and natural-language insights
- **Phase 5** — Polish: microcopy, tooltips, demo datasets, Playwright end-to-end tests
- **Phase 6** — Deploy: Vercel project, custom domain, analytics, final README pass

Each phase is tracked as a GitHub milestone. Every issue belongs to exactly one milestone.

## Reference

- AGENTS.md spec: https://agents.md
- Next.js 15: https://nextjs.org/docs
- Tailwind CSS v4: https://tailwindcss.com/blog/tailwindcss-v4
- Vitest: https://vitest.dev
- Nelson rules: *Journal of Quality Technology* 16 (1984), Lloyd S. Nelson
