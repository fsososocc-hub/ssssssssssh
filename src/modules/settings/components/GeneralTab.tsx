import React, { useState } from 'react';
import { Building, MapPin, Globe, Trash2, Plus, Languages } from 'lucide-react';

interface GeneralTabProps {
  settings: any;
  updateSettings: (vals: any) => void;
  triggerToast: (msg: string) => void;
  activeTab: string;
}

export default function GeneralTab({ settings, updateSettings, triggerToast, activeTab }: GeneralTabProps) {
  const warehouseLocations = settings.warehouseLocations || [];
  const [newLocName, setNewLocName] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');

  const markets = settings.marketsList || [];
  const [newMarketName, setNewMarketName] = useState('');
  const [newMarketRegion, setNewMarketRegion] = useState('');

  const storeLanguages = settings.storeLanguages || [];
  const [newLanguage, setNewLanguage] = useState('');

  if (activeTab === 'general') {
    return (
      <div className="space-y-4">
        {/* Card 1: 店铺详情 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#1A1A1A]" />
              店铺详情
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">这是您的店铺名称，显示在邮件、发票与浏览器网页标签中。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#202223] block">店铺名称</label>
                <input
                  type="text"
                  value={settings.shopName || ''}
                  onChange={(e) => updateSettings({ shopName: e.target.value })}
                  className="w-full h-9 px-3 border border-[#8C9196] rounded-md text-sm bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#202223] block">账号邮箱</label>
                <input
                  type="email"
                  value={settings.shopEmail || ''}
                  onChange={(e) => updateSettings({ shopEmail: e.target.value })}
                  className="w-full h-9 px-3 border border-[#8C9196] rounded-md text-sm bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#202223] block">发件人邮箱</label>
                <input
                  type="email"
                  defaultValue="hello@mystore.com"
                  className="w-full h-9 px-3 border border-[#8C9196] rounded-md text-sm bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                />
                <span className="text-xs text-[#6D7175] block">所有客户邮件的发件人地址。建议验证您的域名。</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#202223] block">客服电话</label>
                <input
                  type="text"
                  defaultValue="+39 02 1234567"
                  className="w-full h-9 px-3 border border-[#8C9196] rounded-md text-sm bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-[#E1E3E5]">
              <button
                type="button"
                onClick={() => triggerToast('店铺详情已成功保存')}
                className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-sm font-medium rounded-md transition-all active:scale-95 cursor-pointer"
              >
                保存店铺信息
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: 店铺地址 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A]">店铺地址</h2>
            <p className="text-xs text-[#6D7175] mt-1">用于税务计算、运费计算及相关的法律文件。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#202223] block">地址第1行</label>
                <input
                  type="text"
                  defaultValue="米兰市商业区88号"
                  className="w-full h-9 px-3 border border-[#8C9196] rounded-md text-sm bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#202223] block">地址第2行</label>
                <input
                  type="text"
                  defaultValue="3楼 301室"
                  className="w-full h-9 px-3 border border-[#8C9196] rounded-md text-sm bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-[#202223] block">城市</label>
                <input
                  type="text"
                  defaultValue="米兰"
                  className="w-full h-9 px-3 border border-[#8C9196] rounded-md text-sm bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#202223] block">邮政编码</label>
                <input
                  type="text"
                  defaultValue="20100"
                  className="w-full h-9 px-3 border border-[#8C9196] rounded-md text-sm bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#202223] block">国家/地区</label>
                <select className="w-full h-9 px-3 border border-[#8C9196] rounded-md text-sm bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors">
                  <option value="IT">意大利 (Italy)</option>
                  <option value="CN">中国 (China)</option>
                  <option value="US">美国 (United States)</option>
                  <option value="DE">德国 (Germany)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-[#E1E3E5]">
              <button
                type="button"
                onClick={() => triggerToast('店铺地址已保存')}
                className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-sm font-medium rounded-md transition-all cursor-pointer"
              >
                保存地址信息
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: 标准和格式 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A]">标准和格式</h2>
            <p className="text-xs text-[#6D7175] mt-1">影响您的订单时间戳、报告统计与物理重量结算格式。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#202223] block">时区</label>
                <select
                  value={settings.timezone || 'Europe/Rome'}
                  onChange={(e) => updateSettings({ timezone: e.target.value })}
                  className="w-full h-9 px-3 border border-[#8C9196] rounded-md text-sm bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                >
                  <option value="Europe/Rome">欧洲/罗马 (UTC+2)</option>
                  <option value="Asia/Shanghai">亚洲/上海 (UTC+8)</option>
                  <option value="America/New_York">北美/纽约 (UTC-4)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#202223] block">测量制度</label>
                <select className="w-full h-9 px-3 border border-[#8C9196] rounded-md text-sm bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors">
                  <option value="metric">公制 (千克, 厘米)</option>
                  <option value="imperial">英制 (磅, 英寸)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#202223] block">店铺本币政策</label>
                <select
                  value={settings.currency || 'EUR'}
                  onChange={(e) => {
                    const symb = e.target.value === 'CNY' ? '¥' : e.target.value === 'USD' ? '$' : '€';
                    updateSettings({ currency: e.target.value, currencySymbol: symb });
                  }}
                  className="w-full h-9 px-3 border border-[#8C9196] rounded-md text-sm bg-white focus:border-black focus:ring-1 focus:ring-black outline-none font-medium transition-colors"
                >
                  <option value="EUR">欧元 (EUR €)</option>
                  <option value="USD">美元 (USD $)</option>
                  <option value="CNY">人民币 (CNY ¥)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-[#E1E3E5]">
              <button
                type="button"
                onClick={() => triggerToast('格式与本币偏置成功更新')}
                className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-sm font-medium rounded-md transition-all cursor-pointer"
              >
                保存标准格式
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'locations') {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1A1A1A]" />
              分发地点与物流仓库
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">管理您的备货仓库与线下门店提货自提柜，控制发件流转规则。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {warehouseLocations.map((loc, idx) => (
                <div key={idx} className="p-4 border border-[#E1E3E5] rounded-lg bg-[#F6F6F7] relative">
                  <button
                  onClick={() => {
                    updateSettings({ warehouseLocations: warehouseLocations.filter((_, i) => i !== idx) });
                    triggerToast('仓库已成功停用并下线');
                  }}
                    className="absolute top-3 right-3 text-[#8C9196] hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{loc.name}</p>
                  <p className="text-xs text-[#6D7175] mt-1 font-medium">{loc.address}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-bold">{loc.type}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded font-semibold">{loc.status}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Location Adder */}
            <div className="p-4 rounded-lg border border-dashed border-[#E1E3E5] bg-[#F6F6F7]/30 space-y-3">
              <span className="text-xs font-semibold text-[#1A1A1A] block">添加新地点或提货柜</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="仓库或门店名称 (例: 意北副厂调度仓)"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded-md px-3 h-9 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
                <input
                  type="text"
                  placeholder="地址与门牌号"
                  value={newLocAddress}
                  onChange={(e) => setNewLocAddress(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded-md px-3 h-9 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!newLocName || !newLocAddress) return;
                    updateSettings({
                      warehouseLocations: [...warehouseLocations, {
                        name: newLocName,
                        address: newLocAddress,
                        type: '一般分发点',
                        status: '营业中'
                      }]
                    });
                    setNewLocName('');
                    setNewLocAddress('');
                    triggerToast('新物理分拨地点增设就绪');
                  }}
                  className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增备货仓
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'languages') {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Languages className="w-4 h-4 text-[#1A1A1A]" />
              店铺展示语言
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">管理您在前台网页向买家展示的多语言偏好，满足多国家交易要求。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="divide-y divide-[#E1E3E5] border border-[#E1E3E5] rounded-md overflow-hidden">
              {storeLanguages.map((lang, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between bg-white hover:bg-[#F6F6F7]/40">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1A1A1A]">{lang}</span>
                    {idx === 0 && <span className="text-[10px] bg-black text-white px-1.5 py-0.2 rounded font-bold">主默认语言</span>}
                  </div>
                  <div>
                    {idx > 0 && (
                      <button
                      onClick={() => {
                        updateSettings({ storeLanguages: storeLanguages.filter((_, i) => i !== idx) });
                        triggerToast(`已停用 ${lang} 语言翻译`);
                      }}
                        className="text-xs text-red-600 hover:underline font-bold"
                      >
                        停用
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="键入新语言模板 (如: 法语 - Français)"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                className="bg-white border border-[#8C9196] rounded-md px-3 h-9 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newLanguage) return;
                  updateSettings({ storeLanguages: [...storeLanguages, newLanguage] });
                  setNewLanguage('');
                  triggerToast('多语语言环境已成功激活');
                }}
                className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap"
              >
                添加语言
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'markets') {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#1A1A1A]" />
              Markets (多目标国际市集)
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">设置专属于特定地区的自定义价格、货代机制与应税折算方案。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {markets.map((m) => (
                <div key={m.id} className="p-4 border border-[#E1E3E5] rounded-lg bg-white shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-semibold text-[#1A1A1A]">{m.name}</span>
                      <p className="text-xs text-[#6D7175] mt-1 font-medium">覆盖国家: {m.region}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      m.status === '已激活' ? 'bg-black text-white' : 'bg-[#E1E3E5] text-[#6D7175]'
                    }`}>{m.status}</span>
                  </div>
                  <div className="mt-4 flex justify-end gap-2 border-t border-[#E1E3E5]/60 pt-3">
                    <button
                      onClick={() => triggerToast(`正在打开 ${m.name} 的高级参数界面`)}
                      className="text-xs text-black border border-[#8C9196] hover:bg-[#F6F6F7] font-semibold py-1 px-2.5 rounded transition-all"
                    >
                      修改区域汇率
                    </button>
                    <button
                      onClick={() => {
                        updateSettings({ marketsList: markets.filter((item: any) => item.id !== m.id) });
                        triggerToast('市集区域已被注销');
                      }}
                      className="text-xs text-red-600 font-bold px-1 hover:underline"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#F6F6F7]/30 border border-dashed border-[#E1E3E5] rounded-lg space-y-3">
              <span className="text-xs font-semibold text-[#1A1A1A] block">拓展主营国际站 Markets</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="市集名称 (例: 亚太极乐大区)"
                  value={newMarketName}
                  onChange={(e) => setNewMarketName(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded-md px-3 h-9 text-sm focus:ring-1 focus:ring-black"
                />
                <input
                  type="text"
                  placeholder="涵盖主权省份 (例: 日本、韩国、新加坡)"
                  value={newMarketRegion}
                  onChange={(e) => setNewMarketRegion(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded-md px-3 h-9 text-sm focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!newMarketName || !newMarketRegion) return;
                    updateSettings({
                      marketsList: [...markets, {
                        id: String(Date.now()),
                        name: newMarketName,
                        region: newMarketRegion,
                        status: '配置中'
                      }]
                    });
                    setNewMarketName('');
                    setNewMarketRegion('');
                    triggerToast('新目标市集已被登记关联');
                  }}
                  className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-xs font-semibold rounded-md transition-all"
                >
                  确认登记市集
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
