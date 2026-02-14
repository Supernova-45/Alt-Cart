import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { urlToDemo, isExtractableProductUrl } from "../lib/urlToDemo";

const MIN_LOADING_MS = 200;

export function Open() {
  const [searchParams] = useSearchParams();
  const [ready, setReady] = useState(false);
  const url = searchParams.get("url");
  const returnTo = searchParams.get("returnTo");

  useEffect(() => {
    const t = setTimeout(() => setReady(true), MIN_LOADING_MS);
    return () => clearTimeout(t);
  }, []);

  if (!url) {
    return <Navigate to="/unsupported?reason=missing_url" replace />;
  }

  if (!ready) {
    return <p>Loading…</p>;
  }

  const target = urlToDemo(url);

  if (target.kind === "product") {
    return <Navigate to={`/p/${target.id}`} replace />;
  }
  if (target.kind === "search") {
    return <Navigate to={`/s/${target.id}`} replace />;
  }
  if (target.kind === "search_extract") {
    const params = new URLSearchParams();
    params.set("url", target.url);
    return <Navigate to={`/extract-search?${params.toString()}`} replace />;
  }

  if (isExtractableProductUrl(url)) {
    const extractParams = new URLSearchParams();
    extractParams.set("url", url);
    if (returnTo) extractParams.set("returnTo", returnTo);
    return <Navigate to={`/extract?${extractParams.toString()}`} replace />;
  }

  const params = new URLSearchParams();
  params.set("url", url);
  params.set("reason", target.reason);
  return <Navigate to={`/unsupported?${params.toString()}`} replace />;
}
