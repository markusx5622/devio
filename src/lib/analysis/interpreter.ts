import type { AnalysisResult, ViolationRule } from '@/lib/spc/types';
import type { SpcInsights } from '@/lib/ai/types';

// ---------------------------------------------------------------------------
// Per-rule templates
// ---------------------------------------------------------------------------

interface RuleTemplate {
  readonly interpretation: string;
  readonly rootCauses: readonly string[];
  readonly actions: readonly string[];
}

const RULE_TEMPLATES: Record<ViolationRule, RuleTemplate> = {
  'nelson-1': {
    interpretation:
      'Un punto fuera de los límites de control (±3σ) indica una causa asignable de alta magnitud. Esta señal es la más fuerte en SPC y requiere investigación inmediata.',
    rootCauses: [
      'Máquina: fallo repentino de equipo, herramienta rota o mal calibrada',
      'Material: lote defectuoso o contaminado fuera de especificación',
      'Mano de obra: error de operador o configuración incorrecta del proceso',
    ],
    actions: [
      'Detener el proceso y segregar el lote afectado para evaluación',
      'Investigar la causa raíz usando el diagrama de Ishikawa (6M)',
      'Registrar el evento en el sistema de no conformidades y notificar al supervisor',
    ],
  },
  'nelson-2': {
    interpretation:
      '9 puntos consecutivos al mismo lado de la línea central indican un desplazamiento sostenido de la media del proceso, aunque los puntos aún estén dentro de los límites de control.',
    rootCauses: [
      'Máquina: desgaste gradual de herramienta o cambio en la configuración del equipo',
      'Material: cambio de proveedor o variación significativa entre lotes de materia prima',
      'Medio ambiente: cambio de temperatura, humedad u otras condiciones ambientales',
    ],
    actions: [
      'Revisar cambios recientes en materiales, operadores o configuración del equipo',
      'Ajustar la media del proceso si el desplazamiento es sistemático y documentar el cambio',
      'Recalcular los límites de control con los datos del período afectado si el proceso ha cambiado permanentemente',
    ],
  },
  'nelson-3': {
    interpretation:
      '6 puntos consecutivos en tendencia monótona (siempre creciente o siempre decreciente) indican deriva sistemática del proceso debida a desgaste, temperatura u otro factor progresivo.',
    rootCauses: [
      'Máquina: desgaste progresivo de herramienta de corte, rodamiento o componente mecánico',
      'Método: lubricación insuficiente o frecuencia de mantenimiento preventivo inadecuada',
      'Medio ambiente: acumulación gradual de calor, humedad o contaminación en el proceso',
    ],
    actions: [
      'Programar inspección y sustitución preventiva del componente que genera la deriva',
      'Revisar el plan de mantenimiento preventivo y ajustar su frecuencia',
      'Implementar monitoreo de tendencias con alarma anticipada al superar ±1.5σ',
    ],
  },
  'nelson-4': {
    interpretation:
      '14 puntos alternando arriba-abajo de forma sistemática indican mezcla de dos fuentes de variación o sobreajuste del proceso por parte del operador.',
    rootCauses: [
      'Mano de obra: dos operadores con ajustes diferentes al mismo proceso (turno A vs. turno B)',
      'Máquina: mezcla de producción de dos máquinas con medias ligeramente diferentes',
      'Método: sobreajuste del proceso — el operador corrige cada punto individual generando oscilación artificial',
    ],
    actions: [
      'Identificar si hay dos fuentes de variación (turnos, máquinas, operadores) y separarlas en subgrupos homogéneos',
      'Capacitar a los operadores: no ajustar el proceso ante variación aleatoria normal dentro de los límites de control',
      'Si es sobreajuste, implementar reglas de acción claras basadas únicamente en señales de la carta de control',
    ],
  },
  'nelson-5': {
    interpretation:
      '2 de 3 puntos consecutivos más allá de ±2σ en el mismo lado indica un desplazamiento moderado de la media del proceso, señal más débil que la Regla 1 pero estadísticamente significativa.',
    rootCauses: [
      'Material: variación entre sublotes dentro del mismo proveedor durante el turno',
      'Mano de obra: cambio de turno u operador con diferente técnica o nivel de habilidad',
      'Medición: sesgo en el sistema de medición o necesidad de recalibración del instrumento',
    ],
    actions: [
      'Verificar si el patrón coincide temporalmente con cambios de turno, lote o configuración',
      'Realizar un estudio de repetibilidad y reproducibilidad (R&R) para descartar error de medición',
      'Aumentar temporalmente la frecuencia de muestreo hasta estabilizar el proceso',
    ],
  },
  'nelson-6': {
    interpretation:
      '4 de 5 puntos consecutivos más allá de ±1σ en el mismo lado indica un desplazamiento menor pero sostenido de la media del proceso.',
    rootCauses: [
      'Material: degradación gradual de la materia prima durante el transcurso del turno de producción',
      'Máquina: acumulación de residuos o contaminantes en la herramienta o en el sistema de transporte',
      'Método: variación no controlada en parámetros del proceso (presión, velocidad, temperatura)',
    ],
    actions: [
      'Revisar los registros de parámetros del proceso en el período donde se detectó el patrón',
      'Inspeccionar el estado de la herramienta y realizar limpieza o ajuste preventivo',
      'Verificar las especificaciones del lote de materia prima activo en producción',
    ],
  },
  'nelson-7': {
    interpretation:
      '15 puntos dentro de ±1σ indica que el proceso parece demasiado uniforme, lo cual puede indicar estratificación de los datos o límites de control calculados incorrectamente.',
    rootCauses: [
      'Medición: los subgrupos contienen mezcla de varias fuentes, cancelando artificialmente la variación real',
      'Método: los datos dentro de cada subgrupo provienen de diferentes máquinas, turnos u operadores',
      'Máquina: el instrumento de medición carece de resolución suficiente para detectar la variación real del proceso',
    ],
    actions: [
      'Revisar la estrategia de subgrupeo: cada subgrupo debe ser homogéneo (misma máquina, turno y material)',
      'Verificar la resolución del instrumento de medición frente a la variabilidad real del proceso',
      'Recalcular los límites de control con subgrupos correctamente definidos y homogéneos',
    ],
  },
  'nelson-8': {
    interpretation:
      '8 puntos consecutivos más allá de ±1σ a ambos lados de la línea central (sin pasar a través de ella) indica distribución bimodal o mezcla de dos procesos distintos.',
    rootCauses: [
      'Mano de obra: dos operadores o dos turnos con medias significativamente diferentes mezclados en los mismos subgrupos',
      'Máquina: producción en dos máquinas con ajustes distintos mezclada en los mismos subgrupos de análisis',
      'Material: mezcla de dos lotes o proveedores con propiedades físicas o químicas diferentes',
    ],
    actions: [
      'Estratificar los datos por turno, operador, máquina y material para identificar la fuente de bimodalidad',
      'Separar las dos fuentes y crear cartas de control individuales para cada una',
      'Estandarizar los parámetros de proceso entre todas las fuentes para eliminar la bimodalidad',
    ],
  },
};

// ---------------------------------------------------------------------------
// generateSpcReport
// ---------------------------------------------------------------------------

export function generateSpcReport(analysis: AnalysisResult): SpcInsights {
  const { violations, isInControl, capability, chart } = analysis;

  // processStatus
  const processStatus: SpcInsights['processStatus'] = !isInControl
    ? 'out-of-control'
    : violations.length > 0
      ? 'marginally-stable'
      : 'in-control';

  // urgency
  const hasRule1 = violations.some((v) => v.rule === 'nelson-1');
  const urgency: SpcInsights['urgency'] =
    !isInControl || hasRule1
      ? 'immediate'
      : violations.length > 0
        ? 'monitor'
        : 'acceptable';

  // chart type label
  const chartLabel =
    chart.type === 'xbar-r' ? 'X̄-R' : chart.type === 'xbar-s' ? 'X̄-S' : 'I-MR';

  // summary
  let summary: string;
  if (processStatus === 'in-control') {
    summary = `El proceso analizado con carta ${chartLabel} (${analysis.subgroupCount} subgrupos, ${analysis.totalMeasurements} mediciones) está bajo control estadístico sin ninguna violación de las reglas de Nelson. La variabilidad observada es consistente con causas comunes únicamente.`;
  } else if (processStatus === 'out-of-control') {
    summary = `El proceso está FUERA DE CONTROL ESTADÍSTICO: se detectaron ${violations.length} violación(es) de las reglas de Nelson en la carta ${chartLabel}. Se requiere acción inmediata para identificar y eliminar las causas asignables antes de continuar la producción.`;
  } else {
    summary = `El proceso muestra indicios de inestabilidad con ${violations.length} violación(es) de las reglas de Nelson en la carta ${chartLabel}. Los puntos están dentro de los límites de control, pero los patrones detectados indican posibles causas asignables que deben investigarse.`;
  }

  // violations mapped to insights
  const violationInsights = violations.map((v) => {
    const ruleNum = Number(v.rule.replace('nelson-', ''));
    const template = RULE_TEMPLATES[v.rule];
    return {
      rule: ruleNum,
      interpretation: template.interpretation,
      rootCauses: [...template.rootCauses],
      actions: [...template.actions],
    };
  });

  // capability assessment
  let capabilityResult: SpcInsights['capability'];
  if (!capability) {
    capabilityResult = {
      assessment:
        'No se proporcionaron límites de especificación. No es posible calcular los índices Cp, Cpk, Pp y Ppk.',
      recommendation:
        'Introduzca los límites de especificación USL y LSL usando el botón "Añadir límites" para calcular la capacidad del proceso y determinar si cumple los requisitos del cliente.',
    };
  } else {
    const { cp, cpk, pp, ppk } = capability;
    const worstIndex = Math.min(cpk, ppk);

    let assessment: string;
    let recommendation: string;

    if (worstIndex >= 1.67) {
      assessment = `Proceso EXCELENTE: Cp=${cp.toFixed(3)}, Cpk=${cpk.toFixed(3)}, Pp=${pp.toFixed(3)}, Ppk=${ppk.toFixed(3)}. Cumple los requisitos Six Sigma (Cpk ≥ 1.67) con amplio margen de seguridad.`;
      recommendation =
        'Mantener el nivel de capacidad con el plan de control vigente. Considerar reducir la frecuencia de muestreo dado el alto nivel de calidad demostrado, previa validación estadística.';
    } else if (worstIndex >= 1.33) {
      assessment = `Proceso ADECUADO: Cp=${cp.toFixed(3)}, Cpk=${cpk.toFixed(3)}, Pp=${pp.toFixed(3)}, Ppk=${ppk.toFixed(3)}. Cumple los requisitos estándar de calidad (Cpk ≥ 1.33).`;
      recommendation =
        'El proceso es aceptable pero existe margen de mejora. Explorar reducción de variabilidad para alcanzar Cpk ≥ 1.67 si los requisitos del cliente son exigentes o el proceso está en crecimiento.';
    } else if (worstIndex >= 1.0) {
      assessment = `Proceso MARGINAL: Cp=${cp.toFixed(3)}, Cpk=${cpk.toFixed(3)}, Pp=${pp.toFixed(3)}, Ppk=${ppk.toFixed(3)}. El proceso produce algunos defectos (Cpk entre 1.00 y 1.33). Mejora prioritaria recomendada.`;
      recommendation =
        'Implementar un plan de mejora para reducir la variabilidad. Revisar parámetros de proceso, sistema de medición y fuentes de variación de causa común mediante un diseño de experimentos (DOE).';
    } else {
      assessment = `Proceso INCAPAZ: Cp=${cp.toFixed(3)}, Cpk=${cpk.toFixed(3)}, Pp=${pp.toFixed(3)}, Ppk=${ppk.toFixed(3)}. El proceso NO puede cumplir las especificaciones del cliente (Cpk < 1.00) y genera defectos de forma sistemática.`;
      recommendation =
        'Intervención urgente requerida. Considerar rediseño del proceso, revisión de tolerancias con el cliente, o implementar inspección al 100% hasta que el proceso alcance capacidad aceptable.';
    }

    capabilityResult = { assessment, recommendation };
  }

  // control limits for DMAIC context
  const xLimits =
    chart.type === 'xbar-r'
      ? chart.xbarLimits
      : chart.type === 'xbar-s'
        ? chart.xbarLimits
        : chart.iLimits;

  const centerLine =
    chart.type === 'i-mr' ? chart.processMean : chart.grandMean;

  const violationPoints =
    violations.length > 0
      ? violations
          .map((v) => `Regla ${v.rule.replace('nelson-', '')}: puntos [${v.subgroupIndices.map((i) => i + 1).join(', ')}]`)
          .join('; ')
      : 'ninguno';

  const reviewCycle = analysis.subgroupCount >= 25 ? '6' : '3';

  const dmaic: SpcInsights['dmaic'] = {
    define: `Proceso monitoreado con carta ${chartLabel} (${analysis.subgroupCount} subgrupos, ${analysis.totalMeasurements} mediciones). Línea central: ${centerLine.toFixed(4)}, UCL: ${xLimits.ucl.toFixed(4)}, LCL: ${xLimits.lcl.toFixed(4)}. Estado actual: ${processStatus === 'in-control' ? 'bajo control estadístico sin violaciones' : `${violations.length} violación(es) detectada(s) — ${processStatus === 'out-of-control' ? 'fuera de control' : 'marginalmente estable'}`}.`,

    measure: `Recolectar datos adicionales con mayor frecuencia en los subgrupos donde se detectaron señales (${violationPoints}). Realizar un estudio de repetibilidad y reproducibilidad (R&R) del sistema de medición para verificar que la variación observada es del proceso y no del instrumento.`,

    analyze:
      violations.length > 0
        ? `Aplicar análisis de causa raíz (diagrama de Ishikawa 6M) para las ${violations.length} violación(es) detectadas. Estratificar los datos por turno, operador, material y máquina. Correlacionar los puntos fuera de control con registros de producción, cambios de lote y eventos de mantenimiento.`
        : `El proceso está bajo control estadístico. Analizar la variabilidad de causa común para identificar oportunidades de reducción. Estudiar la relación entre los parámetros de proceso y la variabilidad actual mediante análisis de correlación o diseño de experimentos (DOE).`,

    improve:
      violations.length > 0
        ? `Implementar acciones correctivas para las causas raíz identificadas: actualizar los procedimientos de operación estándar (SOP), revisar el plan de mantenimiento preventivo y proporcionar capacitación específica a los operadores. Documentar todos los cambios en el sistema de gestión de calidad.`
        : `Explorar proyectos de reducción de variabilidad mediante DOE para identificar los factores con mayor impacto. Optimizar los parámetros de proceso para reducir la variación de causa común y mejorar los índices de capacidad.`,

    control: `Implementar o actualizar el plan de control con la carta ${chartLabel} como herramienta principal de monitoreo continuo. Establecer procedimientos de reacción documentados para cada tipo de señal de Nelson. Programar revisión de los límites de control cada ${reviewCycle} meses o ante cualquier cambio significativo de proceso.`,
  };

  return {
    summary,
    processStatus,
    violations: violationInsights,
    capability: capabilityResult,
    dmaic,
    urgency,
  };
}
