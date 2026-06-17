import React, { useState } from 'react';
import { 
  Globe, ArrowRight, Save, Plus, Settings, ShieldCheck, 
  ChevronRight, ArrowLeft, Sliders, CheckSquare, Coins, 
  HelpCircle, Trash2, Edit 
} from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import { useShopStore } from '../../stores/shopStore';
import { Market, MarketPricingStrategy, B2BWholesaleConfig } from '../../types';

export default function MarketsView() {
  const { products } = useProductStore();
  const { settings } = useShopStore();

  // Selected subscreen: 'list' (overview) or 'edit_market' or 'edit_b2b'
  const [currentScreen, setCurrentScreen] = useState<'list' | 'edit_market' | 'edit_b2b'>('list');
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  // Mock list of markets
  const [markets, setMarkets] = useState<Market[]>([
    {
      id: 'market-eu',
      name: '欧洲共同体出海市场 (EU Market)',
      type: 'international',
      icon: '🇪🇺',
      countries: ['法国', '德国', '西班牙', '比利时'],
      currency: 'EUR',
      currencySymbol: '€',
      languages: ['fr', 'de', 'es'],
      primaryLanguage: 'fr',
      domains: { type: 'subdirectory', value: '/eu' },
      pricingStrategy: {
        mode: 'manual_adjustment',
        exchangeRate: 1.00,
        adjustmentType: 'increase',
        adjustmentValue: 12, // +12% VAT adjustment
        adjustmentMode: 'percentage',
        roundRule: '.99',
        taxIncluded: true
      },
      catalog: { type: 'all' },
      taxAndDuty: {
        rates: { 'FR': 20.00, 'DE': 19.00 },
        collectDutyAtCheckout: true,
        dutyMode: 'DDP'
      },
      shipping: {
        ruleId: 'eu-std',
        rules: [
          { name: 'EU Priority Delivery', cost: 15.00, duration: '2-4 个工作日', freeOver: 150 }
        ]
      },
      salesThisMonth: 12840,
      ordersThisMonth: 82,
      status: 'active'
    },
    {
      id: 'market-us',
      name: '北美自由贸易出海市场 (USA & Canada)',
      type: 'international',
      icon: '🇺🇸',
      countries: ['美国', '加拿大'],
      currency: 'USD',
      currencySymbol: '$',
      languages: ['en'],
      primaryLanguage: 'en',
      domains: { type: 'subdomain', value: 'us.atelier-noir.com' },
      pricingStrategy: {
        mode: 'exchange_rate',
        exchangeRate: 1.08,
        adjustmentType: 'increase',
        adjustmentValue: 5, // +5% markup
        adjustmentMode: 'percentage',
        roundRule: '.00',
        taxIncluded: false
      },
      catalog: { type: 'all' },
      taxAndDuty: {
        rates: { 'US': 8.5 },
        collectDutyAtCheckout: false,
        dutyMode: 'DAP'
      },
      shipping: {
        ruleId: 'us-std',
        rules: [
          { name: 'US Air Courier', cost: 25.00, duration: '3-5 个工作日', freeOver: 200 }
        ]
      },
      salesThisMonth: 9450,
      ordersThisMonth: 54,
      status: 'active'
    }
  ]);

  // B2B Wholesale Pricing tiers
  const [b2bConfig, setB2bConfig] = useState<B2BWholesaleConfig>({
    accessControl: 'login',
    catalogName: '欧美特批大宗批发价目表',
    discountPercentage: 20, // default override
    paymentTerm: 'Net 30',
    minOrderValue: 800,
    minOrderQty: 10
  });

  // Active form states for editing a market's pricing strategy
  const [editingStrategy, setEditingStrategy] = useState<MarketPricingStrategy | null>(null);

  // B2B Tier pricing grid state
  const [b2bTiers, setB2bTiers] = useState([
    { minQty: 10, discount: 15, tag: '小额批发阶段' },
    { minQty: 30, discount: 25, tag: '中额主力调拨' },
    { minQty: 100, discount: 35, tag: '战略货柜集散' },
  ]);

  const [newTierQty, setNewTierQty] = useState('');
  const [newTierDiscount, setNewTierDiscount] = useState('');
  const [newTierTag, setNewTierTag] = useState('');

  const handleAddTier = () => {
    if (!newTierQty || !newTierDiscount) return;
    setB2bTiers(prev => [
      ...prev,
      {
        minQty: parseInt(newTierQty),
        discount: parseFloat(newTierDiscount),
        tag: newTierTag || '自定义梯级'
      }
    ].sort((a, b) => a.minQty - b.minQty));
    setNewTierQty('');
    setNewTierDiscount('');
    setNewTierTag('');
    triggerToast('起订阶梯添加成功');
  };

  const handleDeleteTier = (index: number) => {
    setB2bTiers(prev => prev.filter((_, i) => i !== index));
    triggerToast('起订阶梯已移除');
  };

  const handleEditPricing = (market: Market) => {
    setSelectedMarketId(market.id);
    setEditingStrategy({ ...market.pricingStrategy });
    setCurrentScreen('edit_market');
  };

  const handleSaveMarketPricing = () => {
    if (!selectedMarketId || !editingStrategy) return;
    setMarkets(prev => prev.map(m => {
      if (m.id === selectedMarketId) {
        return {
          ...m,
          pricingStrategy: { ...editingStrategy }
        };
      }
      return m;
    }));
    setCurrentScreen('list');
    triggerToast('国别汇率与调价策略保存成功');
  };

  // Convert individual product base prices based on rules
  const getConvertedPrice = (basePrice: number, strategy: MarketPricingStrategy, symbol: string) => {
    let price = basePrice * strategy.exchangeRate;
    if (strategy.mode === 'manual_adjustment') {
      const adj = strategy.adjustmentValue;
      if (strategy.adjustmentType === 'increase') {
        price = strategy.adjustmentMode === 'percentage' ? price * (1 + adj / 100) : price + adj;
      } else {
        price = strategy.adjustmentMode === 'percentage' ? price * (1 - adj / 100) : price - adj;
      }
    }
    
    // Rounding rule implementation
    if (strategy.roundRule === '.99') {
      price = Math.floor(price) + 0.99;
    } else if (strategy.roundRule === '.00') {
      price = Math.round(price);
    }
    return `${symbol}${price.toFixed(2)}`;
  };

  return (
    <div id="markets-root-container" className="space-y-6">
      
      {/* Grayscale elegant Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A1A1A] text-white text-xs font-semibold py-2.5 px-4 rounded-md shadow-lg border border-neutral-800 flex items-center space-x-2">
          <span>{toast}</span>
        </div>
      )}

      {/* Screen 1: Markets List & B2B Dashboard */}
      {currentScreen === 'list' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-neutral-200">
            <div>
              <h1 className="text-xl font-bold text-[#1a1a1a]">🌍 跨境海外市场 (Markets)</h1>
              <p className="text-xs text-[#6e6e6e] mt-1">
                多国出海汇率微调、跨境 VAT 国别自动课税隔离与 B2B 批发阶梯政策。
              </p>
            </div>
            
            <div className="flex space-x-2 mt-3 md:mt-0">
              <button 
                onClick={() => setCurrentScreen('edit_b2b')}
                className="shopify-btn-secondary flex items-center gap-1.5"
              >
                <Sliders className="w-4 h-4" />
                <span>配置 B2B 批发阶梯价</span>
              </button>
              <button 
                onClick={() => triggerToast('旗舰版已锁，商圈扩展中')}
                className="shopify-btn-primary flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>新建海外市场</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-2xs">
              <span className="text-[10px] text-[#6e6e6e] uppercase tracking-wider font-mono">本月海外销售额</span>
              <p className="text-xl font-bold font-mono text-black mt-1">€22,290.00</p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium mt-1">
                <span>↑ 42%</span>
                <span className="text-neutral-400">对比上月结算</span>
              </div>
            </div>
            <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-2xs">
              <span className="text-[10px] text-[#6e6e6e] uppercase tracking-wider font-mono">B2B 合同预定盘款</span>
              <p className="text-xl font-bold font-mono text-black mt-1">€18,500.00</p>
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-1">
                <span>Net 30 账期绑定比率: 88%</span>
              </div>
            </div>
            <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-2xs">
              <span className="text-[10px] text-[#6e6e6e] uppercase tracking-wider font-mono">主结算国别网格</span>
              <p className="text-xl font-bold text-black mt-1">11 国激活</p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium mt-1">
                <span className="text-neutral-400">全域 DDP 双关离港自动化</span>
              </div>
            </div>
          </div>

          {/* ACTIVE INTERNATIONAL MARKETS LIST */}
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-2xs">
            <div className="px-4 py-3.5 border-b border-neutral-200 bg-neutral-50/50 flex justify-between items-center">
              <span className="text-xs font-bold text-neutral-800">已激活的跨境市场定价条目</span>
              <span className="text-[10.5px] text-[#6e6e6e] font-mono">实时动态级联报价</span>
            </div>

            <div className="divide-y divide-neutral-200">
              {markets.map((m) => (
                <div key={m.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/30 transition-colors">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl pt-0.5">{m.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-neutral-900">{m.name}</h3>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black">
                          {m.status === 'active' ? '已激活' : '草稿'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6e6e6e] mt-1 leading-relaxed">
                        国别区域: <strong className="text-neutral-800">{m.countries.join(', ')}</strong> | 
                        结算货币: <strong className="text-neutral-800 font-mono">{m.currency} ({m.currencySymbol})</strong> | 
                        主域根名: <strong className="text-neutral-800 font-mono">{m.domains.value}</strong>
                      </p>
                      
                      {/* Interactive Pricing Summary tooltip */}
                      <div className="mt-2 text-[10px] bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1 inline-block">
                        <span className="text-neutral-500">主出海调价策略:</span>{' '}
                        <strong className="text-black">
                          {m.pricingStrategy.mode === 'exchange_rate' ? '按官定汇率' : '手动加权控制'} 
                          ({m.pricingStrategy.adjustmentType === 'increase' ? '+' : '-'}
                          {m.pricingStrategy.adjustmentValue}
                          {m.pricingStrategy.adjustmentMode === 'percentage' ? '%' : m.currencySymbol})
                          {' | 舍入方式: '}{m.pricingStrategy.roundRule}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button 
                      onClick={() => handleEditPricing(m)}
                      className="shopify-btn-secondary flex items-center gap-1 py-1.5 px-3 text-xs"
                    >
                      <Edit className="w-3 h-3" />
                      <span>配置国别价格</span>
                    </button>
                    <button 
                      onClick={() => triggerToast('配送关税已在设置中同步')}
                      className="shopify-btn-secondary text-xs py-1.5 px-3"
                    >
                      关税 & 运输
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B2B CLASS STEP MINIMUM ORDER TABLE CARD */}
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-2xs">
            <div className="px-4 py-3.5 border-b border-neutral-200 bg-neutral-50/50 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-neutral-850 block">🏷️ B2B 阶梯起订批发价目表 (Tiered wholesale)</span>
                <span className="text-[10px] text-[#6e6e6e] mt-0.5 block">配置起订件数和优惠折扣对照关系</span>
              </div>
              <span className="text-[10px] bg-[#1a1a1a] text-white px-2 py-0.5 rounded font-mono font-medium">B2B 协议中</span>
            </div>

            <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Info Column */}
              <div className="space-y-3 lg:border-r lg:border-neutral-200 lg:pr-6">
                <div>
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-mono">B2B 核心结算设置</h4>
                  <p className="text-xs text-[#6e6e6e] mt-1 leading-relaxed">
                    在 B2B 出海账单中，客户达到起订量阀值后自动锁定对应折扣。默认支付账期支持 <strong className="text-black">{b2bConfig.paymentTerm}</strong>。
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#6e6e6e]">最低起订金额</span>
                    <span className="font-bold font-mono">€{b2bConfig.minOrderValue}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#6e6e6e]">单件最低购量</span>
                    <span className="font-bold font-mono">{b2bConfig.minOrderQty} 件起</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#6e6e6e]">发运默认账期</span>
                    <span className="font-bold">{b2bConfig.paymentTerm}</span>
                  </div>
                </div>
              </div>

              {/* Tiers List Grid */}
              <div className="lg:col-span-2 space-y-4">
                <div className="border border-neutral-200 rounded-md overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200">
                        <th className="p-2.5 font-bold text-neutral-700">起订量阀值 (≥ N 件)</th>
                        <th className="p-2.5 font-bold text-neutral-700">阶梯折扣</th>
                        <th className="p-2.5 font-bold text-neutral-700">阶段标签</th>
                        <th className="p-2.5 text-right font-bold text-neutral-700">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 font-mono">
                      {b2bTiers.map((tier, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50">
                          <td className="p-2.5 font-bold">{tier.minQty} 件起订</td>
                          <td className="p-2.5 text-emerald-600 font-bold">-{tier.discount}% 折扣</td>
                          <td className="p-2.5 text-[#6e6e6e] font-sans text-[11px]">{tier.tag}</td>
                          <td className="p-2.5 text-right">
                            <button 
                              onClick={() => handleDeleteTier(idx)}
                              className="text-neutral-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                              title="移除阶梯"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Quickly Add Tier Form */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-md p-3 flex flex-wrap gap-2.5 items-end justify-between">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block font-mono">起订数量 (件)</label>
                    <input 
                      type="number"
                      placeholder="如 50"
                      value={newTierQty} 
                      onChange={(e) => setNewTierQty(e.target.value)}
                      className="bg-white border border-neutral-250 rounded px-2.5 py-1.5 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block font-mono">特配折扣 (%)</label>
                    <input 
                      type="number"
                      placeholder="如 30"
                      value={newTierDiscount} 
                      onChange={(e) => setNewTierDiscount(e.target.value)}
                      className="bg-white border border-neutral-250 rounded px-2.5 py-1.5 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-1 flex-1 min-w-[124px]">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block font-mono">策略标签</label>
                    <input 
                      type="text"
                      placeholder="如 中大宗备存"
                      value={newTierTag} 
                      onChange={(e) => setNewTierTag(e.target.value)}
                      className="bg-white border border-neutral-250 rounded px-2.5 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-black font-sans"
                    />
                  </div>
                  <button 
                    onClick={handleAddTier}
                    className="bg-[#1a1a1a] hover:bg-black text-white text-xs font-semibold py-1.5 px-3 rounded cursor-pointer transition-all shrink-0"
                  >
                    新增阶梯对照
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      )}

      {/* Screen 2: Edit Market Pricing Rule panel */}
      {currentScreen === 'edit_market' && editingStrategy && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentScreen('list')}
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-600" />
              </button>
              <div>
                <h1 className="text-sm font-bold text-[#1a1a1a]">出海定价与汇率权重调价方案</h1>
                <p className="text-xs text-neutral-500">
                  调整 {markets.find(m => m.id === selectedMarketId)?.name} 的全球级联实时变价规则。
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleSaveMarketPricing}
              className="shopify-btn-primary flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>保存出海策略</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Controls Column */}
            <div className="lg:col-span-1 space-y-4">
              
              <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-4 shadow-2xs">
                <span className="text-xs font-bold text-neutral-800 border-b border-neutral-100 pb-2 block">
                  1. 改算本位 & 折扣系数
                </span>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider font-mono">定价转换模式</label>
                  <select 
                    value={editingStrategy.mode}
                    onChange={(e) => setEditingStrategy(prev => prev ? { ...prev, mode: e.target.value as any } : null)}
                    className="w-full bg-neutral-50 border border-neutral-250 p-2 text-xs rounded focus:bg-white focus:outline-none"
                  >
                    <option value="exchange_rate">基于国际官方汇率</option>
                    <option value="manual_adjustment">手动溢价/折让控制</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider font-mono">基准折算汇率 (1 EUR = ?)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={editingStrategy.exchangeRate}
                    onChange={(e) => setEditingStrategy(prev => prev ? { ...prev, exchangeRate: parseFloat(e.target.value) || 1 } : null)}
                    className="w-full bg-neutral-50 border border-neutral-250 p-2 text-xs rounded font-mono focus:bg-white focus:outline-none"
                  />
                </div>

                {editingStrategy.mode === 'manual_adjustment' && (
                  <div className="p-3 bg-neutral-50 rounded border border-neutral-200.5 space-y-3">
                    <span className="text-[10px] font-bold text-neutral-600 block font-mono uppercase tracking-wider">溢折让手动规则</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        value={editingStrategy.adjustmentType}
                        onChange={(e) => setEditingStrategy(prev => prev ? { ...prev, adjustmentType: e.target.value as any } : null)}
                        className="bg-white border border-neutral-250 p-1.5 text-xs rounded focus:outline-none"
                      >
                        <option value="increase">溢价增加 (+)</option>
                        <option value="decrease">折让减免 (-)</option>
                      </select>
                      
                      <select 
                        value={editingStrategy.adjustmentMode}
                        onChange={(e) => setEditingStrategy(prev => prev ? { ...prev, adjustmentMode: e.target.value as any } : null)}
                        className="bg-white border border-neutral-250 p-1.5 text-xs rounded focus:outline-none"
                      >
                        <option value="percentage">按百分比 %</option>
                        <option value="fixed">固定金额</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-400 block font-mono">溢折比例 / 金额</label>
                      <input 
                        type="number"
                        value={editingStrategy.adjustmentValue}
                        onChange={(e) => setEditingStrategy(prev => prev ? { ...prev, adjustmentValue: parseFloat(e.target.value) || 0 } : null)}
                        className="w-full bg-white border border-neutral-250 p-2 text-xs rounded font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Rounding presets */}
              <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-4 shadow-2xs">
                <span className="text-xs font-bold text-neutral-800 border-b border-neutral-100 pb-2 block">
                  2. 分端智能美化舍入规律
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '不舍入 (None)', val: 'none' },
                    { label: '.99 尾数', val: '.99' },
                    { label: '.00 整取', val: '.00' }
                  ].map((preset) => {
                    const active = editingStrategy.roundRule === preset.val;
                    return (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setEditingStrategy(prev => prev ? { ...prev, roundRule: preset.val as any } : null)}
                        className={`text-xs p-2 rounded border text-center transition-all ${
                          active 
                            ? 'bg-black text-white border-black font-bold' 
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-[#646464]">国别结算价含VAT税额</span>
                  <input 
                    type="checkbox"
                    checked={editingStrategy.taxIncluded}
                    onChange={(e) => setEditingStrategy(prev => prev ? { ...prev, taxIncluded: e.target.checked } : null)}
                    className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* Price Preview List Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-2xs">
                <div className="px-4 py-3.5 border-b border-neutral-200 bg-neutral-50/50 flex justify-between items-center">
                  <span className="text-xs font-bold text-neutral-800">出海变价实时对账预览 (Live Preview)</span>
                  <span className="text-[10px] font-mono text-neutral-400">本币 ➔ 海外改写价格对比</span>
                </div>

                <div className="divide-y divide-neutral-200 max-h-[480px] overflow-y-auto">
                  {products.map((p) => {
                    const symbol = markets.find(m => m.id === selectedMarketId)?.currencySymbol || '$';
                    const converted = getConvertedPrice(p.price, editingStrategy, symbol);
                    return (
                      <div key={p.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-neutral-50/50">
                        <div className="flex items-center space-x-3">
                          <img src={p.images[0]} alt={p.title} className="w-10 h-10 object-cover rounded border border-neutral-200 shrink-0" referrerPolicy="no-referrer" />
                          <div>
                            <span className="font-bold text-neutral-900 block">{p.title}</span>
                            <span className="text-[10px] text-neutral-400 font-mono tracking-wider mt-0.5 block">SKU: {p.sku}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6 font-mono text-right">
                          <div>
                            <span className="text-neutral-400 text-[10px] uppercase block">原定价 (EUR)</span>
                            <span className="font-bold text-neutral-500">€{p.price.toFixed(2)}</span>
                          </div>
                          <div className="text-neutral-900">
                            <span className="text-emerald-600 text-[10px] uppercase font-bold block">换算后结算价</span>
                            <strong className="text-black text-sm font-extrabold">{converted}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Screen 3: Edit B2B wholesale presets */}
      {currentScreen === 'edit_b2b' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentScreen('list')}
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-600" />
              </button>
              <div>
                <h1 className="text-sm font-bold text-[#1a1a1a]">欧美大宗批发货单 (B2B Core Setup)</h1>
                <p className="text-xs text-neutral-500">修改 B2B 结算账期或最低购货阀值的物理约束。</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setCurrentScreen('list');
                triggerToast('B2B 结算控制参数设置完成');
              }}
              className="shopify-btn-primary"
            >
              配置对账并保存
            </button>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 max-w-xl mx-auto space-y-4">
            <h3 className="text-xs font-bold text-neutral-800 border-b border-neutral-100 pb-2">B2B 合同控制参数</h3>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-neutral-500 block">批发价目表对账商号</label>
              <input 
                type="text"
                value={b2bConfig.catalogName}
                onChange={(e) => setB2bConfig(prev => ({ ...prev, catalogName: e.target.value }))}
                className="w-full bg-neutral-50 border border-neutral-250 p-2.5 text-xs rounded focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-neutral-500 block">基础起订商号金额 (EUR)</label>
                <input 
                  type="number"
                  value={b2bConfig.minOrderValue}
                  onChange={(e) => setB2bConfig(prev => ({ ...prev, minOrderValue: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-neutral-50 border border-neutral-250 p-2.5 text-xs rounded font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-neutral-500 block">单品购货起订件数</label>
                <input 
                  type="number"
                  value={b2bConfig.minOrderQty}
                  onChange={(e) => setB2bConfig(prev => ({ ...prev, minOrderQty: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-neutral-50 border border-neutral-250 p-2.5 text-xs rounded font-mono focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-neutral-500 block">结算发运支持账期 (Payment Terms)</label>
                <select 
                  value={b2bConfig.paymentTerm}
                  onChange={(e) => setB2bConfig(prev => ({ ...prev, paymentTerm: e.target.value as any }))}
                  className="w-full bg-neutral-50 border border-neutral-250 p-2.5 text-xs rounded focus:bg-white"
                >
                  <option value="Net 30">Net 30 (30天对账清算)</option>
                  <option value="Net 60">Net 60 (60天周期承兑)</option>
                  <option value="Due on receipt">Due on receipt (签收即清账)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-neutral-500 block">外部客群准入控制</label>
                <select 
                  value={b2bConfig.accessControl}
                  onChange={(e) => setB2bConfig(prev => ({ ...prev, accessControl: e.target.value as any }))}
                  className="w-full bg-neutral-50 border border-neutral-250 p-2.5 text-xs rounded focus:bg-white"
                >
                  <option value="invited">仅特邀白名单买家登录可见</option>
                  <option value="login">所有注册买手登录查看</option>
                  <option value="anyone">前台完全免签公开</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3 bg-neutral-50 rounded border border-neutral-200 text-xs text-neutral-500 leading-relaxed font-sans">
                💡 <strong className="text-black">对账契约说明:</strong> B2B 批发设置将通过系统事件总线级联挂载给结算收银模块。在前端 POS 或结账视图中，选择 “B2B 档案卡” 后将自动按这些起订及折扣梯度规则计算。
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
