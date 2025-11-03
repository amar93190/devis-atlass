import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { uploadMediaPlaceholder } from "../services/storage.service";

export const uploadMedia = async (_req: AuthenticatedRequest, res: Response) => {
  const result = await uploadMediaPlaceholder();
  return res.status(501).json(result);
};
