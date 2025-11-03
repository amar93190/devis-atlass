import { Router } from "express";
import { getCurrentSubscription } from "../controllers/subscription.controller";
import { requireAuth } from "../middleware/auth";

export const router = Router();

router.use(requireAuth);
router.get("/current", getCurrentSubscription);
router.get("/usage", getCurrentSubscription);
