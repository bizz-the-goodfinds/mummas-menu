"use client";

/**
 * Generic admin table with search, column sorting, and pagination.
 * Custom filters (category/status dropdowns etc.) live in the parent —
 * pass the already-filtered rows in.
 */

import { useMemo, useState } from "react";
import { TextInput } from "./ui";

export interface Column<Row> {
  key: string;
  label: string;
  sortable?: boolean;
  /** Value used for sorting; defaults to render output if it's a primitive. */
  sortValue?: (row: Row) => string | number;
  render: (row: Row) => React.ReactNode;
  className?: string;
}

interface DataTableProps<Row> {
  rows: Row[];
  columns: Column<Row>[];
  rowKey: (row: Row) => string;
  /** Fields to match against the search box (case-insensitive). */
  searchText?: (row: Row) => string;
  searchPlaceholder?: string;
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: Row) => void;
  /** Extra controls rendered next to the search box (filter dropdowns etc.) */
  toolbar?: React.ReactNode;
}

export function DataTable<Row>({
  rows,
  columns,
  rowKey,
  searchText,
  searchPlaceholder = "Search…",
  pageSize = 10,
  emptyMessage = "Nothing here yet.",
  onRowClick,
  toolbar,
}: DataTableProps<Row>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const processed = useMemo(() => {
    let out = rows;
    const q = query.trim().toLowerCase();
    if (q && searchText) out = out.filter((r) => searchText(r).toLowerCase().includes(q));

    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.sortValue) {
        const sv = col.sortValue;
        out = [...out].sort((a, b) => {
          const va = sv(a);
          const vb = sv(b);
          const cmp =
            typeof va === "number" && typeof vb === "number"
              ? va - vb
              : String(va).localeCompare(String(vb));
          return sortDir === "asc" ? cmp : -cmp;
        });
      }
    }
    return out;
  }, [rows, query, sortKey, sortDir, columns, searchText]);

  const pageCount = Math.max(1, Math.ceil(processed.length / pageSize));
  const clampedPage = Math.min(page, pageCount - 1);
  const pageRows = processed.slice(clampedPage * pageSize, (clampedPage + 1) * pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {searchText && (
          <div className="w-full sm:max-w-[260px]">
            <TextInput
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              aria-label="Search table"
            />
          </div>
        )}
        {toolbar}
        <span className="ml-auto text-[12px] text-neutral-500">
          {processed.length} {processed.length === 1 ? "row" : "rows"}
        </span>
      </div>

      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-neutral-200/70">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-[11px] font-bold tracking-wider text-neutral-500 uppercase ${col.className ?? ""}`}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="hover:text-brand-red inline-flex items-center gap-1"
                    >
                      {col.label}
                      <span className="text-[9px]">
                        {sortKey === col.key ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-[13px] text-neutral-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-neutral-100/80 last:border-0 ${
                    onRowClick ? "cursor-pointer transition-colors hover:bg-white/60" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-[13.5px] ${col.className ?? ""}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-neutral-500">
            Page {clampedPage + 1} of {pageCount}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={clampedPage === 0}
              className="glass rounded-lg px-3 py-1.5 text-[13px] font-semibold disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={clampedPage >= pageCount - 1}
              className="glass rounded-lg px-3 py-1.5 text-[13px] font-semibold disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
