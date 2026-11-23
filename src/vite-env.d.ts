/// <reference types="vite/client" />

export interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_APPCHECK_DEBUG_TOKEN?: string;
  readonly VITE_DEFAULT_CLOUD_MODEL?: string;
  readonly VITE_LOCAL_MODEL_MAX_TOKENS?: string;
  readonly VITE_CLOUD_TIMEOUT_MS?: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}

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
