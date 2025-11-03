import { Router } from "express";
import { createPlan } from "../controllers/coach.controller";
import { requireAuth } from "../middleware/auth";

export const router = Router();

router.use(requireAuth);
router.post("/plan", createPlan);
