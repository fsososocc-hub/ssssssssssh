/**
 * Ultimate Modular Sidebar - Level 10 Layout Segment
 * Pure layout orchestration of Left-most collapsible domain rail.
 */

import React, { useState } from 'react';
import { 
  Home, ShoppingBag, Package, Users, Megaphone, Percent, 
  FileText, Globe, Coins, BarChart3, Monitor, Store, Bot, Settings, 
  ChevronDown, ChevronRight, Plus, Check, PanelLeftClose, PanelLeft, LayoutGrid, CreditCard
} from 'lucide-react';
import { StoreSettings } from '../types';
import { translate } from '../utils/i18n';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  settings: StoreSettings;
  onOpenSettings: () => void;
}

export default function Sidebar({ currentTab, onSelectTab, settings, onOpenSettings }: SidebarProps) {
  // Collapse state for screen adaptions
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Store switcher controls
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [mockStores, setMockStores] = useState<string[]>([
    'Atelier Noir Store',
    'Paris Showroom Outlet',
    'Tokyo Flagship Boutique',
    'West Logistics Center'
  ]);
  const [selectedStore, setSelectedStore] = useState<string>('Atelier Noir Store');

  // Sub menu accordion flags
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    orders: true,
    products: true,
    customers: false,
    marketing: false,
    content: false,
    financials: false,
    analytics: false,
  });

  const toggleSubMenu = (menuKey: string) => {
    setOpenSubMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  const handleStoreChange = (storeName: string) => {
    setSelectedStore(storeName);
    setStoreDropdownOpen(false);
  };

  const handleCreateNewStore = () => {
    const freshName = prompt("Enter Name of the custom new Store atelier:", "Milano Galleria");
    if (freshName) {
      setMockStores(prev => [...prev, `${freshName} Outlet`]);
      setSelectedStore(`${freshName} Outlet`);
    }
    setStoreDropdownOpen(false);
  };

  const getMenuClass = (tabId: string) => {
    const isActive = currentTab === tabId;
    if (isCollapsed) {
      return `flex items-center justify-center p-2 rounded-lg transition-all duration-150 relative group cursor-pointer ${
        isActive 
          ? 'bg-neutral-800 text-white shadow-xs' 
          : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
      }`;
    }
    return `flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg transition-all duration-150 group cursor-pointer ${
      isActive 
        ? 'bg-neutral-800 text-white font-semibold' 
        : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
    }`;
  };

  const getSubMenuClass = (tabId: string) => {
    const isActive = currentTab === tabId;
    return `flex items-center justify-between w-full pl-8 pr-3 py-1.5 text-[11px] transition-all duration-150 cursor-pointer border-l-2 ${
      isActive 
        ? 'bg-neutral-800/80 text-white font-bold border-neutral-200' 
        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white border-transparent'
    }`;
  };

  return (
    <aside 
      className={`h-full flex flex-col bg-[#111111] select-none text-white z-20 font-sans transition-all duration-300 border-r border-neutral-800 shadow-lg ${
        isCollapsed ? 'w-16' : 'w-[220px]'
      }`}
    >
      {/* STORE SWITCHER ACCORDION */}
      <div className="relative p-3.5 border-b border-neutral-800 shrink-0">
        <div className="flex items-center justify-between">
          <button 
            id="store-switcher-toggle"
            onClick={() => !isCollapsed && setStoreDropdownOpen(!storeDropdownOpen)}
            className="flex items-center space-x-2 text-left cursor-pointer focus:outline-none transition-opacity hover:opacity-90 max-w-[150px]"
          >
            <div className="w-7 h-7 rounded bg-white text-black font-extrabold text-xs flex items-center justify-center shrink-0 uppercase">
              {selectedStore.substring(0, 1)}
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h2 className="text-xs font-bold leading-tight line-clamp-1">{selectedStore}</h2>
                <span className="text-[9px] text-neutral-400 font-mono block">{translate('merchant_suffix', settings)}</span>
              </div>
            )}
          </button>

          <button 
            id="sidebar-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title={isCollapsed ? "Expand side menu" : "Collapse side menu"}
          >
            {isCollapsed ? <PanelLeft className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
          </button>
        </div>

        {storeDropdownOpen && !isCollapsed && (
          <div className="absolute top-13 left-3 right-3 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl py-1.5 z-40 text-xs">
            <span className="block px-3 py-1 text-[9px] text-neutral-400 uppercase tracking-wider font-mono">{translate('store_node', settings)}</span>
            <div className="px-3 py-1.5 bg-neutral-800 flex items-center justify-between text-neutral-200">
              <span className="font-semibold">{selectedStore}</span>
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            </div>

            <div className="h-[1px] bg-neutral-800 my-1"></div>
            <span className="block px-3 py-1 text-[9px] text-neutral-400 uppercase tracking-wider font-mono">{translate('switch_outlet', settings)}</span>
            <div className="max-h-24 overflow-y-auto">
              {mockStores.filter(s => s !== selectedStore).map((st, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStoreChange(st)}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 text-neutral-300 transition-colors cursor-pointer"
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="h-[1px] bg-neutral-800 my-1"></div>
            <button
              onClick={handleCreateNewStore}
              className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 text-indigo-400 flex items-center space-x-1 transition-colors font-medium cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{translate('create_outlet', settings)}</span>
            </button>
          </div>
        )}
      </div>

      {/* NAVIGATION SECTIONS */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin scrollbar-thumb-neutral-800">
        
        {/* HOME VIEW */}
        <button
          onClick={() => onSelectTab('home')}
          className={getMenuClass('home')}
        >
          <div className="flex items-center space-x-3">
            <Home className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span className="font-medium text-xs">{translate('home', settings)}</span>}
          </div>
          {isCollapsed && (
            <div className="absolute left-14 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {translate('home', settings)}
            </div>
          )}
        </button>

        {/* ORDERS GROUPS */}
        <div>
          {isCollapsed ? (
            <button 
              onClick={() => onSelectTab('orders')} 
              className={getMenuClass('orders')}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <div className="absolute left-14 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {translate('orders', settings)}
              </div>
            </button>
          ) : (
            <div>
              <button
                onClick={() => toggleSubMenu('orders')}
                className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg transition-all text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer ${
                  currentTab.includes('order') || currentTab === 'drafts' || currentTab === 'abandoned' ? 'text-white font-bold' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="w-3.5 h-3.5 text-neutral-300" />
                  <span>{translate('orders', settings)}</span>
                </div>
                {openSubMenus.orders ? <ChevronDown className="w-3.5 h-3.5 text-neutral-550" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-550" />}
              </button>
              {openSubMenus.orders && (
                <div className="mt-1 space-y-0.5 border-l border-neutral-800 ml-5.5">
                  <button onClick={() => onSelectTab('orders')} className={getSubMenuClass('orders')}>
                    <span>{translate('all_orders', settings)}</span>
                  </button>
                  <button onClick={() => onSelectTab('drafts')} className={getSubMenuClass('drafts')}>
                    <span>{translate('draft_orders', settings)}</span>
                  </button>
                  <button onClick={() => onSelectTab('abandoned')} className={getSubMenuClass('abandoned')}>
                    <span>{translate('abandoned', settings)}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PRODUCTS GROUP */}
        <div>
          {isCollapsed ? (
            <button 
              onClick={() => onSelectTab('products')} 
              className={getMenuClass('products')}
            >
              <Package className="w-3.5 h-3.5" />
              <div className="absolute left-14 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {translate('products', settings)}
              </div>
            </button>
          ) : (
            <div>
              <button
                onClick={() => toggleSubMenu('products')}
                className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg transition-all text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer ${
                  currentTab.includes('product') || currentTab === 'inventory' || currentTab === 'collections' ? 'text-white font-bold' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Package className="w-3.5 h-3.5 text-neutral-300" />
                  <span>{translate('products', settings)}</span>
                </div>
                {openSubMenus.products ? <ChevronDown className="w-3.5 h-3.5 text-neutral-550" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-550" />}
              </button>
              {openSubMenus.products && (
                <div className="mt-1 space-y-0.5 border-l border-neutral-800 ml-5.5">
                  <button onClick={() => onSelectTab('products')} className={getSubMenuClass('products')}>
                    <span>{translate('product_catalog', settings)}</span>
                  </button>
                  <button onClick={() => onSelectTab('inventory')} className={getSubMenuClass('inventory')}>
                    <span>{translate('inventory', settings)}</span>
                  </button>
                  <button onClick={() => onSelectTab('collections')} className={getSubMenuClass('collections')}>
                    <span>{translate('collections', settings)}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CUSTOMERS GROUP */}
        <div>
          {isCollapsed ? (
            <button 
              onClick={() => onSelectTab('customers')} 
              className={getMenuClass('customers')}
            >
              <Users className="w-3.5 h-3.5" />
              <div className="absolute left-14 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {translate('customers', settings)}
              </div>
            </button>
          ) : (
            <div>
              <button
                onClick={() => toggleSubMenu('customers')}
                className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer ${
                  currentTab === 'customers' || currentTab === 'segments' ? 'text-white font-bold' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-3.5 h-3.5" />
                  <span>{translate('customers', settings)}</span>
                </div>
                {openSubMenus.customers ? <ChevronDown className="w-3.5 h-3.5 text-neutral-550" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-550" />}
              </button>
              {openSubMenus.customers && (
                <div className="mt-1 space-y-0.5 border-l border-neutral-800 ml-5.5">
                  <button onClick={() => onSelectTab('customers')} className={getSubMenuClass('customers')}>
                    <span>{translate('customers_list', settings)}</span>
                  </button>
                  <button onClick={() => onSelectTab('segments')} className={getSubMenuClass('segments')}>
                    <span>{translate('segments', settings)}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MARKETING CORNER */}
        <div>
          {isCollapsed ? (
            <button 
              onClick={() => onSelectTab('marketing')} 
              className={getMenuClass('marketing')}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <div className="absolute left-14 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {translate('marketing', settings)}
              </div>
            </button>
          ) : (
            <div>
              <button
                onClick={() => toggleSubMenu('marketing')}
                className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer ${
                  currentTab === 'marketing' || currentTab === 'automations' ? 'text-white font-bold' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>{translate('marketing', settings)}</span>
                </div>
                {openSubMenus.marketing ? <ChevronDown className="w-3.5 h-3.5 text-neutral-550" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-550" />}
              </button>
              {openSubMenus.marketing && (
                <div className="mt-1 space-y-0.5 border-l border-neutral-800 ml-5.5">
                  <button onClick={() => onSelectTab('marketing')} className={getSubMenuClass('marketing')}>
                    <span>{translate('campaigns', settings)}</span>
                  </button>
                  <button onClick={() => onSelectTab('automations')} className={getSubMenuClass('automations')}>
                    <span>{translate('automations', settings)}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DISCOUNTS */}
        <button
          onClick={() => onSelectTab('discounts')}
          className={getMenuClass('discounts')}
        >
          <div className="flex items-center space-x-3">
            <Percent className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span className="font-medium text-xs">{translate('discounts', settings)}</span>}
          </div>
          {isCollapsed && (
            <div className="absolute left-14 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {translate('discounts', settings)}
            </div>
          )}
        </button>

        {/* CONTENT CORNER */}
        <div>
          {isCollapsed ? (
            <button 
              onClick={() => onSelectTab('content')} 
              className={getMenuClass('content')}
            >
              <FileText className="w-3.5 h-3.5" />
              <div className="absolute left-14 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {translate('content', settings)}
              </div>
            </button>
          ) : (
            <div>
              <button
                onClick={() => toggleSubMenu('content')}
                className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer ${
                  currentTab === 'content' || currentTab === 'files' || currentTab === 'pages' ? 'text-white font-bold' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{translate('content', settings)}</span>
                </div>
                {openSubMenus.content ? <ChevronDown className="w-3.5 h-3.5 text-neutral-550" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-550" />}
              </button>
              {openSubMenus.content && (
                <div className="mt-1 space-y-0.5 border-l border-neutral-800 ml-5.5">
                  <button onClick={() => onSelectTab('files')} className={getSubMenuClass('files')}>
                    <span>{translate('asset_files', settings)}</span>
                  </button>
                  <button onClick={() => onSelectTab('pages')} className={getSubMenuClass('pages')}>
                    <span>{translate('static_pages', settings)}</span>
                  </button>
                  <button onClick={() => onSelectTab('seo')} className={getSubMenuClass('seo')}>
                    <span>搜索优化</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MARKETS */}
        <button
          onClick={() => onSelectTab('markets')}
          className={getMenuClass('markets')}
        >
          <div className="flex items-center space-x-3">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span className="font-medium text-xs">{translate('markets', settings)}</span>}
          </div>
          {isCollapsed && (
            <div className="absolute left-14 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {translate('markets', settings)}
            </div>
          )}
        </button>

        {/* FINANCIALS PANEL */}
        <div>
          {isCollapsed ? (
            <button 
              onClick={() => onSelectTab('financials')} 
              className={getMenuClass('financials')}
            >
              <Coins className="w-3.5 h-3.5" />
              <div className="absolute left-14 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {translate('financials', settings)}
              </div>
            </button>
          ) : (
            <div>
              <button
                onClick={() => toggleSubMenu('financials')}
                className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer ${
                  currentTab === 'financials' || currentTab === 'payouts' ? 'text-white font-bold' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{translate('financials', settings)}</span>
                </div>
                {openSubMenus.financials ? <ChevronDown className="w-3.5 h-3.5 text-neutral-550" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-550" />}
              </button>
              {openSubMenus.financials && (
                <div className="mt-1 space-y-0.5 border-l border-neutral-800 ml-5.5">
                  <button onClick={() => onSelectTab('financials')} className={getSubMenuClass('financials')}>
                    <span>{translate('overview_stats', settings)}</span>
                  </button>
                  <button onClick={() => onSelectTab('payouts')} className={getSubMenuClass('payouts')}>
                    <span>{translate('atelier_capital', settings)}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ANALYTICS PANEL */}
        <div>
          {isCollapsed ? (
            <button 
              onClick={() => onSelectTab('analytics')} 
              className={getMenuClass('analytics')}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <div className="absolute left-14 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {translate('analytics', settings)}
              </div>
            </button>
          ) : (
            <div>
              <button
                onClick={() => toggleSubMenu('analytics')}
                className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer ${
                  currentTab === 'analytics' || currentTab === 'analytics-overview' || currentTab === 'analytics-reports' ? 'text-white font-bold' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>{translate('analytics', settings)}</span>
                </div>
                {openSubMenus.analytics ? <ChevronDown className="w-3.5 h-3.5 text-neutral-550" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-550" />}
              </button>
              {openSubMenus.analytics && (
                <div className="mt-1 space-y-0.5 border-l border-neutral-800 ml-5.5">
                  <button onClick={() => onSelectTab('analytics')} className={getSubMenuClass('analytics')}>
                    <span>{translate('trends', settings)}</span>
                  </button>
                  <button onClick={() => onSelectTab('analytics-reports')} className={getSubMenuClass('analytics-reports')}>
                    <span>{translate('reports_list', settings)}</span>
                  </button>
                  <button onClick={() => onSelectTab('shopifyql')} className={getSubMenuClass('shopifyql')}>
                    <span>数据查询</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CHANNELS HUB */}
        <div className="pt-4 pb-1.5 px-3">
          {isCollapsed ? <div className="h-[1px] bg-neutral-800" /> : <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-neutral-500">{translate('sales_channels', settings)}</span>}
        </div>

        <button
          onClick={() => onSelectTab('web-shop')}
          className={getMenuClass('web-shop')}
        >
          <div className="flex items-center space-x-3">
            <Monitor className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span className="font-medium text-xs">{translate('online_store', settings)}</span>}
          </div>
        </button>

        <button
          onClick={() => onSelectTab('pos-setup')}
          className={getMenuClass('pos-setup')}
        >
          <div className="flex items-center space-x-3">
            <Store className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span className="font-medium text-xs">{translate('pos_sales', settings)}</span>}
          </div>
        </button>

        <button
          onClick={() => onSelectTab('sidekick-menu')}
          className={getMenuClass('sidekick-menu')}
        >
          <div className="flex items-center space-x-3">
            <Bot className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            {!isCollapsed && (
              <span className="flex items-center font-medium text-xs">
                {translate('agentico_ai', settings)}
                <span className="ml-1.5 px-1 py-0.2 bg-indigo-600 text-white text-[8px] rounded font-mono font-normal uppercase">AI</span>
              </span>
            )}
          </div>
        </button>

        {/* EMBEDDEDS */}
        <div className="pt-4 pb-1.5 px-3">
          {isCollapsed ? <div className="h-[1px] bg-neutral-800" /> : <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-neutral-500">{translate('embedded_apps', settings)}</span>}
        </div>

        <button
          onClick={() => onSelectTab('app-embed')}
          className={getMenuClass('app-embed')}
        >
          <div className="flex items-center space-x-3">
            <LayoutGrid className="w-3.5 h-3.5 text-neutral-450 shrink-0" />
            {!isCollapsed && <span className="font-medium text-xs text-neutral-350">接口网钩</span>}
          </div>
        </button>

        <button
          onClick={() => onSelectTab('checkout')}
          className={getMenuClass('checkout')}
        >
          <div className="flex items-center space-x-3">
            <CreditCard className="w-3.5 h-3.5 text-neutral-450 shrink-0" />
            {!isCollapsed && <span className="font-medium text-xs text-neutral-350">结账优化</span>}
          </div>
        </button>

      </nav>

      {/* FOOTER CODES */}
      <div className="p-3 border-t border-neutral-800 shrink-0 bg-[#0f0f0f]">
        <button
          onClick={onOpenSettings}
          className={`flex items-center space-x-3 w-full px-2.5 py-2 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-lg transition-all cursor-pointer font-medium relative group ${
            currentTab === 'settings' ? 'bg-neutral-800 text-white font-bold' : ''
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
          {!isCollapsed && <span>{translate('settings', settings)}</span>}
          {isCollapsed && (
            <div className="absolute left-14 bottom-2 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {translate('settings', settings)}
            </div>
          )}
        </button>
      </div>

    </aside>
  );
}
