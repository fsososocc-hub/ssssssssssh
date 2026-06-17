/**
 * Ultimate Modular Header - Level 10 Layout Segment
 * Pure layout orchestration of Top Search, Sidekick, Help, and Embedded triggers.
 */

import React from 'react';
import { Search, Sparkles, HelpCircle, LayoutGrid } from 'lucide-react';
import { usePanelStore } from '../stores/panelStore';

export default function Header() {
  const { selectedPreview, togglePreview } = usePanelStore();

  return (
    <header className="h-14 w-full bg-white border-b border-neutral-200 px-5 flex items-center justify-between shrink-0 z-20 shadow-xs">
      <div className="flex items-center space-x-3">
        <svg className="w-5 h-5 fill-neutral-900" viewBox="0 0 24 24">
          <path d="M19.5 2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15.5c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 14H6.5v-2h10v2zm0-4H6.5v-2h10v2zm0-4H6.5V6h10v2z"/>
        </svg>
        <span className="font-bold text-xs font-mono uppercase tracking-widest text-neutral-800">
          Atelier Noir Merchant Admin
        </span>
      </div>

      {/* Dynamic header toggles */}
      <div className="flex items-center space-x-3 text-neutral-600">
        <div className="relative pr-2 hidden sm:block">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
          <input 
            type="text" 
            placeholder="Search products, analytics, help..."
            className="w-56 bg-neutral-50 text-[10px] border border-neutral-250 rounded px-2.5 py-1.5 pl-8 focus:outline-none focus:ring-1 focus:ring-black font-mono transition-shadow hover:shadow-2xs"
          />
        </div>

        <div className="flex items-center space-x-1 border border-neutral-200 p-1 rounded-lg bg-neutral-50 shadow-xs">
          {/* Sidekick Copilot */}
          <button 
            id="sidekick-copilot-btn"
            onClick={() => togglePreview('sidekick')}
            className={`flex items-center space-x-1.5 py-1 px-2.5 rounded text-[10px] transition-colors font-semibold cursor-pointer ${
              selectedPreview?.type === 'sidekick' 
                ? 'bg-neutral-900 text-white shadow-sm' 
                : 'hover:bg-neutral-200 text-neutral-650'
            }`}
          >
            <Sparkles className={`w-3 h-3 ${selectedPreview?.type === 'sidekick' ? 'text-indigo-300 animate-pulse' : ''}`} />
            <span className="font-mono text-[9px] uppercase font-bold">Sidekick</span>
          </button>

          {/* Help Docs */}
          <button 
            id="help-docs-btn"
            onClick={() => togglePreview('help')}
            className={`flex items-center space-x-1.5 py-1 px-2.5 rounded text-[10px] transition-colors font-semibold cursor-pointer ${
              selectedPreview?.type === 'help' 
                ? 'bg-neutral-900 text-white shadow-sm' 
                : 'hover:bg-neutral-200 text-neutral-650'
            }`}
          >
            <HelpCircle className="w-3 h-3" />
            <span className="font-mono text-[9px] uppercase font-bold">Help Hub</span>
          </button>

          {/* Embed widgets */}
          <button 
            id="app-embeds-btn"
            onClick={() => togglePreview('app-embed')}
            className={`flex items-center space-x-1.5 py-1 px-2.5 rounded text-[10px] transition-colors font-semibold cursor-pointer ${
              selectedPreview?.type === 'app-embed' 
                ? 'bg-neutral-900 text-white shadow-white/5 shadow-xs' 
                : 'hover:bg-neutral-200 text-neutral-650'
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            <span className="font-mono text-[9px] uppercase font-bold">Embeds</span>
          </button>
        </div>
      </div>
    </header>
  );
}
