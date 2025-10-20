declare global {
  var LanguageModel: LanguageModel;
}

// https://developer.chrome.com/docs/ai/get-started
// https://developer.chrome.com/docs/ai/prompt-api
export interface LanguageModel {
  create(
    options: LanguageModelCreateOptions,
  ): Promise<LanguageModelSession>;
  availability(): Promise<LanguageModelAvailability>;
  params(): Promise<LanguageModelParams>;
}

export interface LanguageModelCreateOptions {
  initialPrompts?: LanguageModelMessage[];
  temperature?: number;
  topK?: number;
  signal?: AbortSignal;
  monitor?: (monitor: LanguageModelMonitor) => void;
  language?: string;
  expectedOutputs?: LanguageModelExpectedOutput[];
}

export interface LanguageModelMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LanguageModelSession {
  prompt(content: string): Promise<string>;
  clone(options?: { signal?: AbortSignal }): Promise<LanguageModelSession>;
  destroy(): void;
}

export type LanguageModelAvailability =
  | "available"
  | "downloadable"
  | "downloading"
  | "unavailable";

export interface LanguageModelParams {
  defaultTemperature: number;
  maxTemperature: number;
  defaultTopK: number;
  maxTopK: number;
}

export interface LanguageModelMonitor {
  addEventListener(
    type: "downloadprogress",
    listener: (event: LanguageModelDownloadProgressEvent) => void,
  ): void;
}

export interface LanguageModelDownloadProgressEvent {
  loaded: number;
  total: number;
}

export interface LanguageModelExpectedOutput {
  type: "text";
  languages: string[];
}
