export interface TaskMessage {
  id: string;
  userId: string;
  prompt: string;
  timestamp: number;
}

export interface TaskDecision {
  target: 'local' | 'cloud' | 'queue';
  reason: string;
  tokenEstimate: number;
  complexity: 'simple' | 'complex';
}

export interface InferenceResult {
  taskId: string;
  source: 'local' | 'cloud' | 'cache';
  content: string;
  tasksExtracted?: Array<{ id: string; title: string; completed: boolean }>;
  summary?: string;
  latencyMs: number;
  routerReason: string;
  timestamp: number;
}

export interface MetricEntry {
  id: string;
  timestamp: number;
  source: 'local' | 'cloud';
  latencyMs: number;
  tokens: number;
  decisionReason: string;
}

export interface RouterConfig {
  maxLocalTokens: number;
  forceMode?: 'auto' | 'local_only' | 'cloud_only';
  cloudTimeoutMs: number;
}

