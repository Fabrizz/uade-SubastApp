import type { paths } from "@/types/api";
import createClient from "openapi-fetch";

export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4002";

export const api = createClient<paths>({ baseUrl: API_BASE });

