import { Router } from "express";
import { uploadMedia } from "../controllers/upload.controller";
import { requireAuth } from "../middleware/auth";

export const router = Router();

router.use(requireAuth);
router.post("/media", uploadMedia);
