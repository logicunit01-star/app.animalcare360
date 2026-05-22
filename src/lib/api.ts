/** Hulm API — all browser requests go here (dev and production). */
export const HULM_API_BASE =
  process.env.NEXT_PUBLIC_HULM_API_BASE_URL?.trim().replace(/\/$/, "") ||
  "https://api.hulmsolutions.com";

export function hulmUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${HULM_API_BASE}${normalized}`;
}

/** Cross-origin fetch to api.hulmsolutions.com — visible in DevTools → Network → Fetch/XHR. */
export function hulmFetch(url: string, init?: RequestInit): Promise<Response> {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.info("[Hulm API]", init?.method ?? "GET", url);
  }

  return fetch(url, {
    mode: "cors",
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
}
