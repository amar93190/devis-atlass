import { Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth";
import { incrementUsage } from "../services/quota.service";
import { generatePlan } from "../services/ai.service";
import { saveConversation } from "../services/plan.service";

const schema = z.object({
  prompt: z.string().min(3)
});

export const createPlan = async (req: AuthenticatedRequest, res: Response) => {
  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "invalid_payload", details: parse.error.flatten() });
  }

  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    const usage = await incrementUsage(uid);
    const model = usage.limit >= 200 ? "gpt-4o" : "gpt-3.5-turbo";
    const plan = await generatePlan(parse.data.prompt, model);
    await saveConversation(uid, parse.data.prompt, plan, model);
    return res.json(plan);
  } catch (error) {
    if (error instanceof Error && error.message === "quota_exceeded") {
      return res.status(402).json({ error: "quota_exceeded", message: "Quota atteint" });
    }
    console.error(error);
    return res.status(500).json({ error: "plan_generation_failed" });
  }
};
