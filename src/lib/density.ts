import { cookies } from "next/headers";

export type Density = "comfortable" | "compact";
export const DENSITY_COOKIE = "rcv-density";

/** The visitor's chosen card layout (saved in a cookie so the server renders it right away). Compact by default. */
export async function getDensity(): Promise<Density> {
  const value = (await cookies()).get(DENSITY_COOKIE)?.value;
  return value === "comfortable" ? "comfortable" : "compact";
}
