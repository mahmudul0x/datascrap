import { createFileRoute } from "@tanstack/react-router";

// This route is disabled for static deployment on Netlify
// Sheet exports need to be handled differently for static sites

export const Route = createFileRoute("/api/sheets")({
  // Empty component - this route is not used in static deployment
});
