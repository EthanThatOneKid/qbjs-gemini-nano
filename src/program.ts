/// <reference path="./language-model.d.ts" />

import samples from "./samples.json" with { type: "json" };
import type { LanguageModelSession } from "./language-model.d.ts";
import {
  checkLanguageModelAvailability,
  createLanguageModelSessionWithProgress,
} from "./chrome-ai.ts";

export const systemPrompt =
  "You are a helpful assistant that generates QBASIC programs.";

export async function initializeLanguageModel() {
  const availability = await checkLanguageModelAvailability();

  if (availability === "unavailable") {
    throw new Error("LanguageModel is not available on this device");
  }

  const session = await createLanguageModelSessionWithProgress({
    initialPrompts: [
      { role: "system", content: systemPrompt },
      ...generateFewShotPrompts(),
    ],
    language: "en",
  });

  return session;
}

// Initialize the root session lazily.
let rootSession: LanguageModelSession | null = null;

export async function getRootSession(): Promise<LanguageModelSession> {
  if (!rootSession) {
    rootSession = await initializeLanguageModel();
  }

  return rootSession;
}

// https://github.com/webmachinelearning/prompt-api/blob/main/README.md?plain=1
export interface FewShotSample {
  input: string;
  output: string;
}

function generateFewShotPrompts() {
  return samples.flatMap((sample: FewShotSample) => {
    return [
      { role: "user", content: sample.input },
      { role: "assistant", content: sample.output },
    ] as const;
  });
}
