import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { SearchExtractionService } from "../services/searchExtractionService";
import { logger } from "../utils/logger";

const router = Router();
const searchExtractionService = new SearchExtractionService();

const ExtractSearchRequestSchema = z.object({
  url: z.string().url("Must be a valid URL"),
});

router.post("/extract", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = ExtractSearchRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid request",
        message: validation.error.errors[0].message,
      });
    }

    const { url } = validation.data;

    logger.info("Received search extraction request", { url });

    const result = await searchExtractionService.extractSearchResults(url);

    res.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    logger.error("Search extraction failed", {
      error: error instanceof Error ? error.message : String(error),
      url: req.body?.url,
    });
    next(error);
  }
});

export default router;
