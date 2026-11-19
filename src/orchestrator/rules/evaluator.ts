import { 
  RoutingDecision, 
  ComplexityLevel, 
  RoutingMode, 
  ModelStatus, 
  ComplexityBreakdown, 
  EvaluatorContext 
} from '../types';

export class RoutingEvaluator {
  // Patrones PII de Alta Precisión: Correos, Tarjetas, Passwords, API Keys, DNI/SSN
  private static readonly PII_PATTERNS = [
    { type: 'Email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i },
    { type: 'API Key / Token', regex: /\b(sk-[a-zA-Z0-9_\-]{16,}|AIza[0-9A-Za-z-_]{35}|bearer\s+[a-zA-Z0-9_\-\.]{20,})\b/i },
    { type: 'Password / Credencial', regex: /\b(password|contrase[ñn]a|clave|token_privado)\s*[:=]\s*\S+/i },
    { type: 'Credit Card', regex: /\b(?:\d{4}[ -]?){3}\d{4}\b/ },
    { type: 'DNI / SSN / Cédula', regex: /\b\d{3}-\d{2}-\d{4}\b|\b\d{8,10}\b/ }
  ];

  private static readonly COMPLEX_PATTERNS = [
    /\b(análisis profundo|investigación exhaustiva|comparativa detallada)\b/i,
    /\b(arquitectura completa|refactorización integral|código completo)\b/i,
    /\b(pdf|audio|transcripción larga|video|documento extenso)\b/i,
    /\b(paso a paso detallado|razonamiento matemático formal|algoritmo optimizado)\b/i
  ];

  public static estimateTokens(text: string): number {
    return Math.ceil(text.trim().length / 3.8);
  }

  public static detectPII(text: string): { hasPII: boolean; types: string[] } {
    const types: string[] = [];
    for (const p of this.PII_PATTERNS) {
      if (p.regex.test(text)) {
        types.push(p.type);
      }
    }
    return { hasPII: types.length > 0, types };
  }

  /**
   * Enmascara datos sensibles para auditoría Zero-Trust
   */
  public static redactPII(text: string): string {
    let redacted = text;
    // Enmascarar Emails
    redacted = redacted.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
      '[EMAIL_PROTEGIDO]'
    );
    // Enmascarar API Keys y Bearer Tokens
    redacted = redacted.replace(
      /\b(sk-[a-zA-Z0-9_\-]{6,}|AIza[0-9A-Za-z-_]{10,}|bearer\s+[a-zA-Z0-9_\-\.]{10,})\b/gi,
      '[API_KEY_CONFIDENCIAL]'
    );
    // Enmascarar contraseñas explícitas
    redacted = redacted.replace(
      /\b(password|contrase[ñn]a|clave)\s*[:=]\s*\S+/gi,
      '$1: [PASSWORD_PROTEGIDO]'
    );
    // Enmascarar números de tarjetas
    redacted = redacted.replace(
      /\b(?:\d{4}[ -]?){3}\d{4}\b/g,
      '[TARJETA_PROTEGIDA]'
    );
    return redacted;
  }

  public static analyzeIntent(text: string): 'code' | 'reasoning' | 'summary_task' | 'general' {
    if (/\b(c[oó]digo|typescript|javascript|python|sql|api|function|bug|refactor)\b/i.test(text)) return 'code';
    if (/\b(arquitectura|analiza|explica|por qu[eé]|investiga|estrategia|comparativa)\b/i.test(text)) return 'reasoning';
    if (/\b(resumir|extraer tareas|sprint|reuni[oó]n|nota|sincronizar|checklist)\b/i.test(text)) return 'summary_task';
    return 'general';
  }

  public static calculateBreakdown(prompt: string, maxLocalTokens: number): ComplexityBreakdown {
    const tokenCount = this.estimateTokens(prompt);
    const { hasPII, types } = this.detectPII(prompt);
    const intent = this.analyzeIntent(prompt);

    let score = 15;
    if (tokenCount > 100) score += 25;
    if (tokenCount > 500) score += 35;
    if (this.COMPLEX_PATTERNS.some(p => p.test(prompt))) score += 40;
    if (intent === 'code' || intent === 'reasoning') score += 20;
    score = Math.min(100, score);

    const privacyForcedLocal = hasPII;
    const privacyScore = hasPII ? 100 : 0;

    // Sensibilidad de Latencia: Tareas de interacción rápida requieren sub-300ms SLA
    let latencySensitivityScore = 70;
    if (intent === 'summary_task' || tokenCount < 60) latencySensitivityScore = 92;
    else if (intent === 'reasoning') latencySensitivityScore = 40;
    else if (intent === 'code') latencySensitivityScore = 55;

    // Ahorro de Nube Potencial: % de ahorro estimado si se resuelve on-device
    const cloudSavingsScore = score < 50 ? 100 : Math.max(20, 100 - score);

    // Certeza de Enrutamiento: Confianza probabilística del orquestador
    let confidenceScore = 92;
    if (hasPII) confidenceScore = 99; // Criterio absoluto de privacidad
    else if (score >= 75 || score <= 25) confidenceScore = 96;
    else if (score >= 45 && score <= 55) confidenceScore = 84; // Frontera de decisión

    // Estimación económica de cómputo evitado ($ USD)
    const estimatedCostUSD = Number(((tokenCount * 0.00015) / 100).toFixed(6));

    return {
      tokenCount,
      hasPII,
      detectedPIITypes: types,
      intent,
      complexityScore: score,
      privacyForcedLocal,
      privacyScore,
      latencySensitivityScore,
      cloudSavingsScore,
      confidenceScore,
      estimatedCostUSD
    };
  }

  public static evaluate(ctx: EvaluatorContext): RoutingDecision {
    const start = performance.now();
    const breakdown = this.calculateBreakdown(ctx.prompt, ctx.maxLocalTokens);
    const complexity: ComplexityLevel = breakdown.complexityScore >= 50 ? 'complex' : 'simple';

    // 0. ESCUDO DE PRIVACIDAD GARANTIZADA (Zero-Trust)
    if (breakdown.privacyForcedLocal) {
      if (ctx.modelStatus === 'ready') {
        return {
          target: 'local',
          reason: `🛡️ Privacidad Garantizada (Zero-Trust): Datos sensibles detectados (${breakdown.detectedPIITypes.join(', ')}). El orquestador fuerza ejecución on-device en Gemini Nano sin salida de red.`,
          complexity,
          breakdown,
          decidedAt: Date.now(),
          evaluationMs: performance.now() - start
        };
      } else {
        return {
          target: 'queue',
          reason: `🛡️ Privacidad Restringida: Datos sensibles detectados (${breakdown.detectedPIITypes.join(', ')}). Retenido localmente en cola protegida hasta que Gemini Nano esté activo.`,
          complexity,
          breakdown,
          decidedAt: Date.now(),
          evaluationMs: performance.now() - start
        };
      }
    }

    // 1. Modo Cascada Especulativa (Cascade Speculative Routing)
    if (ctx.mode === 'cascade') {
      if (ctx.isOnline && ctx.modelStatus === 'ready') {
        return {
          target: 'cascade',
          reason: `🔄 Orquestación en Cascada: Gemini Nano genera un borrador especulativo instantáneo (< 180ms) mientras Firebase AI Logic ejecuta el análisis profundo en paralelo.`,
          complexity,
          breakdown,
          decidedAt: Date.now(),
          evaluationMs: performance.now() - start,
          speculativePlan: 'Nano inicia pre-extracción de tokens -> Cloud consolida contexto global'
        };
      }
    }

    // 2. Modos manuales forzados
    if (ctx.mode === 'local_only') {
      if (ctx.modelStatus === 'ready') {
        return {
          target: 'local',
          reason: 'Modo manual: Solo Local forzado por el usuario en el dashboard.',
          complexity,
          breakdown,
          decidedAt: Date.now(),
          evaluationMs: performance.now() - start
        };
      }
      return {
        target: 'queue',
        reason: 'Modo Solo Local forzado pero Gemini Nano aún no está inicializado.',
        complexity,
        breakdown,
        decidedAt: Date.now(),
        evaluationMs: performance.now() - start
      };
    }

    if (ctx.mode === 'cloud_only') {
      if (ctx.isOnline) {
        return {
          target: 'cloud',
          reason: 'Modo manual: Solo Nube forzado por el usuario (Firebase AI Logic).',
          complexity,
          breakdown,
          decidedAt: Date.now(),
          evaluationMs: performance.now() - start
        };
      }
      return {
        target: 'queue',
        reason: 'Modo Solo Nube forzado pero no hay conexión de red (Modo Avión).',
        complexity,
        breakdown,
        decidedAt: Date.now(),
        evaluationMs: performance.now() - start
      };
    }

    // 3. Modo Automático (Matriz Multidimensional Adaptativa)
    if (complexity === 'simple' && ctx.modelStatus === 'ready') {
      return {
        target: 'local',
        reason: `⚡ Inferencia Óptima Local (Score: ${breakdown.complexityScore}/100, ${breakdown.tokenCount} tokens): Inferencia resuelta con Gemini Nano en memoria. 0 costo de red y latencia p95 ultrabaja.`,
        complexity: 'simple',
        breakdown,
        decidedAt: Date.now(),
        evaluationMs: performance.now() - start
      };
    }

    if (ctx.isOnline) {
      const reason = ctx.modelStatus !== 'ready'
        ? `☁️ Modelo on-device no activo en el navegador; delegando dinámicamente a Gemini Cloud vía Firebase AI Logic.`
        : `☁️ Cómputo Complejo (Score: ${breakdown.complexityScore}/100, Intención: ${breakdown.intent}): Escalado a Gemini Cloud para razonamiento avanzado protegido por App Check.`;
      return {
        target: 'cloud',
        reason,
        complexity,
        breakdown,
        decidedAt: Date.now(),
        evaluationMs: performance.now() - start
      };
    }

    if (ctx.modelStatus === 'ready') {
      return {
        target: 'local',
        reason: '📶 Modo Avión Activo: Sin red disponible. Degradación resiliente a Gemini Nano on-device para garantizar disponibilidad 100%.',
        complexity,
        breakdown,
        decidedAt: Date.now(),
        evaluationMs: performance.now() - start
      };
    }

    return {
      target: 'queue',
      reason: '📥 Sin red ni modelo local: Tarea almacenada en cola de IndexedDB para reconciliación automática al reconectar.',
      complexity,
      breakdown,
      decidedAt: Date.now(),
      evaluationMs: performance.now() - start
    };
  }
}
