import { Stagehand } from "@browserbasehq/stagehand";
import { config } from "../config/env";
import { logger } from "../utils/logger";
import { ExtractionError } from "../middleware/errorHandler";

export class StagehandService {
  private stagehand: Stagehand | null = null;

  async initialize(): Promise<void> {
    try {
      logger.info("Initializing Stagehand with Browserbase");
      console.log("\n=== BROWSERBASE INITIALIZATION ===");
      console.log("API Key:", config.browserbase.apiKey ? "SET (length: " + config.browserbase.apiKey.length + ")" : "MISSING");
      console.log("Project ID:", config.browserbase.projectId || "MISSING");

      this.stagehand = new Stagehand({
        env: "BROWSERBASE",
        apiKey: config.browserbase.apiKey,
        projectId: config.browserbase.projectId,
      });

      await this.stagehand.init();

      // Log session information to verify Browserbase is being used
      const context = this.stagehand.context;
      const sessionId = (context as any)?.sessionId || (context as any)?._sessionId;
      console.log("✓ Stagehand initialized successfully");
      console.log("Session ID:", sessionId || "Unknown");
      console.log("Browser context:", context ? "Created" : "None");
      console.log("=== BROWSERBASE READY ===\n");

      logger.info("Stagehand initialized successfully", { sessionId });
    } catch (error) {
      logger.error("Failed to initialize Stagehand", {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new ExtractionError("Failed to initialize browser automation");
    }
  }

  async navigateToUrl(url: string): Promise<void> {
    if (!this.stagehand?.page) {
      throw new ExtractionError("Stagehand not initialized");
    }

    try {
      logger.info("Navigating to URL", { url });
      // Use 'domcontentloaded' instead of 'networkidle' for faster, more reliable loading
      await this.stagehand.page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000
      });

      // Wait a bit for dynamic content to load
      await this.stagehand.page.waitForTimeout(2000);

      logger.info("Navigation successful");
    } catch (error) {
      logger.error("Navigation failed", {
        error: error instanceof Error ? error.message : String(error),
        url
      });
      throw new ExtractionError("Failed to load product page");
    }
  }

  getStagehand(): Stagehand {
    if (!this.stagehand) {
      throw new ExtractionError("Stagehand not initialized");
    }
    return this.stagehand;
  }

  async close(): Promise<void> {
    if (this.stagehand) {
      try {
        await this.stagehand.close();
        this.stagehand = null;
        logger.info("Stagehand closed successfully");
      } catch (error) {
        logger.warn("Error closing Stagehand", {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }
}
