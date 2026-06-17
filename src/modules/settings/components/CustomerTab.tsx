import React, { useState } from 'react';
import { Users, CheckSquare, Bell, User, Plus, Send } from 'lucide-react';

interface CustomerTabProps {
  currentUser: any;
  collaborators: any[];
  addCollaborator: (vals: any) => void;
  triggerToast: (msg: string) => void;
  activeTab: string;
  settings: any;
  updateSettings: (vals: any) => void;
}

export default function CustomerTab({ currentUser, collaborators, addCollaborator, triggerToast, activeTab, settings, updateSettings }: CustomerTabProps) {
  const [collabName, setCollabName] = useState('');
  const [collabEmail, setCollabEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('staff');

  const checkoutConfig = settings.checkoutConfig || {};
  const customerAccounts = settings.customerAccounts || {};
  const notifications = settings.notifications || {};

  if (activeTab === 'users') {
    return (
      <div className="space-y-4">
        {/* Card 1: 店铺所有者 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1A1A1A]" />
              店铺所有权人
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">主所有权拥有当前商号系统的绝对根最高控制权与账单结算权。</p>
          </div>
          <div className="p-5">
            <div className="p-4 border border-[#E1E3E5] rounded-lg bg-[#F6F6F7] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black text-white font-bold text-sm flex items-center justify-center font-mono shrink-0">
                  {currentUser.avatar || 'LUO'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{currentUser.name || 'Master Owner'}</p>
                  <p className="text-xs text-[#6D7175] font-mono">{currentUser.email}</p>
                </div>
              </div>
              <span className="text-[10px] bg-black text-white font-bold px-2.5 py-0.5 rounded uppercase font-mono tracking-wider">PRIMARY OWNER</span>
            </div>
          </div>
        </div>

        {/* Card 2: 员工授权管理 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A]">受邀在线在岗后勤小组成员</h2>
            <p className="text-xs text-[#6D7175] mt-1">为员工分配精细化的后台核销、仓储入库或财务只读管理权限。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              {collaborators.map((col, idx) => (
                <div key={idx} className="p-3.5 border border-[#E1E3E5] rounded-md bg-white flex items-center justify-between hover:bg-[#F6F6F7]/30 transition-all">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#1A1A1A] block">{col.name}</span>
                    <span className="text-xs text-[#6D7175] font-mono block">{col.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-[#F6F6F7] border border-[#E1E3E5] text-[#202223] font-bold px-2 py-0.5 rounded">
                      {col.role === 'admin' ? '系统财务主管' : '发货助理'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Invitation Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!collabName || !collabEmail) return;
              addCollaborator({
                name: collabName,
                email: collabEmail,
                role: selectedRole,
                permissions: ['orders', 'products', 'customers'],
              });
              setCollabName('');
              setCollabEmail('');
              triggerToast('受邀员工添加加入成功，激活链接已流转至电子邮箱');
            }} className="p-4 rounded-lg border border-dashed border-[#E1E3E5] bg-[#F6F6F7]/30 space-y-3">
              <span className="text-xs font-semibold text-[#1A1A1A] block">发送激活邮件加配新助理</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="姓名 (例: 仓库组长张力)"
                  value={collabName}
                  onChange={(e) => setCollabName(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded-md px-3 h-9 text-sm focus:ring-1 focus:ring-black outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="员工邮箱 (例: staff@domain.it)"
                  value={collabEmail}
                  onChange={(e) => setCollabEmail(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded-md px-3 h-9 text-sm focus:ring-1 focus:ring-black outline-none"
                />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded-md px-3 h-9 text-sm focus:ring-1 focus:ring-black outline-none"
                >
                  <option value="staff">一般值班助理 (Staff)</option>
                  <option value="admin">平台财务协管 (Admin)</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-xs font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  指引激活
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'checkout') {
    return (
      <div className="space-y-4">
        {/* Card 1: 结账信息策略 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#1A1A1A]" />
              结账结算信息字段配置
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">控制买家结账表单深度，多一重简化极速成单转化率。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#6D7175] block mb-1.5 uppercase">结账联络方式选择</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] cursor-pointer">
                      <input
                        type="radio"
                        checked={checkoutConfig.contactMethod === 'email'}
                        onChange={() => updateSettings({ checkoutConfig: {...checkoutConfig, contactMethod: 'email'} })}
                        className="accent-black"
                      />
                      <span>仅限电子信箱 (推荐)</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] cursor-pointer">
                      <input
                        type="radio"
                        checked={checkoutConfig.contactMethod === 'both'}
                        onChange={() => updateSettings({ checkoutConfig: {...checkoutConfig, contactMethod: 'both'} })}
                        className="accent-black"
                      />
                      <span>手机号或邮箱自选</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#6D7175] block mb-1.5 uppercase">公司名称字段</label>
                  <select
                    value={checkoutConfig.companyField}
                    onChange={(e) => updateSettings({ checkoutConfig: {...checkoutConfig, companyField: e.target.value} })}
                    className="w-full h-9 px-3 border border-[#8C9196] rounded-md text-sm bg-white"
                  >
                    <option value="optional">可选填写 (Optional)</option>
                    <option value="required">必设必填 (Required - 适合B2B商户)</option>
                    <option value="hidden">彻底隐藏 (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-[#F6F6F7] rounded-lg border border-[#E1E3E5] space-y-3">
                <span className="text-[10px] font-bold text-[#6D7175] block uppercase tracking-wider">高转化留存与小费策略</span>
                
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkoutConfig.enableTips}
                    onChange={(e) => {
                      updateSettings({ checkoutConfig: {...checkoutConfig, enableTips: e.target.checked} });
                      triggerToast(e.target.checked ? '结账页小费自打赏框已部署' : '小费已隐藏');
                    }}
                    className="mt-1 w-4 h-4 accent-black rounded border-neutral-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#1A1A1A] block">启用结账界面加付小费小费箱</span>
                    <span className="text-[11px] text-[#6D7175] block leading-normal mt-0.5">多赚取10%额外现金利润打赏基层。</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-[#E1E3E5]/70">
                  <input
                    type="checkbox"
                    checked={checkoutConfig.autoAbandonEmail}
                    onChange={(e) => {
                      updateSettings({ checkoutConfig: {...checkoutConfig, autoAbandonEmail: e.target.checked} });
                      triggerToast(e.target.checked ? '放弃支付自动催款信已锁定' : '催款流关闭');
                    }}
                    className="mt-1 w-4 h-4 accent-black rounded border-neutral-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#1A1A1A] block">自动催回流失废单 (1小时后)</span>
                    <span className="text-[11px] text-[#6D7175] block leading-normal mt-0.5">对于在购物车中途放弃完款的游客账户，发送降价提醒激活。</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E1E3E5]">
              <button
                type="button"
                onClick={() => triggerToast('中枢结账链路字段保存完毕')}
                className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-sm font-semibold rounded-md transition-all cursor-pointer"
              >
                保存结账设置
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'customer_accounts') {
    return (
      <div className="space-y-4">
        {/* Card 1: 客户账号规范 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <User className="w-5 h-5 text-[#1A1A1A]" />
              买家实名账户及登录规定
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">核算与控制前台消费者登录行为。支持设置免账号快速游客直接交易。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#6D7175] block uppercase">客户账号登录级别</span>
                {[
                  { value: 'disabled', label: '不予提供 (不可创建及登录)', desc: '最适合零售批发，客户仅作为游客存在。' },
                  { value: 'optional', label: '可选创建 (买家可决定是否登录)', desc: '结账中显示“创建并保存数据，便于下次顺畅完结”。' },
                  { value: 'required', label: '强制必须登录才能游览/成单', desc: '用于高契合定制奢品私密商城，防止游客乱看。' }
                ].map((item) => (
                  <label key={item.value} className="flex items-start gap-2.5 p-3 border border-[#E1E3E5] rounded-md hover:bg-[#F6F6F7]/25 cursor-pointer leading-normal">
                    <input
                      type="radio"
                      name="accounts_req"
                      checked={customerAccounts.loginRequirement === item.value}
                      onChange={() => updateSettings({ customerAccounts: {...customerAccounts, loginRequirement: item.value} })}
                      className="mt-0.5 accent-black font-semibold"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#1A1A1A] block">{item.label}</span>
                      <span className="text-[11px] text-[#6D7175] block mt-0.5">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="p-4 bg-[#F6F6F7] border border-[#E1E3E5] rounded-md h-fit space-y-2">
                <span className="text-xs font-bold text-[#1A1A1A] block">安全2FA强保护</span>
                <p className="text-xs text-[#6D7175] leading-normal">
                  我们强烈要求所有注册的白名单常任买家账号在结账保存银行卡卡据时，自动联用单次邮箱2FA验证码验证手段。
                </p>
                <div className="pt-2">
                  <span className="text-[10px] text-white bg-black font-semibold py-1 px-2 rounded">系统默认激活</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-[#E1E3E5]">
              <button
                type="button"
                onClick={() => triggerToast('买家账户权限逻辑已更新保存')}
                className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-sm font-semibold rounded-md transition-all cursor-pointer"
              >
                保存账户规则
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'notifications') {
    return (
      <div className="space-y-4">
        {/* Card 1: 邮件通知模板配置 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#1A1A1A]" />
              自动化即时邮件及配送更新 (Liquid)
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">控制系统自动派发交易重要时刻的通知状态，保障买家及时知悉进展。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {[
                  { key: 'orderConfirm', label: '📧 订单付款成功确认书 (Order Confirmed)', desc: '支付后立即下发。' },
                  { key: 'orderCancel', label: '📧 订单异常拦截退款通知 (Order Cancelled)', desc: '拦截后自动派发说明。' },
                  { key: 'shippingUpdate', label: '📧 核心运单 DHL 轨迹更新 (Shipping Updated)', desc: '仓库打印标签时推送。' },
                  { key: 'lowStockAlert', label: '📧 定向商家库存预警通知 (Stock Alerts)', desc: '库存少于5件下发。' }
                ].map((item) => {
                  const val = (notifications as any)[item.key];
                  return (
                    <div key={item.key} className="p-3 border border-[#E1E3E5] rounded-md flex items-center justify-between bg-white hover:bg-[#F6F6F7]/50">
                      <div>
                        <span className="text-xs font-bold text-[#1A1A1A] block">{item.label}</span>
                        <span className="text-[11px] text-[#6D7175] block mt-0.5">{item.desc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateSettings({ notifications: { ...notifications, [item.key]: !val } });
                          triggerToast(`${item.label.split(' ')[1]} 选项已更改`);
                        }}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-250 outline-none shrink-0 ${
                          val ? 'bg-black' : 'bg-neutral-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-all transform duration-250 ${
                          val ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Web Template Tester */}
              <div className="p-4 bg-[#F6F6F7] border border-[#E1E3E5] rounded-md h-fit space-y-3 font-mono text-xs">
                <span className="text-xs font-bold text-[#1A1A1A] block font-sans">Liquid 邮件排版在线预览</span>
                <div className="bg-[#1A1A1A] text-white p-3.5 rounded">
                  <p className="text-neutral-450">&lt;h1&gt;感谢您的订单！&lt;/h1&gt;</p>
                  <p className="text-[#8C9196]">亲爱的 {"{"}{"{"} customer.first_name {"}"}{"}"}，您的付款已确认...</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => triggerToast('已下发模拟订单确认格式至您的所有权邮箱')}
                    className="bg-[#303030] hover:bg-[#1A1A1A] text-white text-xs font-semibold rounded py-1.5 px-3 flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    发送测试 Liquid 邮件
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-[#E1E3E5]">
              <button
                type="button"
                onClick={() => triggerToast('中枢交易通知策略保存完毕')}
                className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-sm font-semibold rounded-md transition-all cursor-pointer"
              >
                保存通知策略
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
