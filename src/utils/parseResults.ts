export type WebsiteStatus = "active" | "inactive" | "checking" | "none";

export type ReviewStatus = "idle" | "loading" | "loaded" | "error" | "none";

export type TopReview = {
  snippet: string;
  author: string;
  rating: number | null;
  link: string;
};

export type BusinessRow = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  specializations: string;
  websiteStatus: WebsiteStatus;
  rating: number | null;
  reviews: number | null;
  dataId: string;
  placeId: string;
  topReview: TopReview | null;
  reviewStatus: ReviewStatus;
  demo?: boolean;
};

type SerpResult = {
  title?: string;
  address?: string;
  phone?: string;
  website?: string;
  type?: string;
  types?: string[];
  email?: string;
  rating?: number;
  reviews?: number;
  data_id?: string;
  place_id?: string;
};

const demoReview = (snippet: string, author: string, rating: number, link: string): TopReview => ({ snippet, author, rating, link });

export const demoRows: BusinessRow[] = [
  { id: "demo-1", name: "De Brauw Blackstone Westbroek", address: "Burgerweeshuispad 201, 1076 GR Amsterdam", phone: "+31 20 577 1771", email: "info@debrauw.com", website: "debrauw.com", specializations: "Corporate/M&A · Litigation · Capital Markets", websiteStatus: "active", rating: 4.6, reviews: 128, dataId: "", placeId: "", topReview: demoReview("Top-tier M&A counsel — fast turnaround and crystal clear advice.", "Jan V.", 5, "https://debrauw.com"), reviewStatus: "loaded", demo: true },
  { id: "demo-2", name: "Stibbe", address: "Beethovenplein 10, 1077 WM Amsterdam", phone: "+31 20 546 06 06", email: "amsterdam@stibbe.com", website: "stibbe.com", specializations: "Banking & Finance · Tax · Litigation", websiteStatus: "inactive", rating: 4.3, reviews: 92, dataId: "", placeId: "", topReview: demoReview("Professional team handled our cross-border deal seamlessly.", "Marieke H.", 4, "https://stibbe.com"), reviewStatus: "loaded", demo: true },
  { id: "demo-3", name: "Houthoff", address: "Gustav Mahlerplein 50, 1082 MA Amsterdam", phone: "+31 20 605 6000", email: "info@houthoff.com", website: "houthoff.com", specializations: "M&A · Arbitration · Real Estate", websiteStatus: "active", rating: 4.8, reviews: 215, dataId: "", placeId: "", topReview: demoReview("Excellent arbitration practice. Highly recommended.", "Pieter K.", 5, "https://houthoff.com"), reviewStatus: "loaded", demo: true },
  { id: "demo-4", name: "NautaDutilh", address: "Beethovenstraat 400, 1082 PR Amsterdam", phone: "+31 20 717 1000", email: "info@nautadutilh.com", website: "nautadutilh.com", specializations: "Capital Markets · Banking & Finance", websiteStatus: "checking", rating: 4.1, reviews: 67, dataId: "", placeId: "", topReview: null, reviewStatus: "idle", demo: true },
];

export function normalizeUrl(url: string) {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function emailFromWebsite(website?: string, directEmail?: string) {
  if (directEmail) return directEmail;
  if (!website) return "";
  try {
    const host = new URL(normalizeUrl(website)).hostname.replace(/^www\./, "");
    return host ? `info@${host}` : "";
  } catch {
    return "";
  }
}

export function parseSerpResults(items: SerpResult[] = [], startIndex = 0): BusinessRow[] {
  return items.map((item, index) => {
    const website = item.website ?? "";
    const specializations = Array.isArray(item.types) && item.types.length ? item.types.join(" · ") : item.type ?? "";
    return {
      id: `serp-${Date.now()}-${startIndex + index}-${item.title ?? "business"}`,
      name: item.title ?? "Untitled business",
      address: item.address ?? "",
      phone: item.phone ?? "",
      email: emailFromWebsite(website, item.email),
      website,
      specializations,
      websiteStatus: website ? "checking" : "none",
      rating: typeof item.rating === "number" ? item.rating : null,
      reviews: typeof item.reviews === "number" ? item.reviews : null,
      dataId: item.data_id ?? "",
      placeId: item.place_id ?? "",
      topReview: null,
      reviewStatus: (item.data_id || item.place_id) && typeof item.reviews === "number" && item.reviews > 0 ? "idle" : "none",
    };
  });
}
