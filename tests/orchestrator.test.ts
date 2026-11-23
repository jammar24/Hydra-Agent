import { HybridOrchestrator } from '../src/orchestrator';
import { RoutingEvaluator } from '../src/orchestrator/rules/evaluator';

/**
 * Suite Integral de Pruebas Automatizadas (PT-01 a PT-10)
 * HybridAgent - Firebase #BuildHybridAI 2026
 */
async function runTests() {
  console.log('🧪 ========================================================');
  console.log('   BANCO DE PRUEBAS AUTOMATIZADAS HYBRIDAGENT (PT-01 a PT-10)');
  console.log('========================================================\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `-> ${detail}` : ''}`);
      failed++;
    }
  }

  const orchestrator = new HybridOrchestrator({ 
    maxLocalTokens: 9216, 
    cloudTimeoutMs: 8000,
    initialMode: 'auto'
  });

  // Preparar modelo local para pruebas
  await orchestrator.getLocalWorker().initializeDeviceModel();

  // -------------------------------------------------------------
  // PT-01: Tareas simples resueltas on-device con baja latencia
  // -------------------------------------------------------------
  const res1 = await orchestrator.dispatch('Anotar reunión de equipo para mañana a las 10am', true);
  assert(res1.decision.target === 'local', 'PT-01: Tarea simple enrutada a Gemini Nano on-device');
  assert((res1.result?.latencyMs || 0) < 2000, 'PT-01b: Latencia on-device dentro del umbral de SLA');

  // -------------------------------------------------------------
  // PT-02: Tareas complejas enrutadas a Gemini Cloud
  // -------------------------------------------------------------
  const res2 = await orchestrator.dispatch(
    'Análisis profundo y arquitectura detallada para sistema de pagos distribuido de alta concurrencia y tolerancia a fallos',
    true
  );
  assert(res2.decision.target === 'cloud', 'PT-02: Tarea de alta complejidad delegada a Gemini Cloud');
  assert(res2.decision.breakdown.complexityScore >= 50, 'PT-02b: Score de complejidad >= 50 puntos');

  // -------------------------------------------------------------
  // PT-03: Modo sin conexión (Modo Avión)
  // -------------------------------------------------------------
  orchestrator.setMode('cloud_only');
  const res3 = await orchestrator.dispatch('Generar reporte financiero completo anual consolidado', false);
  assert(res3.decision.target === 'queue' && res3.queued === true, 'PT-03: Tarea cloud sin red es retenida en cola offline');

  // -------------------------------------------------------------
  // PT-04: Reconexión y vaciado de cola (drainQueue)
  // -------------------------------------------------------------
  const drained = await orchestrator.drainQueue(true);
  assert(drained.length === 1, 'PT-04: Tareas pendientes procesadas automáticamente al volver la red');
  assert(orchestrator.getQueueLength() === 0, 'PT-04b: Cola vaciada tras drenaje idempotente');

  // -------------------------------------------------------------
  // PT-05: Trazabilidad y métricas de inferencia
  // -------------------------------------------------------------
  const metrics = orchestrator.getMetrics();
  assert(metrics.length >= 3, 'PT-05: Cada inferencia registra métrica con razón y latencia');

  // -------------------------------------------------------------
  // PT-06: Escudo Zero-Trust de Privacidad (Detección de PII)
  // -------------------------------------------------------------
  orchestrator.setMode('auto');
  const piiPrompt = 'Guardar credenciales privadas: usuario juan@empresa.com con api_key: sk-proj-99482910 y clave: secret123';
  const resPII = await orchestrator.dispatch(piiPrompt, true);
  assert(resPII.decision.target === 'local', 'PT-06: PII detectada fuerza enrutamiento 100% on-device');
  assert(resPII.decision.breakdown.hasPII === true, 'PT-06b: Flag hasPII activado correctamente');
  assert(resPII.decision.breakdown.detectedPIITypes.includes('Email'), 'PT-06c: Tipo de PII Email identificado');
  assert(resPII.decision.breakdown.detectedPIITypes.some(t => t.includes('API Key')), 'PT-06d: Tipo de PII API Key identificado');

  // -------------------------------------------------------------
  // PT-07: Enmascaramiento y Redacción segura de PII
  // -------------------------------------------------------------
  const redacted = RoutingEvaluator.redactPII(piiPrompt);
  assert(!redacted.includes('juan@empresa.com'), 'PT-07a: Correo electrónico redactado de forma segura');
  assert(redacted.includes('[EMAIL_PROTEGIDO]'), 'PT-07b: Token [EMAIL_PROTEGIDO] insertado');
  assert(!redacted.includes('sk-proj-99482910'), 'PT-07c: API key privada enmascarada');

  // -------------------------------------------------------------
  // PT-08: Orquestación en Cascada Especulativa
  // -------------------------------------------------------------
  orchestrator.setMode('cascade');
  const resCascade = await orchestrator.dispatch(
    'Diseñar arquitectura escalable en tiempo real con microfrontends',
    true
  );
  assert(resCascade.decision.target === 'cascade', 'PT-08a: Modo cascada activado y respetado');
  assert(resCascade.result?.source === 'cascade', 'PT-08b: Resultado consolidado como fuente cascade');
  assert(!!resCascade.result?.speculativePreview, 'PT-08c: Preview especulativo de Nano generado');

  // -------------------------------------------------------------
  // PT-09: Vector de Decisión XAI Multidimensional
  // -------------------------------------------------------------
  assert(resCascade.decision.breakdown.confidenceScore >= 80, 'PT-09a: Score de confianza probabilística >= 80%');
  assert(typeof resCascade.decision.breakdown.estimatedCostUSD === 'number', 'PT-09b: Estimación de costo computada en USD');
  assert(resCascade.decision.evaluationMs < 50, 'PT-09c: Tiempo de evaluación del enrutador < 50ms');

  // -------------------------------------------------------------
  // PT-10: Exportación de Auditoría en JSON y CSV
  // -------------------------------------------------------------
  const jsonExport = orchestrator.exportAuditLogsAsJSON();
  const parsedJson = JSON.parse(jsonExport);
  assert(Array.isArray(parsedJson) && parsedJson.length > 0, 'PT-10a: Exportación JSON válida y no vacía');
  
  const csvExport = orchestrator.exportAuditLogsAsCSV();
  assert(csvExport.includes('TaskID') && csvExport.includes('CostSavedUSD'), 'PT-10b: Cabeceras CSV correctas con telemetría de costo');

  // -------------------------------------------------------------
  // RESUMEN FINAL
  // -------------------------------------------------------------
  console.log('\n========================================================');
  console.log(`🎯 RESULTADOS FINALES: ${passed} pasadas, ${failed} fallidas`);
  console.log(`ESTADO GENERAL: ${failed === 0 ? '🟢 TODAS LAS PRUEBAS PASARON - LISTO PARA PRODUCCIÓN' : '🔴 HAY PRUEBAS FALLIDAS'}`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Error fatal durante la ejecución de pruebas:', err);
  process.exit(1);
});
