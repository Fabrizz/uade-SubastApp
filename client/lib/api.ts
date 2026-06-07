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

