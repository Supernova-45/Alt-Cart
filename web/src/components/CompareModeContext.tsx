import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { addToCompare, clearCompare, getCompareUrl, MAX_COMPARE } from "../lib/compare";

interface CompareModeContextValue {
  compareMode: boolean;
  selectedIds: string[];
  enterCompareMode: () => void;
  exitCompareMode: () => void;
  toggleProduct: (id: string) => void;
  clearSelection: () => void;
  confirmCompare: (navigate: (url: string) => void) => boolean;
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

  const enterCompareMode = useCallback(() => {
    setCompareMode(true);
    setSelectedIds([]);
  }, []);

  const exitCompareMode = useCallback(() => {
    setCompareMode(false);
    setSelectedIds([]);
  }, []);

  const toggleProduct = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const confirmCompare = useCallback((navigate: (url: string) => void): boolean => {
    if (selectedIds.length < 2 || selectedIds.length > MAX_COMPARE) return false;
    clearCompare();
    selectedIds.forEach((id) => addToCompare(id));
    navigate(getCompareUrl());
    setCompareMode(false);
    setSelectedIds([]);
    return true;
  }, [selectedIds]);

  const value: CompareModeContextValue = {
    compareMode,
    selectedIds,
    enterCompareMode,
    exitCompareMode,
    toggleProduct,
    clearSelection,
    confirmCompare,
  };

  return (
    <CompareModeContext.Provider value={value}>
      {children}
    </CompareModeContext.Provider>
  );
}
