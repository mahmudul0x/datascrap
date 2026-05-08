import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const SerpApiRequestSchema = z.object({
  query: z.string().trim().min(1).max(160),
  location: z.string().trim().min(1).max(160),
  language: z.string().trim().regex(/^[a-z]{2}$/),
  apiKey: z.string().trim().min(8).max(500),
  start: z.number().int().min(0).max(1000).nullable().optional(),
});

export const Route = createFileRoute("/api/serpapi")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const input = SerpApiRequestSchema.parse(await request.json());
          const params = new URLSearchParams({
            engine: "google_maps",
            q: `${input.query} in ${input.location}`,
            type: "search",
            hl: input.language,
            api_key: input.apiKey,
          });

          if (input.start) params.set("start", String(input.start));

          const serpResponse = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
            headers: { Accept: "application/json" },
          });
          const payload = await serpResponse.json().catch(() => ({ error: "SerpAPI returned an unreadable response." }));

          return Response.json(payload, {
            status: serpResponse.ok ? 200 : serpResponse.status,
            headers: { "Cache-Control": "no-store" },
          });
        } catch (error) {
          const message = error instanceof z.ZodError ? "Invalid search request. Check your query, location, language, and API key." : "Network error. Check your connection and try again.";
          return Response.json({ error: message }, { status: 400, headers: { "Cache-Control": "no-store" } });
        }
      },
    },
  },
});
