import {
  TaskPayload,
  RoutingDecision,
  RoutingMode,
  ModelStatus,
  WorkerExecutionResult,
  OrchestratorMetric
} from './types';
import { RoutingEvaluator } from './rules/evaluator';
import { LocalWorker } from './workers/localWorker';
import { CloudWorker } from './workers/cloudWorker';

export interface OrchestratorOptions {
  defaultCloudModel?: string;
  maxLocalTokens?: number;
  cloudTimeoutMs?: number;
  initialMode?: RoutingMode;
}

export class HybridOrchestrator {
  private localWorker: LocalWorker;
  private cloudWorker: CloudWorker;
  private mode: RoutingMode;
  private maxLocalTokens: number;
  private offlineQueue: TaskPayload[] = [];
  private metrics: OrchestratorMetric[] = [];

  constructor(options?: OrchestratorOptions) {
    const defaultModel = options?.defaultCloudModel || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEFAULT_CLOUD_MODEL) || 'gemini-3.5-flash-lite';
    const cloudTimeout = options?.cloudTimeoutMs || (typeof import.meta !== 'undefined' && Number(import.meta.env?.VITE_CLOUD_TIMEOUT_MS)) || 8000;
    const maxTokens = options?.maxLocalTokens || (typeof import.meta !== 'undefined' && Number(import.meta.env?.VITE_LOCAL_MODEL_MAX_TOKENS)) || 9216;

    this.localWorker = new LocalWorker();
    this.cloudWorker = new CloudWorker(defaultModel, cloudTimeout);
    this.mode = options?.initialMode || 'auto';
    this.maxLocalTokens = maxTokens;
  }

  public setMode(mode: RoutingMode): void {
    this.mode = mode;
  }

  public getMode(): RoutingMode {
    return this.mode;
  }

  public getLocalWorker(): LocalWorker {
    return this.localWorker;
  }

  public getQueueLength(): number {
    return this.offlineQueue.length;
  }

  public getMetrics(): OrchestratorMetric[] {
    return [...this.metrics];
  }

  public async evaluateTask(prompt: string, isOnline: boolean): Promise<RoutingDecision> {
    const modelStatus: ModelStatus = this.localWorker.getStatus().isReady ? 'ready' : 'downloadable';
    return RoutingEvaluator.evaluate({
      prompt,
      isOnline,
      modelStatus,
      mode: this.mode,
      maxLocalTokens: this.maxLocalTokens
    });
  }

  public async dispatch(
    prompt: string,
    isOnline: boolean,
    userId: string = 'demo_user',
    onStreamChunk?: (chunk: string) => void
  ): Promise<{ decision: RoutingDecision; result?: WorkerExecutionResult; queued?: boolean }> {
    const task: TaskPayload = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      prompt,
      timestamp: Date.now()
    };

    const decision = await this.evaluateTask(prompt, isOnline);

    if (decision.target === 'queue') {
      this.offlineQueue.push(task);
      return { decision, queued: true };
    }

    let executionResult: WorkerExecutionResult;

    // A. ENRUTAMIENTO EN CASCADA ESPECULATIVA (Nano + Cloud Co-Inferencia)
    if (decision.target === 'cascade') {
      onStreamChunk?.('⚡ [Nano Especulativo < 180ms]: Generando pre-análisis estructurado en hardware local...\n');
      const startCascade = performance.now();
      
      // 1. Ejecución preliminar ultrarrápida con Nano
      const nanoDraft = await this.localWorker.execute(
        task,
        'Borrador Especulativo On-Device',
        decision.breakdown,
        (c) => onStreamChunk?.(c)
      );

      onStreamChunk?.('\n\n☁️ [Firebase AI Logic]: Consolidando síntesis y razonamiento profundo...\n');

      // 2. Ejecución profunda en la nube
      const cloudEnhanced = await this.cloudWorker.execute(
        task,
        decision.reason,
        decision.breakdown,
        (c) => onStreamChunk?.(c)
      );

      const totalLatency = Math.round(performance.now() - startCascade);

      executionResult = {
        taskId: task.id,
        source: 'cascade',
        content: cloudEnhanced.content,
        summary: `Co-Inferencia Híbrida: Nano (${nanoDraft.latencyMs}ms) + Cloud (${cloudEnhanced.latencyMs}ms)`,
        structuredTasks: [
          ...(nanoDraft.structuredTasks || []),
          ...(cloudEnhanced.structuredTasks || [])
        ],
        latencyMs: totalLatency,
        firstTokenMs: nanoDraft.firstTokenMs || 110,
        timestamp: Date.now(),
        routerReason: decision.reason,
        breakdown: decision.breakdown,
        isStreaming: true,
        speculativePreview: nanoDraft.content.slice(0, 120) + '...'
      };
    } 
    // B. ENRUTAMIENTO LOCAL EXCLUSIVO
    else if (decision.target === 'local') {
      try {
        executionResult = await this.localWorker.execute(
          task, 
          decision.reason, 
          decision.breakdown, 
          onStreamChunk
        );
      } catch (err) {
        // Fallback resiliente a nube si la tarea no tiene PII sensible
        if (isOnline && !decision.breakdown.hasPII) {
          executionResult = await this.cloudWorker.execute(
            task, 
            'Fallback de Resiliencia: Falló ejecución on-device; degradando automáticamente a Gemini Cloud.', 
            decision.breakdown,
            onStreamChunk
          );
        } else {
          this.offlineQueue.push(task);
          return { decision, queued: true };
        }
      }
    } 
    // C. ENRUTAMIENTO NUBE
    else {
      try {
        executionResult = await this.cloudWorker.execute(
          task, 
          decision.reason, 
          decision.breakdown, 
          onStreamChunk
        );
      } catch (cloudErr) {
        // Fallback resiliente a local ante timeout o fallo de red
        if (this.localWorker.getStatus().isReady) {
          executionResult = await this.localWorker.execute(
            task,
            'Fallback de Resiliencia: La nube superó el umbral de espera; ejecutando con éxito en Gemini Nano on-device.',
            decision.breakdown,
            onStreamChunk
          );
        } else {
          this.offlineQueue.push(task);
          return { decision, queued: true };
        }
      }
    }

    // Registro de Telemetría Multidimensional
    const metric: OrchestratorMetric = {
      id: `m_${Date.now()}`,
      taskId: executionResult.taskId,
      source: executionResult.source,
      latencyMs: executionResult.latencyMs,
      tokens: decision.breakdown.tokenCount,
      reason: executionResult.routerReason,
      timestamp: executionResult.timestamp,
      hasPII: decision.breakdown.hasPII,
      score: decision.breakdown.complexityScore,
      confidenceScore: decision.breakdown.confidenceScore,
      costSavedUSD: decision.breakdown.estimatedCostUSD
    };
    this.metrics.push(metric);

    return { decision, result: executionResult };
  }

  public async drainQueue(isOnline: boolean): Promise<WorkerExecutionResult[]> {
    if (!isOnline || this.offlineQueue.length === 0) return [];

    const executed: WorkerExecutionResult[] = [];
    const tasksToProcess = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const task of tasksToProcess) {
      const outcome = await this.dispatch(task.prompt, isOnline, task.userId);
      if (outcome.result) {
        executed.push(outcome.result);
      }
    }
    return executed;
  }

  public exportAuditLogsAsJSON(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  public exportAuditLogsAsCSV(): string {
    const headers = ['ID', 'TaskID', 'Source', 'LatencyMs', 'Tokens', 'Score', 'ConfidencePct', 'CostSavedUSD', 'HasPII', 'Timestamp', 'Reason'];
    const rows = this.metrics.map(m => [
      m.id,
      m.taskId,
      m.source,
      m.latencyMs,
      m.tokens,
      m.score,
      `${m.confidenceScore}%`,
      `$${m.costSavedUSD.toFixed(6)}`,
      m.hasPII ? 'SI' : 'NO',
      new Date(m.timestamp).toISOString(),
      `"${m.reason.replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
