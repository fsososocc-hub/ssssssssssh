import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, Download, Eye, ArrowUpRight, 
  CreditCard, Calendar, Filter, FileSpreadsheet, Percent, Coins, Building, ShieldCheck
} from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import { useShopStore } from '../../stores/shopStore';

export default function FinanceView() {
  const { orders } = useOrderStore();
  const { settings } = useShopStore();
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  // Mock payouts history list
  const payouts = [
    { id: 'PAY-8902', date: '2026-06-15', account: 'UNICREDIT (*9902)', amount: 5690.00, status: '已付到账' },
    { id: 'PAY-8891', date: '2026-06-08', account: 'UNICREDIT (*9902)', amount: 4850.50, status: '已付到账' },
    { id: 'PAY-8780', date: '2026-06-01', account: 'UNICREDIT (*9902)', amount: 6120.00, status: '已付到账' },
    { id: 'PAY-8612', date: '2026-05-25', account: 'UNICREDIT (*9902)', amount: 3950.00, status: '已付到账' },
  ];

  // Mock invoicing bills
  const bills = [
    { id: 'INV-202606', date: '2026-06-01', type: '平台月度资费套餐 & 算卡手续费', amount: 329.00, status: '已付' },
    { id: 'INV-202605', date: '2026-05-01', type: '平台月度资费套餐 & 外部插件费', amount: 299.00, status: '已付' },
  ];

  const totalSales = orders.reduce((acc, o) => o.paymentStatus === 'paid' ? acc + o.total : acc, 0);
  const totalPending = orders.reduce((acc, o) => o.paymentStatus === 'pending' ? acc + o.total : acc, 0);

  return (
    <div id="finance-view-root" className="space-y-6">
      
      {/* Grayscale elegant Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A1A1A] text-white text-xs font-semibold py-2.5 px-4 rounded-md shadow-lg border border-neutral-800 flex items-center space-x-2">
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">💳 财务结算与账单中心 (Finance)</h1>
          <p className="text-xs text-[#6e6e6e] mt-1">
            监控线上收单流水结算进度、对账到账记录以及 Atelier Noir 订阅发票。
          </p>
        </div>
        
        <div className="flex space-x-2 mt-3 md:mt-0">
          <button 
            onClick={() => triggerToast('对账成功！已申请本周提前清算')}
            className="shopify-btn-primary flex items-center gap-1.5"
          >
            <Coins className="w-4 h-4" />
            <span>申请清算本周资金</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-[#6e6e6e] uppercase tracking-wider font-mono">账户余额 (可结)</span>
            <Building className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-xl font-bold font-mono text-black mt-1">€4,520.10</p>
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-1">
            <span>下个自动划款日: 6月22日</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-[#6e6e6e] uppercase tracking-wider font-mono">本月实收 (已清算)</span>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-xl font-bold font-mono text-black mt-1">€{totalSales.toFixed(2)}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium mt-1">
            <span>100% 收单结算链路在线</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-[#6e6e6e] uppercase tracking-wider font-mono">在途资金 (待结算)</span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-xl font-bold font-mono text-black mt-1">€{totalPending.toFixed(2)}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-1">
            <span>待买家提货签收确认</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-4 rounded-lg shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-[#6e6e6e] uppercase tracking-wider font-mono">本币收单结算通道</span>
            <ShieldCheck className="w-4 h-4 text-neutral-450" />
          </div>
          <p className="text-sm font-bold text-black mt-2">Shopify Payments</p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold mt-1">
            <span>手续费率: 2.1% + €0.25</span>
          </div>
        </div>
      </div>

      {/* Main Row Payouts lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left payouts table (2 spans) */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50/50 flex justify-between items-center">
            <span className="text-xs font-bold text-neutral-800">打款划账流水 (Payouts)</span>
            <button 
              onClick={() => triggerToast('CSV打款明细报单已发送至注册邮箱')}
              className="text-[#646464] hover:text-black font-semibold text-[10.5px] p-1 flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>导出对账表</span>
            </button>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/30 border-b border-neutral-200 text-[#6e6e6e]">
                <th className="p-3 font-semibold">打款批次 ID</th>
                <th className="p-3 font-semibold">结算打款日期</th>
                <th className="p-3 font-semibold">目标对账账户</th>
                <th className="p-3 font-semibold">批次合计金额</th>
                <th className="p-3 font-semibold text-right">结算状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-mono">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/30">
                  <td className="p-3 font-bold text-neutral-900">{p.id}</td>
                  <td className="p-3 text-neutral-500">{p.date}</td>
                  <td className="p-3 text-neutral-700 font-sans">{p.account}</td>
                  <td className="p-3 text-black font-bold">€{p.amount.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    <span className="inline-block text-[10px] bg-emerald-50 text-emerald-700 font-sans px-2 py-0.5 rounded-full font-bold">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right billing invoice logs (1 span) */}
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-2xs flex flex-col justify-between">
          <div>
            <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50/50">
              <span className="text-xs font-bold text-neutral-800">系统账期账单费用 (Bills)</span>
            </div>

            <div className="divide-y divide-neutral-200 text-xs">
              {bills.map((b) => (
                <div key={b.id} className="p-3.5 space-y-2 hover:bg-neutral-50/20">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-neutral-900">{b.id}</span>
                    <span className="text-[10px] font-mono text-neutral-400">{b.date}</span>
                  </div>
                  <p className="text-[#6e6e6e] text-[11px] leading-relaxed">{b.type}</p>
                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="font-bold text-black">€{b.amount.toFixed(2)}</span>
                    <span className="bg-neutral-100 text-[#444] px-1.5 py-0.2 rounded font-bold">{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-neutral-200 bg-neutral-50/50">
            <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">主力收单信用卡</h5>
            <div className="flex items-center justify-between text-xs bg-white border border-neutral-205 p-2.5 rounded-md mt-2">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-neutral-500" />
                <span className="font-bold">VISA (*8920)</span>
              </div>
              <span className="text-[#aeaeae] font-mono text-[10px]">校验截止 08/29</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
