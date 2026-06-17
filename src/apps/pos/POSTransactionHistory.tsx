import React from 'react';
import { useOrderStore } from '../../stores/orderStore';
import { Order } from '../../types';
import { Printer, RefreshCw, Trash2, FileText, FileSearch } from 'lucide-react';

interface POSTransactionHistoryProps {
  onViewInvoice: (order: Order) => void;
  onToast: (msg: string) => void;
}

export default function POSTransactionHistory({ onViewInvoice, onToast }: POSTransactionHistoryProps) {
  const orders = useOrderStore((state) => state.orders);
  const updateOrder = useOrderStore((state) => state.updateOrder);
  const deleteOrder = useOrderStore((state) => state.deleteOrder);

  // 仅筛选 POS 交易产生的订单
  const posOrders = React.useMemo(() => {
    return orders.filter(
      (o) => o.id.startsWith('pos-') || (o.notes && o.notes.includes('POS'))
    );
  }, [orders]);

  // 退款/撤销单项处理
  const handleRefund = (orderId: string) => {
    updateOrder(orderId, {
      paymentStatus: 'refunded',
      fulfillmentStatus: 'unfulfilled',
    });
    onToast('已取消此单并置为已退款状态');
  };

  const handleDelete = (orderId: string) => {
    deleteOrder(orderId);
    onToast('已彻底删除此笔销售流水记录');
  };

  return (
    <div className="bg-white border border-[#E1E3E5] rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 border-b border-[#F1F2F4] bg-neutral-50 flex justify-between items-center">
        <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider font-sans flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#07C2E3]" />
          <span>终端零售流水账目表 (POS Transaction Ledger)</span>
        </h3>
        <span className="text-[10px] font-mono font-bold text-neutral-400">
          共 {posOrders.length} 笔流水记录
        </span>
      </div>

      <div className="overflow-x-auto w-full">
        {posOrders.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 flex flex-col items-center justify-center space-y-2">
            <FileSearch className="w-8 h-8 text-neutral-300" />
            <p className="text-xs font-medium">今天暂无结账流水记录</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-[#F1F2F4] text-neutral-500 font-bold">
                <th className="p-3">流水号</th>
                <th className="p-3">交易顾客</th>
                <th className="p-3 text-right">交易项数</th>
                <th className="p-3 text-right font-mono">优惠扣减</th>
                <th className="p-3 text-right font-mono">代征附加税</th>
                <th className="p-3 text-right font-mono">销售实收金额</th>
                <th className="p-3">支付/履约状态</th>
                <th className="p-3">销售终端时间</th>
                <th className="p-3 text-center">快捷收银台操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F2F4]">
              {posOrders.map((o) => {
                const totalQty = o.items.reduce((acc, cur) => acc + cur.quantity, 0);
                return (
                  <tr key={o.id} className="hover:bg-neutral-50/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-neutral-900">
                      {o.name}
                    </td>
                    <td className="p-3 text-neutral-700">
                      {o.customerName}
                    </td>
                    <td className="p-3 text-right text-neutral-600 font-medium">
                      {totalQty} 件
                    </td>
                    <td className="p-3 text-right font-mono text-neutral-600">
                      {o.discountAmount && o.discountAmount > 0 ? `-€ ${o.discountAmount.toFixed(2)}` : '€ 0.00'}
                    </td>
                    <td className="p-3 text-right font-mono text-neutral-500">
                      € {o.tax ? o.tax.toFixed(2) : '0.00'}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-neutral-900">
                      € {o.total.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded-sm uppercase ${
                            o.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : o.paymentStatus === 'refunded'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-neutral-50 text-neutral-700 border border-neutral-100'
                          }`}
                        >
                          {o.paymentStatus === 'paid' ? '已收款' : '已退款/闭仓'}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded-sm uppercase ${
                            o.fulfillmentStatus === 'fulfilled'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-neutral-50 text-neutral-700 border border-neutral-100'
                          }`}
                        >
                          {o.fulfillmentStatus === 'fulfilled' ? '已自提交付' : '未付货'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-neutral-500 font-mono text-[10px]">
                      {new Date(o.createdAt).toLocaleString('zh-CN', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewInvoice(o)}
                          className="p-1 text-neutral-600 hover:text-[#07C2E3] hover:bg-neutral-100 rounded transition-all cursor-pointer"
                          title="查看并复打热敏小票"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        
                        {o.paymentStatus !== 'refunded' && (
                          <button
                            onClick={() => handleRefund(o.id)}
                            className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition-all cursor-pointer"
                            title="办理现场退款/废单"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(o.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all cursor-pointer"
                          title="物理抹除此项账目记录"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
