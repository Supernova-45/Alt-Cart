import cors from "cors";
import { config } from "../config/env";

const ALLOWED_ORIGINS = [
  config.frontendUrl,
  "https://altcart.vercel.app",
  "http://localhost:5173",
].filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.some((o) => origin === o)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
