import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { addToCompare, clearCompare, getCompareUrl, MAX_COMPARE } from "../lib/compare";
import { extractProduct } from "../lib/api";
import { setCachedPassport } from "../lib/passportCache";

interface CompareModeContextValue {
  compareMode: boolean;
  selectedIds: string[];
  selectedUrls: string[];
  enterCompareMode: () => void;
  exitCompareMode: () => void;
  toggleProduct: (id: string) => void;
  toggleProductByUrl: (url: string) => void;
  clearSelection: () => void;
  confirmCompare: (navigate: (url: string) => void) => Promise<boolean>;
}

const CompareModeContext = createContext<CompareModeContextValue | null>(null);

export function useCompareMode(): CompareModeContextValue {
  const ctx = useContext(CompareModeContext);
  if (!ctx) {
    throw new Error("useCompareMode must be used within CompareModeProvider");
  }
  return ctx;
}

export function useCompareModeOptional(): CompareModeContextValue | null {
  return useContext(CompareModeContext);
}

interface CompareModeProviderProps {
  children: ReactNode;
}

export function CompareModeProvider({ children }: CompareModeProviderProps) {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const enterCompareMode = useCallback(() => {
    setCompareMode(true);
    setSelectedIds([]);
    setSelectedUrls([]);
  }, []);

  const exitCompareMode = useCallback(() => {
    setCompareMode(false);
    setSelectedIds([]);
    setSelectedUrls([]);
  }, []);

  const toggleProduct = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      const total = prev.length + selectedUrls.length;
      if (total >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }, [selectedUrls.length]);

  const toggleProductByUrl = useCallback((url: string) => {
    setSelectedUrls((prev) => {
      if (prev.includes(url)) {
        return prev.filter((x) => x !== url);
      }
      const total = selectedIds.length + prev.length;
      if (total >= MAX_COMPARE) return prev;
      return [...prev, url];
    });
  }, [selectedIds.length]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelectedUrls([]);
  }, []);

  const confirmCompare = useCallback(async (navigate: (url: string) => void): Promise<boolean> => {
    const total = selectedIds.length + selectedUrls.length;
    if (total < 2 || total > MAX_COMPARE) return false;
    clearCompare();
    const idsToAdd = [...selectedIds];
    for (const url of selectedUrls) {
      try {
        const result = await extractProduct(url);
        setCachedPassport(result.data.id, result.data.passport);
        idsToAdd.push(result.data.id);
      } catch {
        return false;
      }
    }
    idsToAdd.forEach((id) => addToCompare(id));
    navigate(getCompareUrl());
    setCompareMode(false);
    setSelectedIds([]);
    setSelectedUrls([]);
    return true;
  }, [selectedIds, selectedUrls]);

  const value: CompareModeContextValue = {
    compareMode,
    selectedIds,
    selectedUrls,
    enterCompareMode,
    exitCompareMode,
    toggleProduct,
    toggleProductByUrl,
    clearSelection,
    confirmCompare,
  };

  return (
    <CompareModeContext.Provider value={value}>
      {children}
    </CompareModeContext.Provider>
  );
}
