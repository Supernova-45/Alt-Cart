import { useSearchParams, Navigate } from "react-router-dom";
import { snapshotIdFromUrl } from "../lib/asinRegistry";
import { UnsupportedPassport } from "./UnsupportedPassport";

export function PassportFromUrl() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");

  if (!url) {
    return <UnsupportedPassport message="No URL provided. Use the extension from an Amazon product page." />;
  }

  const snapshotId = snapshotIdFromUrl(url);

  if (snapshotId) {
    return <Navigate to={`/passport/${snapshotId}`} replace />;
  }

  return <UnsupportedPassport message="This product is not in the demo. Try one of the supported products below." />;
}
