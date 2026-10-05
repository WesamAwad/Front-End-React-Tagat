const OPEN_AI_CHAT_EVENT = "swiftfix:open-ai-chat";

export function openAIChat() {
  window.dispatchEvent(new Event(OPEN_AI_CHAT_EVENT));
}

export function subscribeToOpenAIChat(onOpen: () => void) {
  window.addEventListener(OPEN_AI_CHAT_EVENT, onOpen);
  return () => window.removeEventListener(OPEN_AI_CHAT_EVENT, onOpen);
}
