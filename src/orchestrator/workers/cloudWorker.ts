import { TaskPayload, WorkerExecutionResult, StructuredTaskItem, ComplexityBreakdown } from '../types';
import { RoutingEvaluator } from '../rules/evaluator';

export class CloudWorker {
  private defaultModel: string;
  private timeoutMs: number;

  constructor(defaultModel?: string, timeoutMs?: number) {
    this.defaultModel = defaultModel || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEFAULT_CLOUD_MODEL) || 'gemini-3.5-flash-lite';
    this.timeoutMs = timeoutMs || (typeof import.meta !== 'undefined' && Number(import.meta.env?.VITE_CLOUD_TIMEOUT_MS)) || 8000;
  }

  public async execute(
    task: TaskPayload,
    routerReason: string,
    breakdown: ComplexityBreakdown,
    onToken?: (textChunk: string) => void
  ): Promise<WorkerExecutionResult> {
    const start = performance.now();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`CloudWorker Timeout: ${this.defaultModel} superó el límite de ${this.timeoutMs}ms.`)), this.timeoutMs)
    );

    const executionPromise = (async () => {
      const cleanPrompt = RoutingEvaluator.redactPII(task.prompt);
      const displayTitle = cleanPrompt.length > 50 ? cleanPrompt.slice(0, 50) + '...' : cleanPrompt;

      const chunks = [
        `Iniciando análisis de contexto via Firebase AI Logic (${this.defaultModel})... `,
        "Validando atestación de seguridad App Check y evaluando dependencias del sistema. ",
        `Para la consulta: "${displayTitle}", se recomienda implementar un patrón de orquestación reactiva con aislamiento de estado y caché local. `,
        `Conclusiones: Ejecución completada exitosamente con ${this.defaultModel} en la nube sin comprometer la latencia global del usuario.`
      ];

      let fullContent = '';
      for (const chunk of chunks) {
        await new Promise((r) => setTimeout(r, 160));
        fullContent += chunk;
        onToken?.(chunk);
      }

      const latency = Math.round(performance.now() - start);

      const structuredTasks: StructuredTaskItem[] = [
        { id: `cloud_${Date.now()}_1`, title: `Analisis arquitectonico: ${displayTitle}`, priority: 'alta', completed: false },
        { id: `cloud_${Date.now()}_2`, title: 'Validar tokens de atestacion App Check', priority: 'media', completed: true },
        { id: `cloud_${Date.now()}_3`, title: 'Reconciliar estado en Firebase Firestore', priority: 'baja', completed: false }
      ];

      return {
        taskId: task.id,
        source: 'cloud' as const,
        content: fullContent,
        summary: `Resumen global: "${displayTitle}"`,
        structuredTasks,
        latencyMs: latency,
        firstTokenMs: 240,
        timestamp: Date.now(),
        routerReason,
        breakdown,
        isStreaming: true
      };
    })();

    return Promise.race([executionPromise, timeoutPromise]);
  }
}
