import { NextFunction, Request, Response } from "express";
import { firebaseAuth } from "../config/firebase";

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    claims?: Record<string, unknown>;
  };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized", message: "Missing bearer token" });
  }

  try {
    const token = header.replace("Bearer ", "");
    const decoded = await firebaseAuth.verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      claims: decoded
    };
    return next();
  } catch (error) {
    return res.status(401).json({ error: "unauthorized", message: "Invalid token" });
  }
};
