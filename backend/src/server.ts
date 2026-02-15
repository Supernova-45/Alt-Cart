import express from "express";
import { config, validateEnv } from "./config/env";
import { corsMiddleware, isAllowedOrigin } from "./middleware/cors";
import { errorHandler } from "./middleware/errorHandler";
import healthRoutes from "./routes/health";
import productRoutes from "./routes/products";
import searchRoutes from "./routes/search";
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

// Explicit OPTIONS handler FIRST - must return 204 for preflight to pass CORS check
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  const allowOrigin = origin && isAllowedOrigin(origin) ? origin : "https://alt-cart.vercel.app";
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.status(204).end();
});

// CORS for non-OPTIONS requests
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
app.use("/api/search", searchRoutes);

// Error handling
app.use(errorHandler);

// Start server (skip on Vercel - it uses the exported app)
const PORT = config.port;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    logger.info(`alt+cart backend server running on port ${PORT}`);
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
