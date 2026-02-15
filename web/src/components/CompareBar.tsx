import { useNavigate } from "react-router-dom";
import { useCompareMode } from "./CompareModeContext";
import { clearCompare } from "../lib/compare";

export function CompareBar() {
  const navigate = useNavigate();
  const {
    compareMode,
    selectedIds,
    exitCompareMode,
    clearSelection,
    confirmCompare,
  } = useCompareMode();

  if (!compareMode) return null;

  const canCompare = selectedIds.length >= 2 && selectedIds.length <= 3;

  const handleCompare = () => {
    if (canCompare) confirmCompare((url) => navigate(url));
  };

  const handleCancel = () => {
    clearCompare();
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
          {selectedIds.length === 0
            ? "Click products to select (2–3), then compare"
            : selectedIds.length === 1
              ? "1 selected"
              : `${selectedIds.length} selected`}
        </span>
        <div className="compare-bar__actions">
          <button
            type="button"
            className="compare-bar__btn compare-bar__btn--primary"
            onClick={handleCompare}
            disabled={!canCompare}
            aria-label={canCompare ? "Compare selected products" : "Select 2–3 products to compare"}
          >
            Compare →
          </button>
          <button
            type="button"
            className="compare-bar__btn compare-bar__btn--secondary"
            onClick={handleCancel}
            aria-label="Exit compare mode"
          >
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}
