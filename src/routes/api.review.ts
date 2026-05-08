import { createFileRoute } from "@tanstack/react-router";

// This route is disabled for static deployment on Netlify
// API calls are made directly from the browser

export const Route = createFileRoute("/api/review")({
  // Empty component - this route is not used in static deployment
});
