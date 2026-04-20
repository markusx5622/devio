# Devio — Control Estadístico de Procesos

> Herramienta de análisis SPC para ingenieros de calidad.
> Sube tus datos de proceso, obtén cartas de control,
> detección de causas asignables y un informe DMAIC
> completo — sin configuración, sin API keys.

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://devio.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/tests-125_passing-green)](./src)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

## Demo en vivo

**[devio.vercel.app](https://devio.vercel.app)** — Sin registro, sin API key.

Carga uno de los 4 escenarios de demo incluidos y ve el análisis en segundos.

## Qué hace

Devio implementa desde cero el motor de Control Estadístico de Procesos:

- **Cartas de control** X̄-R, X̄-S e I-MR con límites UCL/CL/LCL calculados
- **Detección de las 8 reglas de Nelson** para identificar causas asignables
- **Índices de capacidad** Cp, Cpk, Pp y Ppk con interpretación categórica
- **Informe DMAIC determinístico** — análisis Six Sigma completo sin IA generativa
- **4 escenarios de demo** — proceso estable, deriva, causa asignable y proceso incapaz
- **Export a PDF** del informe completo

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 App Router |
| Lenguaje | TypeScript 5 strict |
| Motor SPC | Implementación propia (zero dependencias externas) |
| Gráficos | Recharts |
| Animaciones | Framer Motion v12 |
| Estilos | Tailwind CSS v4 |
| Tests | Vitest + Testing Library |
| Tests E2E | Playwright |
| Deploy | Vercel |

## Arquitectura

```
src/
├── lib/
│   ├── spc/              # Motor estadístico puro (zero framework)
│   │   ├── parsers/      # CSV y XLSX → ParsedData
│   │   ├── stats/        # Funciones estadísticas base
│   │   ├── charts/       # Calculadores X̄-R, X̄-S, I-MR
│   │   ├── rules/        # Detector 8 reglas de Nelson
│   │   ├── capability/   # Cp, Cpk, Pp, Ppk
│   │   └── analyze.ts    # Orquestador principal
│   └── analysis/
│       └── interpreter.ts # Informe DMAIC determinístico
├── components/           # React components
│   ├── charts/           # ControlChart, CapabilityCard
│   ├── results/          # ViolationTable, ExportButton
│   ├── upload/           # UploadDropzone
│   └── ai/               # InsightsPanel (análisis determinístico)
└── app/
    ├── api/analyze/      # POST /api/analyze
    ├── api/insights/     # POST /api/insights
    └── app/              # Dashboard principal
```

El motor SPC (`src/lib/spc/`) es framework-agnostic:
funciones puras, sin I/O, sin side effects.
Puede usarse independientemente de Next.js.

## Desarrollo local

```bash
# Clonar e instalar
git clone https://github.com/markusx5622/devio.git
cd devio
pnpm install

# Variables de entorno (opcional)
cp .env.example .env.local

# Servidor de desarrollo
pnpm dev          # http://localhost:3000

# Tests
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright e2e tests

# Build de producción
pnpm build
```

## Datasets de demo incluidos

| Escenario | Descripción | Violaciones esperadas |
|-----------|-------------|----------------------|
| Proceso estable | 30 subgrupos × n=5, Cpk≈1.45 | Ninguna |
| Proceso con deriva | Deriva lineal desde subgrupo 15 | Nelson R2, R3 |
| Causa asignable | Spike brusco en subgrupos 18-20 | Nelson R1 |
| Fuera de especificación | Alta variabilidad, Cpk≈0.65 | Múltiples |

## Por qué este proyecto

Construido como proyecto personal durante los estudios de
Ingeniería en Organización Industrial en la Universidad Europea
de Valencia. El objetivo era implementar las técnicas SPC
estudiadas en clase como software real y funcional.

Todo el motor estadístico está implementado desde cero
siguiendo Montgomery, *Introduction to Statistical Quality
Control* (7ª ed.) como referencia bibliográfica.

## Licencia

MIT © 2026 M&C Web Solutions
