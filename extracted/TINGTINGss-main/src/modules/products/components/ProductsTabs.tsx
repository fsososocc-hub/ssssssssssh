import React from 'react';
import { Box } from 'lucide-react';

interface ProductsTabsProps {
  productFilter: string;
  setProductFilter: (val: any) => void;
  filteredCount: number;
}

export default function ProductsTabs({ productFilter, setProductFilter, filteredCount }: ProductsTabsProps) {
  const tabs = [
    { id: 'All', label: '全部产品' },
    { id: 'active', label: '上架中' },
    { id: 'draft', label: '草稿箱' },
    { id: 'archived', label: '已下架' }
  ];

  return (
    <div className="flex bg-white border border-neutral-200 rounded-lg p-1.5 items-center justify-between shadow-xs select-none">
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const active = productFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setProductFilter(tab.id)}
              className={`px-3 py-1 font-mono text-[10px] font-bold rounded uppercase transition-colors ${
                active
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-550 hover:text-black hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center space-x-1 font-mono text-[9px] text-neutral-400">
        <Box className="w-3 h-3 text-neutral-500" />
        <span>总项: {filteredCount} Pcs</span>
      </div>
    </div>
  );
}
