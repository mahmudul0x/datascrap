import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Schema = z.object({
  webhookUrl: z.string().url().max(500),
  sheetName: z.string().trim().max(100).optional().default("MapScraper"),
  headers: z.array(z.string().max(120)).min(1).max(50),
  rows: z.array(z.array(z.string().max(2000))).min(1).max(2000),
  meta: z
    .object({
      query: z.string().max(160).optional().default(""),
      location: z.string().max(160).optional().default(""),
    })
    .optional(),
});

export const Route = createFileRoute("/api/sheets")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const input = Schema.parse(await request.json());
          const res = await fetch(input.webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sheetName: input.sheetName,
              headers: input.headers,
              rows: input.rows,
              meta: input.meta ?? {},
              timestamp: new Date().toISOString(),
            }),
          });

          const text = await res.text();
          if (!res.ok) {
            return Response.json({ error: `Sheet webhook returned ${res.status}: ${text.slice(0, 200)}` }, { status: 502 });
          }
          return Response.json({ ok: true, response: text.slice(0, 500) });
        } catch (error) {
          const message = error instanceof z.ZodError ? "Invalid sheet export request." : "Failed to send to Google Sheet.";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
