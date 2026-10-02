"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";

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
import { BotIcon } from "lucide-react";

export default function NotesChat() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new TextStreamChatTransport({
      api: "http://localhost:8080/api/ask",
      prepareSendMessagesRequest: ({ messages }) => {
        const lastMessage = messages[messages.length - 1];
        const query = lastMessage?.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("");
        return {
          body: {
            query,
          },
        };
      },
    }),
  });

  console.log(status);

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
        <ConversationContent className="p-0 pb-4">
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

          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <p className="text-muted-foreground">Generating ...</p>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          value={input}
          onChange={(event) => setInput(event.currentTarget.value)}
          placeholder="Ask something about your notes..."
        />

        <PromptInputSubmit
          status={status}
          disabled={!input.trim()}
          className="m-2"
        />
      </PromptInput>
    </div>
  );
}
