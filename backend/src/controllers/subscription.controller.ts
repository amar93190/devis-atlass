import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { getUsageStatus } from "../services/quota.service";

export const getCurrentSubscription = async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const status = await getUsageStatus(uid);
  return res.json(status);
};
