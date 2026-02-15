import cors from "cors";
import { config } from "../config/env";

const ALLOWED_ORIGINS = [
  config.frontendUrl,
  "https://alt-cart.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
].filter(Boolean);

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) return true;
  if (origin.endsWith(".vercel.app")) return true;
  return false;
}

export const corsMiddleware = cors({
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) {
      cb(null, origin || true);
    } else {
      cb(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  optionsSuccessStatus: 204,
});
