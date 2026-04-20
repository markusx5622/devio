'use client';

import { Printer } from 'lucide-react';

export function ExportButton() {
  const handlePrint = () => {
    const date = new Date().toISOString().slice(0, 10);
    const prev = document.title;
    document.title = `devio-informe-${date}`;
    window.print();
    document.title = prev;
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="no-print flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
    >
      <Printer className="h-4 w-4" aria-hidden />
      Exportar informe PDF
    </button>
  );
}
