import { Request, Response, NextFunction } from "express";
import { InvalidUrlError } from "../utils/urlParser";
import { logger } from "../utils/logger";

export class ExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExtractionError";
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof InvalidUrlError) {
    return res.status(400).json({
      error: "Invalid URL",
      message: err.message,
      supportedDomains: ["amazon.com", "walmart.com"],
    });
  }

  if (err instanceof ExtractionError) {
    logger.error("Extraction failed", { error: err.message, url: req.body?.url });
    return res.status(500).json({
      error: "Extraction failed",
      message: err.message,
      canRetry: true,
    });
  }

  // Log unexpected errors
  logger.error("Unexpected error", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    error: "Internal server error",
    message: err.message || "Something went wrong. Please try again.",
  });
};
