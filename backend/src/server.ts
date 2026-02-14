import express from "express";
import { config, validateEnv } from "./config/env";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import healthRoutes from "./routes/health";
import productRoutes from "./routes/products";
import { logger } from "./utils/logger";

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  logger.error("Environment validation failed", {
    error: error instanceof Error ? error.message : String(error)
  });
  process.exit(1);
}

// Create Express app
const app = express();

// CORS first (must handle preflight before other middleware)
app.use(corsMiddleware);
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info("Incoming request", {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/products", productRoutes);

// Error handling
app.use(errorHandler);

// Start server (skip on Vercel - it uses the exported app)
const PORT = config.port;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    logger.info(`Alt-Cart backend server running on port ${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Frontend URL: ${config.frontendUrl}`);
  });

  process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down gracefully");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT received, shutting down gracefully");
    process.exit(0);
  });
}

export default app;
