import React, { useState } from 'react';
import { CreditCard, Truck, Percent, Trash2, Plus, Info } from 'lucide-react';

interface FinanceTabProps {
  settings: any;
  updateSettings: (vals: any) => void;
  triggerToast: (msg: string) => void;
  activeTab: string;
}

export default function FinanceTab({ settings, updateSettings, triggerToast, activeTab }: FinanceTabProps) {
  const paymentProviders = settings.paymentProviders || {};
  const shippingRates = settings.shippingRates || [];

  const [newRateName, setNewRateName] = useState('');
  const [newRateCost, setNewRateCost] = useState('5.00');

  const packages = settings.packages || [];
  const [pkgName, setPkgName] = useState('');
  const [pkgSize, setPkgSize] = useState('');

  if (activeTab === 'plan') {
    return (
      <div className="space-y-4">
        {/* Card 1: 当前计划 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#1A1A1A]" />
              资费与计划政策
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">查看和管理您当前的 SaaS 计划，切换并结算每月订阅开销。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="p-4 border border-[#E1E3E5] rounded-lg bg-[#F6F6F7] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#6D7175] uppercase block tracking-wider">订阅方案级别</span>
                <span className="text-base font-bold text-[#1A1A1A] block mt-0.5">{settings.plan || 'Shopify Regular Plan'}</span>
                <span className="text-xs text-[#6D7175] block mt-1">下一个账单寄送日期: 2026-07-01 (预计 €{settings.plan === 'Basic' ? '29.00' : settings.plan === 'Advanced' ? '299.00' : '79.00'})</span>
              </div>
              <span className="text-xs bg-black text-white px-3 py-1 rounded font-bold">按月划扣 (活跃中)</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#202223] block">切换其他计划规格</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'Basic', title: '基础商号 (Basic)', price: '€29/月', commission: '2.0% 附加费' },
                  { id: 'Shopify', title: '高精方案 (Shopify)', price: '€79/月', commission: '1.0% 精细佣金' },
                  { id: 'Advanced', title: '极客智选 (Advanced)', price: '€299/月', commission: '0.5% 超低佣金' }
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`p-4 border rounded-lg cursor-pointer flex flex-col justify-between transition-all ${
                      settings.plan === item.id ? 'border-black bg-[#F6F6F7]/50' : 'border-[#E1E3E5] hover:border-[#8C9196]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="plan_select"
                        checked={settings.plan === item.id}
                        onChange={() => {
                          updateSettings({ plan: item.id });
                          triggerToast(`成功升级/变更至: ${item.title}`);
                        }}
                        className="accent-black"
                      />
                      <span className="text-xs font-bold text-[#1A1A1A]">{item.title}</span>
                    </div>
                    <div className="mt-3">
                      <span className="text-sm font-bold block">{item.price}</span>
                      <span className="text-[11px] text-[#6D7175] block">{item.commission}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'payments') {
    return (
      <div className="space-y-4">
        {/* Card 1: 收单通道 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#1A1A1A]" />
              在线收单与网关参数
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">启用或停用全球第三方付款提供商，免除交易附加佣金并缩短回款账期。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'shopifyPayments', title: 'Shopify Payments 综合汇交', desc: '免除交易附加费政策，直连维萨与万事达信用卡账户。', enabled: paymentProviders.shopifyPayments },
                { id: 'paypal', title: 'PayPal Express 快捷结账', desc: '全球市集消费者装机必备选项，一键调起支付弹窗。', enabled: paymentProviders.paypal },
                { id: 'stripe', title: 'Stripe 国际银行结清', desc: '完美适合欧美市场小众地区快捷本币结算。', enabled: paymentProviders.stripe },
                { id: 'manualCod', title: '线下货到清点 (Cash On Delivery)', desc: '支持买家签收现场，通过清点实体现金完成清账。', enabled: paymentProviders.manualCod }
              ].map((item) => (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg flex flex-col justify-between transition-all ${
                    item.enabled ? 'border-black bg-[#F6F6F7]/20 font-medium' : 'border-[#E1E3E5]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-[#1A1A1A]">{item.title}</span>
                      <p className="text-[11px] text-[#6D7175] leading-normal mt-1">{item.desc}</p>
                    </div>
                    {/* Compact iOS Toggle in grayscale */}
                    <button
                      type="button"
                      onClick={() => {
                        updateSettings({
                          paymentProviders: {
                            ...paymentProviders,
                            [item.id]: !item.enabled
                          }
                        });
                        triggerToast(`${item.title} 状态已更新`);
                      }}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 outline-none shrink-0 ${
                        item.enabled ? 'bg-black' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          item.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'shipping') {
    return (
      <div className="space-y-4">
        {/* Card 1: 运费核销 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#1A1A1A]" />
              国际自营物流配送费率
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">设置专属于特定发货区域的各公斤段快递包裹基本邮资。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="border border-[#E1E3E5] divide-y divide-[#E1E3E5] rounded-md overflow-hidden">
              {shippingRates.map((rate) => (
                <div key={rate.id} className="p-3.5 flex justify-between items-center bg-white hover:bg-[#F6F6F7]/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1A1A1A]">{rate.name}</span>
                      <span className="text-[10px] bg-black text-white px-1.5 py-0.2 rounded font-bold">{rate.zone}</span>
                    </div>
                    <span className="text-xs text-[#6D7175] block mt-0.5">限制条件: {rate.condition}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#1A1A1A]">
                      {rate.cost === 0 ? '免费直邮' : `€${rate.cost.toFixed(2)}`}
                    </span>
                    <button
                      onClick={() => {
                        updateSettings({
                          shippingRates: shippingRates.filter(r => r.id !== rate.id)
                        });
                        triggerToast('物流资费政策已剔除');
                      }}
                      className="text-[#8C9196] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* shipping rate builder */}
            <div className="p-4 bg-[#F6F6F7]/30 border border-dashed border-[#E1E3E5] rounded-lg space-y-3">
              <span className="text-xs font-semibold text-[#1A1A1A] block">自定义新增一条邮资挡位</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="邮资别名 (例: 亚欧快速专递 - DHL)"
                  value={newRateName}
                  onChange={(e) => setNewRateName(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded-md px-3 h-9 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
                <input
                  type="number"
                  placeholder="保税邮费金额 (EUR €)"
                  value={newRateCost}
                  onChange={(e) => setNewRateCost(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded-md px-3 h-9 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!newRateName) return;
                    updateSettings({
                      shippingRates: [...shippingRates, {
                        id: String(Date.now()),
                        zone: '意大利国内',
                        name: newRateName,
                        cost: Number(newRateCost),
                        condition: '所有订单'
                      }]
                    });
                    setNewRateName('');
                    setNewRateCost('5.00');
                    triggerToast('新国际保税货运费率增设完毕');
                  }}
                  className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-xs font-semibold rounded-md transition-all cursor-pointer"
                >
                  增加邮资规则
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: 包装尺寸 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A]">标准包装预设</h2>
            <p className="text-xs text-[#6D7175] mt-1">录入您平日常备的纸箱及防静电包装盒参数，用于算费及运费便签打印。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {packages.map((pkg, idx) => (
                <div key={idx} className="p-3 border border-[#E1E3E5] rounded-md bg-white flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-[#1A1A1A] block">{pkg.name}</span>
                    <span className="text-[11px] text-[#6D7175] block mt-0.5">尺寸: {pkg.size} • 空载重: {pkg.emptyWeight}</span>
                  </div>
                  <button
                    onClick={() => {
                      updateSettings({
                        packages: packages.filter((_, i) => i !== idx)
                      });
                      triggerToast('包装模板已移除');
                    }}
                    className="text-[#8C9196] hover:text-red-500 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#F6F6F7]/30 border border-dashed border-[#E1E3E5] rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="包装模板别名"
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded-md px-3 h-9 text-sm focus:ring-1 focus:ring-black"
                />
                <input
                  type="text"
                  placeholder="尺寸 (例: 45×30×20 cm)"
                  value={pkgSize}
                  onChange={(e) => setPkgSize(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded-md px-3 h-9 text-sm focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!pkgName || !pkgSize) return;
                    updateSettings({
                      packages: [...packages, { name: pkgName, size: pkgSize, emptyWeight: '0.2 kg' }]
                    });
                    setPkgName('');
                    setPkgSize('');
                    triggerToast('常备货包装规格预设成功');
                  }}
                  className="h-8 px-3 bg-[#303030] hover:bg-[#1A1A1A] text-white text-xs font-semibold rounded-md transition-all"
                >
                  增置包装模板
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'taxes') {
    return (
      <div className="space-y-4">
        {/* Card 1: 增值税计算模式 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Percent className="w-5 h-5 text-[#1A1A1A]" />
              欧盟增值税计入与核销规则 (VAT)
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">控制您的店铺前台在结算结账时，产品列表价格中是否预先整合相应的进口销项增值税费。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="p-4 border border-[#E1E3E5] rounded-lg bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-900 font-mono">意大利属地默认 VAT 精确汇率</span>
                  <span className="text-[10px] bg-neutral-900 text-white font-bold px-1.5 py-0.2 rounded">进口计税</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  当前处于 Europe Mode，欧盟申根核心区域统一预警 VAT 销税率为 22%。您可在右栏直接覆盖覆写该比例。
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#6D7175]">基准计税率:</span>
                <input
                  type="number"
                  value={settings.taxRate || 19}
                  onChange={(e) => {
                    updateSettings({ taxRate: Number(e.target.value) });
                  }}
                  className="w-16 h-9 bg-white border border-[#8C9196] rounded-md text-center font-mono text-sm font-bold"
                />
                <span className="text-xs font-semibold text-[#6D7175]">%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6D7175] bg-[#F6F6F7] p-3 rounded-md border border-[#E1E3E5]">
              <Info className="w-4 h-4 text-black shrink-0" />
              <span>所有买家账款发票，将基于此项销税系数进行逆推，并在财务记账中心生成明细报表。</span>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E1E3E5]">
              <button
                type="button"
                onClick={() => triggerToast('中枢增值销税核算矩阵已就绪')}
                className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-sm font-semibold rounded-md transition-all cursor-pointer"
              >
                保存税率参数
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
