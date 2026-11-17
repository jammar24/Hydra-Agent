import { TaskDecision, RouterConfig } from './types';

export class HybridRouter {
  private config: RouterConfig;

  constructor(customConfig?: Partial<RouterConfig>) {
    this.config = {
      maxLocalTokens: 9000,
      forceMode: 'auto',
      cloudTimeoutMs: 8000,
      ...customConfig
    };
  }

  public updateConfig(newConfig: Partial<RouterConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  public isComplexTask(text: string): boolean {
    const complexIndicators = [
      /\b(resumen detallado|analiza a profundidad|investiga|compara en detalle)\b/i,
      /\b(c[oó]digo completo|arquitectura detallada|paso a paso extenso)\b/i,
      /\b(transcribe audio|lee pdf|analiza imagen compleja)\b/i
    ];
    return complexIndicators.some(pattern => pattern.test(text));
  }

  public decide(
    prompt: string,
    isOnline: boolean,
    isLocalModelReady: boolean
  ): TaskDecision {
    const tokenCount = this.estimateTokens(prompt);
    const complex = this.isComplexTask(prompt) || tokenCount > this.config.maxLocalTokens;

    if (this.config.forceMode === 'local_only') {
      if (isLocalModelReady) {
        return {
          target: 'local',
          reason: 'Modo manual forzado: Solo Local',
          tokenEstimate: tokenCount,
          complexity: complex ? 'complex' : 'simple'
        };
      }
      return {
        target: 'queue',
        reason: 'Modo Solo Local seleccionado pero modelo en dispositivo no inicializado',
        tokenEstimate: tokenCount,
        complexity: complex ? 'complex' : 'simple'
      };
    }

    if (this.config.forceMode === 'cloud_only') {
      if (isOnline) {
        return {
          target: 'cloud',
          reason: 'Modo manual forzado: Solo Nube',
          tokenEstimate: tokenCount,
          complexity: complex ? 'complex' : 'simple'
        };
      }
      return {
        target: 'queue',
        reason: 'Modo Solo Nube forzado pero sin conexión a internet',
        tokenEstimate: tokenCount,
        complexity: complex ? 'complex' : 'simple'
      };
    }

    if (!complex && isLocalModelReady) {
      return {
        target: 'local',
        reason: `Tarea simple (${tokenCount} tokens estimados) ejecutada on-device vía Gemini Nano`,
        tokenEstimate: tokenCount,
        complexity: 'simple'
      };
    }

    if (isOnline) {
      const reason = !isLocalModelReady
        ? 'Modelo local no disponible aún; delegando a Gemini Nube'
        : `Tarea compleja o >${this.config.maxLocalTokens} tokens; enrutada a Gemini Nube`;
      return {
        target: 'cloud',
        reason,
        tokenEstimate: tokenCount,
        complexity: complex ? 'complex' : 'simple'
      };
    }

    if (isLocalModelReady) {
      return {
        target: 'local',
        reason: 'Sin conexión a internet: degradación suave a modelo local Gemini Nano',
        tokenEstimate: tokenCount,
        complexity: complex ? 'complex' : 'simple'
      };
    }

    return {
      target: 'queue',
      reason: 'Sin conexión a internet y modelo local no disponible; tarea encolada para sincronización',
      tokenEstimate: tokenCount,
      complexity: complex ? 'complex' : 'simple'
    };
  }
}

