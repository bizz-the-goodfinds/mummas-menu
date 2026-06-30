import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { MenuData, SiteData } from "./types";

const dataDir = path.join(process.cwd(), "data");

export async function getMenuData(): Promise<MenuData> {
  const raw = await fs.readFile(path.join(dataDir, "menu.json"), "utf-8");
  return JSON.parse(raw) as MenuData;
}

export async function getSiteData(): Promise<SiteData> {
  const raw = await fs.readFile(path.join(dataDir, "site.json"), "utf-8");
  return JSON.parse(raw) as SiteData;
}
