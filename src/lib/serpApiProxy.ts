function getStoredApiKey() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("msp_serpapi_key") ?? "";
}

export async function callSerpApi(params: URLSearchParams) {
  const apiKey = getStoredApiKey();
  const response = await fetch(`/.netlify/functions/serpapi?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(apiKey ? { "x-serpapi-key": apiKey } : {}),
    },
  });

  const payload = await response.json().catch(() => ({ error: "SerpAPI returned an unreadable response." }));
  if (!response.ok || payload.error) {
    throw new Error(payload.error ?? "SerpAPI request failed.");
  }

  return payload;
}

export async function fetchSerpApiConfig() {
  const response = await fetch("/.netlify/functions/serpapi?mode=config", {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const payload = await response.json().catch(() => ({ hasServerApiKey: false }));
  return { hasServerApiKey: Boolean(payload?.hasServerApiKey) };
}
