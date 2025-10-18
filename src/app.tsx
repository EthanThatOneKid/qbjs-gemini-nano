/// <reference lib="dom" />

import React from "react";
import { createRoot } from "react-dom/client";
import type { MessageProps } from "@chatui/core";
import { Bubble, useMessages } from "@chatui/core";
import { ChatComponent } from "./chatui.tsx";

globalThis.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error(
      "Target container is not a DOM element. Make sure there's a div with id='root' in your HTML.",
    );

    throw new Error("Root element not found!");
  }

  const root = createRoot(rootElement);
  root.render(<App />);
});

function App() {
  const { messages, appendMsg } = useMessages([
    {
      type: "text",
      content: { text: "Hello! I'm an AI assistant, how can I help you?" },
      position: "left",
    },
    {
      type: "text",
      content: {
        text:
          "Welcome to QBJS Gemini Nano! This is a chat application based on Deno and React.",
      },
      position: "right",
    },
  ]);

  function handleSend(type: string, val: string): void {
    if (type === "text" && val.trim()) {
      appendMsg({
        type: "text",
        content: { text: val },
        position: "right",
      });

      // Simulate receiving a message
      setTimeout(() => {
        appendMsg({
          type: "text",
          content: {
            text: "I received your message! This is a simulated reply.",
          },
          position: "left",
        });
      }, 1000);
    }
  }

  function renderMessageContent(msg: MessageProps): React.ReactNode {
    const { type, content } = msg;

    // Render based on message type
    switch (type) {
      case "text": {
        return <Bubble content={content.text} />;
      }

      default: {
        return null;
      }
    }
  }

  return (
    <ChatComponent
      navbar={{ title: "AI Assistant" }}
      messages={messages}
      renderMessageContent={renderMessageContent}
      onSend={handleSend}
    />
  );
}
