import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DiegoPlan = {
  technicalDrills: string[];
  physicalWorkouts: string[];
  tacticalFocus: string[];
  nutritionAdvice: string[];
  mentalTip: string[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
  createdAt: string;
  plan?: DiegoPlan;
};

type ChatState = {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    set => ({
      messages: [],
      addMessage: message => set(state => ({ messages: [...state.messages, message] })),
      reset: () => set({ messages: [] })
    }),
    {
      name: "diego-chat-store"
    }
  )
);
