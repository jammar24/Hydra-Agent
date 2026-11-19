/// <reference types="vite/client" />

export interface AILanguageModelCapabilities {
  available: 'readily' | 'after-download' | 'no';
  defaultTemperature?: number;
  maxTemperature?: number;
  defaultTopK?: number;
  maxTopK?: number;
}

export interface AILanguageModelCreateOptions {
  systemPrompt?: string;
  temperature?: number;
  topK?: number;
  signal?: AbortSignal;
  monitor?: (monitor: any) => void;
}

export interface AILanguageModelSession {
  prompt(input: string): Promise<string>;
  promptStreaming(input: string): ReadableStream<string>;
  destroy(): void;
  clone(): Promise<AILanguageModelSession>;
}

export interface WindowAI {
  languageModel?: {
    capabilities(): Promise<AILanguageModelCapabilities>;
    create(options?: AILanguageModelCreateOptions): Promise<AILanguageModelSession>;
  };
}

declare global {
  interface Window {
    ai?: WindowAI;
  }
}
