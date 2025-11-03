import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { router as coachRoutes } from "./routes/coach.routes";
import { router as subscriptionRoutes } from "./routes/subscription.routes";
import { router as authRoutes } from "./routes/auth.routes";
import { router as uploadRoutes } from "./routes/upload.routes";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./utils/logger";

export const createApp = () => {
  const app = express();

  app.use(requestLogger());
  app.use(cors({ origin: env.allowedOrigins, credentials: true }));
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/coach", coachRoutes);
  app.use("/billing", subscriptionRoutes);
  app.use("/auth", authRoutes);
  app.use("/uploads", uploadRoutes);

  app.use(errorHandler);

  return app;
};
