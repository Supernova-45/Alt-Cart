import { ProductPassport } from "./productModel";

function getApiBase(): string {
  const isProduction = typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
  if (isProduction) {
    return ""; // Use same-origin /api (proxied to backend by Vercel)
  }
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
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
  const base = API_BASE ? `${API_BASE}` : "";
  const response = await fetch(`${base}/api/products/extract`, {
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

export interface SearchResultItem {
  name: string;
  price?: string;
  ratingText?: string;
  reviewCountText?: string;
  imageUrl?: string;
  productUrl: string;
}

export interface ExtractSearchResponse {
  status: "success";
  data: {
    query: string;
    domain: string;
    items: SearchResultItem[];
  };
}

export async function extractSearch(url: string): Promise<ExtractSearchResponse> {
  const base = API_BASE ? `${API_BASE}` : "";
  const response = await fetch(`${base}/api/search/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    let message = "Search extraction failed";
    try {
      const error: ErrorResponse = await response.json();
      message = error.message || message;
    } catch {
      message = response.statusText;
    }
    throw new Error(message);
  }

  return response.json();
}

export async function getProduct(id: string): Promise<ProductResponse | null> {
  const base = API_BASE ? `${API_BASE}` : "";
  const response = await fetch(`${base}/api/products/${id}`);

  if (!response.ok) {
    return null;
  }

  return response.json();
}
