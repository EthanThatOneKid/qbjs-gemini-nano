/// <reference path="./chrome-ai.ts" />

import samples from "./samples.json" with { type: "json" };

export const systemPrompt =
  "You are a helpful assistant that generates QBASIC programs.";
export const rootSession = await globalThis.LanguageModel.create({
  initialPrompts: [
    { role: "system", content: systemPrompt },
    ...generateFewShotPrompts(),
  ],
});

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
