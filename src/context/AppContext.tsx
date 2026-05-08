import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { fetchSerpApiConfig } from "@/lib/serpApiProxy";
import { demoRows, type BusinessRow } from "@/utils/parseResults";

type ScrapeStatus = "idle" | "scraping";

type LastSearch = { query: string; location: string; maxResults: number; language: string } | null;

export type ScrapeMeta = {
  page: number;
  totalPages: number;
  collected: number;
  target: number;
  startedAt: number | null;
  phase: "idle" | "fetching" | "checking" | "done";
};

type AppContextValue = {
  apiKey: string;
  setApiKeyValue: (key: string) => void;
  clearApiKey: () => void;
  results: BusinessRow[];
  setResults: React.Dispatch<React.SetStateAction<BusinessRow[]>>;
  isDemo: boolean;
  setIsDemo: (value: boolean) => void;
  status: ScrapeStatus;
  setStatus: (status: ScrapeStatus) => void;
  progress: number;
  setProgress: (progress: number) => void;
  error: string;
  setError: (error: string) => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  nextStart: number | null;
  setNextStart: (start: number | null) => void;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  lastSearch: LastSearch;
  setLastSearch: (search: LastSearch) => void;
  lightMode: boolean;
  setLightMode: (light: boolean) => void;
  scrapeMeta: ScrapeMeta;
  setScrapeMeta: React.Dispatch<React.SetStateAction<ScrapeMeta>>;
  hasServerApiKey: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState("");
  const [results, setResults] = useState<BusinessRow[]>(demoRows);
  const [isDemo, setIsDemo] = useState(true);
  const [status, setStatus] = useState<ScrapeStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [nextStart, setNextStart] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastSearch, setLastSearch] = useState<LastSearch>(null);
  const [lightMode, setLightMode] = useState(false);
  const [scrapeMeta, setScrapeMeta] = useState<ScrapeMeta>({ page: 0, totalPages: 0, collected: 0, target: 0, startedAt: null, phase: "idle" });
  const [hasServerApiKey, setHasServerApiKey] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("msp_serpapi_key") ?? "";
    setApiKey(stored);

    let cancelled = false;

    fetchSerpApiConfig()
      .then(({ hasServerApiKey }) => {
        if (cancelled) return;
        setHasServerApiKey(hasServerApiKey);
        if (!stored && !hasServerApiKey) setModalOpen(true);
      })
      .catch(() => {
        if (cancelled) return;
        if (!stored) setModalOpen(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", lightMode);
  }, [lightMode]);

  const setApiKeyValue = (key: string) => {
    localStorage.setItem("msp_serpapi_key", key);
    setApiKey(key);
    setModalOpen(false);
    toast.success("API key saved successfully");
  };

  const clearApiKey = () => {
    localStorage.removeItem("msp_serpapi_key");
    setApiKey("");
  };

  const value = useMemo(
    () => ({ apiKey, setApiKeyValue, clearApiKey, results, setResults, isDemo, setIsDemo, status, setStatus, progress, setProgress, error, setError, selectedIds, setSelectedIds, nextStart, setNextStart, modalOpen, setModalOpen, sidebarOpen, setSidebarOpen, lastSearch, setLastSearch, lightMode, setLightMode, scrapeMeta, setScrapeMeta, hasServerApiKey }),
    [apiKey, results, isDemo, status, progress, error, selectedIds, nextStart, modalOpen, sidebarOpen, lastSearch, lightMode, scrapeMeta, hasServerApiKey],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
