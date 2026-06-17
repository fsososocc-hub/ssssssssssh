/**
 * Professional Core Mobile Layout - Level 10 Separate Setup
 * Full-fidelity Mobile-First Admin HUD.
 */

import React, { useState } from 'react';
import { 
  Bell, Search, Sparkles, HelpCircle, LayoutGrid, X, Percent, BarChart3, Settings, Megaphone, Globe 
} from 'lucide-react';
import BottomTabs from './BottomTabs';
import { usePanelStore } from '../stores/panelStore';
import { useShopStore } from '../stores/shopStore';
import { translate } from '../utils/i18n';

interface MobileLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  content: React.ReactNode;
  contextPanel: React.ReactNode;
}

export default function MobileLayout({ currentTab, onSelectTab, content, contextPanel }: MobileLayoutProps) {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [searchToggle, setSearchToggle] = useState(false);
  const { togglePreview } = usePanelStore();
  const { settings } = useShopStore();

  const isPos = currentTab === 'pos-setup';

  return (
    <div id="mobile-layout-root" className="flex flex-col h-screen text-black select-none bg-neutral-50 relative max-w-md mx-auto border-x border-neutral-200 shadow-xl overflow-hidden font-sans">
      
      {/* 🔝 TOP NAVIGATION HEADER */}
      {!isPos && (
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200 shrink-0 sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-black text-white flex items-center justify-center font-bold text-[11px] font-mono leading-none">
              AN
            </div>
            <span className="font-bold text-xs font-mono lowercase tracking-tight">atelier.noir</span>
          </div>

          {/* Action icons */}
          <div className="flex items-center space-x-2.5 text-neutral-600">
            <button onClick={() => setSearchToggle(!searchToggle)} className="p-1 hover:text-black cursor-pointer">
              <Search className="w-4 h-4" />
            </button>
            
            {/* Sidekick AI Trigger */}
            <button 
              onClick={() => togglePreview('sidekick')} 
              className="p-1 relative rounded hover:text-black cursor-pointer"
              title="AI 智能助手"
            >
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
            </button>

            {/* Help Hub Doc Trigger */}
            <button 
              onClick={() => togglePreview('help')} 
              className="p-1 rounded hover:text-black cursor-pointer"
              title="帮助中心"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Apps Embed Trigger */}
            <button 
              onClick={() => togglePreview('app-embed')} 
              className="p-1 rounded hover:text-black cursor-pointer"
              title="应用集成"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button className="p-1 hover:text-black cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* SEARCH OVERLAY BAR IF ACTIVE */}
      {!isPos && searchToggle && (
        <div className="p-2 border-b border-neutral-200 bg-white shrink-0 flex items-center space-x-2 animate-fadeIn">
          <input
            type="text"
            placeholder="搜索商品、订单、客户档案..."
            className="flex-1 bg-neutral-50 border border-neutral-250 px-3 py-1.5 rounded text-xs text-black focus:outline-none focus:ring-1 focus:ring-black font-sans"
          />
          <button onClick={() => setSearchToggle(false)} className="text-xs font-semibold text-neutral-400 hover:text-black cursor-pointer">
            取消
          </button>
        </div>
      )}

      {/* 📋 SCROLL CONTENT CONTAINER */}
      <main className={`flex-1 overflow-y-auto transition-all ${isPos ? 'p-0 space-y-0' : 'p-4 space-y-4'} bg-neutral-50`}>
        {content}
      </main>

      {/* CONTEXT DRAWER OVERLAY ON MOBILE */}
      {contextPanel && (
        <div className="absolute inset-x-0 bottom-0 top-14 bg-black/45 z-40 animate-fadeIn overflow-hidden flex flex-col justify-end">
          <div className="bg-white border-t border-neutral-200 rounded-t-2xl overflow-hidden flex flex-col h-[75vh] shadow-2xl">
            {contextPanel}
          </div>
        </div>
      )}

      {/* 📋 BOTTOM MOBILE TABS */}
      <BottomTabs 
        activeTab={currentTab} 
        onTabChange={onSelectTab} 
        onOpenMore={() => setIsMoreMenuOpen(true)} 
        settings={settings}
      />

      {/* MULTI-MORE SHEET MODAL */}
      {isMoreMenuOpen && (
        <div className="absolute inset-0 bg-black/40 z-30 flex flex-col justify-end p-2 select-none animate-fadeIn">
          <div className="bg-white rounded-xl overflow-hidden p-4 space-y-4 max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <h3 className="font-bold text-xs uppercase font-mono tracking-wider">{translate('menu_options', settings)}</h3>
              <button 
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded bg-neutral-100 text-neutral-500 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pb-4 overflow-y-auto">
              {[
                { label: translate('discounts', settings), icon: Percent, action: () => { onSelectTab('discounts'); setIsMoreMenuOpen(false); } },
                { label: translate('analytics', settings), icon: BarChart3, action: () => { onSelectTab('analytics'); setIsMoreMenuOpen(false); } },
                { label: translate('settings', settings), icon: Settings, action: () => { onSelectTab('settings'); setIsMoreMenuOpen(false); } },
                { label: translate('marketing', settings), icon: Megaphone, action: () => { onSelectTab('marketing'); setIsMoreMenuOpen(false); } },
                { label: translate('markets', settings), icon: Globe, action: () => { onSelectTab('markets'); setIsMoreMenuOpen(false); } }
              ].map((it, idx) => {
                const IconComp = it.icon;
                return (
                  <button 
                    key={idx}
                    onClick={it.action}
                    className="p-3 bg-neutral-50 border border-neutral-200.5.rounded flex flex-col items-start space-y-2 hover:bg-neutral-100 transition-all rounded-lg active:scale-95 text-left cursor-pointer"
                  >
                    <IconComp className="w-5 h-5 text-neutral-700" />
                    <span className="text-[10px] font-semibold text-neutral-800 leading-tight block">{it.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
