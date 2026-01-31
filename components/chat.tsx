"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { useDataStream } from "./data-stream-provider";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: ChatMessage[];
}) {
  const { setDataStream } = useDataStream();
  const [input, setInput] = useState<string>("");

  const { messages, sendMessage, status, stop, addToolApprovalResponse } =
    useChat<ChatMessage>({
      id,
      messages: initialMessages,
      generateId: generateUUID,
      sendAutomaticallyWhen: ({ messages: currentMessages }) => {
        const lastMessage = currentMessages.at(-1);
        const shouldContinue =
          lastMessage?.parts?.some(
            (part) =>
              "state" in part &&
              part.state === "approval-responded" &&
              "approval" in part &&
              part.approval === "approved"
          ) ?? false;

        return shouldContinue;
      },
      api: "/api/chat",
      body: {},
      onResponse: (response) => {
        if (response.body) {
          setDataStream(response.body);
        }
      },
      onFinish: () => {
        setDataStream(null);
      },
    });

  return (
    <div className="flex w-full flex-col">
      <Messages
        addToolApprovalResponse={addToolApprovalResponse}
        chatId={id}
        messages={messages}
        sendMessage={sendMessage}
        status={status}
      />

      <MultimodalInput
        chatId={id}
        input={input}
        messages={messages}
        sendMessage={sendMessage}
        setInput={setInput}
        status={status}
        stop={stop}
      />
    </div>
  );
}
