import type { paths } from "@/types/api";
import createClient from "openapi-fetch";

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4002";

export const api = createClient<paths>({ baseUrl });

