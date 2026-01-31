"use client";

import { memo } from "react";
import type { ChatMessage } from "@/lib/types";

export function PreviewMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 md:px-8">
      <div className="group/message relative flex gap-3 py-4">
        <div className="flex-1 space-y-2">
          <div className="text-sm">
            {message.parts.map((part, index) => {
              if (part.type === "text") {
                return (
                  <div key={index} className="whitespace-pre-wrap">
                    {part.text}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export const ThinkingMessage = memo(() => {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 md:px-8">
      <div className="group/message relative flex gap-3 py-4">
        <div className="flex-1 space-y-2">
          <div className="text-sm text-muted-foreground">Thinking...</div>
        </div>
      </div>
    </div>
  );
});

ThinkingMessage.displayName = "ThinkingMessage";
