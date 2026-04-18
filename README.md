# Devio

> Statistical Process Control analysis for the rest of us.

[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Devio is a web application that brings Statistical Process Control (SPC) analysis to manufacturing and quality engineers without requiring specialist software. Upload your process measurement data as a CSV or Excel file and instantly receive control charts, rule-violation detection, process capability indices (Cp, Cpk, Pp, Ppk), and AI-generated Six Sigma DMAIC reports.

Built on Next.js 15 and deployed on Vercel, Devio runs entirely in the browser and on serverless functions — no database, no login, no installation required. The statistical engine is written in pure TypeScript, following the formulas and constants documented in Montgomery's *Introduction to Statistical Quality Control*.

## Development

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Lint
pnpm lint
```

## Project phases

| Phase | Description |
|-------|-------------|
| **Phase 0** | Repository bootstrap, developer ergonomics, CI basics |
| **Phase 1** | SPC architecture: domain types, algorithm interfaces, `docs/ARCHITECTURE.md` |
| **Phase 2** | Statistical engine: parsers, stats utilities, chart calculators, violation rules, capability indices |
| **Phase 3** | Dashboard UI: upload flow, chart components, capability cards, report preview |
| **Phase 4** | AI layer: Claude integration for DMAIC reports and natural-language insights |
| **Phase 5** | Polish: microcopy, tooltips, demo datasets, Playwright end-to-end tests |
| **Phase 6** | Deploy: Vercel project, custom domain, analytics, final README pass |

See [AGENTS.md](AGENTS.md) for the full specification and governance rules for this repository.

## License

This project is licensed under the [MIT License](LICENSE). Copyright 2026 M&C Web Solutions.
