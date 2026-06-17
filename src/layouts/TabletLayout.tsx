/**
 * Tablet Layout Orchestrator - Level 10 Separate Setup
 * Full 2-column layout (no context panel or sliding right pane by default to guarantee touch density).
 */

import React from 'react';
import { useLayoutStore } from '../stores/layoutStore';

interface TabletLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  content: React.ReactNode;
}

export default function TabletLayout({ sidebar, header, content }: TabletLayoutProps) {
  const { currentTab } = useLayoutStore();
  const isPos = currentTab === 'pos-setup';

  return (
    <div id="tablet-layout-root" className="w-full h-screen overflow-hidden flex flex-col bg-neutral-100 font-sans antialiased text-neutral-900 select-none">
      {!isPos && header}
      <div className="flex-1 w-full flex overflow-hidden">
        {!isPos && sidebar}
        <main 
          className={`flex-1 overflow-y-auto bg-[#fafafa] select-none focus:outline-none transition-all ${
            isPos ? 'p-0' : 'p-5'
          }`}
        >
          <div className={`${isPos ? 'max-w-none w-full h-full' : 'max-w-4xl mx-auto'}`}>
            {content}
          </div>
        </main>
      </div>
    </div>
  );
}
