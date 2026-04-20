'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Loader2,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  TrendingUp,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import type { AnalysisResult } from '@/lib/spc/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ParsedPreview {
  headers: string[];
  rows: string[][];
}

interface DemoScenario {
  id: string;
  filename: string;
  label: string;
  description: string;
  chartType: string;
  badge: 'stable' | 'drift' | 'spike' | 'incapable';
  specLimits?: { usl: number; lsl: number };
}

interface UploadDropzoneProps {
  onSuccess: (result: AnalysisResult) => void;
}

type UploadState = 'idle' | 'dragging' | 'preview' | 'loading' | 'error';

// ---------------------------------------------------------------------------
// Badge config
// ---------------------------------------------------------------------------

const BADGE_CONFIG: Record<
  DemoScenario['badge'],
  { label: string; icon: React.ElementType; className: string }
> = {
  stable: {
    label: 'Estable',
    icon: CheckCircle2,
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  },
  drift: {
    label: 'Deriva',
    icon: TrendingUp,
    className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  },
  spike: {
    label: 'Violaciones',
    icon: Zap,
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  },
  incapable: {
    label: 'Incapaz',
    icon: AlertTriangle,
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  },
};

// ---------------------------------------------------------------------------
// Demo selector sub-component
// ---------------------------------------------------------------------------

function DemoSelector({
  onLoad,
  disabled,
}: {
  onLoad: (scenario: DemoScenario) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);

  useEffect(() => {
    fetch('/demo/index.json')
      .then((r) => r.json())
      .then((data: DemoScenario[]) => setScenarios(data))
      .catch(() => {/* silently ignore */});
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors disabled:opacity-40"
      >
        <FileText className="h-4 w-4" aria-hidden />
        Cargar ejemplo
        {open ? <ChevronUp className="h-3.5 w-3.5" aria-hidden /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden />}
      </button>

      <AnimatePresence>
        {open && scenarios.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full mb-2 left-0 z-50 w-72 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="px-4 py-2.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide border-b border-neutral-100 dark:border-neutral-700">
              Selecciona un escenario
            </p>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-700/50">
              {scenarios.map((s) => {
                const cfg = BADGE_CONFIG[s.badge];
                const Icon = cfg.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setOpen(false); onLoad(s); }}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                        {s.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
                        <Icon className="h-3 w-3" aria-hidden />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">{s.description}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function UploadDropzone({ onSuccess }: UploadDropzoneProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParsedPreview | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pendingScenario, setPendingScenario] = useState<DemoScenario | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseCsvPreview = useCallback((text: string): ParsedPreview => {
    const nonComment = text.split('\n').filter((l) => !l.trim().startsWith('#'));
    const lines = nonComment.slice(0, 6);
    const delimiter = lines[0]?.includes(';') && !lines[0]?.includes(',') ? ';' : ',';
    const headers = lines[0]?.split(delimiter).map((h) => h.trim()) ?? [];
    const rows = lines.slice(1).map((l) => l.split(delimiter).map((c) => c.trim()));
    return { headers, rows };
  }, []);

  const loadFile = useCallback(
    async (f: File) => {
      setFile(f);
      if (f.name.toLowerCase().endsWith('.csv')) {
        const text = await f.text();
        setPreview(parseCsvPreview(text));
      } else {
        setPreview(null);
      }
      setState('preview');
      setError(null);
    },
    [parseCsvPreview],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files[0];
      if (!dropped) return;
      const name = dropped.name.toLowerCase();
      if (!name.endsWith('.csv') && !name.endsWith('.xlsx') && !name.endsWith('.xls')) {
        setState('error');
        setError('Solo se aceptan archivos CSV o Excel (.xlsx). Por favor sube un archivo válido.');
        return;
      }
      setPendingScenario(null);
      loadFile(dropped);
    },
    [loadFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const picked = e.target.files?.[0];
      if (picked) { setPendingScenario(null); loadFile(picked); }
    },
    [loadFile],
  );

  const loadScenario = useCallback(
    async (scenario: DemoScenario) => {
      setPendingScenario(scenario);
      const res = await fetch(`/demo/${scenario.filename}`);
      const text = await res.text();
      const demoFile = new File([text], scenario.filename, { type: 'text/csv' });
      await loadFile(demoFile);
    },
    [loadFile],
  );

  const runAnalysis = useCallback(async () => {
    if (!file) return;
    setState('loading');
    setError(null);

    const body = new FormData();
    body.append('file', file);
    body.append('analysisType', pendingScenario?.chartType === 'imr' ? 'imr' : 'auto');
    if (pendingScenario?.specLimits) {
      body.append('usl', String(pendingScenario.specLimits.usl));
      body.append('lsl', String(pendingScenario.specLimits.lsl));
    }

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body });
      const json = (await res.json()) as
        | { ok: true; data: AnalysisResult }
        | { ok: false; error: { code: string; message: string } };

      if (!json.ok) {
        setState('error');
        setError(json.error.message);
        return;
      }

      onSuccess(json.data);
    } catch {
      setState('error');
      setError('Error al procesar el archivo. Comprueba el formato e inténtalo de nuevo.');
    }
  }, [file, onSuccess, pendingScenario]);

  const reset = useCallback(() => {
    setState('idle');
    setFile(null);
    setPreview(null);
    setError(null);
    setPendingScenario(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Drop zone */}
      <motion.div
        className={[
          'relative rounded-xl border-2 border-dashed transition-colors duration-200 cursor-pointer',
          state === 'dragging'
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
            : state === 'error'
              ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
              : state === 'preview' || state === 'loading'
                ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                : 'border-neutral-300 dark:border-neutral-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10',
        ].join(' ')}
        onDragOver={(e) => { e.preventDefault(); setState('dragging'); }}
        onDragLeave={() => { setState(file ? 'preview' : 'idle'); }}
        onDrop={handleDrop}
        onClick={() => { if (state !== 'loading') inputRef.current?.click(); }}
        role="button"
        aria-label="Arrastra tu archivo CSV o Excel aquí, o haz clic para seleccionar"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="sr-only"
          onChange={handleFileInput}
          aria-label="Seleccionar archivo CSV o Excel"
        />

        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <AnimatePresence mode="wait">
            {state === 'loading' ? (
              <motion.div key="loading" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" aria-hidden />
              </motion.div>
            ) : state === 'error' ? (
              <motion.div key="error" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <AlertCircle className="h-12 w-12 text-red-500" aria-hidden />
              </motion.div>
            ) : state === 'preview' ? (
              <motion.div key="preview-icon" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <FileText className="h-12 w-12 text-green-500" aria-hidden />
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <UploadCloud className="h-12 w-12 text-neutral-400" aria-hidden />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {state === 'loading' ? (
              <motion.div key="loading-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1.5">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Analizando proceso…</p>
                <div className="flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-blue-500"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : state === 'error' ? (
              <motion.div key="error-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="mt-2 text-xs text-red-500 underline hover:no-underline"
                >
                  Intentar de nuevo
                </button>
              </motion.div>
            ) : state === 'preview' ? (
              <motion.div key="preview-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full" onClick={(e) => e.stopPropagation()}>
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 truncate max-w-xs mx-auto">{file?.name}</p>
                {pendingScenario && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{pendingScenario.label}</p>
                )}
                <p className="text-xs text-neutral-400 mt-0.5">Haz clic en «Analizar» para continuar</p>
              </motion.div>
            ) : (
              <motion.div key="idle-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-base font-medium text-neutral-700 dark:text-neutral-200">
                  Arrastra tu archivo CSV o Excel aquí, o haz clic para seleccionar
                </p>
                <p className="text-sm text-neutral-400 mt-1">Soporta .csv y .xlsx · Mínimo 5 filas de datos numéricos</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Data preview table */}
      <AnimatePresence>
        {state === 'preview' && preview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700"
          >
            <p className="px-4 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide bg-neutral-50 dark:bg-neutral-800">
              Vista previa — primeras 5 filas
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-neutral-100 dark:bg-neutral-700/50">
                    {preview.headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, i) => (
                    <tr key={i} className="border-t border-neutral-100 dark:border-neutral-700/50 even:bg-neutral-50/50 dark:even:bg-neutral-800/30">
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-1.5 text-neutral-700 dark:text-neutral-300 font-mono whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {state === 'preview' && (
          <motion.button
            type="button"
            onClick={runAnalysis}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition-all"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PlayCircle className="h-4 w-4" aria-hidden />
            Analizar
          </motion.button>
        )}

        {state !== 'loading' && (
          <DemoSelector onLoad={loadScenario} disabled={false} />
        )}
      </div>
    </div>
  );
}
