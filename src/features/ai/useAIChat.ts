import { useEffect, useRef, useState } from "react";
import { sendMessage, type AiChatMessage, type ShopRecommendation } from "./aiService";

const STORAGE_KEY = "swiftfix-ai-chat";

export type AiChatStatus = "idle" | "sending" | "error";

function createId() {
  return crypto.randomUUID?.() ?? `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isRecommendation(value: unknown): value is ShopRecommendation {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<ShopRecommendation>;
  const shopId = row.shop_id;
  return (typeof shopId === "string" || typeof shopId === "number") && typeof row.rank === "number";
}

function isStoredMessage(value: unknown): value is AiChatMessage {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<AiChatMessage>;
  if ((row.role !== "user" && row.role !== "assistant") || typeof row.id !== "string" || typeof row.content !== "string") return false;
  if (row.recommendations == null) return true;
  return Array.isArray(row.recommendations) && row.recommendations.every(isRecommendation);
}

function loadMessages() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredMessage);
  } catch {
    return [];
  }
}

export function useAIChat() {
  const [messages, setMessages] = useState<AiChatMessage[]>(loadMessages);
  const [status, setStatus] = useState<AiChatStatus>("idle");
  const generation = useRef(0);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    return () => {
      generation.current += 1;
    };
  }, []);

  async function requestReply(history: AiChatMessage[], runId: number) {
    setStatus("sending");

    try {
      const reply = await sendMessage(history);
      if (generation.current !== runId) return;

      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content: reply.content,
          recommendations: reply.recommendations,
        },
      ]);
      setStatus("idle");
    } catch {
      if (generation.current !== runId) return;
      setStatus("error");
    }
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || status === "sending") return;

    generation.current += 1;
    const history = [...messages, { id: createId(), role: "user" as const, content: trimmed }];
    setMessages(history);
    void requestReply(history, generation.current);
  }

  function retry() {
    if (status === "sending" || messages.length === 0) return;
    generation.current += 1;
    void requestReply(messages, generation.current);
  }

  function reset() {
    generation.current += 1;
    setMessages([]);
    setStatus("idle");
    sessionStorage.removeItem(STORAGE_KEY);
  }

  return {
    messages,
    status,
    isBusy: status === "sending",
    send,
    retry,
    reset,
  };
}
