/**
 * DataTable.tsx
 * Generic sortable, filterable table component for admin data views.
 */

import React, { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyIcon?: string;
  emptyText?: string;
  emptySubtext?: string;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
}

type SortDir = "asc" | "desc" | null;

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyIcon = "🗒️",
  emptyText = "No data found",
  emptySubtext = "Adjust your filters to see results.",
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey)
      return <ChevronsUpDown size={13} className="text-gray-300" />;
    if (sortDir === "asc") return <ChevronUp size={13} className="text-[#107acc]" />;
    return <ChevronDown size={13} className="text-[#107acc]" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-11 bg-gray-100 rounded-xl animate-pulse"
              style={{ opacity: 1 - i * 0.12 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100" style={{ background: "#f9fbf9" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap ${
                    col.sortable ? "cursor-pointer select-none hover:text-gray-600" : ""
                  }`}
                  style={col.width ? { width: col.width } : {}}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon colKey={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="text-4xl mb-3">{emptyIcon}</div>
                  <p className="text-gray-700 font-bold text-sm">{emptyText}</p>
                  <p className="text-gray-400 text-xs mt-1">{emptySubtext}</p>
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr
                  key={rowKey(row)}
                  className={`transition-colors ${
                    onRowClick
                      ? "cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                      : "hover:bg-gray-50/60"
                  }`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700 align-middle">
                      {col.render
                        ? col.render(row, index)
                        : (row[col.key] as React.ReactNode) ?? <span className="text-gray-300">—</span>}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer row count */}
      {sortedData.length > 0 && (
        <div className="px-4 py-2.5 border-t border-gray-50 flex items-center justify-between">
          <p className="text-[11px] text-gray-400 font-medium">
            {sortedData.length} record{sortedData.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
