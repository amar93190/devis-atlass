import { Router } from "express";
import { getProfile, upsertProfile } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

export const router = Router();

router.use(requireAuth);
router.get("/profile", getProfile);
router.post("/profile", upsertProfile);
