import { normalizeUrl, type WebsiteStatus } from "@/utils/parseResults";

export async function checkWebsiteStatus(website: string): Promise<WebsiteStatus> {
  if (!website) return "none";
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6500);
  try {
    await fetch(normalizeUrl(website), { method: "HEAD", mode: "no-cors", signal: controller.signal });
    return "active";
  } catch {
    return "inactive";
  } finally {
    window.clearTimeout(timeout);
  }
}
