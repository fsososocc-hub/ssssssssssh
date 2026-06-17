/**
 * Premium Consolidated Settings Panel
 * World-Class Shopify / Polaris Monochromatic Design Standard
 * Meets 100% Cellular Isolation and App-Suitability for Phones/PWAs
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, CreditCard, Users, Shield, MapPin, 
  Globe, Layout, CheckCircle2, ChevronRight, Plus, 
  Trash2, Key, FileText, Settings, Check, ArrowLeft,
  Percent, File, Gift, Bell, Languages, CheckSquare, User
} from 'lucide-react';
import { useShopStore } from '../../stores/shopStore';
import { useAuthStore } from '../../stores/authStore';

// Cellular Tabs Imports
import GeneralTab from './components/GeneralTab';
import FinanceTab from './components/FinanceTab';
import CustomerTab from './components/CustomerTab';
import DeveloperTab from './components/DeveloperTab';

export default function SettingsView() {
  const { settings, updateSettings } = useShopStore();
  const { currentUser, collaborators, addCollaborator } = useAuthStore();
  
  // Tab control & mobile router
  const [activeTab, setActiveTab] = useState('general');
  const [isMobileSubpageOpen, setIsMobileSubpageOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // 19 Complete Shopify Specification Categories
  const categories = [
    { id: 'general', label: '常规', desc: '商号基本要素详情', icon: Building, section: 1 },
    { id: 'plan', label: '计划', desc: '订阅每月资费计划', icon: CreditCard, section: 1 },
    { id: 'users', label: '用户和权限', desc: '系统后勤团队授权', icon: Users, section: 1 },
    { id: 'payments', label: '付款', desc: '收款网关与在线付款', icon: CreditCard, section: 1 },
    { id: 'checkout', label: '结账', desc: '买家结账表单定制', icon: CheckSquare, section: 1 },
    { id: 'customer_accounts', label: '客户账号', desc: '登录模式与2FA规定', icon: User, section: 1 },
    
    { id: 'shipping', label: '运输和配送', desc: '国内直邮与预包装', icon: Trash2, section: 2 }, // mapped placeholder icons cleanly
    { id: 'taxes', label: '税费和关税', desc: 'VAT应税及海关申报', icon: Percent, section: 2 },
    { id: 'locations', label: '地点', desc: '各仓库及自提提货点', icon: MapPin, section: 2 },
    { id: 'gift_cards', label: '礼品卡', desc: '派发数字礼资卡面', icon: Gift, section: 2 },
    
    { id: 'markets', label: 'Markets', desc: '外海多主权区域汇率', icon: Globe, section: 3 },
    { id: 'brand', label: '品牌', desc: '口号与品牌标识色', icon: Layout, section: 3 },
    { id: 'notifications', label: '通知', desc: '自动Liquid交易回执', icon: Bell, section: 3 },
    { id: 'files', label: '文件', desc: '公开 lookbook PDF 媒体库', icon: File, section: 3 },
    { id: 'languages', label: '语言', desc: '前台多语言系统支持', icon: Languages, section: 3 },
    { id: 'policies', label: '政策', desc: 'GDPR与销假法律文本', icon: FileText, section: 3 },
    { id: 'metafields', label: '自定义数据', desc: 'Zod动态挂载扩充元字段', icon: Settings, section: 3 },
    { id: 'domains', label: '域名', desc: '连接已有站外自定义URL', icon: Globe, section: 3 },
    { id: 'apps', label: '应用和销售渠道', desc: 'ERP系统API对接密钥对', icon: Shield, section: 3 },
  ];

  // Auto-scroll-to-top on tab switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  return (
    <div id="settings-adaptive-viewport" className="min-h-screen bg-[#FAFAFA] text-neutral-900 font-sans tracking-tight antialiased">
      
      {/* Toast Notification in grayscale */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#1A1A1A] text-white text-xs font-semibold py-2.5 px-4 rounded-md shadow-lg border border-neutral-800 flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE FORMAT HEADER: Show when subpage is active */}
      {isMobileSubpageOpen && (
        <div className="lg:hidden bg-white border-b border-[#E1E3E5] px-4 py-3.5 flex items-center justify-between sticky top-0 z-40">
          <button 
            onClick={() => setIsMobileSubpageOpen(false)}
            className="flex items-center space-x-1.5 text-sm font-bold text-[#1A1A1A] hover:opacity-85"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回设置</span>
          </button>
          <span className="text-sm font-bold text-[#202223]">
            {categories.find(c => c.id === activeTab)?.label}
          </span>
          <div className="w-6" /> {/* Spacer */}
        </div>
      )}

      {/* MAIN TWO-COLUMN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 py-5 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* COLUMN 1: LEFT SETTINGS CATEGORIES SIDEBAR */}
          <div className={`lg:block ${isMobileSubpageOpen ? 'hidden' : 'block'} space-y-4`}>
            <div className="mb-4">
              <h1 className="text-xl font-bold text-[#1A1A1A]">⚙️ 设置</h1>
              <p className="text-xs text-[#6D7175] mt-1">管理您在全球范围开店、后勤调拨所需的所有偏置属性。</p>
            </div>

            {/* List Menu */}
            <div className="bg-[#F6F6F7] border border-[#E1E3E5] rounded-lg p-2.5 space-y-1">
              {/* Grouping by visual divider based on section flag */}
              {Array.from({ length: 3 }).map((_, secIdx) => {
                const sectionNum = secIdx + 1;
                const sectionCats = categories.filter(c => c.section === sectionNum);
                return (
                  <div key={sectionNum} className="space-y-0.5">
                    {sectionCats.map((cat) => {
                      const Icon = cat.icon;
                      const active = activeTab === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setActiveTab(cat.id);
                            setIsMobileSubpageOpen(true);
                          }}
                          className={`w-full flex items-center justify-between h-9 px-3 rounded-md text-[13.5px] transition-all text-left font-medium ${
                            active 
                              ? 'bg-black text-white' 
                              : 'text-[#202223] hover:bg-[#E1E3E5]/40'
                          }`}
                        >
                          <div className="flex items-center space-x-3.5">
                            {/* Grayscale Icon */}
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-white' : 'text-neutral-500'}`} />
                            <span>{cat.label}</span>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 hover:opacity-100 ${active ? 'text-white opacity-90' : 'text-neutral-400 opacity-60'}`} />
                        </button>
                      );
                    })}
                    {/* Add Divider unless it's the final section */}
                    {sectionNum < 3 && <div className="my-2 border-b border-[#E1E3E5]" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: RIGHT CONTENT AREA */}
          <div className={`lg:col-span-3 ${isMobileSubpageOpen ? 'block' : 'hidden lg:block'} space-y-6`}>
            
            {/* Desktop breadcrumb & section title */}
            <div className="hidden lg:block mb-4 leading-normal">
              <span className="text-[11px] font-bold text-[#6D7175] uppercase tracking-wider">
                系统设置参数 ➔ {categories.find(c => c.id === activeTab)?.desc}
              </span>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mt-0.5">
                {categories.find(c => c.id === activeTab)?.label}
              </h2>
            </div>

            {/* TAB CONTENT MULTI-ROUTER SWITCH */}
            <div>
              {/* Tab Set 1: General categories routing */}
              {['general', 'locations', 'languages', 'markets'].includes(activeTab) && (
                <GeneralTab 
                  settings={settings}
                  updateSettings={updateSettings}
                  triggerToast={triggerToast}
                  activeTab={activeTab}
                />
              )}

              {/* Tab Set 2: Financial categories routing */}
              {['plan', 'payments', 'shipping', 'taxes'].includes(activeTab) && (
                <FinanceTab 
                  settings={settings}
                  updateSettings={updateSettings}
                  triggerToast={triggerToast}
                  activeTab={activeTab}
                />
              )}

              {/* Tab Set 3: Customers & Roles routing */}
              {['users', 'checkout', 'customer_accounts', 'notifications'].includes(activeTab) && (
                <CustomerTab 
                  currentUser={currentUser}
                  collaborators={collaborators}
                  addCollaborator={addCollaborator}
                  triggerToast={triggerToast}
                  activeTab={activeTab}
                  settings={settings}
                  updateSettings={updateSettings}
                />
              )}

              {/* Tab Set 4: Branding, Webhooks & Policy generators routing */}
              {['brand', 'policies', 'metafields', 'domains', 'apps', 'files', 'gift_cards'].includes(activeTab) && (
                <DeveloperTab 
                  settings={settings}
                  updateSettings={updateSettings}
                  triggerToast={triggerToast}
                  activeTab={activeTab}
                />
              )}
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
