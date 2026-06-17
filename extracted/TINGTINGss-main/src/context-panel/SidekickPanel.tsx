import React from 'react';
import { Minimize2, Maximize2 } from 'lucide-react';
import SidekickAI from '../components/SidekickAI';
import { Product, Order, Discount } from '../types';

interface SidekickPanelProps {
  products: Product[];
  orders: Order[];
  discounts: Discount[];
  onClose: () => void;
  isMaximized: boolean;
  setIsMaximized: (val: boolean) => void;
}

export default function SidekickPanel({
  products,
  orders,
  discounts,
  onClose,
  isMaximized,
  setIsMaximized,
}: SidekickPanelProps) {
  return (
    <div className="flex flex-col h-full relative">
      {/* Maximize Switch in Header layer wrapper */}
      <div className="absolute right-14 top-3 z-30 flex items-center space-x-1">
        <button 
          onClick={() => setIsMaximized(!isMaximized)}
          title={isMaximized ? "Collapse wide view" : "Expand to wide view"}
          className="p-1 hover:bg-[#ebebeb] rounded text-[#616161] hover:text-[#1a1a1a] transition-all cursor-pointer"
        >
          {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
      <SidekickAI 
        products={products}
        orders={orders}
        discounts={discounts}
        onClose={onClose}
      />
    </div>
  );
}
