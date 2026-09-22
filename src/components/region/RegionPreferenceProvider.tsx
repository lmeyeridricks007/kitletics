"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import {
  readDocumentRegionCookie,
  writeDocumentRegionCookie,
} from "@/lib/region/cookie";

interface RegionPreferenceValue {
  region: RegionCode;
  setRegion: (code: RegionCode) => void;
}

const RegionPreferenceContext = createContext<RegionPreferenceValue | null>(
  null,
);

export function RegionPreferenceProvider({
  children,
  initialRegion = DEFAULT_REGION,
}: {
  children: ReactNode;
  initialRegion?: RegionCode;
}) {
  const [region, setRegionState] = useState<RegionCode>(initialRegion);

  useEffect(() => {
    const fromCookie = readDocumentRegionCookie();
    if (fromCookie) setRegionState(fromCookie);
  }, []);

  const setRegion = useCallback((code: RegionCode) => {
    writeDocumentRegionCookie(code);
    setRegionState(code);
  }, []);

  const value = useMemo(
    () => ({ region, setRegion }),
    [region, setRegion],
  );

  return (
    <RegionPreferenceContext.Provider value={value}>
      {children}
    </RegionPreferenceContext.Provider>
  );
}

export function useRegionPreference(): RegionPreferenceValue {
  const ctx = useContext(RegionPreferenceContext);
  if (!ctx) {
    throw new Error(
      "useRegionPreference must be used within RegionPreferenceProvider",
    );
  }
  return ctx;
}
