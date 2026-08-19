import { request } from "./client";
import { statsSchema, type Stats } from "./schemas";

export async function getStats(): Promise<Stats> {
  return request(statsSchema, { url: "/stats", method: "GET" });
}
