/// <reference lib="dom" />

import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { MessageProps } from "@chatui/core";
import { Bubble, Button, Typing, useMessages } from "@chatui/core";
import type { LanguageModelSession } from "./language-model.d.ts";
import { getRootSession } from "./program.ts";
import { ChatComponent } from "./components/chatui.tsx";
import { makeQbjsUrl } from "./qbjs.ts";
import {
  checkLanguageModelAvailability,
  cloneLanguageModelSession,
  sendPrompt,
} from "./chrome-ai.ts";
import {
  createErrorMessage,
  createLoadingMessage,
  createMessage,
  createSuccessMessage,
  logError,
  logInit,
  logWarning,
  trimCodeFences,
} from "./utils.ts";

// Custom hook for Language Model session management
function useLanguageModel() {
  const [session, setSession] = useState<LanguageModelSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const sessionRef = useRef<LanguageModelSession | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        logInit("Initializing LanguageModel session...");
        const availability = await checkLanguageModelAvailability();

        if (availability === "unavailable") {
          throw new Error("LanguageModel is not available on this device");
        }

        const rootSession = await getRootSession();
        const clonedSession = await cloneLanguageModelSession(rootSession);

        if (mounted) {
          setSession(clonedSession);
          sessionRef.current = clonedSession;
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          logError("Failed to initialize LanguageModel session", err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    return () => {
      mounted = false;
      // Cleanup: destroy session if needed
      if (sessionRef.current) {
        sessionRef.current.destroy();
      }
    };
  }, []);

  return { session, isLoading, error };
}

// Error boundary component for critical failures
function LanguageModelErrorBoundary(
  { children }: { children: React.ReactNode },
) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(new Error(event.message));
    };

    globalThis.addEventListener("error", handleError);
    return () => globalThis.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return React.createElement(
      "div",
      { style: { padding: "20px", textAlign: "center" } },
      React.createElement("h2", null, "Failed to initialize AI model"),
      React.createElement("p", null, error?.message),
      React.createElement("button", {
        type: "button",
        onClick: () => globalThis.location.reload(),
      }, "Reload"),
    );
  }

  return children;
}

// Initialize the app
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found!");
}

const root = createRoot(rootElement);
root.render(
  React.createElement(LanguageModelErrorBoundary, {}, React.createElement(App)),
);

function App() {
  const { session, isLoading, error } = useLanguageModel();
  const loadingMessageSent = useRef(false);
  const errorMessageSent = useRef(false);
  const successMessageSent = useRef(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);

  const { messages, appendMsg, deleteMsg } = useMessages([
    createMessage(
      "Hello! I'm a QuickBasic program generator. I can create QBASIC programs for you!",
    ),
    createMessage(
      "Try asking me to create a program like 'make a hello world program' or 'create a guessing game'",
    ),
  ]);

  // Add status messages dynamically based on state changes
  useEffect(() => {
    if (isLoading && !loadingMessageSent.current) {
      appendMsg(createLoadingMessage("Initializing AI model... Please wait."));
      loadingMessageSent.current = true;
    }
  }, [isLoading, appendMsg]);

  useEffect(() => {
    if (error && !errorMessageSent.current) {
      appendMsg(createErrorMessage(error, "initializing the AI model"));
      errorMessageSent.current = true;
    }
  }, [error, appendMsg]);

  useEffect(() => {
    if (session && !isLoading && !successMessageSent.current) {
      appendMsg(
        createSuccessMessage(
          "AI model ready! You can now ask me to create QBASIC programs.",
        ),
      );
      successMessageSent.current = true;
    }
  }, [session, isLoading, appendMsg]);

  async function handleRetry(originalPrompt: string): Promise<void> {
    if (isLoading) {
      appendMsg(
        createLoadingMessage(
          "Please wait, the AI model is still initializing...",
        ),
      );
      return;
    }

    if (!session) {
      logWarning("No session initialized");
      appendMsg(
        createMessage(
          "Sorry, the AI model is not available. Please check the console for details.",
        ),
      );
      return;
    }

    // Show typing indicator while AI is generating response
    const typingId = appendMsg({
      type: "typing",
      content: { text: "AI is thinking..." },
      position: "left",
    });
    setTypingMessageId(typingId);

    try {
      const result = await sendPrompt(session, originalPrompt);

      // Remove typing indicator
      if (typingMessageId) {
        deleteMsg(typingMessageId);
        setTypingMessageId(null);
      }

      if (result) {
        // Check if the result contains code fences
        const fenceRegex = /```([a-zA-Z0-9+]*)?\n([\s\S]*?)\n```/;
        const hasCodeFences = fenceRegex.test(result);

        if (hasCodeFences) {
          // Trim the code fences and create a code message type
          const cleanCode = trimCodeFences(result);
          appendMsg({
            type: "code",
            content: { text: cleanCode, originalPrompt },
            position: "left",
          });
        } else {
          // Check if the result looks like QBASIC code (even without fences)
          const qbasicKeywords =
            /\b(PRINT|INPUT|LET|IF|THEN|ELSE|END|FOR|NEXT|WHILE|WEND|DO|LOOP|SUB|FUNCTION|DIM|AS|INTEGER|STRING|SINGLE|DOUBLE|LONG|CIRCLE|LINE|PSET|CLS|SCREEN|COLOR|LOCATE|BEEP|SLEEP|RND|INT|VAL|STR|LEN|LEFT|RIGHT|MID|INSTR|UCASE|LCASE|TRIM|SPACE|TAB|CHR|ASC|SQR|ABS|SIN|COS|TAN|LOG|EXP|FIX|CINT|CDBL|CSNG|CSTR)\b/i;
          const hasQbasicCode = qbasicKeywords.test(result) &&
            result.length > 20;

          if (hasQbasicCode) {
            // Treat as QBASIC code and render in iframe
            appendMsg({
              type: "code",
              content: { text: result, originalPrompt },
              position: "left",
            });
          } else {
            // Create a regular text message
            appendMsg(createMessage(result));
          }
        }
      } else {
        appendMsg(createMessage("No response received from the AI model."));
      }
    } catch (error) {
      // Remove typing indicator on error
      if (typingMessageId) {
        deleteMsg(typingMessageId);
        setTypingMessageId(null);
      }
      logError("Error prompting the model", error);
      appendMsg(createErrorMessage(error, "processing your request"));
    }
  }

  async function handleSend(type: string, val: string): Promise<void> {
    if (isLoading) {
      appendMsg(
        createLoadingMessage(
          "Please wait, the AI model is still initializing...",
        ),
      );
      return;
    }

    if (!session) {
      logWarning("No session initialized");
      appendMsg(
        createMessage(
          "Sorry, the AI model is not available. Please check the console for details.",
        ),
      );
      return;
    }

    if (type === "text" && val.trim()) {
      appendMsg(createMessage(val, "right"));
    }

    // Show typing indicator while AI is generating response
    const typingId = appendMsg({
      type: "typing",
      content: { text: "AI is thinking..." },
      position: "left",
    });
    setTypingMessageId(typingId);

    try {
      const result = await sendPrompt(session, val);

      // Remove typing indicator
      if (typingMessageId) {
        deleteMsg(typingMessageId);
        setTypingMessageId(null);
      }

      if (result) {
        // Check if the result contains code fences
        const fenceRegex = /```([a-zA-Z0-9+]*)?\n([\s\S]*?)\n```/;
        const hasCodeFences = fenceRegex.test(result);

        if (hasCodeFences) {
          // Trim the code fences and create a code message type
          const cleanCode = trimCodeFences(result);
          appendMsg({
            type: "code",
            content: { text: cleanCode, originalPrompt: val },
            position: "left",
          });
        } else {
          // Check if the result looks like QBASIC code (even without fences)
          const qbasicKeywords =
            /\b(PRINT|INPUT|LET|IF|THEN|ELSE|END|FOR|NEXT|WHILE|WEND|DO|LOOP|SUB|FUNCTION|DIM|AS|INTEGER|STRING|SINGLE|DOUBLE|LONG|CIRCLE|LINE|PSET|CLS|SCREEN|COLOR|LOCATE|BEEP|SLEEP|RND|INT|VAL|STR|LEN|LEFT|RIGHT|MID|INSTR|UCASE|LCASE|TRIM|SPACE|TAB|CHR|ASC|SQR|ABS|SIN|COS|TAN|LOG|EXP|FIX|CINT|CDBL|CSNG|CSTR)\b/i;
          const hasQbasicCode = qbasicKeywords.test(result) &&
            result.length > 20;

          if (hasQbasicCode) {
            // Treat as QBASIC code and render in iframe
            appendMsg({
              type: "code",
              content: { text: result, originalPrompt: val },
              position: "left",
            });
          } else {
            // Create a regular text message
            appendMsg(createMessage(result));
          }
        }
      } else {
        appendMsg(createMessage("No response received from the AI model."));
      }
    } catch (error) {
      // Remove typing indicator on error
      if (typingMessageId) {
        deleteMsg(typingMessageId);
        setTypingMessageId(null);
      }
      logError("Error prompting the model", error);
      appendMsg(createErrorMessage(error, "processing your request"));
    }
  }

  function renderMessageContent(msg: MessageProps): React.ReactNode {
    const { type, content } = msg;

    // Render based on message type.
    switch (type) {
      case "text": {
        return <Bubble content={content.text} />;
      }

      case "code": {
        const code = content.text || "";
        const originalPrompt = content.originalPrompt;
        const qbjsUrl = makeQbjsUrl(code, "auto");
        const qbjsViewUrl = makeQbjsUrl(code, undefined);

        return React.createElement(
          Bubble,
          null,
          React.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: "8px" } },
            React.createElement("iframe", {
              src: qbjsUrl.toString(),
              width: "100%",
              height: "400",
              frameBorder: "0",
              allow: "fullscreen; clipboard-write; clipboard-read; web-share",
              sandbox:
                "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation",
              loading: "lazy",
              title: "QBJS Code Editor",
              style: {
                border: "1px solid #ccc",
                borderRadius: "8px",
                pointerEvents: "auto",
                userSelect: "auto",
              },
            }),
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              },
              React.createElement("a", {
                href: qbjsViewUrl.toString(),
                target: "_blank",
                rel: "noopener noreferrer",
                style: {
                  color: "#1890ff",
                  textDecoration: "none",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                },
                children: "🔗 View in QBJS.org",
              }),
              originalPrompt &&
                React.createElement(Button, {
                  size: "sm",
                  color: "primary",
                  onClick: () => handleRetry(originalPrompt),
                  children: "🔄 Regenerate",
                }),
            ),
          ),
        );
      }

      case "typing": {
        return <Typing text="AI is thinking..." />;
      }

      default: {
        return null;
      }
    }
  }

  return (
    <ChatComponent
      navbar={{ title: "QBJS Gemini Nano" }}
      messages={messages}
      renderMessageContent={renderMessageContent}
      onSend={handleSend}
    />
  );
}
