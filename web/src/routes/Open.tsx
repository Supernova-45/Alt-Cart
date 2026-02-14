import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { urlToDemo } from "../lib/urlToDemo";

const MIN_LOADING_MS = 200;

export function Open() {
  const [searchParams] = useSearchParams();
  const [ready, setReady] = useState(false);
  const url = searchParams.get("url");

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

  const params = new URLSearchParams();
  params.set("url", url);
  params.set("reason", target.reason);
  return <Navigate to={`/unsupported?${params.toString()}`} replace />;
}
