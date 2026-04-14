import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: { page: number; pages: number; total: number; limit: number };
  onPageChange?: (page: number) => void;
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  rowKey?: (row: T) => string;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
}

function SortIcon({ column, sortKey, sortDir }: { column: string; sortKey: string; sortDir: 'asc' | 'desc' | null }) {
  if (sortKey !== column) return <ChevronsUpDown size={12} className="opacity-30" />;
  return sortDir === 'asc'
    ? <ChevronUp size={12} className="text-accent" />
    : <ChevronDown size={12} className="text-accent" />;
}

export function DataTable<T extends Record<string, any>>({
  columns, data, isLoading, pagination, onPageChange, onSort,
  emptyMessage = 'No data found', emptyIcon, rowKey, onRowClick, stickyHeader
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  const skeletonRows = Array(pagination?.limit || 8).fill(0);

  return (
    <div className="space-y-3">
      <div className="table-container">
        <table>
          <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={col.sortable ? 'cursor-pointer select-none hover:text-text-primary transition-colors' : ''}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && <SortIcon column={col.key} sortKey={sortKey} sortDir={sortKey === col.key ? sortDir : null} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              skeletonRows.map((_, i) => (
                <tr key={i}>
                  {columns.map((col, j) => (
                    <td key={j}>
                      <div className="skeleton h-4 rounded" style={{ width: j === 0 ? '140px' : '80px' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    {emptyIcon && <div className="opacity-20">{emptyIcon}</div>}
                    <p className="text-text-secondary text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : data.map((row, i) => (
              <tr
                key={rowKey ? rowKey(row) : i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row, i) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-tertiary">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-1.5 rounded-lg border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let page = i + 1;
              if (pagination.pages > 5) {
                const start = Math.max(1, pagination.page - 2);
                page = Math.min(start + i, pagination.pages - 4 + i);
              }
              return (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    page === pagination.page
                      ? 'bg-accent text-white shadow-glow-sm'
                      : 'text-text-secondary hover:bg-white/5'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-1.5 rounded-lg border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
