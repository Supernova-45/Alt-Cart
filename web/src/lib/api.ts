import { ProductPassport } from "./productModel";

function getApiBase(): string {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "https://api.altcart.vercel.app";
  }
  return "http://localhost:3001";
}

const API_BASE = getApiBase();

export interface ExtractResponse {
  status: "success";
  data: {
    id: string;
    passport: ProductPassport;
  };
}

export interface ProductResponse {
  passport: ProductPassport;
  cachedAt: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  supportedDomains?: string[];
  canRetry?: boolean;
}

export async function extractProduct(url: string): Promise<ExtractResponse> {
  const response = await fetch(`${API_BASE}/api/products/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    let message = "Extraction failed";
    try {
      const error: ErrorResponse = await response.json();
      message = error.message || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.json();
}

export async function getProduct(id: string): Promise<ProductResponse | null> {
  const response = await fetch(`${API_BASE}/api/products/${id}`);

  if (!response.ok) {
    return null;
  }

  return response.json();
}
