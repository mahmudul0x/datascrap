import { createFileRoute } from "@tanstack/react-router";

// This route is disabled for static deployment on Netlify
// Location autocomplete calls are made directly to SerpAPI from the browser

export const Route = createFileRoute("/api/locations")({
  // Empty component - this route is not used in static deployment
});
