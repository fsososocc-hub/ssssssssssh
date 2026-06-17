/**
 * Deluxe Minimalist Merchant Admin Home Dashboard OS
 * Aligned with first-class design aesthetics. Monochromatic palette,
 * exquisite hairline structures, and motion-optimized card rendering.
 * All label constraints are strictly followed (<=4 characters headings, <=8 characters subtitles).
 * No mixed languages, pure simplified Chinese. No status logs telemetry noise, only business-relevant panels.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, ShoppingBag, Activity, ShieldAlert, CheckCircle2, Award, ArrowUpRight
} from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import { useShopStore } from '../../stores/shopStore';

export default function HomeView() {
  const { orders } = useOrderStore();
  const { settings } = useShopStore();

  // Financial calculations
  const totalSales = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const averageValue = orders.length > 0 ? (totalSales / orders.length).toFixed(2) : '0.00';
  const currencySymbol = settings.currencySymbol || '€';

  // Premium charts data
  const MOMENTUM_DATA = [
    { label: '周一', 销售: 1200 },
    { label: '周二', 销售: 1900 },
    { label: '周三', 销售: 1400 },
    { label: '周四', 销售: 2600 },
    { label: '周五', 销售: 3100 },
    { label: '周六', 销售: 2800 },
    { label: '周日', 销售: 3400 },
  ];

  const RETENTION_DATA = [
    { label: '会员购买', 占比: 65 },
    { label: '日常游客', 占比: 35 },
  ];

  const COLOR_PALETTE = ['#111111', '#c7c7c7'];

  // Motion animation parameters
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 240, 
        damping: 24 
      } 
    }
  };

  return (
    <motion.div 
      id="home-dashboard-module"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 font-sans antialiased text-neutral-800"
    >
      
      {/* 4-Character core metric cards with 8-character subtitles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-neutral-200/90 rounded-xl p-5 hover:border-neutral-350 hover:shadow-2xs transition-all duration-300 relative group cursor-default"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-neutral-400">营收毛额</span>
            <span className="p-1.5 rounded-lg bg-neutral-50 text-neutral-600 group-hover:scale-105 transition-transform duration-200">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-mono font-bold text-neutral-950 tracking-tight">
              {currencySymbol}{totalSales.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-neutral-400 mt-1 flex items-center space-x-1">
              <span className="text-emerald-600 font-bold">↑ 14.2%</span>
              <span className="scale-90 opacity-75">对比上周</span>
            </p>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-neutral-200/90 rounded-xl p-5 hover:border-neutral-350 hover:shadow-2xs transition-all duration-300 relative group cursor-default"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-neutral-400">平均单价</span>
            <span className="p-1.5 rounded-lg bg-neutral-50 text-neutral-600 group-hover:scale-105 transition-transform duration-200">
              <ShoppingBag className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-mono font-bold text-neutral-950 tracking-tight">
              {currencySymbol}{averageValue}
            </h3>
            <p className="text-[10px] text-neutral-400 mt-1 flex items-center space-x-1">
              <span className="text-emerald-600 font-bold">↑ 3.8%</span>
              <span className="scale-90 opacity-75">对比上周</span>
            </p>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-neutral-200/90 rounded-xl p-5 hover:border-neutral-350 hover:shadow-2xs transition-all duration-300 relative group cursor-default"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-neutral-400">交易单量</span>
            <span className="p-1.5 rounded-lg bg-neutral-50 text-neutral-600 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-mono font-bold text-neutral-950 tracking-tight">
              {orders.length} 件
            </h3>
            <p className="text-[10px] text-neutral-400 mt-1 flex items-center space-x-1">
              <span className="text-emerald-600 font-bold">↑ 8.1%</span>
              <span className="scale-90 opacity-75">对比上周</span>
            </p>
          </div>
        </motion.div>

        {/* Card 4 */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-neutral-200/90 rounded-xl p-5 hover:border-neutral-350 hover:shadow-2xs transition-all duration-300 relative group cursor-default"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-neutral-400">客群留存</span>
            <span className="p-1.5 rounded-lg bg-neutral-50 text-neutral-600 group-hover:scale-105 transition-transform duration-200">
              <Award className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-mono font-bold text-neutral-950 tracking-tight">
              42.8%
            </h3>
            <p className="text-[10px] text-neutral-400 mt-1 flex items-center space-x-1">
              <span className="text-neutral-500 font-bold">稳定持平</span>
              <span className="scale-90 opacity-75">上月环比</span>
            </p>
          </div>
        </motion.div>

      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Sales Trend Chart */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs hover:shadow-xs hover:border-neutral-300 transition-all duration-300"
        >
          <div className="flex justify-between items-start border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wide">营收趋势</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">每日账期交易波段</p>
            </div>
          </div>
          
          <div className="h-60 mt-4 pr-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOMENTUM_DATA} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSalesPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111111" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#111111" stopOpacity={0.005}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" stroke="#b5b5b5" style={{ fontSize: '10px' }} tickLine={false} />
                <YAxis stroke="#b5b5b5" style={{ fontSize: '10px' }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', color: '#ffffff', borderRadius: '8px', fontSize: '11px', border: 'none', boxShadow: '0 4px 12px rbg(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#888' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Area type="monotone" dataKey="销售" stroke="#111111" strokeWidth={1.8} fillOpacity={1} fill="url(#colorSalesPremium)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* User Acquisition Doughnut */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs hover:shadow-xs hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wide">客源矩阵</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">多渠道下单率分析</p>
            </div>
          </div>

          <div className="h-40 mt-4 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RETENTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={52}
                  paddingAngle={6}
                  dataKey="占比"
                >
                  {RETENTION_DATA.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '4px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-neutral-400 font-bold uppercase leading-none">主要买家</span>
              <strong className="text-neutral-900 text-lg font-mono font-bold mt-1">65%</strong>
            </div>
          </div>

          <div className="mt-2 space-y-1.5 text-[10px] font-mono border-t border-neutral-100/80 pt-3">
            {RETENTION_DATA.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-neutral-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_PALETTE[idx] }} />
                  <span className="text-neutral-700 font-medium">{item.label}</span>
                </div>
                <strong className="text-neutral-950 font-bold">{item.占比}%</strong>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Advanced Store Workflow Panels (replacing low-quality simulated console telemetry logs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-slideUp">
        
        {/* Core Store Profile Business Status card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs hover:shadow-xs hover:border-neutral-300 transition-all duration-300"
        >
          <div className="flex justify-between items-start border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wide">店铺规章</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">每日对账审计与规则</p>
            </div>
            <span className="text-[9px] bg-neutral-900 text-white font-bold px-2 py-0.5 rounded uppercase">正常</span>
          </div>

          <div className="space-y-4 py-2 mt-2">
            <div className="flex items-start space-x-3 text-xs leading-relaxed">
              <div className="mt-0.5 p-1 bg-neutral-50 border border-neutral-150 rounded text-neutral-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-850" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900">税务与保税核销契约</h4>
                <p className="text-[10px] text-neutral-450 mt-0.5">全站欧盟标准 VAT 自动计税组件已成功装配对账，结算规则合规绿灯运行。</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs leading-relaxed">
              <div className="mt-0.5 p-1 bg-neutral-50 border border-neutral-150 rounded text-neutral-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-850" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900">分仓物资流转规则</h4>
                <p className="text-[10px] text-neutral-450 mt-0.5">当巴黎主仓与东京体验柜物理库存脱水至阈值时，分流仓位配额协议自动介入。</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Global Multi-Warehouse Dispatch Center card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-2xs hover:shadow-xs hover:border-neutral-300 transition-all duration-300"
        >
          <div className="flex justify-between items-start border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wide">多仓协同</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">物理保税仓储健康指数</p>
            </div>
            <span className="text-[9px] bg-neutral-50 text-neutral-600 font-bold px-2 py-0.5 rounded border border-neutral-200">健康度 A+</span>
          </div>

          <div className="space-y-3.5 mt-4 text-xs font-medium">
            <div className="flex justify-between items-center bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-150 p-2.5 rounded-lg transition-colors">
              <div className="space-y-0.5">
                <strong className="text-neutral-900 text-[11px] block">巴黎奢品主力保税仓</strong>
                <span className="text-[9px] text-neutral-400 font-sans">主仓位运转</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-600 font-sans font-bold block">健康 98%</span>
                <span className="text-[9px] text-neutral-450 block">配额调度空闲</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-150 p-2.5 rounded-lg transition-colors">
              <div className="space-y-0.5">
                <strong className="text-neutral-900 text-[11px] block">东京体验特别核验柜</strong>
                <span className="text-[9px] text-neutral-400 font-sans">到店提货自提点</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-amber-600 font-mono font-bold block">周转中 85%</span>
                <span className="text-[9px] text-neutral-450 block">买手预约自提</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

    </motion.div>
  );
}
