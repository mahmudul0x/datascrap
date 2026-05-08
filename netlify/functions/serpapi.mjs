const SERPAPI_BASE_URL = "https://serpapi.com";

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function getApiKey(event) {
  const headerKey = event.headers["x-serpapi-key"] || event.headers["X-SerpApi-Key"];
  const envKey = process.env.SERPAPI_KEY;
  return envKey || headerKey || "";
}

function buildUpstreamUrl(mode, params, apiKey) {
  const search = new URLSearchParams();

  if (mode === "locations") {
    search.set("q", params.get("q") || "");
    search.set("limit", params.get("limit") || "10");
    return `${SERPAPI_BASE_URL}/locations.json?${search.toString()}`;
  }

  if (mode === "search") {
    search.set("engine", "google_maps");
    search.set("type", "search");
    search.set("q", params.get("q") || "");
    search.set("hl", params.get("hl") || "en");
    search.set("api_key", apiKey);

    const start = params.get("start");
    if (start) search.set("start", start);

    return `${SERPAPI_BASE_URL}/search.json?${search.toString()}`;
  }

  if (mode === "reviews") {
    search.set("engine", "google_maps_reviews");
    search.set("hl", params.get("hl") || "en");
    search.set("sort_by", "ratingHigh");
    search.set("api_key", apiKey);

    const dataId = params.get("data_id");
    const placeId = params.get("place_id");

    if (dataId) search.set("data_id", dataId);
    if (placeId) search.set("place_id", placeId);

    return `${SERPAPI_BASE_URL}/search.json?${search.toString()}`;
  }

  return null;
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        Allow: "GET, POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod === "POST") {
    const pathname = event.path || "";

    if (!pathname.endsWith("/sheet-proxy")) {
      return json(405, { error: "Method not allowed" });
    }

    let payload;

    try {
      payload = event.body ? JSON.parse(event.body) : {};
    } catch {
      return json(400, { error: "Invalid JSON body." });
    }

    const targetUrl = typeof payload?.url === "string" ? payload.url.trim() : "";
    const body = payload?.body;

    if (!targetUrl) {
      return json(400, { error: "Missing Google Apps Script URL." });
    }

    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(targetUrl)) {
      return json(400, { error: "Invalid Google Apps Script URL." });
    }

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });

      const text = await response.text();

      if (!response.ok) {
        return json(response.status || 502, {
          error: `Google Sheet webhook returned ${response.status}${text ? `: ${text.slice(0, 200)}` : ""}`,
        });
      }

      let parsed;
      try {
        parsed = text ? JSON.parse(text) : { ok: true };
      } catch {
        parsed = { ok: true, raw: text };
      }

      return json(200, parsed);
    } catch {
      return json(502, { error: "Unable to reach Google Sheet webhook." });
    }
  }

  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  const params = new URLSearchParams(event.queryStringParameters || {});
  const mode = params.get("mode") || "";
  const apiKey = getApiKey(event);

  if (mode === "config") {
    return json(200, { hasServerApiKey: Boolean(process.env.SERPAPI_KEY) });
  }

  if (!["locations", "search", "reviews"].includes(mode)) {
    return json(400, { error: "Invalid SerpAPI mode." });
  }

  if (mode !== "locations" && !apiKey) {
    return json(400, {
      error: "Missing SerpAPI key. Set SERPAPI_KEY in Netlify or provide a key from the app.",
    });
  }

  const upstreamUrl = buildUpstreamUrl(mode, params, apiKey);
  if (!upstreamUrl) {
    return json(400, { error: "Could not build upstream SerpAPI request." });
  }

  try {
    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    const text = await response.text();
    let payload;

    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { error: "SerpAPI returned an unreadable response." };
    }

    if (!response.ok || payload?.error) {
      return json(response.status || 502, {
        error: payload?.error || "SerpAPI request failed.",
      });
    }

    return json(200, payload);
  } catch {
    return json(502, { error: "Unable to reach SerpAPI." });
  }
}
