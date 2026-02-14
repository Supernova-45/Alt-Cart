import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  browserbase: {
    apiKey: process.env.BROWSERBASE_API_KEY || "",
    projectId: process.env.BROWSERBASE_PROJECT_ID || "",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};

export function validateEnv(): void {
  const required = ["BROWSERBASE_API_KEY", "BROWSERBASE_PROJECT_ID"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
