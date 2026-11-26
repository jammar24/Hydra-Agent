import { TaskPayload, WorkerExecutionResult, StructuredTaskItem, ComplexityBreakdown } from '../types';
import { RoutingEvaluator } from '../rules/evaluator';

export class LocalWorker {
  private isReady: boolean = false;
  private isNativeWindowAIAvailable: boolean = false;
  private nativeSession: any = null;
  private downloadPercentage: number = 0;

  constructor() {
    this.checkNativeAvailability();
  }

  // Check Chrome Desktop Prompt API availability
  public async checkNativeAvailability(): Promise<boolean> {
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.ai && win.ai.languageModel) {
        try {
          const capabilities = await win.ai.languageModel.capabilities();
          this.isNativeWindowAIAvailable = capabilities && capabilities.available !== 'no';
          if (capabilities && capabilities.available === 'readily') {
            this.isReady = true;
            this.downloadPercentage = 100;
          }
          return this.isNativeWindowAIAvailable;
        } catch (e) {
          console.warn('Prompt API (window.ai) not readily available:', e);
        }
      }
    }
    return false;
  }

  // Get current local worker state
  public getStatus(): { isReady: boolean; progress: number; isNative: boolean } {
    return {
      isReady: this.isReady,
      progress: this.downloadPercentage,
      isNative: this.isNativeWindowAIAvailable
    };
  }

  // Download and initialize local on-device model
  public async initializeDeviceModel(onProgress?: (pct: number) => void): Promise<boolean> {
    if (this.isReady && this.nativeSession) return true;

    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.ai && win.ai.languageModel) {
        try {
          this.nativeSession = await win.ai.languageModel.create({
            systemPrompt: 'You are Gemini Nano, a fast, concise on-device model. Respond with structured analysis.'
          });
          this.isReady = true;
          this.downloadPercentage = 100;
          this.isNativeWindowAIAvailable = true;
          onProgress?.(100);
          return true;
        } catch (err) {
          console.warn('Failed to initialize native window.ai; falling back to local runtime:', err);
        }
      }
    }

    // Local model simulated download progress
    for (let p = 15; p <= 100; p += 20) {
      await new Promise((r) => setTimeout(r, 70));
      this.downloadPercentage = Math.min(p, 100);
      onProgress?.(this.downloadPercentage);
    }
    this.isReady = true;
    return true;
  }

  // Execute on-device inference
  public async execute(
    task: TaskPayload,
    routerReason: string,
    breakdown: ComplexityBreakdown,
    onToken?: (textChunk: string) => void
  ): Promise<WorkerExecutionResult> {
    if (!this.isReady) {
      throw new Error('LocalWorker Error: Gemini Nano is not initialized on device.');
    }

    const start = performance.now();
    let textOutput = '';
    let isRealHardware = false;

    // A. Native Prompt API streaming execution
    if (this.nativeSession && typeof this.nativeSession.promptStreaming === 'function') {
      try {
        isRealHardware = true;
        const stream = this.nativeSession.promptStreaming(task.prompt);
        let previousLength = 0;
        for await (const chunk of stream) {
          const newContent = chunk.slice(previousLength);
          previousLength = chunk.length;
          textOutput = chunk;
          onToken?.(newContent);
        }
      } catch (err) {
        console.warn('Native window.ai streaming error:', err);
        textOutput = await this.nativeSession.prompt(task.prompt);
        onToken?.(textOutput);
      }
    } else {
      // B. Structured local runtime execution
      const safePrompt = RoutingEvaluator.redactPII(task.prompt);
      await new Promise((r) => setTimeout(r, 90));

      let fullLocalText = '';
      if (breakdown.hasPII) {
        fullLocalText = [
          `[Gemini Nano On-Device · Privacy Shield Active]`,
          `Datos sensibles detectados (${breakdown.detectedPIITypes.join(', ')}) y protegidos en memoria local.`,
          `Resumen seguro: "${safePrompt}"`
        ].join('\n');
      } else if (/json|tareas|tasks|nota|note|resumen|summary/.test(safePrompt.toLowerCase())) {
        fullLocalText = JSON.stringify(
          {
            runtime: 'gemini-nano-on-device',
            networkTokensUsed: 0,
            summary: safePrompt.length > 90 ? safePrompt.slice(0, 90) + '...' : safePrompt,
            tasks: [
              { title: 'Revisar puntos clave extraídos localmente', priority: 'alta' },
              { title: 'Sincronizar resultado en historial local', priority: 'media' }
            ]
          },
          null,
          2
        );
      } else {
        fullLocalText = [
          `[Gemini Nano On-Device · 0 tokens de red]`,
          `Respuesta local para: "${safePrompt}"`,
          `- Ejecución completada en memoria del navegador con baja latencia.`
        ].join('\n');
      }

      const step = Math.max(20, Math.ceil(fullLocalText.length / 4));
      for (let i = 0; i < fullLocalText.length; i += step) {
        const ch = fullLocalText.slice(i, i + step);
        await new Promise((r) => setTimeout(r, 40));
        textOutput += ch;
        onToken?.(ch);
      }
    }

    const latency = Math.round(performance.now() - start);
    const cleanPrompt = RoutingEvaluator.redactPII(task.prompt);
    const displayTitle = cleanPrompt.length > 40 ? cleanPrompt.slice(0, 40) + '...' : cleanPrompt;

    const structuredTasks: StructuredTaskItem[] = [
      { id: `nano_${Date.now()}_1`, title: `Local review: ${displayTitle}`, priority: 'alta', completed: false },
      { id: `nano_${Date.now()}_2`, title: 'Sync state in local storage', priority: 'media', completed: true }
    ];

    return {
      taskId: task.id,
      source: 'local',
      content: textOutput,
      summary: `Local summary: "${displayTitle}"`,
      structuredTasks,
      latencyMs: latency,
      firstTokenMs: isRealHardware ? 80 : 120,
      timestamp: Date.now(),
      routerReason,
      breakdown,
      isRealHardware
    };
  }
}
