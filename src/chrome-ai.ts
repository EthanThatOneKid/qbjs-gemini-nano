declare global {
  var LanguageModel: LanguageModel;
}

// https://developer.chrome.com/docs/ai/get-started
export interface LanguageModel {
  create(
    options: { initialPrompts: LanguageModelMessage[] },
  ): Promise<LanguageModelSession>;
}

export interface LanguageModelMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LanguageModelSession {
  prompt(content: string): Promise<string>;
  clone(): Promise<LanguageModelSession>;
}
