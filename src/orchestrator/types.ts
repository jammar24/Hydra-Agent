/**
 * Contrato de Tipos para HybridAgent v2.5
 * Cumplimiento: RF-03, RF-04, RF-05, RF-07, RF-10, RF-13, RF-14, RF-15, RF-17
 */

export type RoutingTarget = 'local' | 'cloud' | 'queue';
export type ComplexityLevel = 'simple' | 'complex';
export type RoutingMode = 'auto' | 'local_only' | 'cloud_only';
export type ModelStatus = 'not_available' | 'downloadable' | 'downloading' | 'ready';

export interface ComplexityBreakdown {
  tokenCount: number;
  hasPII: boolean;
  detectedPIITypes: string[];
  intent: 'code' | 'reasoning' | 'summary_task' | 'general';
  complexityScore: number; // 0 a 100
  privacyForcedLocal: boolean;
}

export interface RoutingDecision {
  target: RoutingTarget;
  reason: string;
  complexity: ComplexityLevel;
  breakdown: ComplexityBreakdown;
  decidedAt: number;
  evaluationMs: number;
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
  source: 'local' | 'cloud';
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
}

export interface OrchestratorMetric {
  id: string;
  taskId: string;
  source: 'local' | 'cloud';
  latencyMs: number;
  tokens: number;
  reason: string;
  timestamp: number;
  hasPII: boolean;
  score: number;
}
