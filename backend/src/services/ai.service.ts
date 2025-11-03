import { openai } from "../config/openai";
import type { DiegoPlan } from "../models/plan";

export const generatePlan = async (prompt: string, model: string): Promise<DiegoPlan> => {
  const response = await openai.chat.completions.create({
    model,
    temperature: 0.8,
    messages: [
      {
        role: "system",
        content:
          "Tu es Diego, un coach de football professionnel. Réponds en JSON avec les clés technicalDrills, physicalWorkouts, tacticalFocus, nutritionAdvice, mentalTip. Chaque valeur est un tableau de recommandations en français."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const message = response.choices[0]?.message?.content;
  if (!message) {
    throw new Error("Aucune réponse de l'IA");
  }

  try {
    const parsed = JSON.parse(message) as DiegoPlan;
    return parsed;
  } catch (error) {
    throw new Error("Réponse IA mal formatée");
  }
};
