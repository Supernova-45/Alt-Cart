import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCompareMode } from "./CompareModeContext";

export function CompareBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [extracting, setExtracting] = useState(false);
  const {
    compareMode,
    selectedIds,
    selectedUrls,
    exitCompareMode,
    clearSelection,
    confirmCompare,
  } = useCompareMode();

  if (!compareMode) return null;

  const totalSelected = selectedIds.length + selectedUrls.length;
  const canCompare = totalSelected >= 2 && totalSelected <= 3;

  const handleCompare = async () => {
    if (!canCompare) return;
    setExtracting(true);
    try {
      const ok = await confirmCompare((url) => {
        const returnTo = location.pathname + location.search;
        const finalUrl =
          returnTo && returnTo !== "/"
            ? `${url}${url.includes("?") ? "&" : "?"}returnTo=${encodeURIComponent(returnTo)}`
            : url;
        navigate(finalUrl);
      });
      if (!ok) setExtracting(false);
    } catch {
      setExtracting(false);
    }
  };

  const handleCancel = () => {
    clearSelection();
    exitCompareMode();
  };

  return (
    <div
      className="compare-bar"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="compare-bar__inner">
        <span className="compare-bar__count">
          {totalSelected === 0
            ? "Click products to select (2–3), then compare"
            : totalSelected === 1
              ? "1 selected"
              : `${totalSelected} selected`}
        </span>
        <div className="compare-bar__actions">
          <button
            type="button"
            className="compare-bar__btn compare-bar__btn--primary"
            onClick={handleCompare}
            disabled={!canCompare || extracting}
            aria-label={canCompare ? "Compare selected products" : "Select 2–3 products to compare"}
          >
            {extracting ? "Extracting…" : "Compare →"}
          </button>
          <button
            type="button"
            className="compare-bar__btn compare-bar__btn--secondary"
            onClick={handleCancel}
            aria-label="Exit compare mode"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
