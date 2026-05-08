export async function sendSheetWebhook(url: string, body: unknown) {
  const response = await fetch("/.netlify/functions/sheet-proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ url, body }),
  });

  const payload = await response.json().catch(() => ({ error: "Sheet proxy returned an unreadable response." }));
  if (!response.ok || payload.error) {
    throw new Error(payload.error ?? "Failed to push to sheet");
  }

  return payload;
}
