import "server-only";
import { supabaseAdmin } from "./supabase";
import { logger } from "./logger";
import type { AdminMenuItem, ItemStatus, MenuCategory, MenuData, MenuItem } from "./types";

// Menu lives in two normalized tables (categories, menu_items) with soft
// deletes: rows are never removed by the admin UI, only stamped with
// deleted_at so they can be restored. Public readers see only visible,
// non-deleted rows; admin readers see everything.

const log = logger.child("menu-store");

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface ItemRow {
  id: string;
  category_id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  tags: string[];
  status: ItemStatus;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function rowToItem(row: ItemRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    description: row.description,
    image: row.image,
    tags: row.tags ?? [],
    isVisible: row.is_visible,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function rowToCategory(row: CategoryRow, items: MenuItem[]): MenuCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    emoji: row.emoji,
    isVisible: row.is_visible,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    items,
  };
}

async function fetchMenu(includeHidden: boolean): Promise<MenuData> {
  let catQuery = supabaseAdmin
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  let itemQuery = supabaseAdmin
    .from("menu_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!includeHidden) {
    catQuery = catQuery.eq("is_visible", true).is("deleted_at", null);
    itemQuery = itemQuery.eq("is_visible", true).is("deleted_at", null);
  }

  const [{ data: cats, error: catErr }, { data: items, error: itemErr }] = await Promise.all([
    catQuery,
    itemQuery,
  ]);
  if (catErr) throw new Error(`Failed to load categories: ${catErr.message}`);
  if (itemErr) throw new Error(`Failed to load menu items: ${itemErr.message}`);

  const itemsByCategory = new Map<string, MenuItem[]>();
  for (const row of (items ?? []) as ItemRow[]) {
    const list = itemsByCategory.get(row.category_id) ?? [];
    list.push(rowToItem(row));
    itemsByCategory.set(row.category_id, list);
  }

  return {
    categories: ((cats ?? []) as CategoryRow[]).map((c) =>
      rowToCategory(c, itemsByCategory.get(c.id) ?? []),
    ),
  };
}

/** Customer-facing menu: visible, non-deleted categories/items only. */
export const readPublicMenu = () => fetchMenu(false);

/** Admin menu: everything, including hidden and soft-deleted rows. */
export const readAdminMenu = () => fetchMenu(true);

/** Flat item list for the admin table (joined with category info). */
export async function readAdminItems(): Promise<AdminMenuItem[]> {
  const menu = await readAdminMenu();
  return menu.categories.flatMap((cat) =>
    cat.items.map((item, idx) => ({
      ...item,
      categoryId: cat.id!,
      categorySlug: cat.slug,
      categoryName: cat.name,
      categoryEmoji: cat.emoji,
      sortOrder: idx,
    })),
  );
}

/* ── Item CRUD ──────────────────────────────────────────────────────────── */

export interface ItemInput {
  id?: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  image: string;
  tags: string[];
  status: ItemStatus;
  isVisible: boolean;
  sortOrder?: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export async function createItem(input: ItemInput): Promise<MenuItem> {
  const id = input.id?.trim() || slugify(input.name) || crypto.randomUUID();
  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .insert({
      id,
      category_id: input.categoryId,
      name: input.name,
      price: input.price,
      description: input.description,
      image: input.image,
      tags: input.tags,
      status: input.status,
      is_visible: input.isVisible,
      sort_order: input.sortOrder ?? 0,
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to create item: ${error.message}`);
  log.info("item created", { id });
  return rowToItem(data as ItemRow);
}

export async function updateItem(
  id: string,
  patch: Partial<ItemInput> & { deletedAt?: string | null },
): Promise<MenuItem> {
  const row: Record<string, unknown> = {};
  if (patch.categoryId !== undefined) row.category_id = patch.categoryId;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.price !== undefined) row.price = patch.price;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.image !== undefined) row.image = patch.image;
  if (patch.tags !== undefined) row.tags = patch.tags;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.isVisible !== undefined) row.is_visible = patch.isVisible;
  if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder;
  if (patch.deletedAt !== undefined) row.deleted_at = patch.deletedAt;

  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update item ${id}: ${error.message}`);
  log.info("item updated", { id, fields: Object.keys(row) });
  return rowToItem(data as ItemRow);
}

export async function softDeleteItem(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("menu_items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Failed to delete item ${id}: ${error.message}`);
  log.info("item soft-deleted", { id });
}

/* ── Category CRUD ──────────────────────────────────────────────────────── */

export interface CategoryInput {
  slug?: string;
  name: string;
  emoji: string;
  isVisible: boolean;
  sortOrder?: number;
}

export async function createCategory(input: CategoryInput): Promise<MenuCategory> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({
      slug: input.slug?.trim() || slugify(input.name),
      name: input.name,
      emoji: input.emoji,
      is_visible: input.isVisible,
      sort_order: input.sortOrder ?? 0,
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to create category: ${error.message}`);
  log.info("category created", { id: (data as CategoryRow).id });
  return rowToCategory(data as CategoryRow, []);
}

export async function updateCategory(
  id: string,
  patch: Partial<CategoryInput> & { deletedAt?: string | null },
): Promise<MenuCategory> {
  const row: Record<string, unknown> = {};
  if (patch.slug !== undefined) row.slug = patch.slug;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.emoji !== undefined) row.emoji = patch.emoji;
  if (patch.isVisible !== undefined) row.is_visible = patch.isVisible;
  if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder;
  if (patch.deletedAt !== undefined) row.deleted_at = patch.deletedAt;

  const { data, error } = await supabaseAdmin
    .from("categories")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update category ${id}: ${error.message}`);
  log.info("category updated", { id, fields: Object.keys(row) });
  return rowToCategory(data as CategoryRow, []);
}

export async function softDeleteCategory(id: string): Promise<void> {
  const now = new Date().toISOString();
  // Items go down with their category so they don't strand in public queries.
  const [{ error: itemErr }, { error: catErr }] = await Promise.all([
    supabaseAdmin.from("menu_items").update({ deleted_at: now }).eq("category_id", id),
    supabaseAdmin.from("categories").update({ deleted_at: now }).eq("id", id),
  ]);
  if (itemErr || catErr) {
    throw new Error(`Failed to delete category ${id}: ${(itemErr ?? catErr)!.message}`);
  }
  log.info("category soft-deleted (with items)", { id });
}
