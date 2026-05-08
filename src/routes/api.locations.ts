import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Schema = z.object({
  q: z.string().trim().min(1).max(120),
});

type SerpLocation = {
  id?: string;
  name?: string;
  canonical_name?: string;
  country_code?: string;
};

export const Route = createFileRoute("/api/locations")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { q } = Schema.parse(await request.json());
          const params = new URLSearchParams({ q, limit: "10" });
          const res = await fetch(`https://serpapi.com/locations.json?${params.toString()}`, {
            headers: { Accept: "application/json" },
          });
          const data = await res.json().catch(() => []);
          const list: SerpLocation[] = Array.isArray(data) ? data : [];
          const suggestions = list
            .map((item) => item.canonical_name || item.name)
            .filter((value): value is string => Boolean(value && value.length))
            .slice(0, 10);
          return Response.json({ suggestions }, { headers: { "Cache-Control": "public, max-age=300" } });
        } catch {
          return Response.json({ suggestions: [] }, { status: 200 });
        }
      },
    },
  },
});
