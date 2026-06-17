import React, { useState } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingCart, Percent, ArrowUpRight, ArrowDownRight,
  Download, Calendar, RefreshCw 
} from 'lucide-react';

export default function AnalyticsView() {
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  // Mock charts stats data
  const billingChartData = [
    { name: 'Mon', sales: 1240, orders: 12, sessions: 210 },
    { name: 'Tue', sales: 1890, orders: 18, sessions: 350 },
    { name: 'Wed', sales: 2300, orders: 22, sessions: 420 },
    { name: 'Thu', sales: 1540, orders: 15, sessions: 280 },
    { name: 'Fri', sales: 2890, orders: 26, sessions: 540 },
    { name: 'Sat', sales: 3400, orders: 32, sessions: 690 },
    { name: 'Sun', sales: 4100, orders: 39, sessions: 810 },
  ];

  const channelData = [
    { name: '旗舰展示网店', value: 12840, color: '#111111' },
    { name: '实体 iPad POS', value: 5890, color: '#444444' },
    { name: 'Instagram 社交收单', value: 3450, color: '#888888' },
    { name: 'B2B 阶梯大宗调价', value: 4500, color: '#BBBBBB' }
  ];

  return (
    <div id="analytics-view-root" className="space-y-6">
      
      {/* Grayscale elegant Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A1A1A] text-white text-xs font-semibold py-2.5 px-4 rounded-md shadow-lg border border-neutral-800 flex items-center space-x-2">
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">📊 商业智能大盘 (Analytics)</h1>
          <p className="text-xs text-[#6e6e6e] mt-1">
            商铺流量总揽、转化率结算归因、客单价变动以及销售管道占比。
          </p>
        </div>
        
        <div className="flex space-x-2 mt-3 md:mt-0">
          <button 
            onClick={() => triggerToast('已更新至最近 1 分钟的全部交易档案')}
            className="shopify-btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>实时刷新</span>
          </button>
          <button 
            onClick={() => triggerToast('商业智能 PDF 完整报单已发出导出队列')}
            className="shopify-btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出经营总报</span>
          </button>
        </div>
      </div>

      {/* Modern High-Impact Grid Summary Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-2xs">
          <div className="flex justify-between items-center text-[#6e6e6e]">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">总网销售额</span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-xl font-bold font-mono text-black mt-1">€26,680.00</p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18.4%</span>
            <span className="text-neutral-400 font-normal">对比上旬区间</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-2xs">
          <div className="flex justify-between items-center text-[#6e6e6e]">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">商铺访客数</span>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-xl font-bold font-mono text-black mt-1">3,300人</p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+34.2%</span>
            <span className="text-neutral-400 font-normal">在线心跳 12人</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-2xs">
          <div className="flex justify-between items-center text-[#6e6e6e]">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">结账转化比</span>
            <Percent className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-xl font-bold font-mono text-black mt-1">4.62%</p>
          <div className="flex items-center gap-1.5 text-[10px] text-rose-600 font-semibold mt-1">
            <ArrowDownRight className="w-3 h-3" />
            <span>-0.12%</span>
            <span className="text-neutral-400 font-normal">结算流损控制良</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-2xs">
          <div className="flex justify-between items-center text-[#6e6e6e]">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">客群均客单价</span>
            <ShoppingCart className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-xl font-bold font-mono text-black mt-1">€162.00</p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+5.6%</span>
            <span className="text-neutral-400 font-normal">搭配销售见成效</span>
          </div>
        </div>

      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales trend chart - 2 span */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 p-4 rounded-lg shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
            <span className="text-xs font-bold text-neutral-800">本周对账销售走势 & 访客留痕</span>
            <span className="text-[10px] font-mono text-neutral-400">周一至周日周期统计</span>
          </div>

          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={billingChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111111" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#111111" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#aeaeae" fontSize={9} tickLine={false} />
                <YAxis stroke="#aeaeae" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#1a1a1a', border: 'none', borderRadius: '4px', fontSize: '10px', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#111111" strokeWidth={1.8} fillOpacity={1} fill="url(#colorSales)" name="销售额 (€)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales channels distribution - 1 span */}
        <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold text-neutral-800">销售管道结账贡献</span>
            </div>

            <div className="mt-4 space-y-3">
              {channelData.map((channel, i) => {
                const total = channelData.reduce((acc, c) => acc + c.value, 0);
                const percent = ((channel.value / total) * 100).toFixed(0);
                return (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-neutral-700">{channel.name}</span>
                      <span className="font-bold font-mono text-black">{percent}%</span>
                    </div>
                    
                    {/* Visual Bar Indicator */}
                    <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-black"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono text-right">
                      €{channel.value.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 text-[10.5px] text-neutral-500 leading-relaxed font-sans">
            ☝️ <strong className="text-black">智能合并建议:</strong> POS 实体门店出单比率对比去年有大幅上游。配合出海市场的 Markets 汇率优化可以多赚 3.5% 点差。
          </div>
        </div>

      </div>

    </div>
  );
}
