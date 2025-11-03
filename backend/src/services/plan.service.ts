import { firestore } from "../config/firebase";
import type { DiegoPlan } from "../models/plan";

export const saveConversation = async (uid: string, prompt: string, plan: DiegoPlan, model: string) => {
  await firestore.collection("conversations").doc(uid).collection("entries").add({
    prompt,
    response: plan,
    model,
    createdAt: new Date().toISOString()
  });
};
