/**
 * Contrato de Tipos para HybridAgent Orchestrator v3.0
 * Soporte: Enrutamiento Multidimensional, Zero-Trust Privacy, Modo Cascada Especulativo y Telemetría.
 */

export type RoutingTarget = 'local' | 'cloud' | 'queue' | 'cascade';
export type ComplexityLevel = 'simple' | 'complex';
export type RoutingMode = 'auto' | 'cascade' | 'local_only' | 'cloud_only';
export type ModelStatus = 'not_available' | 'downloadable' | 'downloading' | 'ready';

export interface ComplexityBreakdown {
  tokenCount: number;
  hasPII: boolean;
  detectedPIITypes: string[];
  intent: 'code' | 'reasoning' | 'summary_task' | 'general';
  complexityScore: number; // 0 a 100
  privacyForcedLocal: boolean;
  // Métricas Multidimensionales del Orquestador v3.0:
  privacyScore: number; // 0 - 100
  latencySensitivityScore: number; // 0 - 100 (Alta sensibilidad: SLA < 300ms)
  cloudSavingsScore: number; // 0 - 100 (% de ahorro de cómputo en nube)
  confidenceScore: number; // 0 - 100 (Certeza matemática de la ruta)
  estimatedCostUSD: number; // Costo evitado en la nube
}

export interface EvaluatorContext {
  prompt: string;
  isOnline: boolean;
  modelStatus: ModelStatus;
  mode: RoutingMode;
  maxLocalTokens: number;
  networkRTT?: number;
}

export interface RoutingDecision {
  target: RoutingTarget;
  reason: string;
  complexity: ComplexityLevel;
  breakdown: ComplexityBreakdown;
  decidedAt: number;
  evaluationMs: number;
  speculativePlan?: string;
}

export interface TaskPayload {
  id: string;
  userId: string;
  prompt: string;
  timestamp: number;
  metadata?: {
    estimatedTokens?: number;
    requiresVision?: boolean;
    requiresStructuredOutput?: boolean;
  };
}

export interface StructuredTaskItem {
  id: string;
  title: string;
  priority: 'alta' | 'media' | 'baja';
  completed: boolean;
}

export interface WorkerExecutionResult {
  taskId: string;
  prompt?: string;
  model?: string;
  source: 'local' | 'cloud' | 'cascade';
  content: string;
  structuredTasks?: StructuredTaskItem[];
  summary?: string;
  latencyMs: number;
  firstTokenMs?: number;
  timestamp: number;
  routerReason: string;
  breakdown: ComplexityBreakdown;
  isStreaming?: boolean;
  isRealHardware?: boolean;
  speculativePreview?: string;
}

export interface PersistedTaskRecord {
  taskId: string;
  prompt: string;
  response: string;
  head: 'LOCAL' | 'CLOUD' | 'CASCADE';
  model: string;
  latencyMs: number;
  savedCost: number;
  complexityScore: number;
  intent: string;
  structuredTasks: StructuredTaskItem[];
  createdAt: number;
  routerReason?: string;
  confidenceScore?: number;
}

export interface OrchestratorMetric {
  id: string;
  taskId: string;
  source: 'local' | 'cloud' | 'cascade';
  latencyMs: number;
  tokens: number;
  reason: string;
  timestamp: number;
  hasPII: boolean;
  score: number;
  confidenceScore: number;
  costSavedUSD: number;
}
