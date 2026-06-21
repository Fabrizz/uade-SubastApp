import type { paths } from "@/types/api";
import createClient from "openapi-fetch";

export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "https://cly-subastapp.fabriziob.com";

export const api = createClient<paths>({
  baseUrl: API_BASE,
  querySerializer: (query) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (key === 'pageable' && value && typeof value === 'object') {
        const pageable = value as Record<string, any>;
        if (pageable.page !== undefined) params.append('page', String(pageable.page));
        if (pageable.size !== undefined) params.append('size', String(pageable.size));
        if (Array.isArray(pageable.sort)) {
          pageable.sort.forEach(s => params.append('sort', String(s)));
        } else if (pageable.sort !== undefined) {
          params.append('sort', String(pageable.sort));
        }
      } else if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)));
        } else if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, String(value));
        }
      }
    }
    return params.toString();
  }
});

const TRACE_MAX_LEN = 200;

function truncateTrace(body: unknown): string {
  if (body === undefined) return "";
  const text = (typeof body === "string" ? body : JSON.stringify(body)).replace(/\s*\n\s*/g, "");
  return text.length > TRACE_MAX_LEN ? `${text.slice(0, TRACE_MAX_LEN)}…` : text;
}

// Logs every outgoing request, plus every non-2xx response and network failure, so API
// activity is visible in the console without each call site adding its own logging.
api.use({
  onRequest({ request }) {
    console.log(`[REQUEST] [${request.method}] ${request.url}`);
    return request;
  },
  async onResponse({ request, response }) {
    let body: unknown;
    try {
      body = await response.clone().json();
    } catch {
      try {
        body = await response.clone().text();
      } catch {
        body = undefined;
      }
    }
    console.log(`[RESPONSE] [${response.status}] ${request.method} ${request.url} ${truncateTrace(body)}`);

    if (!response.ok) {
      const label = response.status === 401 ? "401 Unauthorized" : `${response.status} ${response.statusText}`;
      console.log(`[error] [api] ${label} — ${request.method} ${request.url}`, truncateTrace(body));
    }
    return response;
  },
  onError({ request, error }) {
    console.log(`[error] [api] network error — ${request.method} ${request.url}`, truncateTrace(error instanceof Error ? error.message : error));
  },
});
