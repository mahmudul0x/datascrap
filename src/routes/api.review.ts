import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const ReviewRequestSchema = z.object({
  apiKey: z.string().trim().min(8).max(500),
  dataId: z.string().trim().max(200).optional().default(""),
  placeId: z.string().trim().max(200).optional().default(""),
  language: z.string().trim().regex(/^[a-z]{2}$/).optional().default("en"),
});

type SerpReview = {
  snippet?: string;
  user?: { name?: string; link?: string };
  rating?: number;
  link?: string;
};

export const Route = createFileRoute("/api/review")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const input = ReviewRequestSchema.parse(await request.json());
          if (!input.dataId && !input.placeId) {
            return Response.json({ error: "Missing data_id or place_id." }, { status: 400 });
          }

          const params = new URLSearchParams({
            engine: "google_maps_reviews",
            hl: input.language,
            sort_by: "ratingHigh",
            api_key: input.apiKey,
          });
          if (input.dataId) params.set("data_id", input.dataId);
          else if (input.placeId) params.set("place_id", input.placeId);

          const serpResponse = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
            headers: { Accept: "application/json" },
          });
          const payload = await serpResponse.json().catch(() => ({ error: "SerpAPI returned an unreadable response." }));

          if (!serpResponse.ok || payload.error) {
            return Response.json({ error: payload.error ?? "Failed to fetch reviews." }, { status: serpResponse.ok ? 502 : serpResponse.status });
          }

          const reviews: SerpReview[] = Array.isArray(payload.reviews) ? payload.reviews : [];
          const top = reviews.find((r) => r.snippet && r.snippet.trim().length > 0) ?? null;

          if (!top) {
            return Response.json({ topReview: null });
          }

          return Response.json({
            topReview: {
              snippet: (top.snippet ?? "").slice(0, 320),
              author: top.user?.name ?? "Anonymous",
              rating: typeof top.rating === "number" ? top.rating : null,
              link: top.link ?? top.user?.link ?? "",
            },
          }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          const message = error instanceof z.ZodError ? "Invalid review request." : "Network error fetching reviews.";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
