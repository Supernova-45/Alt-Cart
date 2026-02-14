export class InvalidUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUrlError";
  }
}

export type SupportedDomain = "amazon" | "walmart";

export interface ParsedUrl {
  domain: SupportedDomain;
  productId: string;
  fullUrl: string;
}

const SUPPORTED_DOMAINS = {
  amazon: ["amazon.com", "www.amazon.com"],
  walmart: ["walmart.com", "www.walmart.com"],
};

export function parseProductUrl(urlString: string): ParsedUrl {
  let url: URL;

  try {
    url = new URL(urlString);
  } catch {
    throw new InvalidUrlError("Invalid URL format");
  }

  // Detect domain
  const hostname = url.hostname.toLowerCase();
  let domain: SupportedDomain | null = null;

  if (SUPPORTED_DOMAINS.amazon.includes(hostname)) {
    domain = "amazon";
  } else if (SUPPORTED_DOMAINS.walmart.includes(hostname)) {
    domain = "walmart";
  }

  if (!domain) {
    throw new InvalidUrlError(
      `Unsupported domain. Supported domains: amazon.com, walmart.com`
    );
  }

  // Extract product ID
  let productId: string | null = null;

  if (domain === "amazon") {
    // Amazon: Extract ASIN from /dp/ or /gp/product/ paths
    const dpMatch = url.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
    const gpMatch = url.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    productId = dpMatch?.[1] || gpMatch?.[1] || null;
  } else if (domain === "walmart") {
    // Walmart: Extract from /ip/ path or seQueueId query param
    const ipMatch = url.pathname.match(/\/ip\/([^\/]+)\/(\d+)/);
    productId = ipMatch?.[2] || url.searchParams.get("seQueueId") || null;
  }

  if (!productId) {
    throw new InvalidUrlError(
      `Could not extract product ID from URL. Make sure this is a valid ${domain} product page.`
    );
  }

  return {
    domain,
    productId,
    fullUrl: url.toString(),
  };
}

export function validateProductUrl(urlString: string): boolean {
  try {
    parseProductUrl(urlString);
    return true;
  } catch {
    return false;
  }
}
