import "server-only";
import { cache } from "react";
import { promises as fs } from "fs";
import path from "path";
import type { MenuData, OrderLog, SiteData } from "./types";

const dataDir = path.join(process.cwd(), "data");

async function readJson<T>(filename: string): Promise<T> {
  const raw = await fs.readFile(path.join(dataDir, filename), "utf-8");
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Failed to parse ${filename} — the file may be corrupt`);
  }
}

// React.cache memoises per request so duplicate calls in the same render
// (e.g. generateMetadata + page component) only hit the filesystem once.
export const getMenuData = cache(async (): Promise<MenuData> => readJson("menu.json"));
export const getSiteData = cache(async (): Promise<SiteData> => readJson("site.json"));
export const getOrders = cache(async (): Promise<OrderLog> => {
  try {
    return await readJson<OrderLog>("orders.json");
  } catch {
    return { orders: [] };
  }
});

export async function appendOrder(order: OrderLog["orders"][number]): Promise<void> {
  const filePath = path.join(dataDir, "orders.json");
  const tmpPath = filePath + ".tmp";
  let log: OrderLog;
  try {
    log = await readJson<OrderLog>("orders.json");
  } catch {
    log = { orders: [] };
  }
  log.orders.push(order);
  await fs.writeFile(tmpPath, JSON.stringify(log, null, 2) + "\n", "utf-8");
  await fs.rename(tmpPath, filePath);
}
