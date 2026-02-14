import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ExtractionService } from "../services/extractionService";
import { logger } from "../utils/logger";

const router = Router();
const extractionService = new ExtractionService();

// In-memory store for extracted products (replace with Redis in production)
const productStore = new Map<string, any>();

const ExtractRequestSchema = z.object({
  url: z.string().url("Must be a valid URL"),
});

router.post("/extract", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const validation = ExtractRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid request",
        message: validation.error.errors[0].message,
      });
    }

    const { url } = validation.data;

    logger.info("Received extraction request", { url });
    console.log("\n=== EXTRACTION STARTED ===");
    console.log("URL:", url);

    // Extract product
    const result = await extractionService.extractProduct(url);

    console.log("Extraction result ID:", result.id);
    console.log("Product name:", result.passport.name);

    // Store in memory
    productStore.set(result.id, result.passport);

    console.log("Stored in productStore with ID:", result.id);
    console.log("Store now has", productStore.size, "products");
    console.log("Store keys:", Array.from(productStore.keys()));
    console.log("=== EXTRACTION COMPLETED ===\n");

    logger.info("Extraction completed successfully", {
      id: result.id,
      productName: result.passport.name,
      storeSize: productStore.size
    });

    // Return success response
    res.json({
      status: "success",
      data: {
        id: result.id,
        passport: result.passport,
      },
    });
  } catch (error) {
    console.error("EXTRACTION ERROR:", error);
    logger.error("Extraction failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: req.body?.url,
    });
    next(error);
  }
});

router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  console.log("\n=== GET PRODUCT REQUEST ===");
  console.log("Requested ID:", id);
  console.log("Store has", productStore.size, "products");
  console.log("Available IDs:", Array.from(productStore.keys()));

  logger.info("Product lookup request", {
    id,
    storeSize: productStore.size,
    availableIds: Array.from(productStore.keys())
  });

  const passport = productStore.get(id);

  if (!passport) {
    console.log("❌ Product NOT FOUND for ID:", id);
    console.log("=== GET PRODUCT FAILED ===\n");
    logger.warn("Product not found in store", {
      requestedId: id,
      availableIds: Array.from(productStore.keys())
    });
    return res.status(404).json({
      error: "Product not found",
      message: "This product ID does not exist or has expired.",
    });
  }

  console.log("✓ Product FOUND:", passport.name);
  console.log("=== GET PRODUCT SUCCESS ===\n");

  res.json({
    passport,
    cachedAt: new Date().toISOString(),
  });
});

export default router;
