import { createFileRoute } from "@tanstack/react-router";
import App from "@/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MapScraper Pro | Google Maps Data Scraper" },
      {
        name: "description",
        content: "Frontend-only SerpAPI Google Maps scraper for business leads, filtering, status checks, and CSV or Excel exports.",
      },
      { property: "og:title", content: "MapScraper Pro" },
      {
        property: "og:description",
        content: "Scrape Google Maps business results directly in your browser with SerpAPI.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <App />;
}
