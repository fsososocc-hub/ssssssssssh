/**
 * Desktop Layout Orchestrator - Level 10 Separate Setup
 * Full 3-column desktop layout. Free of business logic.
 */

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useLayoutStore } from '../stores/layoutStore';
import { usePanelStore } from '../stores/panelStore';
import { useShopStore } from '../stores/shopStore';

interface DesktopLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  content: React.ReactNode;
  contextPanel: React.ReactNode;
}

export default function DesktopLayout({ sidebar, header, content, contextPanel }: DesktopLayoutProps) {
  return (
    <div id="desktop-layout-root" className="w-full h-screen overflow-hidden flex flex-col bg-neutral-100 font-sans antialiased text-neutral-900 select-none">
      {/* GLOBAL HEADER BAR */}
      {header}

      {/* THREE COLUMN WORKSPACE */}
      <div className="flex-1 w-full flex overflow-hidden">
        {/* COLUMN 1 — Left Navigation sidebar */}
        {sidebar}

        {/* COLUMN 2 — Main Area work desk */}
        <main 
          id="main-area-scroller" 
          className="flex-1 overflow-y-auto bg-[#fafafa] p-6 lg:p-8 select-none focus:outline-none scrollbar-thin scrollbar-thumb-neutral-300"
        >
          <div className="max-w-5xl mx-auto">
            {content}
          </div>
        </main>

        {/* COLUMN 3 — Dynamic right preview context slider */}
        {contextPanel}
      </div>
    </div>
  );
}
