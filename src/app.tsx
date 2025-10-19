/// <reference lib="dom" />

import React from "react";
import { createRoot } from "react-dom/client";
import type { MessageProps } from "@chatui/core";
import { Bubble, useMessages } from "@chatui/core";
import { ChatComponent } from "./components/chatui.tsx";
import { generateProgramWithLM } from "./program.ts";
import { makeQbjsUrl } from "./qbjs.ts";

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

      try {
        // Generate QuickBasic program
        const program = await generateProgramWithLM(val);

        // Create QBJS URL
        const qbjsUrl = makeQbjsUrl(program, "play");

        // Send the generated program as a response
        appendMsg({
          type: "text",
          content: {
            text:
              `Here's your QuickBasic program:\n\n\`\`\`qbasic\n${program}\n\`\`\`\n\n[Run it on QBJS](${qbjsUrl.toString()})`,
          },
          position: "left",
        });
      } catch (error) {
        console.error("Error generating program:", error);
        appendMsg({
          type: "text",
          content: {
            text:
              "Sorry, I couldn't generate a program right now. Please try again.",
          },
          position: "left",
        });
      }
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
      navbar={{ title: "QBJS QuickBasic Generator" }}
      messages={messages}
      renderMessageContent={renderMessageContent}
      onSend={handleSend}
    />
  );
}
