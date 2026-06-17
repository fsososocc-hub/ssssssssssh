/**
 * Master Admin OS Layout Engine - Level 10
 * Pure Layout Orchestrator responsive to all screens (Desktop, Tablet, Mobile)
 * Dynamically delivers views based on Zustand router state.
 */

import React, { useEffect, useState } from 'react';
import { useLayoutStore } from '../stores/layoutStore';
import { usePanelStore } from '../stores/panelStore';
import { useShopStore } from '../stores/shopStore';

// Desktop, Tablet, and Mobile visual skins
import DesktopLayout from './DesktopLayout';
import TabletLayout from './TabletLayout';
import MobileLayout from './MobileLayout';
import Header from './Header';
import Sidebar from './Sidebar';
import ContextPanel from '../context-panel';

// Core Decoupled Business Modules (Level 1/2)
import HomeView from '../modules/home';
import OrdersView from '../modules/orders';
import ProductsView from '../modules/products';
import CustomersView from '../modules/customers';
import DiscountsView from '../modules/discounts';
import SettingsView from '../modules/settings';
import GenericModuleView from '../modules/generic';
import ContentView from '../modules/content';
import ThemeEditorView from '../modules/web-shop';
import FinanceView from '../modules/finance';
import AnalyticsView from '../modules/analytics';

import FlowView from '../modules/flows';
import WebhookView from '../modules/webhooks';
import SeoView from '../modules/seo';
import CheckoutView from '../modules/checkout';
import ShopifyQlView from '../modules/shopifyql';
import MarketsView from '../modules/markets';
import POSModule from '../apps/pos/POSModule';
import AIModule from '../apps/ai/AIModule';

// Legacy / domain state pointers
import { useProductStore } from '../stores/productStore';
import { useOrderStore } from '../stores/orderStore';
import { useCustomerStore } from '../stores/customerStore';
import { useDiscountStore } from '../stores/discountStore';

export default function AdminLayout() {
  const { currentTab, setCurrentTab } = useLayoutStore();
  const { selectedPreview, setSelectedPreview } = usePanelStore();
  const { settings, updateSettings } = useShopStore();

  const { products, setProducts } = useProductStore();
  const { orders, setOrders } = useOrderStore();
  const { customers, setCustomers } = useCustomerStore();
  const { discounts, setDiscounts } = useDiscountStore();

  // Dimension Auditing Engine
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = dimensions.width < 768;
  const isTablet = dimensions.width >= 768 && dimensions.width < 1200;
  const isDesktop = dimensions.width >= 1200;

  // Master Routing Dispatcher
  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomeView />;
        
      case 'orders':
      case 'drafts':
      case 'abandoned':
      case 'returns':
        return <OrdersView />;
        
      case 'products':
      case 'inventory':
      case 'collections':
        return <ProductsView />;
        
      case 'customers':
      case 'segments':
        return <CustomersView />;
        
      case 'discounts':
        return <DiscountsView />;
        
      case 'settings':
        return <SettingsView />;
        
      case 'finance':
        return <FinanceView />;
        
      case 'analytics':
      case 'analytics-reports':
        return <AnalyticsView />;
        
      case 'marketing':
      case 'apps':
      case 'sidekick-menu':
        return <GenericModuleView moduleKey={currentTab} />;
        
      case 'pos-setup':
        return <POSModule />;
        
      case 'ai-apps':
        return <AIModule />;
        
      case 'markets':
        return <MarketsView />;
        
      case 'automations':
        return <FlowView />;
        
      case 'app-embed':
        return <WebhookView />;
        
      case 'seo':
        return <SeoView />;
        
      case 'checkout':
        return <CheckoutView />;
        
      case 'shopifyql':
        return <ShopifyQlView />;
        
      case 'content':
      case 'files':
      case 'pages':
      case 'blog':
      case 'navigation':
      case 'metaobjects':
        return <ContentView />;
        
      case 'web-shop':
        return <ThemeEditorView />;
        
      default:
        return <HomeView />;
    }
  };

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    // Auto-fallback to sidekick AI instead of closing 3-column space entirely to maintain Shopify persistent 3-column workspace layout
    if (selectedPreview && ['order', 'product', 'customer', 'discount'].includes(selectedPreview.type || '')) {
      setSelectedPreview({ type: 'sidekick', id: null });
    }
  };

  // Pre-assembled components for standard layouts
  const sharedHeader = <Header />;
  const sharedSidebar = (
    <Sidebar 
      currentTab={currentTab}
      onSelectTab={handleSelectTab}
      settings={settings}
      onOpenSettings={() => setCurrentTab('settings')}
    />
  );
  
  const mainContent = (
    <div className="animate-fadeIn">
      {renderTabContent()}
    </div>
  );

  const sharedContextPanel = selectedPreview ? (
    <ContextPanel 
      selectedItem={selectedPreview}
      onClose={() => {
        // Fallback to sidekick when closing individual item-level previews, otherwise close the panel completely
        if (selectedPreview && ['order', 'product', 'customer', 'discount'].includes(selectedPreview.type || '')) {
          setSelectedPreview({ type: 'sidekick', id: null });
        } else {
          setSelectedPreview(null);
        }
      }}
      products={products}
      setProducts={setProducts}
      orders={orders}
      setOrders={setOrders}
      customers={customers}
      setCustomers={setCustomers}
      discounts={discounts}
      setDiscounts={setDiscounts}
      currentTab={currentTab}
    />
  ) : null;

  // Adaptive Visual Shells
  if (isMobile) {
    return (
      <MobileLayout 
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        content={mainContent}
        contextPanel={sharedContextPanel}
      />
    );
  }

  if (isTablet) {
    return (
      <TabletLayout 
        sidebar={sharedSidebar}
        header={sharedHeader}
        content={mainContent}
      />
    );
  }

  return (
    <DesktopLayout 
      sidebar={sharedSidebar}
      header={sharedHeader}
      content={mainContent}
      contextPanel={sharedContextPanel}
    />
  );
}
