import { 
  RoutingDecision, 
  ComplexityLevel, 
  RoutingMode, 
  ModelStatus, 
  ComplexityBreakdown, 
  EvaluatorContext 
} from '../types';

export class RoutingEvaluator {
  // PII patterns: Emails, API keys, passwords, credit cards, government IDs
  private static readonly PII_PATTERNS = [
    { type: 'Email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i },
    { type: 'API Key / Token', regex: /\b(sk-[a-zA-Z0-9_\-]{8,}|AIza[0-9A-Za-z-_]{20,}|bearer\s+[a-zA-Z0-9_\-\.]{12,})\b/i },
    { type: 'Password / Credential', regex: /\b(password|contrase[ñn]a|clave|token_privado)\s*[:=]\s*\S+/i },
    { type: 'Credit Card', regex: /\b(?:\d{4}[ -]?){3}\d{4}\b/ },
    { type: 'ID / SSN', regex: /\b\d{3}-\d{2}-\d{4}\b|\b\d{8,10}\b/ }
  ];

  // Complex intent and heavy reasoning patterns
  private static readonly COMPLEX_PATTERNS = [
    /\b(análisis profundo|investigación exhaustiva|comparativa detallada|deep analysis|thorough research)\b/i,
    /\b(arquitectura completa|refactorización integral|código completo|system architecture|full refactor)\b/i,
    /\b(pdf|audio|transcripción larga|video|documento extenso|large document)\b/i,
    /\b(paso a paso detallado|razonamiento matemático formal|algoritmo optimizado|formal reasoning)\b/i
  ];

  // Estimate prompt token count
  public static estimateTokens(text: string): number {
    return Math.ceil(text.trim().length / 3.8);
  }

  // Detect sensitive PII
  public static detectPII(text: string): { hasPII: boolean; types: string[] } {
    const types: string[] = [];
    for (const p of this.PII_PATTERNS) {
      if (p.regex.test(text)) {
        types.push(p.type);
      }
    }
    return { hasPII: types.length > 0, types };
  }

  // Redact sensitive PII in memory for zero-trust logs
  public static redactPII(text: string): string {
    let redacted = text;
    // Redact emails
    redacted = redacted.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
      '[EMAIL_PROTEGIDO]'
    );
    // Redact API keys and bearer tokens
    redacted = redacted.replace(
      /\b(sk-[a-zA-Z0-9_\-]{6,}|AIza[0-9A-Za-z-_]{10,}|bearer\s+[a-zA-Z0-9_\-\.]{10,})\b/gi,
      '[API_KEY_CONFIDENCIAL]'
    );
    // Redact explicit passwords
    redacted = redacted.replace(
      /\b(password|contrase[ñn]a|clave)\s*[:=]\s*\S+/gi,
      '$1: [PASSWORD_PROTEGIDO]'
    );
    // Redact credit card numbers
    redacted = redacted.replace(
      /\b(?:\d{4}[ -]?){3}\d{4}\b/g,
      '[TARJETA_PROTEGIDA]'
    );
    return redacted;
  }

  // Classify user prompt intent
  public static analyzeIntent(text: string): 'code' | 'reasoning' | 'summary_task' | 'general' {
    if (/\b(c[oó]digo|typescript|javascript|python|sql|api|function|bug|refactor|code)\b/i.test(text)) return 'code';
    if (/\b(arquitectura|analiza|explica|por qu[eé]|investiga|estrategia|comparativa|architecture|analyze)\b/i.test(text)) return 'reasoning';
    if (/\b(resumir|extraer tareas|sprint|reuni[oó]n|nota|sincronizar|checklist|summary|notes)\b/i.test(text)) return 'summary_task';
    return 'general';
  }

  // Compute multidimensional complexity breakdown
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

    // Latency sensitivity scoring
    let latencySensitivityScore = 70;
    if (intent === 'summary_task' || tokenCount < 60) latencySensitivityScore = 92;
    else if (intent === 'reasoning') latencySensitivityScore = 40;
    else if (intent === 'code') latencySensitivityScore = 55;

    // Cloud savings score
    const cloudSavingsScore = score < 50 ? 100 : Math.max(20, 100 - score);

    // Decision confidence score
    let confidenceScore = 92;
    if (hasPII) confidenceScore = 99;
    else if (score >= 75 || score <= 25) confidenceScore = 96;
    else if (score >= 45 && score <= 55) confidenceScore = 84;

    // Estimated avoided cloud compute ($ USD)
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

  // Evaluate routing decision based on context and rules
  public static evaluate(ctx: EvaluatorContext): RoutingDecision {
    const start = performance.now();
    const breakdown = this.calculateBreakdown(ctx.prompt, ctx.maxLocalTokens);
    const complexity: ComplexityLevel = breakdown.complexityScore >= 50 ? 'complex' : 'simple';

    // 0. Privacy shield: sensitive PII detected
    if (breakdown.privacyForcedLocal) {
      if (ctx.modelStatus === 'ready') {
        return {
          target: 'local',
          reason: `🛡️ Privacidad: Datos sensibles detectados (${breakdown.detectedPIITypes.join(', ')}). Enrutamiento forzado on-device en Gemini Nano sin salida a internet.`,
          complexity,
          breakdown,
          decidedAt: Date.now(),
          evaluationMs: performance.now() - start
        };
      } else {
        return {
          target: 'queue',
          reason: `🛡️ Privacidad: Datos sensibles detectados (${breakdown.detectedPIITypes.join(', ')}). Retenido en almacenamiento seguro hasta activar el modelo local.`,
          complexity,
          breakdown,
          decidedAt: Date.now(),
          evaluationMs: performance.now() - start
        };
      }
    }

    // 1. Cascade speculative routing mode
    if (ctx.mode === 'cascade') {
      if (ctx.isOnline && ctx.modelStatus === 'ready') {
        return {
          target: 'cascade',
          reason: `🔄 Orquestación en Cascada: Gemini Nano genera un borrador especulativo instantáneo (< 180ms) mientras la nube procesa la síntesis profunda.`,
          complexity,
          breakdown,
          decidedAt: Date.now(),
          evaluationMs: performance.now() - start,
          speculativePlan: 'Nano inicia pre-extracción de tokens -> Cloud consolida contexto global'
        };
      }
    }

    // 2. Forced manual modes
    if (ctx.mode === 'local_only') {
      if (ctx.modelStatus === 'ready') {
        return {
          target: 'local',
          reason: 'Modo manual: Solo Local forzado en el panel de control.',
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
          reason: 'Modo manual: Solo Nube forzado en el panel de control.',
          complexity,
          breakdown,
          decidedAt: Date.now(),
          evaluationMs: performance.now() - start
        };
      }
      return {
        target: 'queue',
        reason: 'Modo Solo Nube forzado pero no hay conexión de red activa.',
        complexity,
        breakdown,
        decidedAt: Date.now(),
        evaluationMs: performance.now() - start
      };
    }

    // 3. Automatic adaptive decision matrix
    if (complexity === 'simple' && ctx.modelStatus === 'ready') {
      return {
        target: 'local',
        reason: `⚡ Inferencia Óptima Local (Score: ${breakdown.complexityScore}/100, ${breakdown.tokenCount} tokens): Resuelto on-device en Gemini Nano sin consumo de red.`,
        complexity: 'simple',
        breakdown,
        decidedAt: Date.now(),
        evaluationMs: performance.now() - start
      };
    }

    if (ctx.isOnline) {
      const reason = ctx.modelStatus !== 'ready'
        ? `☁️ Modelo local no activo en el navegador; delegando dinámicamente a Gemini Cloud.`
        : `☁️ Cómputo Complejo (Score: ${breakdown.complexityScore}/100, Intención: ${breakdown.intent}): Escalado a Gemini Cloud para razonamiento profundo.`;
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
        reason: '📶 Modo Avión Activo: Sin red disponible. Degradación resiliente a Gemini Nano on-device.',
        complexity,
        breakdown,
        decidedAt: Date.now(),
        evaluationMs: performance.now() - start
      };
    }

    return {
      target: 'queue',
      reason: '📥 Sin red ni modelo local: Tarea almacenada en cola segura para procesamiento al reconectar.',
      complexity,
      breakdown,
      decidedAt: Date.now(),
      evaluationMs: performance.now() - start
    };
  }
}
