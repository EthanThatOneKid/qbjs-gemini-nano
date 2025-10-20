/// <reference path="./language-model.d.ts" />

import type {
  LanguageModelAvailability,
  LanguageModelCreateOptions,
  LanguageModelSession,
} from "./language-model.d.ts";
import { logError, logInit, logWarning } from "./utils.ts";

/**
 * Checks if the Chrome AI LanguageModel is available
 */
export function isChromeAIAvailable(): boolean {
  return typeof globalThis.LanguageModel !== "undefined";
}

/**
 * Checks LanguageModel availability and logs appropriate messages
 * @returns Promise<LanguageModelAvailability>
 */
export async function checkLanguageModelAvailability(): Promise<
  LanguageModelAvailability
> {
  if (!isChromeAIAvailable()) {
    logError(
      "Chrome AI LanguageModel is not available in this environment",
      null,
    );
    return "unavailable";
  }

  logInit("Checking LanguageModel availability...");
  const availability = await globalThis.LanguageModel.availability();
  console.log("LanguageModel availability:", availability);

  if (availability === "unavailable") {
    logError("LanguageModel is not available on this device", null);
  } else if (
    availability === "downloadable" || availability === "downloading"
  ) {
    logInit("Model needs to be downloaded. User interaction required.");
  }

  return availability;
}

/**
 * Creates a LanguageModel session with proper error handling
 */
export async function createLanguageModelSession(
  options: LanguageModelCreateOptions,
): Promise<LanguageModelSession> {
  if (!isChromeAIAvailable()) {
    throw new Error(
      "Chrome AI LanguageModel is not available in this environment",
    );
  }

  try {
    logInit("Creating LanguageModel session...");
    const session = await globalThis.LanguageModel.create(options);
    logInit("LanguageModel session created successfully");
    return session;
  } catch (error) {
    logError("Failed to create LanguageModel session", error);
    throw error;
  }
}

/**
 * Creates a LanguageModel session with download progress monitoring
 */
export async function createLanguageModelSessionWithProgress(
  options: Omit<LanguageModelCreateOptions, "monitor">,
): Promise<LanguageModelSession> {
  return createLanguageModelSession({
    ...options,
    monitor(monitor) {
      monitor.addEventListener("downloadprogress", (event) => {
        const progress = (event.loaded / event.total) * 100;
        console.log(`Model download progress: ${progress.toFixed(1)}%`);
      });
    },
  });
}

/**
 * Clones a LanguageModel session with error handling
 */
export async function cloneLanguageModelSession(
  session: LanguageModelSession,
): Promise<LanguageModelSession> {
  try {
    logInit("Cloning LanguageModel session...");
    const clonedSession = await session.clone();
    logInit("LanguageModel session cloned successfully");
    return clonedSession;
  } catch (error) {
    logError("Failed to clone LanguageModel session", error);
    throw error;
  }
}

/**
 * Sends a prompt to a LanguageModel session with error handling
 */
export async function sendPrompt(
  session: LanguageModelSession,
  prompt: string,
): Promise<string> {
  try {
    console.log("Sending prompt to LanguageModel:", prompt);
    const result = await session.prompt(prompt);
    console.log("LanguageModel response:", result);
    return result;
  } catch (error) {
    logError("Error sending prompt to LanguageModel", error);
    throw error;
  }
}

/**
 * Destroys a LanguageModel session safely
 */
export function destroyLanguageModelSession(
  session: LanguageModelSession,
): void {
  try {
    session.destroy();
    logInit("LanguageModel session destroyed");
  } catch (error) {
    logWarning("Error destroying LanguageModel session", error);
  }
}
