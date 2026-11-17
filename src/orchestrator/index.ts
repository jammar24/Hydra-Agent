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
    this.localWorker = new LocalWorker();
    this.cloudWorker = new CloudWorker('gemini-3.5-flash-lite', options?.cloudTimeoutMs || 8000);
    this.mode = options?.initialMode || 'auto';
    this.maxLocalTokens = options?.maxLocalTokens || 9216;
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

    if (decision.target === 'local') {
      try {
        executionResult = await this.localWorker.execute(
          task, 
          decision.reason, 
          decision.breakdown, 
          onStreamChunk
        );
      } catch (err) {
        // Fallback si falla local y no contiene PII sensible
        if (isOnline && !decision.breakdown.hasPII) {
          executionResult = await this.cloudWorker.execute(
            task, 
            'Fallback activado: Falló ejecución local; delegando a Gemini Cloud.', 
            decision.breakdown,
            onStreamChunk
          );
        } else {
          this.offlineQueue.push(task);
          return { decision, queued: true };
        }
      }
    } else {
      // Intento en nube con fallback automático a local ante timeout o fallo de red (RF-09)
      try {
        executionResult = await this.cloudWorker.execute(
          task, 
          decision.reason, 
          decision.breakdown,
          onStreamChunk
        );
      } catch (cloudErr) {
        if (this.localWorker.getStatus().isReady) {
          executionResult = await this.localWorker.execute(
            task,
            'Fallback activo (RF-09): La nube superó el timeout; degradando con éxito a Gemini Nano on-device.',
            decision.breakdown,
            onStreamChunk
          );
        } else {
          this.offlineQueue.push(task);
          return { decision, queued: true };
        }
      }
    }

    // Registro de auditoría y métricas (RF-10, RF-11)
    const metric: OrchestratorMetric = {
      id: `m_${Date.now()}`,
      taskId: executionResult.taskId,
      source: executionResult.source,
      latencyMs: executionResult.latencyMs,
      tokens: decision.breakdown.tokenCount,
      reason: executionResult.routerReason,
      timestamp: executionResult.timestamp,
      hasPII: decision.breakdown.hasPII,
      score: decision.breakdown.complexityScore
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
    const headers = ['ID', 'TaskID', 'Source', 'LatencyMs', 'Tokens', 'Score', 'HasPII', 'Timestamp', 'Reason'];
    const rows = this.metrics.map(m => [
      m.id,
      m.taskId,
      m.source,
      m.latencyMs,
      m.tokens,
      m.score,
      m.hasPII ? 'SI' : 'NO',
      new Date(m.timestamp).toISOString(),
      `"${m.reason.replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
