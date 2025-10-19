/// <reference lib="dom" />

import React from "react";
import type { ChatProps } from "@chatui/core";
import Chat from "@chatui/core";

export const ChatComponent = Chat as React.ComponentType<ChatProps>;
