import { useState } from "react";
import { useChatStore } from "@store/chatStore";
import { requestPlan } from "@services/api";

export const useChat = () => {
  const messages = useChatStore(state => state.messages);
  const addMessage = useChatStore(state => state.addMessage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendPrompt = async (prompt: string) => {
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      text: prompt,
      createdAt: new Date().toISOString()
    };
    addMessage(userMessage);
    setLoading(true);
    setError(null);
    try {
      const plan = await requestPlan(prompt);
      addMessage({
        id: `ai-${Date.now()}`,
        role: "ai",
        text: "Voici ton plan personnalisé.",
        createdAt: new Date().toISOString(),
        plan
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de générer le plan";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    error,
    sendPrompt
  };
};
