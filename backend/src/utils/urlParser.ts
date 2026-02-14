export class InvalidUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUrlError";
  }
}

export type SupportedDomain = "amazon" | "walmart" | "ebay" | "target" | "macys";

export interface ParsedUrl {
  domain: SupportedDomain;
  productId: string;
  fullUrl: string;
}

const SUPPORTED_DOMAINS = {
  amazon: ["amazon.com", "www.amazon.com"],
  walmart: ["walmart.com", "www.walmart.com"],
  ebay: ["ebay.com", "www.ebay.com"],
  target: ["target.com", "www.target.com"],
  macys: ["macys.com", "www.macys.com"],
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
  } else if (SUPPORTED_DOMAINS.ebay.includes(hostname)) {
    domain = "ebay";
  } else if (SUPPORTED_DOMAINS.target.includes(hostname)) {
    domain = "target";
  } else if (SUPPORTED_DOMAINS.macys.includes(hostname)) {
    domain = "macys";
  }

  if (!domain) {
    throw new InvalidUrlError(
      `Unsupported domain. Supported: amazon.com, walmart.com, ebay.com, target.com, macys.com`
    );
  }

  // Extract product ID
  let productId: string | null = null;

  if (domain === "amazon") {
    const dpMatch = url.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
    const gpMatch = url.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    productId = dpMatch?.[1] || gpMatch?.[1] || null;
  } else if (domain === "walmart") {
    const ipMatch = url.pathname.match(/\/ip\/([^\/]+)\/(\d+)/);
    productId = ipMatch?.[2] || url.searchParams.get("seQueueId") || null;
  } else if (domain === "ebay") {
    // eBay: /itm/405946765805 or /itm/405946765805?...
    const itmMatch = url.pathname.match(/\/itm\/(\d+)/);
    productId = itmMatch?.[1] || url.searchParams.get("itm") || null;
  } else if (domain === "target") {
    // Target: /p/.../-/A-87854495
    const aMatch = url.pathname.match(/\/-\/A-(\d+)/);
    productId = aMatch?.[1] || null;
  } else if (domain === "macys") {
    // Macy's: ?ID=19864965
    productId = url.searchParams.get("ID") || null;
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
