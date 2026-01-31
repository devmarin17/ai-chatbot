"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import type { Attachment, ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedVisibilityType, setSelectedVisibilityType] = useState<"public" | "private">("private");
  const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_CHAT_MODEL.id);

  const { messages, sendMessage, status, stop, addToolApprovalResponse, setMessages } =
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
        setMessages={setMessages}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        selectedVisibilityType={selectedVisibilityType}
        selectedModelId={selectedModelId}
        onModelChange={setSelectedModelId}
      />
    </div>
  );
}
