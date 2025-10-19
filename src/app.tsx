/// <reference lib="dom" />

import React from "react";
import { createRoot } from "react-dom/client";
import type { MessageProps } from "@chatui/core";
import { Bubble, useMessages } from "@chatui/core";
import { ChatComponent } from "./components/chatui.tsx";

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
      content: {
        text:
          "Hello! I'm a QuickBasic program generator. I can create QBASIC programs for you!",
      },
      position: "left",
    },
    {
      type: "text",
      content: {
        text:
          "Try asking me to create a program like 'make a hello world program' or 'create a guessing game'",
      },
      position: "left",
    },
  ]);

  async function handleSend(type: string, val: string): Promise<void> {
    if (type === "text" && val.trim()) {
      appendMsg({
        type: "text",
        content: { text: val },
        position: "right",
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    appendMsg({
      type: "text",
      content: { text: "Generating program..." },
      position: "left",
    });
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
      navbar={{ title: "QBJS Gemini Nano" }}
      messages={messages}
      renderMessageContent={renderMessageContent}
      onSend={handleSend}
    />
  );
}
