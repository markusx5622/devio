'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SPC_GLOSSARY } from '@/lib/spc/glossary';

interface SpcTooltipProps {
  term: string;
  children: React.ReactNode;
}

export function SpcTooltip({ term, children }: SpcTooltipProps) {
  const definition = SPC_GLOSSARY[term];
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, above: true });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const show = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const above = rect.top > 160;
    setCoords({
      top: above ? rect.top + window.scrollY - 8 : rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX + rect.width / 2,
      above,
    });
    setVisible(true);
  }, []);

  const hide = useCallback(() => setVisible(false), []);

  if (!definition) return <>{children}</>;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="cursor-help underline decoration-dotted decoration-neutral-400 dark:decoration-neutral-500 underline-offset-2"
        tabIndex={0}
        aria-describedby={visible ? `spc-tip-${term}` : undefined}
      >
        {children}
      </span>

      {mounted && createPortal(
        <AnimatePresence>
          {visible && (
            <motion.div
              id={`spc-tip-${term}`}
              role="tooltip"
              initial={{ opacity: 0, y: coords.above ? 4 : -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: coords.above ? undefined : coords.top,
                bottom: coords.above ? `calc(100vh - ${coords.top}px - 2px)` : undefined,
                left: coords.left,
                transform: 'translateX(-50%)',
                zIndex: 9999,
              }}
              className="pointer-events-none max-w-xs w-64 rounded-lg bg-neutral-900 dark:bg-neutral-700 px-3 py-2 text-xs text-white shadow-xl"
            >
              <p className="font-semibold mb-1 text-blue-300">{term}</p>
              <p className="leading-relaxed text-neutral-200">{definition}</p>
              <div
                className={[
                  'absolute left-1/2 -translate-x-1/2 w-0 h-0',
                  coords.above
                    ? 'bottom-0 translate-y-full border-x-4 border-x-transparent border-t-4 border-t-neutral-900 dark:border-t-neutral-700'
                    : 'top-0 -translate-y-full border-x-4 border-x-transparent border-b-4 border-b-neutral-900 dark:border-b-neutral-700',
                ].join(' ')}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
