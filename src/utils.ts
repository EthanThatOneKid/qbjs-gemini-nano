/// <reference path="./language-model.d.ts" />

/**
 * Creates a standardized message object
 */
export function createMessage(
  text: string,
  position: "left" | "right" = "left",
) {
  return {
    type: "text" as const,
    content: { text },
    position: position,
  };
}

/**
 * Creates an error message with consistent formatting
 */
export function createErrorMessage(
  error: unknown,
  context: string = "processing your request",
): ReturnType<typeof createMessage> {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return createMessage(
    `Sorry, there was an error ${context}: ${errorMessage}. Please try again.`,
  );
}

/**
 * Creates a loading message
 */
export function createLoadingMessage(
  text: string = "Please wait...",
): ReturnType<typeof createMessage> {
  return createMessage(`🔄 ${text}`);
}

/**
 * Creates a success message
 */
export function createSuccessMessage(
  text: string,
): ReturnType<typeof createMessage> {
  return createMessage(`✅ ${text}`);
}

/**
 * Logs initialization progress with consistent formatting
 */
export function logInit(message: string): void {
  console.log(`[INIT] ${message}`);
}

/**
 * Logs error with consistent formatting
 */
export function logError(context: string, error: unknown): void {
  console.error(`[ERROR] ${context}:`, error);
}

/**
 * Logs warning with consistent formatting
 */
export function logWarning(message: string, error?: unknown): void {
  if (error) {
    console.warn(`[WARN] ${message}:`, error);
  } else {
    console.warn(`[WARN] ${message}`);
  }
}

/**
 * Trims code fences from a string and returns the clean code
 */
export function trimCodeFences(text: string): string {
  const fenceRegex = /```([a-zA-Z0-9+]*)?\n([\s\S]*?)\n```/;
  const match = text.match(fenceRegex);

  if (match) {
    return match[2]; // Return the code content without fences
  }

  return text; // Return original text if no fences found
}
