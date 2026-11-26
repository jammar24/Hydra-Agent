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
    const cloudTimeout = options?.cloudTimeoutMs || (typeof import.meta !== 'undefined' && Number(import.meta.env?.VITE_CLOUD_TIMEOUT_MS)) || 20000;
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

    // A. Cascade speculative routing (Nano + Cloud co-inference)
    if (decision.target === 'cascade') {
      onStreamChunk?.('[Nano Speculative < 180ms]: Generating on-device structured pre-analysis...\n');
      const startCascade = performance.now();

      // 1. Fast speculative local pass with Nano
      const nanoDraft = await this.localWorker.execute(
        task,
        'On-Device Speculative Draft',
        decision.breakdown,
        (c) => onStreamChunk?.(c)
      );

      onStreamChunk?.('\n\n[Cloud Inference]: Consolidating deep reasoning context...\n');

      // 2. Deep cloud inference
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
        summary: `Hybrid Co-Inference: Nano (${nanoDraft.latencyMs}ms) + Cloud (${cloudEnhanced.latencyMs}ms)`,
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
    // B. Direct local on-device routing
    else if (decision.target === 'local') {
      try {
        executionResult = await this.localWorker.execute(
          task,
          decision.reason,
          decision.breakdown,
          onStreamChunk
        );
      } catch (err) {
        // Fallback to cloud if non-PII task fails locally
        if (isOnline && !decision.breakdown.hasPII) {
          executionResult = await this.cloudWorker.execute(
            task,
            'Resilience Fallback: Local execution failed; escalated to Gemini Cloud.',
            decision.breakdown,
            onStreamChunk
          );
        } else {
          this.offlineQueue.push(task);
          return { decision, queued: true };
        }
      }
    }
    // C. Cloud routing
    else {
      try {
        executionResult = await this.cloudWorker.execute(
          task,
          decision.reason,
          decision.breakdown,
          onStreamChunk
        );
      } catch (cloudErr) {
        // Fallback to local model on cloud timeout or network error
        if (this.localWorker.getStatus().isReady) {
          executionResult = await this.localWorker.execute(
            task,
            'Resilience Fallback: Cloud timeout reached; executed locally with Gemini Nano.',
            decision.breakdown,
            onStreamChunk
          );
        } else {
          this.offlineQueue.push(task);
          return { decision, queued: true };
        }
      }
    }

    // Record multidimensional telemetry
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

  private sanitizeCsvCell(value: string): string {
    const neutralized = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
    return `"${neutralized.replace(/"/g, '""')}"`;
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
      m.hasPII ? 'YES' : 'NO',
      new Date(m.timestamp).toISOString(),
      this.sanitizeCsvCell(m.reason)
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
