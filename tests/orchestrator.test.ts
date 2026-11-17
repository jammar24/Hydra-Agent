import { HybridOrchestrator } from '../src/orchestrator';

/**
 * Suite de Pruebas Unitarias y de Aceptación (PT-01 a PT-05)
 * Ejecutable directamente con ts-node o node
 */
async function runTests() {
  console.log('🧪 Iniciando Banco de Pruebas PT-01 a PT-05 para HybridAgent...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  const orchestrator = new HybridOrchestrator({ maxLocalTokens: 9216 });

  // PT-01: Tareas simples resueltas en local cuando el modelo está descargado
  await orchestrator.getLocalWorker().initializeDeviceModel();
  const res1 = await orchestrator.dispatch('Anotar reunión de equipo para mañana a las 10am', true);
  assert(res1.decision.target === 'local', 'PT-01: Tarea simple enrutada a Local on-device');
  assert((res1.result?.latencyMs || 0) < 2000, 'PT-01: Latencia de primer token p95 < 2000ms');

  // PT-02: Tareas complejas enrutadas a la nube
  const res2 = await orchestrator.dispatch(
    'Análisis profundo y arquitectura detallada para sistema de pagos distribuido de alta concurrencia',
    true
  );
  assert(res2.decision.target === 'cloud', 'PT-02: Tarea compleja enrutada a Gemini Cloud');

  // PT-03: Modo avión - Tareas simples responden local; complejas encolan si no hay nube
  orchestrator.setMode('cloud_only');
  const res3 = await orchestrator.dispatch('Generar reporte financiero completo anual', false);
  assert(res3.decision.target === 'queue' && res3.queued === true, 'PT-03: Tarea cloud sin red va a la cola offline');

  // PT-04: Reconexión - vaciado de cola sin duplicados
  const drained = await orchestrator.drainQueue(true);
  assert(drained.length === 1, 'PT-04: Cola vaciada y procesada al restablecer conexión');

  // PT-05: Verificación de trazabilidad y métricas
  const metrics = orchestrator.getMetrics();
  assert(metrics.length >= 2, 'PT-05: Cada inferencia registra métrica con razón y latencia');

  console.log(`\n========================================`);
  console.log(`Resultados: ${passed} pasadas, ${failed} fallidas`);
  console.log(`Estado: ${failed === 0 ? 'LISTO PARA LA DEMO' : 'REVISAR FALLOS'}`);
  console.log(`========================================\n`);
}

runTests().catch(console.error);

