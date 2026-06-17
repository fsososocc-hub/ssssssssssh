/**
 * Dynamic DataGrid - Level 10 Dynamic Component Segment
 * Formulates high-fidelity lists and tables from schema column definitions automatically.
 * Supports sorting, responsive alignments, live filtering, and detail drawers.
 */

import React, { useState, useMemo } from 'react';
import { SchemaColumnMeta } from '../../schemas';
import { Search, ArrowUpDown, ChevronDown, RefreshCw, BarChart } from 'lucide-react';
import { Badge } from './Badge';

interface DataGridProps {
  columns: SchemaColumnMeta[];
  records: any[];
  searchPlaceholder?: string;
  onRowClick?: (record: any) => void;
  currencySymbol?: string;
  defaultSortKey?: string;
}

export default function DataGrid({
  columns,
  records,
  searchPlaceholder = '对当前列表进行对账搜索...',
  onRowClick,
  currencySymbol = '€',
  defaultSortKey
}: DataGridProps) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<string>(defaultSortKey || columns[0]?.key || '');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Cross-column high-fidelity filter helper
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matcher = query.toLowerCase();
      if (!matcher) return true;
      
      return Object.keys(rec).some((k) => {
        const val = rec[k];
        if (val === null || val === undefined) return false;
        
        // Deep search within item lists if needed
        if (Array.isArray(val)) {
          return val.some(item => String(item).toLowerCase().includes(matcher));
        }
        if (typeof val === 'object') {
          return Object.values(val).join(' ').toLowerCase().includes(matcher);
        }
        return String(val).toLowerCase().includes(matcher);
      });
    });
  }, [records, query]);

  // Sorting Routine
  const sortedRecords = useMemo(() => {
    if (!sortKey) return filteredRecords;

    const sorted = [...filteredRecords];
    sorted.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      // Handle strings
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      // Handle numbers/booleans
      return sortAsc ? (aVal > bVal ? 1 : -1) : (bVal > aVal ? 1 : -1);
    });

    return sorted;
  }, [filteredRecords, sortKey, sortAsc]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const renderCellContent = (record: any, col: SchemaColumnMeta) => {
    const val = record[col.key];

    if (val === undefined || val === null) {
      return <span className="text-neutral-300">-</span>;
    }

    switch (col.type) {
      case 'badge':
        const badgeColors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
          active: 'success',
          paid: 'success',
          fulfilled: 'success',
          cleared: 'success',
          published: 'success',
          improved: 'success',
          
          pending: 'warning',
          draft: 'warning',
          scheduled: 'warning',
          unfulfilled: 'warning',
          
          refunded: 'neutral',
          expired: 'neutral',
          archived: 'neutral',
          paused: 'neutral'
        };
        const variant = badgeColors[String(val).toLowerCase()] || 'neutral';
        return <Badge variant={variant}>{String(val).toUpperCase()}</Badge>;

      case 'currency':
        return <span className="font-mono font-bold text-neutral-900">{currencySymbol}{Number(val).toFixed(2)}</span>;

      case 'date':
        return <span className="font-mono text-[10px] text-neutral-500">{new Date(val).toLocaleDateString()}</span>;

      case 'number':
        return <span className="font-mono font-semibold text-neutral-800">{val}</span>;

      default:
        return <span className="text-neutral-700">{String(val)}</span>;
    }
  };

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* Search and control bar */}
      <div className="flex bg-white border border-neutral-200 rounded-lg p-2 items-center justify-between shadow-xs select-none">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 pl-9 text-xs focus:ring-1 focus:ring-black focus:outline-none font-sans"
          />
        </div>
        <div className="flex items-center space-x-1.5 text-[9px] font-mono text-neutral-400">
          <BarChart className="w-2.5 h-2.5 text-[#111]" />
          <span>匹配数: {sortedRecords.length} / {records.length} 个基项</span>
        </div>
      </div>

      {/* Structured data grid table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
        {sortedRecords.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <span className="text-3xl">🗂️</span>
            <p className="text-xs font-mono text-neutral-400 uppercase">没有检索到匹配的数据项 (STANDBY_EMPTY_STATE)</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px] layout-fixed">
              <thead>
                <tr className="bg-neutral-50/60 border-b border-neutral-200 font-mono text-[9px] uppercase tracking-wider text-neutral-400">
                  {columns.map((col) => (
                    <th key={col.key} className="p-3">
                      {col.sortable ? (
                        <button
                          onClick={() => toggleSort(col.key)}
                          className="flex items-center space-x-1 font-bold tracking-wider uppercase text-neutral-400 hover:text-black transition-colors"
                        >
                          <span>{col.label}</span>
                          <ArrowUpDown className="w-2.5 h-2.5 text-neutral-400 hover:text-black" />
                        </button>
                      ) : (
                        <span className="font-bold tracking-wider uppercase">{col.label}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee]">
                {sortedRecords.map((record, index) => (
                  <tr
                    key={record.id || index}
                    onClick={() => onRowClick && onRowClick(record)}
                    className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="p-3 align-middle">
                        {renderCellContent(record, col)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
