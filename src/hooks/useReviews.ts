import { useApp } from "@/context/AppContext";
import { callSerpApi } from "@/lib/serpApiProxy";
import type { TopReview } from "@/utils/parseResults";

export function useReviews() {
  const { apiKey, setResults, lastSearch } = useApp();

  const fetchTopReview = async (rowId: string, dataId: string, placeId: string) => {
    if (!apiKey || (!dataId && !placeId)) return;

    setResults((current) => current.map((row) => row.id === rowId ? { ...row, reviewStatus: "loading" } : row));

    try {
      const params = new URLSearchParams({
        mode: "reviews",
        hl: lastSearch?.language ?? "en",
      });
      if (dataId) params.set("data_id", dataId);
      else if (placeId) params.set("place_id", placeId);

      const payload = await callSerpApi(params);

      const reviews = Array.isArray(payload.reviews) ? payload.reviews : [];
      const top = reviews.find((r: any) => r.snippet && r.snippet.trim().length > 0) ?? null;

      const topReview: TopReview | null = top ? {
        snippet: (top.snippet ?? "").slice(0, 320),
        author: top.user?.name ?? "Anonymous",
        rating: typeof top.rating === "number" ? top.rating : null,
        link: top.link ?? top.user?.link ?? "",
      } : null;

      setResults((current) => current.map((row) => row.id === rowId ? { ...row, topReview, reviewStatus: topReview ? "loaded" : "none" } : row));
    } catch {
      setResults((current) => current.map((row) => row.id === rowId ? { ...row, reviewStatus: "error" } : row));
    }
  };

  const fetchAllPending = async (rowIds: string[]) => {
    for (const id of rowIds) {
      // Sequential to avoid SerpAPI rate limit spikes
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    }
  };

  return { fetchTopReview, fetchAllPending };
}
