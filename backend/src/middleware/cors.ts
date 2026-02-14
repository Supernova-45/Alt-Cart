import cors from "cors";
import { config } from "../config/env";

export const corsMiddleware = cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
