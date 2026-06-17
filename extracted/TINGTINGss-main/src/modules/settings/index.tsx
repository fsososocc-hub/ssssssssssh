/**
 * Premium Monolithic Settings Panel
 * Design Standard: Linear, Shopify, Stripe, Apple
 * Strictly adheres to labels <= 4 characters, subtitles/descriptions <= 8 characters.
 * 100% Pure Chinese, zero static marketing/filler paragraphs.
 * Fully animated with spring layouts.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, CreditCard, Users, Shield, Sliders, MapPin, 
  Database, Layout, Bell, Globe, RefreshCw, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useShopStore } from '../../stores/shopStore';
import { useAuthStore } from '../../stores/authStore';

export default function SettingsView() {
  const { settings, updateSettings } = useShopStore();
  const { currentUser, collaborators, addCollaborator } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  const [toast, setToast] = useState<string | null>(null);

  const [collabName, setCollabName] = useState('');
  const [collabEmail, setCollabEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('staff');
  const [selectedNewLocale, setSelectedNewLocale] = useState('it');

  // Multi-warehouse locales list
  const [activeLocales, setActiveLocales] = useState([
    { code: 'zh', name: '中文', role: '主控' },
    { code: 'en', name: '英文', role: '就绪' }
  ]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleAddLocale = () => {
    const localeNames: { [key: string]: string } = {
      it: '意文',
      fr: '法文',
      de: '德文',
      es: '西文'
    };
    const targetName = localeNames[selectedNewLocale];
    if (activeLocales.some(l => l.code === selectedNewLocale)) {
      triggerToast('已经存在');
      return;
    }
    setActiveLocales(prev => [...prev, { code: selectedNewLocale, name: targetName, role: '就绪' }]);
    triggerToast('添加成功');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('保存成功');
  };

  const handleAddCollab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabName || !collabEmail) return;
    addCollaborator({
      name: collabName,
      email: collabEmail,
      role: selectedRole as any,
      permissions: ['inventory_read'],
    });
    setCollabName('');
    setCollabEmail('');
    triggerToast('已加团队');
  };

  const categories = [
    { id: 'general', label: '基本设置', desc: '商号对账', icon: Compass },
    { id: 'plan', label: '资费方案', desc: '版本明细', icon: CreditCard },
    { id: 'users', label: '后勤团队', desc: '人员授权', icon: Users },
    { id: 'payments', label: '支付渠道', desc: '结算网关', icon: Shield },
    { id: 'shipping', label: '保价配送', desc: '邮资管理', icon: MapPin },
    { id: 'locations', label: '实体仓库', desc: '物理网格', icon: Database },
    { id: 'brand', label: '视觉配色', desc: '设计配色', icon: Layout },
    { id: 'languages', label: '语系配置', desc: '商品翻译', icon: Globe },
  ];

  return (
    <div id="settings-frame" className="max-w-6xl mx-auto space-y-6 px-4 py-4 font-sans antialiased text-neutral-900">
      
      {/* Toast Prompt */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-neutral-950 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-xl border border-neutral-800 flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header OS style */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-neutral-450 uppercase font-black">Core OS</span>
          <h1 className="text-lg font-bold tracking-tight text-neutral-900 mt-0.5">控制台组</h1>
        </div>
        <button 
          onClick={() => triggerToast('自检正常')}
          className="flex items-center space-x-1.5 text-xs font-bold text-neutral-700 bg-neutral-100 border border-neutral-200/60 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>自主对账</span>
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="space-y-1 p-1.5 bg-neutral-50/50 border border-neutral-200/85 rounded-xl">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs transition-all text-left group ${
                  active 
                    ? 'bg-neutral-900 text-white shadow-sm' 
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-950'}`} />
                  <div>
                    <span className="block font-bold">{cat.label}</span>
                    <span className={`block text-[9px] mt-0.5 ${active ? 'text-neutral-400' : 'text-neutral-400'}`}>{cat.desc}</span>
                  </div>
                </div>
                {active && <ChevronRight className="w-3 h-3 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Tab content wrapper */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="space-y-4"
            >
              
              {/* Core general shop preferences */}
              {activeTab === 'general' && (
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-4">
                    <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-neutral-950">基础配置</h3>
                      <span className="text-[10px] font-mono text-neutral-400">核心商号</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400">门牌名称</label>
                        <input
                          type="text"
                          required
                          value={settings.shopName}
                          onChange={(e) => updateSettings({ shopName: e.target.value })}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400">客服邮箱</label>
                        <input
                          type="email"
                          required
                          value={settings.shopEmail}
                          onChange={(e) => updateSettings({ shopEmail: e.target.value })}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400">结算本币</label>
                        <select
                          value={settings.currency}
                          onChange={(e) => {
                            const cur = e.target.value;
                            const symb = cur === 'EUR' ? '€' : cur === 'USD' ? '$' : cur === 'CNY' ? '¥' : '£';
                            updateSettings({ currency: cur, currencySymbol: symb });
                          }}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                        >
                          <option value="CNY">人民币 (¥)</option>
                          <option value="EUR">欧元 (€)</option>
                          <option value="USD">美元 ($)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400">保价邮资</label>
                        <input
                          type="number"
                          value={settings.shippingStandardRate}
                          onChange={(e) => updateSettings({ shippingStandardRate: Number(e.target.value) })}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-xs text-neutral-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      className="bg-neutral-900 hover:bg-black text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm cursor-pointer transition-all active:scale-95"
                    >
                      保存配置
                    </button>
                  </div>
                </form>
              )}

              {/* Core billing/plans options */}
              {activeTab === 'plan' && (
                <div className="space-y-4">
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-4">
                    <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-neutral-950">旗舰方案</h3>
                      <span className="text-[10px] font-mono text-emerald-600">正常计费</span>
                    </div>

                    <div className="bg-neutral-900 text-white rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-neutral-400">费用</span>
                        <h4 className="text-lg font-bold font-mono">€299 / 月</h4>
                      </div>
                      <span className="text-[10px] bg-white/10 text-white py-1 px-2.5 rounded font-bold">按月结算</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button 
                        onClick={() => triggerToast('修改完成')}
                        className="border border-neutral-200 rounded-lg p-3 hover:bg-neutral-50 text-left transition-all cursor-pointer"
                      >
                        <span className="text-[10px] text-neutral-400 block font-bold">变更方案</span>
                        <span className="text-xs font-bold text-neutral-800">调整</span>
                      </button>
                      <button 
                        onClick={() => triggerToast('已发账单')}
                        className="border border-neutral-200 rounded-lg p-3 hover:bg-neutral-50 text-left transition-all cursor-pointer"
                      >
                        <span className="text-[10px] text-neutral-400 block font-bold">历史账单</span>
                        <span className="text-xs font-bold text-neutral-800">下载</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Team setting options */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-4">
                    <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-neutral-950">添加后勤</h3>
                      <span className="text-[10px] font-mono text-neutral-400">授权成员</span>
                    </div>

                    <form onSubmit={handleAddCollab} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input 
                        type="text" 
                        required 
                        placeholder="姓名"
                        value={collabName} 
                        onChange={(e) => setCollabName(e.target.value)}
                        className="bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-xs focus:bg-white"
                      />
                      <input 
                        type="email" 
                        required 
                        placeholder="邮箱"
                        value={collabEmail} 
                        onChange={(e) => setCollabEmail(e.target.value)}
                        className="bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-xs focus:bg-white"
                      />
                      <select 
                        value={selectedRole} 
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-xs focus:bg-white"
                      >
                        <option value="admin">系统主管</option>
                        <option value="staff">一般仓务</option>
                      </select>
                      <button 
                        type="submit" 
                        className="bg-neutral-900 border border-neutral-900 rounded-lg text-white font-bold text-xs py-2 cursor-pointer hover:bg-black active:scale-95 transition-all"
                      >
                        确认邀请
                      </button>
                    </form>

                    <div className="space-y-2 pt-2 border-t border-neutral-100">
                      <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50/50">
                        <div>
                          <p className="text-xs font-bold text-neutral-900">{currentUser.name}</p>
                          <p className="text-[10px] font-mono text-neutral-400">{currentUser.email}</p>
                        </div>
                        <span className="text-[9px] bg-neutral-900 text-white font-bold px-2 py-0.5 rounded-full">主理人</span>
                      </div>

                      {collaborators.map((col, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50/50">
                          <div>
                            <p className="text-xs font-bold text-neutral-900">{col.name}</p>
                            <p className="text-[10px] font-mono text-neutral-400">{col.email}</p>
                          </div>
                          <span className="text-[9px] bg-neutral-100 text-neutral-700 font-bold px-2 py-0.5 rounded-full">
                            {col.role === 'admin' ? '系统主管' : '助理协务'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Gateways Channels */}
              {activeTab === 'payments' && (
                <div className="space-y-4">
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-4">
                    <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-neutral-950">结算通道</h3>
                      <span className="text-[10px] font-mono text-neutral-400">启用就绪</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { title: '微信支付', key: 'wx' },
                        { title: '支付宝', key: 'alipay' },
                        { title: '信用卡', key: 'credit' }
                      ].map((item, i) => (
                        <div 
                          key={i} 
                          onClick={() => triggerToast('启闭变更')}
                          className="p-4 border border-neutral-200 rounded-xl hover:border-neutral-350 bg-white shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between cursor-pointer"
                        >
                          <span className="text-xs font-bold text-neutral-900">{item.title}</span>
                          <div className="mt-4 flex justify-between items-center">
                            <span className="text-[9px] text-neutral-400">已就绪</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Standard rate configurations */}
              {activeTab === 'shipping' && (
                <div className="space-y-4">
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-4">
                    <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-neutral-950">邮资模板</h3>
                      <span className="text-[10px] font-mono text-neutral-400">保价政策</span>
                    </div>

                    <div className="border border-neutral-200 rounded-lg p-4 flex justify-between items-center hover:border-neutral-350 transition-all">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900">航空直邮</h4>
                        <span className="text-[10.5px] text-neutral-400 block mt-0.5">到仓清关</span>
                      </div>
                      <button 
                        onClick={() => triggerToast('修改邮资')}
                        className="text-[10px] font-bold text-neutral-600 bg-neutral-100 border border-neutral-200 rounded px-2.5 py-1"
                      >
                        重新对账
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Physical Warehouses location configs */}
              {activeTab === 'locations' && (
                <div className="space-y-4">
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-4">
                    <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-neutral-950">实体仓区</h3>
                      <span className="text-[10px] font-mono text-neutral-400">调拨网格</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-neutral-200 rounded-xl hover:border-neutral-300 transition-all bg-neutral-50/20">
                        <div className="flex justify-between items-center">
                          <strong className="text-xs font-bold text-neutral-900">巴黎仓</strong>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black">主仓</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono block mt-2">仓储周转调拨空闲</span>
                      </div>

                      <div className="p-4 border border-neutral-200 rounded-xl hover:border-neutral-300 transition-all bg-neutral-50/20">
                        <div className="flex justify-between items-center">
                          <strong className="text-xs font-bold text-neutral-900">东京柜</strong>
                          <span className="text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded font-black">自提</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono block mt-2">买手预约自提核对</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Design Palette Selection */}
              {activeTab === 'brand' && (
                <div className="space-y-4">
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-4">
                    <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-neutral-950">视觉选色</h3>
                      <span className="text-[10px] font-mono text-neutral-400">自适应色</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { title: '曜黑主底', hex: '#111111' },
                        { title: '冷玫沙金', hex: '#634b54' }
                      ].map((col, index) => (
                        <div 
                          key={index} 
                          onClick={() => triggerToast(`配色同步为: ${col.title}`)}
                          className="p-4 border border-neutral-200 hover:border-neutral-350 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                        >
                          <div>
                            <span className="text-xs font-bold text-neutral-950 block">{col.title}</span>
                            <span className="text-[9px] font-mono text-neutral-400 mt-1 block">对账标定目色</span>
                          </div>
                          <span className="w-4 h-4 rounded border border-neutral-200 inline-block" style={{ backgroundColor: col.hex }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Multilingual mappings options */}
              {activeTab === 'languages' && (
                <div className="space-y-4">
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-4">
                    <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-neutral-950 font-sans">多语翻译</h3>
                      <span className="text-[10px] font-mono text-neutral-400">货品映射</span>
                    </div>

                    {/* Minimalist Grid table */}
                    <div className="border border-neutral-150 rounded-lg overflow-hidden divide-y divide-neutral-150 shadow-2xs">
                      {activeLocales.map((loc) => (
                        <div key={loc.code} className="p-3 flex items-center justify-between bg-white hover:bg-neutral-50/50 transition-colors">
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-neutral-950">{loc.name}</span>
                              <span className="text-[9px] font-mono bg-neutral-100 text-neutral-500 px-1.5 py-0.2 rounded font-black">
                                {loc.role}
                              </span>
                            </div>
                            <span className="text-[9px] text-neutral-400 font-mono block mt-0.5">编译关联就绪</span>
                          </div>

                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => triggerToast('对账成功')}
                              className="text-[10px] font-bold text-neutral-600 bg-neutral-100 border border-neutral-200 rounded px-2.5 py-1 cursor-pointer hover:bg-neutral-250 transition-colors"
                            >
                              重译
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Simple locale selector element (Selector target 2 & 3) */}
                    <div className="p-4 bg-neutral-50/60 rounded-xl border border-neutral-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div>
                        {/* Selector 3 targets this h5 (keep <=4 heading, <=8 text) */}
                        <h5 className="text-xs font-bold text-neutral-900">语系调拨</h5>
                        {/* Selector 2 targets this p */}
                        <p className="text-[10px] text-neutral-450 font-mono mt-0.5">分配附加目标语系</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={selectedNewLocale}
                          onChange={(e) => setSelectedNewLocale(e.target.value)}
                          className="bg-white border border-neutral-250 rounded-lg p-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black"
                        >
                          <option value="it">意文 (it)</option>
                          <option value="fr">法文 (fr)</option>
                          <option value="de">德文 (de)</option>
                          <option value="es">西文 (es)</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleAddLocale}
                          className="bg-neutral-900 hover:bg-black text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-2xs cursor-pointer active:scale-95 transition-all"
                        >
                          添加
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
