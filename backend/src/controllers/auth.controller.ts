import { Response } from "express";
import { z } from "zod";
import { firestore } from "../config/firebase";
import { AuthenticatedRequest } from "../middleware/auth";

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  age: z.number().min(6).max(60).optional(),
  level: z.string().optional(),
  club: z.string().optional(),
  routine: z.string().optional(),
  goals: z.array(z.string()).optional()
});

export const upsertProfile = async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const result = profileSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "invalid_payload", details: result.error.flatten() });
  }

  await firestore.collection("users").doc(uid).set(result.data, { merge: true });
  return res.status(204).send();
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const doc = await firestore.collection("users").doc(uid).get();
  return res.json(doc.data() ?? {});
};
