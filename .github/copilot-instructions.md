# GitHub Copilot instructions — Devio

Devio is a Statistical Process Control (SPC) analysis web app. Users upload manufacturing process measurements and receive control charts, rule-violation detection, process capability indices, and AI-generated Six Sigma DMAIC reports.

The authoritative specification is `AGENTS.md` at the repo root. When anything in this file is unclear, defer to `AGENTS.md`.

## Context to assume in every chat session

- **Stack**: Next.js 15 App Router, React 19, TypeScript strict, Tailwind CSS v4, Recharts, Framer Motion v12, Zod, Vitest, `@anthropic-ai/sdk`
- **Package manager**: pnpm
- **Domain**: Statistical Process Control — always use SPC terminology (CL, UCL, LCL, USL, LSL, Cp, Cpk, Nelson rules 1–8)
- **Architecture**: a pure-function statistics engine in `src/lib/spc/`; the Next.js UI consumes it through API routes in `src/app/api/`
- **State**: v1 is stateless; no database, no auth

## Directory conventions

- `src/app/` — Next.js routes and API handlers
- `src/components/{feature}/` — React components grouped by feature
- `src/lib/spc/` — pure SPC engine (parsers, stats, charts, rules, capability, types, constants)
- `src/lib/ai/` — Claude integration for insights and reports
- `src/lib/utils/` — cross-cutting helpers (Result type, formatters)
- `docs/` — architecture and domain documentation
- `public/demo/` — sample datasets bundled with the app

## How I use this tool

- **Ask mode (planning)**: discussing architecture, cross-examining decisions, drafting issue specifications, reviewing PRs before merge, writing documentation
- **Agent mode (implementation)**: executing well-specified issues by creating branches, writing code, writing tests, and opening pull requests

When responding in Ask mode, help me sharpen a specification before I hand it to the coding agent. When responding in Agent mode, follow `AGENTS.md` strictly and produce a focused PR.

## Preferences for responses

- When proposing code, include the file path as a heading or comment
- When proposing architecture, include a mermaid diagram if the relationship is non-trivial
- Cite the SPC source (Montgomery; Grant & Leavenworth; Wheeler) for statistical formulas and constants
- Prefer composition over inheritance, pure functions over classes
- Prefer explicit return types over inference for public module APIs
- When suggesting an approach with trade-offs, list the two most serious alternatives and explain why the primary one wins

## Model selection heuristics

- **Claude Opus 4.6** — architecture conversations, prompt engineering for the AI layer, issue drafting for non-trivial features, PR reviews that require design judgment
- **Claude Sonnet 4.6** — default for the coding agent when implementing a well-specified issue
- **Claude Haiku 4.5** — microcopy variants, quick tooltip drafts, small refactors, demo data generation

## Do not

- Suggest adding databases, ORMs, or authentication — Devio v1 is stateless
- Propose dependencies that replace trivial utilities
- Generate code in Ask mode unless I explicitly request it; Ask mode is for thinking and drafting issues, not for producing implementation
- Modify configuration files unless explicitly asked
