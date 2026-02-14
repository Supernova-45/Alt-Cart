import { ProductPassport } from "./productModel";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

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
