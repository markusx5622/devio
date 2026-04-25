import { readFileSync } from 'fs';
import { join } from 'path';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, TrendingUp, Zap, AlertTriangle } from 'lucide-react';

interface DemoConfig {
  id: string;
  filename: string;
  label: string;
  description: string;
  chartType: string;
  badge: 'stable' | 'drift' | 'spike' | 'incapable';
  specLimits?: { usl: number; lsl: number };
}

const BADGE_ICONS: Record<DemoConfig['badge'], React.ElementType> = {
  stable: CheckCircle2,
  drift: TrendingUp,
  spike: Zap,
  incapable: AlertTriangle,
};

const BADGE_LABELS: Record<DemoConfig['badge'], string> = {
  stable: 'Estable',
  drift: 'Deriva',
  spike: 'Violaciones',
  incapable: 'Incapaz',
};

const BADGE_COLORS: Record<
  DemoConfig['badge'],
  { bg: string; text: string; border: string }
> = {
  stable: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800/50',
  },
  drift: {
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800/50',
  },
  spike: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800/50',
  },
  incapable: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800/50',
  },
};

async function getDemos(): Promise<DemoConfig[]> {
  const indexPath = join(process.cwd(), 'public/demo/index.json');
  const content = readFileSync(indexPath, 'utf-8');
  return JSON.parse(content);
}

export default async function DemoPage() {
  const demos = await getDemos();

  return (
    <div className="w-11/12 mx-auto py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-50">
          Demostración de Procesos
        </h1>
        <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
          Selecciona un escenario de ejemplo para explorar cómo Devio analiza diferentes tipos de procesos
        </p>
      </div>

      {/* Demo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {demos.map((demo, idx) => {
          const Icon = BADGE_ICONS[demo.badge];
          const colors = BADGE_COLORS[demo.badge];

          return (
            <Link
              key={demo.id}
              href={`/app?demo=${demo.id}`}
              className={`group block h-full rounded-2xl border-2 p-6 sm:p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${colors.border} ${colors.bg}`}
            >
              {/* Badge */}
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 ${colors.text}`}>
                <Icon className="h-4 w-4" aria-hidden />
                <span className="text-xs font-semibold">{BADGE_LABELS[demo.badge]}</span>
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-3">
                {demo.label}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-base leading-relaxed mb-6">
                {demo.description}
              </p>

              {/* Chart Type Info */}
              <div className="mb-6 p-3 rounded-lg bg-neutral-100/50 dark:bg-neutral-700/30">
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                  Tipo de Carta
                </p>
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                  {demo.chartType === 'xbar-r' ? 'X̄-R' : demo.chartType === 'xbar-s' ? 'X̄-S' : 'I-MR'}
                </p>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all">
                Ver análisis
                <ArrowRight className="h-4 w-4" aria-hidden />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Back Link */}
      <div className="flex justify-center pt-8">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 px-6 py-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
        >
          ← Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
