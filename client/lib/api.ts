import type { paths } from "@/types/api";
import createClient from "openapi-fetch";

export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "https://cly-subastapp.fabriziob.com";

export const api = createClient<paths>({ baseUrl: API_BASE });

