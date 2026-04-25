'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Sigma,
  TrendingUp,
  Zap,
  BarChart3,
  Code2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Math section explaining Devio logic: limits → rules → capability
// ---------------------------------------------------------------------------

function MathBlock({
  icon: Icon,
  title,
  subtitle,
  children,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 p-6 sm:p-8 space-y-5"
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 shrink-0">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-neutral-800 dark:text-neutral-100">
            {title}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300">
        {children}
      </div>
    </motion.div>
  );
}

export function MathematicsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: '-200px' });

  return (
    <motion.section
      ref={sectionRef}
      className="border-t border-neutral-200 dark:border-neutral-700 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-800/30 dark:to-neutral-900 py-20 sm:py-28"
      aria-label="La matemática de Devio"
      initial={{ opacity: 0 }}
      animate={sectionInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
    >
      <div className="mx-auto w-11/12 space-y-16 sm:space-y-20">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto space-y-4"
          initial={{ opacity: 0, y: 24 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-50">
            La matemática de Devio
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Bajo el capó: cómo Devio transforma datos crudos en inteligencia estadística. Explicación de
            la lógica pura y las fórmulas que mueven el control de procesos.
          </p>
        </motion.div>

        {/* Step 1: Límites de Control */}
        <MathBlock
          icon={Sigma}
          title="1. Límites de Control (UCL, CL, LCL)"
          subtitle="Calculados a partir de la varianza del proceso"
          delay={0.1}
        >
          <div className="space-y-4">
            <p>
              Los límites de control definen la zona donde el proceso se comporta de forma aleatoria. Se
              calculan usando la media (μ) y desviación estándar (σ) de tus datos:
            </p>

            <div className="bg-neutral-100 dark:bg-neutral-900/50 rounded-lg p-4 font-mono text-xs sm:text-sm overflow-x-auto border border-neutral-200 dark:border-neutral-700">
              <div className="text-blue-600 dark:text-blue-400">• Media (CL):</div>
              <div className="text-neutral-700 dark:text-neutral-300 mt-1">
                CL = Σ(mediciones) / n
              </div>

              <div className="text-blue-600 dark:text-blue-400 mt-4">• Desviación estándar (σ):</div>
              <div className="text-neutral-700 dark:text-neutral-300 mt-1">
                σ = √(Σ(x - CL)² / (n - 1))
              </div>

              <div className="text-blue-600 dark:text-blue-400 mt-4">• Límites de control (±3σ):</div>
              <div className="text-neutral-700 dark:text-neutral-300 mt-1">
                UCL = CL + 3σ <br />
                LCL = CL - 3σ
              </div>
            </div>

            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                El 99.73% de los datos aleatorios caen dentro de ±3σ. Valores fuera = causa asignable.
              </p>
            </div>
          </div>
        </MathBlock>

        {/* Step 2: Zonas Sigma */}
        <MathBlock
          icon={TrendingUp}
          title="2. Zonas Sigma: Capas de Riesgo"
          subtitle="Subdivisiones del proceso para detectar patrones"
          delay={0.2}
        >
          <div className="space-y-4">
            <p>
              Devio divide el proceso en 5 zonas basadas en desviaciones estándar, similar a Minitab:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="font-semibold text-red-700 dark:text-red-300 text-sm">Zona A (±2σ–±3σ)</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Rojo: Anómalo, causa probable</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                <p className="font-semibold text-orange-700 dark:text-orange-300 text-sm">Zona B (±1σ–±2σ)</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Naranja: Advertencia</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="font-semibold text-green-700 dark:text-green-300 text-sm">Zona C (±0–±1σ)</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Verde: Normal, controlado</p>
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg p-3">
                <p className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm">% de datos esperados</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">68% en C, 27% en B, 5% en A</p>
              </div>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
              Fuente: Montgomery, Introduction to Statistical Quality Control (6ª ed.)
            </p>
          </div>
        </MathBlock>

        {/* Step 3: Reglas de Nelson */}
        <MathBlock
          icon={Zap}
          title="3. Reglas de Nelson: Detección de Patrones"
          subtitle="8 pruebas que revelan causas asignables"
          delay={0.3}
        >
          <div className="space-y-4">
            <p>
              Las 8 reglas de Nelson (1984) detectan patrones no aleatorios que indican que el proceso ha
              salido de control. Devio las aplica automáticamente:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { rule: '1', desc: 'Punto > ±3σ' },
                { rule: '2', desc: '9 puntos del mismo lado' },
                { rule: '3', desc: '6 puntos en tendencia' },
                { rule: '4', desc: '14 puntos alternando' },
                { rule: '5', desc: '2/3 > ±2σ mismo lado' },
                { rule: '6', desc: '4/5 > ±1σ mismo lado' },
                { rule: '7', desc: '15 puntos en ±1σ' },
                { rule: '8', desc: '8 puntos fuera ±1σ' },
              ].map((item) => (
                <div
                  key={item.rule}
                  className="bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3"
                >
                  <p className="font-bold text-blue-600 dark:text-blue-400">Nelson {item.rule}</p>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Si una regla se viola, Devio la marca con ⚠️ y sugiere causa raíz usando IA.
              </p>
            </div>
          </div>
        </MathBlock>

        {/* Step 4: Capacidad del Proceso */}
        <MathBlock
          icon={BarChart3}
          title="4. Índices de Capacidad: ¿Puedo cumplir especificaciones?"
          subtitle="Cp, Cpk, Pp, Ppk miden qué tan bien tu proceso ejecuta"
          delay={0.4}
        >
          <div className="space-y-4">
            <p>
              Los índices de capacidad comparan la variabilidad del proceso con los límites de
              especificación (USL/LSL). Valores {'>'} 1.33 = proceso capaz.
            </p>

            <div className="bg-neutral-100 dark:bg-neutral-900/50 rounded-lg p-4 font-mono text-xs sm:text-sm overflow-x-auto border border-neutral-200 dark:border-neutral-700">
              <div className="text-blue-600 dark:text-blue-400 font-bold">Capacidad a corto plazo:</div>
              <div className="text-neutral-700 dark:text-neutral-300 mt-2">
                Cp = (USL - LSL) / (6σ)
                <br />
                Cpk = min((USL - μ), (μ - LSL)) / (3σ)
              </div>

              <div className="text-blue-600 dark:text-blue-400 font-bold mt-4">Desempeño a largo plazo:</div>
              <div className="text-neutral-700 dark:text-neutral-300 mt-2">
                Pp = (USL - LSL) / (6σ_total)
                <br />
                Ppk = min((USL - μ), (μ - LSL)) / (3σ_total)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded p-2">
                <p className="font-bold text-green-700 dark:text-green-300">{'≥ 1.67'}</p>
                <p className="text-green-600 dark:text-green-400">Excelente</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-2">
                <p className="font-bold text-blue-700 dark:text-blue-300">{'>= 1.33'}</p>
                <p className="text-blue-600 dark:text-blue-400">Adecuado</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded p-2">
                <p className="font-bold text-yellow-700 dark:text-yellow-300">{'>= 1.0'}</p>
                <p className="text-yellow-600 dark:text-yellow-400">Marginal</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded p-2">
                <p className="font-bold text-red-700 dark:text-red-300">{'< 1.0'}</p>
                <p className="text-red-600 dark:text-red-400">Inadecuado</p>
              </div>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
              Cpk es más importante que Cp: considera el centrado del proceso.
            </p>
          </div>
        </MathBlock>

        {/* Step 5: El flujo completo */}
        <MathBlock
          icon={Code2}
          title="5. El Flujo Completo: De Datos a Acción"
          subtitle="Cómo Devio procesa tu CSV en segundos"
          delay={0.5}
        >
          <div className="space-y-4">
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                  1
                </span>
                <div>
                  <p className="font-semibold text-neutral-700 dark:text-neutral-200">Parsear CSV/Excel</p>
                  <p className="text-neutral-500 dark:text-neutral-400">Detecta automáticamente: ¿subgrupos o individuales?</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                  2
                </span>
                <div>
                  <p className="font-semibold text-neutral-700 dark:text-neutral-200">Calcular estadísticos</p>
                  <p className="text-neutral-500 dark:text-neutral-400">Media, σ, límites UCL/CL/LCL para la carta X̄-R, X̄-S o I-MR</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                  3
                </span>
                <div>
                  <p className="font-semibold text-neutral-700 dark:text-neutral-200">Aplicar 8 reglas Nelson</p>
                  <p className="text-neutral-500 dark:text-neutral-400">Marca puntos violados, identifica patrones anómalos</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                  4
                </span>
                <div>
                  <p className="font-semibold text-neutral-700 dark:text-neutral-200">Calcular Cp/Cpk (si USL/LSL)</p>
                  <p className="text-neutral-500 dark:text-neutral-400">Compara contra especificaciones, categoriza capacidad</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                  5
                </span>
                <div>
                  <p className="font-semibold text-neutral-700 dark:text-neutral-200">IA: Análisis DMAIC</p>
                  <p className="text-neutral-500 dark:text-neutral-400">Claude analiza violaciones, causa raíz (6M), acciones correctivas</p>
                </div>
              </li>
            </ol>

            <div className="flex items-start gap-3 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Todo ocurre server-side. Tus datos no se guardan. Resultados listos en segundos.
              </p>
            </div>
          </div>
        </MathBlock>

        {/* CTA */}
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 24 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Ahora que entiendes la lógica detrás de Devio, pruébalo. Sube un CSV, visualiza la matemática
            en tiempo real y toma decisiones basadas en datos.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <a
              href="/app"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-base font-semibold text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/40"
            >
              Ir al Dashboard y Analizar
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
