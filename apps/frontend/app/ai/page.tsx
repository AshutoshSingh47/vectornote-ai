"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";

export default function NotesChat() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "http://localhost:8080/api/ask",
    }),
  });

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text.trim()) return;

    sendMessage({
      text: message.text,
    });

    setInput("");
  };

  return (
    <div className="flex h-dvh w-full max-w-3xl mx-auto flex-col px-4 py-5">
      <Conversation>
        <ConversationContent className="p-0">
          {messages.length === 0 && (
            <ConversationEmptyState
              className="p-0"
              title="Ask your notes"
              description="Ask anything based on your saved notes."
            />
          )}

          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.parts.map((part, index) => {
                  if (part.type !== "text") return null;

                  return (
                    <MessageResponse key={index}>{part.text}</MessageResponse>
                  );
                })}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          value={input}
          onChange={(event) => setInput(event.currentTarget.value)}
          placeholder="Ask something about your notes..."
        />

        <PromptInputSubmit status={status} disabled={!input.trim()} />
      </PromptInput>
    </div>
  );
}
