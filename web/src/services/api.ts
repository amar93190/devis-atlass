import axios from "axios";
import type { DiegoPlan } from "@store/chatStore";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
  timeout: 15000
});

client.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.message || error.response?.data?.error || error.message || "Une erreur est survenue";
    return Promise.reject(new Error(message));
  }
);

export const requestPlan = async (prompt: string): Promise<DiegoPlan> => {
  const response = await client.post<DiegoPlan>("/coach/plan", {
    prompt
  });
  return response.data;
};

export type SubscriptionStatus = {
  tier: "freemium" | "basic" | "pro" | "elite";
  requestsRemaining: number;
  requestsLimit: number;
  renewalDate?: string;
};

export const fetchSubscription = async (): Promise<SubscriptionStatus> => {
  const response = await client.get<SubscriptionStatus>("/billing/current");
  return response.data;
};
