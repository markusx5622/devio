'use client';

import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UploadCloud, FileText, AlertCircle, Loader2, PlayCircle } from 'lucide-react';
import type { AnalysisResult } from '@/lib/spc/types';

interface ParsedPreview {
  headers: string[];
  rows: string[][];
}

interface UploadDropzoneProps {
  onSuccess: (result: AnalysisResult) => void;
}

type UploadState = 'idle' | 'dragging' | 'preview' | 'loading' | 'error';

export function UploadDropzone({ onSuccess }: UploadDropzoneProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParsedPreview | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseCsvPreview = useCallback((text: string): ParsedPreview => {
    const lines = text.trim().split('\n').slice(0, 6); // header + 5 rows
    const delimiter = text.includes(';') && !text.includes(',') ? ';' : ',';
    const headers = lines[0]?.split(delimiter).map((h) => h.trim()) ?? [];
    const rows = lines.slice(1).map((l) => l.split(delimiter).map((c) => c.trim()));
    return { headers, rows };
  }, []);

  const loadFile = useCallback(
    async (f: File) => {
      setFile(f);
      // Only preview CSV inline; XLSX just show filename
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
      loadFile(dropped);
    },
    [loadFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const picked = e.target.files?.[0];
      if (picked) loadFile(picked);
    },
    [loadFile],
  );

  const loadDemo = useCallback(async () => {
    const res = await fetch('/demo/sample-data.csv');
    const text = await res.text();
    const demoFile = new File([text], 'sample-data.csv', { type: 'text/csv' });
    loadFile(demoFile);
  }, [loadFile]);

  const runAnalysis = useCallback(async () => {
    if (!file) return;
    setState('loading');
    setError(null);

    const body = new FormData();
    body.append('file', file);
    body.append('analysisType', 'auto');

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
      setError('No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.');
    }
  }, [file, onSuccess]);

  const reset = useCallback(() => {
    setState('idle');
    setFile(null);
    setPreview(null);
    setError(null);
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
        onDragLeave={() => setState(file ? 'preview' : 'idle')}
        onDrop={handleDrop}
        onClick={() => state !== 'loading' && inputRef.current?.click()}
        role="button"
        aria-label="Arrastra un archivo CSV o Excel aquí, o haz clic para seleccionar"
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
              <motion.div key="loading-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                {/* Skeleton lines */}
                {[80, 60, 70].map((w, i) => (
                  <div key={i} className={`h-3 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse`} style={{ width: `${w}%` }} />
                ))}
                <p className="text-sm text-neutral-500 mt-2">Analizando datos…</p>
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
                <p className="text-xs text-neutral-400 mt-0.5">Haz clic en &ldquo;Analizar&rdquo; para continuar</p>
              </motion.div>
            ) : (
              <motion.div key="idle-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-base font-medium text-neutral-700 dark:text-neutral-200">
                  Arrastra tu archivo aquí
                </p>
                <p className="text-sm text-neutral-400 mt-1">CSV o Excel (.xlsx) · hasta 10 MB</p>
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
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); loadDemo(); }}
            className="flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
          >
            <FileText className="h-4 w-4" aria-hidden />
            Cargar datos de ejemplo
          </button>
        )}
      </div>
    </div>
  );
}
