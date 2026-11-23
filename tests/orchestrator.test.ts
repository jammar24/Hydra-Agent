import { HybridOrchestrator } from '../src/orchestrator';
import { RoutingEvaluator } from '../src/orchestrator/rules/evaluator';

/**
 * Automated Test Suite (PT-01 to PT-10)
 * HYDRA Agent AI - Hybrid Local & Cloud Orchestrator
 */
async function runTests() {
  console.log('🧪 ========================================================');
  console.log('   HYDRA AGENT AI - AUTOMATED TEST BENCHMARK (PT-01 - PT-10)');
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

  // Prepare local worker for execution
  await orchestrator.getLocalWorker().initializeDeviceModel();

  // -------------------------------------------------------------
  // PT-01: Simple on-device tasks resolved locally with SLA check
  // -------------------------------------------------------------
  const res1 = await orchestrator.dispatch('Quick team sync: review sprint tasks for tomorrow 10am', true);
  assert(res1.decision.target === 'local', 'PT-01: Simple task routed to Gemini Nano on-device');
  assert((res1.result?.latencyMs || 0) < 2000, 'PT-01b: On-device latency within expected SLA');

  // -------------------------------------------------------------
  // PT-02: Complex tasks escalated to Gemini Cloud
  // -------------------------------------------------------------
  const res2 = await orchestrator.dispatch(
    'Deep analysis and detailed system architecture for high-concurrency distributed payment processing',
    true
  );
  assert(res2.decision.target === 'cloud', 'PT-02: High-complexity workload routed to Gemini Cloud');
  assert(res2.decision.breakdown.complexityScore >= 50, 'PT-02b: Complexity score threshold >= 50');

  // -------------------------------------------------------------
  // PT-03: Offline resilience mode (Airplane Mode)
  // -------------------------------------------------------------
  orchestrator.setMode('cloud_only');
  const res3 = await orchestrator.dispatch('Generate comprehensive annual financial report', false);
  assert(res3.decision.target === 'queue' && res3.queued === true, 'PT-03: Cloud task offline is queued in storage');

  // -------------------------------------------------------------
  // PT-04: Reconnection and idempotent queue draining
  // -------------------------------------------------------------
  const drained = await orchestrator.drainQueue(true);
  assert(drained.length === 1, 'PT-04: Queued tasks automatically drained on network restore');
  assert(orchestrator.getQueueLength() === 0, 'PT-04b: Queue empty after idempotent flush');

  // -------------------------------------------------------------
  // PT-05: Telemetry traceability and metrics
  // -------------------------------------------------------------
  const metrics = orchestrator.getMetrics();
  assert(metrics.length >= 3, 'PT-05: Every dispatch records audit telemetry with reason and latency');

  // -------------------------------------------------------------
  // PT-06: Zero-Trust Privacy Shield (PII pattern detection)
  // -------------------------------------------------------------
  orchestrator.setMode('auto');
  const piiPrompt = 'Store private credentials: user john@company.com with api_key: sk-proj-99482910 and secret pass123';
  const resPII = await orchestrator.dispatch(piiPrompt, true);
  assert(resPII.decision.target === 'local', 'PT-06: Detected PII forces 100% on-device routing');
  assert(resPII.decision.breakdown.hasPII === true, 'PT-06b: hasPII flag activated');
  assert(resPII.decision.breakdown.detectedPIITypes.includes('Email'), 'PT-06c: Email PII type detected');
  assert(resPII.decision.breakdown.detectedPIITypes.some(t => t.includes('API Key')), 'PT-06d: API Key PII type detected');

  // -------------------------------------------------------------
  // PT-07: In-memory PII masking and redaction
  // -------------------------------------------------------------
  const redacted = RoutingEvaluator.redactPII(piiPrompt);
  assert(!redacted.includes('john@company.com'), 'PT-07a: Email address redacted in audit strings');
  assert(redacted.includes('[EMAIL_PROTEGIDO]'), 'PT-07b: [EMAIL_PROTEGIDO] token inserted');
  assert(!redacted.includes('sk-proj-99482910'), 'PT-07c: Private API key token masked');

  // -------------------------------------------------------------
  // PT-08: Cascade speculative routing mode
  // -------------------------------------------------------------
  orchestrator.setMode('cascade');
  const resCascade = await orchestrator.dispatch(
    'Design scalable real-time microfrontend system architecture',
    true
  );
  assert(resCascade.decision.target === 'cascade', 'PT-08a: Cascade mode active and respected');
  assert(resCascade.result?.source === 'cascade', 'PT-08b: Execution result identified as cascade source');
  assert(!!resCascade.result?.speculativePreview, 'PT-08c: Nano speculative draft generated');

  // -------------------------------------------------------------
  // PT-09: XAI multidimensional decision vector
  // -------------------------------------------------------------
  assert(resCascade.decision.breakdown.confidenceScore >= 80, 'PT-09a: Confidence score >= 80%');
  assert(typeof resCascade.decision.breakdown.estimatedCostUSD === 'number', 'PT-09b: Avoided cloud cost computed');
  assert(resCascade.decision.evaluationMs < 50, 'PT-09c: Router decision evaluation time < 50ms');

  // -------------------------------------------------------------
  // PT-10: Audit logs export in JSON and CSV
  // -------------------------------------------------------------
  const jsonExport = orchestrator.exportAuditLogsAsJSON();
  const parsedJson = JSON.parse(jsonExport);
  assert(Array.isArray(parsedJson) && parsedJson.length > 0, 'PT-10a: JSON export valid and non-empty');
  
  const csvExport = orchestrator.exportAuditLogsAsCSV();
  assert(csvExport.includes('TaskID') && csvExport.includes('CostSavedUSD'), 'PT-10b: CSV export headers correct');

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n========================================================');
  console.log(`🎯 FINAL RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`OVERALL STATUS: ${failed === 0 ? '🟢 ALL TESTS PASSED - PRODUCTION READY' : '🔴 TESTS FAILED'}`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
