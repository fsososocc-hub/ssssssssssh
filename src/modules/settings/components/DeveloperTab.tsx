import React, { useState } from 'react';
import { Layout, FileText, Settings, Globe, Shield, Key, Send, File, Gift, Plus, Trash2 } from 'lucide-react';

interface DeveloperTabProps {
  settings: any;
  updateSettings: (vals: any) => void;
  triggerToast: (msg: string) => void;
  activeTab: string;
}

export default function DeveloperTab({ settings, updateSettings, triggerToast, activeTab }: DeveloperTabProps) {
  // Domain mapping list
  const domains = settings.domains || [
    { url: 'www.mystore.com', type: '自定义主域名', isPrimary: true, status: '正常连接', ip: '23.227.38.65' },
    { url: 'mystore-sandbox.myshopify.com', type: '默认系统子域名', isPrimary: false, status: '正常连接', ip: '23.227.38.65' },
  ];
  const [newDomain, setNewDomain] = useState('');

  // Policy text areas
  const policyRefund = settings.policyRefund || '';
  const policyPrivacy = settings.policyPrivacy || '';
  const policyTerms = settings.policyTerms || '';

  // Dynamic Metafields (Schema defined keys)
  const metafields = settings.metafields || [
    { resource: '商品', key: 'custom.material_comp', name: '材质成分', type: '单行文本 (String)', count: 120 },
    { resource: '客户', key: 'custom.birthday_date', name: '生日结构', type: '日期结构 (Date)', count: 86 }
  ];
  const [metaResource, setMetaResource] = useState('商品');
  const [metaName, setMetaName] = useState('');
  const [metaKey, setMetaKey] = useState('');

  // Developer Apps Credential set
  const devApps = settings.devApps || [
    { name: '意北主发货系统对接 ERP 校验', key: 'apk_99018c11a', permissions: '产品只读、订单双向读写', status: '正常活动中' }
  ];
  const [newDevAppName, setNewDevAppName] = useState('');
  const [apiTerminalOutput, setApiTerminalOutput] = useState('等待推送模拟 JSON Webhook Payload...');

  // Files media library
  const filesList = settings.filesList || [
    { name: 'brand-banner-home.jpg', size: '242 KB', type: 'Image/JPEG', creationDate: '2026-05-12' },
    { name: 'size-chart-winter.pdf', size: '1.2 MB', type: 'Application/PDF', creationDate: '2026-06-01' }
  ];
  const [newFileName, setNewFileName] = useState('');

  // Expiration rules
  const giftCards = settings.giftCards || [
    { code: 'GFT-990-AX1', balance: 100.00, status: '有效', customer: 'buyer@domain.it' }
  ];
  const [giftEmail, setGiftEmail] = useState('');
  const [giftAmount, setGiftAmount] = useState('50');

  // Policy generators
  const generatePolicyFromTemplate = (type: 'refund' | 'privacy' | 'terms') => {
    const sName = settings.shopName || '我的商铺';
    const sMail = settings.shopEmail || 'cs@mystore.com';
    if (type === 'refund') {
      updateSettings({
        policyRefund: `【${sName} 售后退换货政策】\n1. 遵照欧共体条例指引，支持买家签收后14个自然日内无责任申请退款/换币。\n2. 所有退还单据需配合吊牌完封。请联系官方邮箱：${sMail} 投送原路邮寄条单。`
      });
    } else if (type === 'privacy') {
      updateSettings({
        policyPrivacy: `【${sName} 隐私条款与 GDPR 完全符合性证明】\n我们坚信数据本权。您在本店录入的结账单据全部经过高安全传输直接投送至收单银行，我们的本地容器不会留存卡密码。如需销毁游览足迹，请与 ${sMail} 取得联系。`
      });
    } else if (type === 'terms') {
      updateSettings({
        policyTerms: `【${sName} 平台销售与服务权责白皮书】\n在完成支付即锁定货单契约。如因特定区域或大宗物流管制不可联，商家具有撤回交易并不受罚的最终解释权。`
      });
    }
    triggerToast('已为您生成一版标准的政策文书模板');
  };

  const triggerWebhookSimulation = () => {
    setApiTerminalOutput('正在建立端对端校验隧道...');
    setTimeout(() => {
      setApiTerminalOutput(JSON.stringify({
        event: "order.created",
        tenant_id: "eu-milan-88",
        timestamp: new Date().toISOString(),
        payload: {
          client_id: "Haixu-OS",
          order_id: "#1092-A",
          amount: 299.00,
          currency: settings.currency || 'EUR',
          customer_email: "buyer@domain.it",
          items: [{ sku: "AT-NOIR-COAT", qty: 1 }],
        }
      }, null, 2));
      triggerToast('Webhook 推送已通过 SSL 验证到达接收端');
    }, 500);
  };

  if (activeTab === 'brand') {
    return (
      <div className="space-y-4">
        {/* Card 1: 品牌美学要素 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Layout className="w-5 h-5 text-[#1A1A1A]" />
              店铺视觉主色与 Logo 要素
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">定制您的品牌专属标志以及前台主力交互高对比基准色系。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-md border border-[#E1E3E5] bg-white flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1A1A1A] block">品牌主控交互色 (Primary Accent)</span>
                  <p className="text-[11px] text-[#6D7175] mt-1 leading-normal">用于客户前台按钮、链接以及菜单激活高亮。</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-6 h-6 rounded bg-black border border-[#E1E3E5] shadow-inner" />
                  <span className="text-xs font-mono font-bold">#111111</span>
                </div>
              </div>

              <div className="p-4 rounded-md border border-[#E1E3E5] bg-white flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1A1A1A] block">品牌背景辅陈色 (Page Canvas)</span>
                  <p className="text-[11px] text-[#6D7175] mt-1 leading-normal">客户在APP/网页端主营界面的背景大底底色。</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-6 h-6 rounded bg-[#FAFAFA] border border-[#E1E3E5]" />
                  <span className="text-xs font-mono font-bold">#FAFAFA</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#202223] block">品牌首脑口号与 Slogan</label>
              <input
                type="text"
                defaultValue="Atelier Noir – 极简而纯粹的意式格调"
                className="w-full h-9 px-3 border border-[#8C9196] rounded-md text-sm bg-white"
              />
              <span className="text-xs text-[#6D7175]">显示在主页底部的社交卡片中。</span>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E1E3E5]">
              <button
                type="button"
                onClick={() => triggerToast('品牌要素已保存更新')}
                className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-sm font-semibold rounded-md transition-all cursor-pointer"
              >
                保存品牌设置
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'policies') {
    return (
      <div className="space-y-4">
        {/* Card 1: 核心政策编写 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1A1A1A]" />
              店铺合规法律政策文本
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">制定退货、隐私合规说明，勾选后将自动挂载在结账最底部吸引买家信任。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#1A1A1A]">售后退款退货政策 (Refund Policy)</span>
                  <button onClick={() => generatePolicyFromTemplate('refund')} className="text-black font-semibold hover:underline">[从标准模板生成]</button>
                </div>
                <textarea
                  value={policyRefund}
                  onChange={(e) => updateSettings({ policyRefund: e.target.value })}
                  placeholder="请输入您的退货期、退款账款返还路径及退件运费自理约定..."
                  rows={2}
                  className="w-full border border-[#8C9196] rounded-md p-2 text-xs font-mono bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#1A1A1A]">隐私权 GDPR 条例声明 (Privacy GDPR)</span>
                  <button onClick={() => generatePolicyFromTemplate('privacy')} className="text-black font-semibold hover:underline">[从标准模板生成]</button>
                </div>
                <textarea
                  value={policyPrivacy}
                  onChange={(e) => updateSettings({ policyPrivacy: e.target.value })}
                  placeholder="关于消费者电子邮件、运输地址信息保护与主动注销权利的约定..."
                  rows={2}
                  className="w-full border border-[#8C9196] rounded-md p-2 text-xs font-mono bg-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#1A1A1A]">用户注册与平台服务协议 (Terms)</span>
                  <button onClick={() => generatePolicyFromTemplate('terms')} className="text-black font-semibold hover:underline">[从标准模板生成]</button>
                </div>
                <textarea
                  value={policyTerms}
                  onChange={(e) => updateSettings({ policyTerms: e.target.value })}
                  placeholder="平台买家与商家责任豁免、物流管制及缺货全额退款约定..."
                  rows={2}
                  className="w-full border border-[#8C9196] rounded-md p-2 text-xs font-mono bg-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E1E3E5]">
              <button
                type="button"
                onClick={() => triggerToast('三件核心合规政策均已保存')}
                className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-sm font-semibold rounded-md transition-all cursor-pointer"
              >
                保存所有政策
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'metafields') {
    return (
      <div className="space-y-4">
        {/* Card 1: 动态元字段 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#1A1A1A]" />
              Zod Custom Metafields (动态元字段增设)
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">无需定制任何繁复代码，在线为商品或买家实体外挂关联自定义附加字段。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              {metafields.map((mf, idx) => (
                <div key={idx} className="p-3 border border-[#E1E3E5] rounded-md bg-white flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-bold text-[#1A1A1A]">{mf.key}</span>
                      <span className="text-[10px] bg-black text-white px-1.5 py-0.2 rounded font-sans">{mf.resource}</span>
                    </div>
                    <span className="text-[#6D7175] mt-1 block">中文译名: {mf.name} | 数据强约束: {mf.type}</span>
                  </div>
                  <span className="text-xs font-bold text-black border border-[#E1E3E5] py-0.5 px-2 bg-[#F6F6F7] rounded">{mf.count} 条记录在存</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#F6F6F7]/30 border border-dashed border-[#E1E3E5] rounded-lg space-y-3">
              <span className="text-xs font-semibold text-[#1A1A1A] block">在不写代码下动态外挂一个属性字段</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={metaResource}
                  onChange={(e) => setMetaResource(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded p-1.5 text-xs focus:ring-1 focus:ring-black outline-none"
                >
                  <option value="商品">挂载在产品上 (Product)</option>
                  <option value="变体">挂载在具体Sku上 (Variant)</option>
                  <option value="客户">挂载在买家属性上 (Customer)</option>
                </select>
                <input
                  type="text"
                  placeholder="展示中文名 (例: 材质特微)"
                  value={metaName}
                  onChange={(e) => setMetaName(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded px-3 h-9 text-xs focus:ring-1 focus:ring-black outline-none"
                />
                <input
                  type="text"
                  placeholder="字段约束Key (例: custom.material_desc)"
                  value={metaKey}
                  onChange={(e) => setMetaKey(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded px-3 h-9 text-xs focus:ring-1 focus:ring-black outline-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!metaName || !metaKey) return;
                    updateSettings({
                      metafields: [...metafields, {
                        resource: metaResource,
                        key: metaKey,
                        name: metaName,
                        type: '单行文书 (String)',
                        count: 0
                      }]
                    });
                    setMetaName('');
                    setMetaKey('');
                    triggerToast('数据库动态关系增加成功');
                  }}
                  className="h-8 px-4.5 bg-[#303030] hover:bg-[#1A1A1A] text-white text-xs font-semibold rounded-md transition-colors"
                >
                  确认挂载
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'domains') {
    return (
      <div className="space-y-4">
        {/* Card 1: 域名 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#1A1A1A]" />
              店铺域名绑定与重定向
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">连结您的个性站外域名，让买家通过高辨识度的 URL 开启交易之旅。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              {domains.map((dom, idx) => (
                <div key={idx} className="p-4 border border-[#E1E3E5] rounded-md flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#1A1A1A]">{dom.url}</span>
                      {dom.isPrimary && <span className="text-[9px] bg-black text-white py-0.2 px-1.5 rounded font-bold font-sans">主域名</span>}
                    </div>
                    <span className="text-[#6D7175] block mt-1">{dom.type} • 已解析至: {dom.ip}</span>
                  </div>
                  <span className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">{dom.status}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#F6F6F7]/30 border border-dashed border-[#E1E3E5] rounded-lg space-y-3">
              <span className="text-xs font-semibold text-[#1A1A1A] block">连接已有第三方注册商域名 (GoDaddy, 阿里云等)</span>
              <p className="text-xs text-[#6D7175] leading-normal">
                请在注册商处将域名 A 记录指向：<b className="text-black font-semibold">23.227.38.65</b>，并将 www 的 CNAME 记录指向：<b className="text-black font-semibold">shops.myshopify.com</b>。
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="www.atelier-noir-elite.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded-md px-3 h-9 text-sm flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newDomain) return;
                    updateSettings({
                      domains: [...domains, {
                        url: newDomain,
                        type: '普通站外外部连接',
                        isPrimary: false,
                        status: '解析侦测中',
                        ip: '23.227.38.65'
                      }]
                    });
                    setNewDomain('');
                    triggerToast('外部域名连接绑定任务已排队，DNS广播生效约2-24小时');
                  }}
                  className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer"
                >
                  开始探测连接
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'apps') {
    return (
      <div className="space-y-4">
        {/* Card 1: 开发者凭证 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1A1A1A]" />
              对接销售渠道与外部 ERP 授权秘钥 (Access Tokens)
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">创建和重置用于对接您的本地进销存、海运中枢仓库或仓储控制台的管理API密钥对。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-3">
              {devApps.map((app, idx) => (
                <div key={idx} className="p-4 border border-[#E1E3E5] rounded-md text-xs space-y-2 bg-white">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-[#1A1A1A]">{app.name}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold px-2 py-0.5 rounded-full">{app.status}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#F6F6F7] p-2 rounded border border-[#E1E3E5] font-mono">
                    <Key className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span className="text-black font-semibold text-xs select-all">{app.key}</span>
                  </div>
                  <p className="text-[11px] text-[#6D7175]">权限边界范围: {app.permissions}</p>
                </div>
              ))}
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newDevAppName) return;
              const rndKey = `shpat_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 6)}`;
              updateSettings({
                devApps: [...devApps, {
                  name: newDevAppName,
                  key: rndKey,
                  permissions: '产品变体只读、订单调配及流转写入',
                  status: '正常活动中'
                }]
              });
              setNewDevAppName('');
              triggerToast('外部专属接入凭据包成功生成');
            }} className="p-4 bg-[#F6F6F7]/30 border border-dashed border-[#E1E3E5] rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="w-full sm:w-auto">
                <span className="text-xs font-bold text-[#1A1A1A] block">为新对接端单独注册 API Key</span>
                <p className="text-[11px] text-[#6D7175] mt-0.5">限制独立权限，确保商路数据安全隔离。</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  required
                  placeholder="接入应用别名 (例: 米兰大仓WMS)"
                  value={newDevAppName}
                  onChange={(e) => setNewDevAppName(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded-md px-2.5 h-9 text-xs focus:ring-1 focus:ring-black outline-none flex-1"
                />
                <button type="submit" className="h-9 px-4 bg-black text-white text-xs font-bold rounded-md whitespace-nowrap active:scale-95 transition-all">创建凭据包</button>
              </div>
            </form>
          </div>
        </div>

        {/* Card 2: Webhook pushing */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A]">双向异步 Webhook 推送监听测试工具</h2>
            <p className="text-xs text-[#6D7175] mt-1">模拟高频订单交易事件对象 (JSON)，实地排查外部服务器接入承压与连通性。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-[#1A1A1A] text-emerald-400 font-mono text-xs rounded-md p-4 max-h-[180px] overflow-y-auto shadow-inner leading-relaxed">
              <pre className="whitespace-pre-wrap">{apiTerminalOutput}</pre>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#6D7175]">模拟高维事件: <b className="text-black font-semibold">order.created</b></span>
              <button
                type="button"
                onClick={triggerWebhookSimulation}
                className="h-9 px-4.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-md flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                派送 Webhook 测试报数
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'files') {
    return (
      <div className="space-y-4">
        {/* Card 1: 媒体库资源列表 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <File className="w-5 h-5 text-[#1A1A1A]" />
              店铺文档与媒体库
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">管理您上传的尺码对照 PDF 导图、产品手册、图片等公开媒体资产。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="border border-[#E1E3E5] rounded-md overflow-hidden divide-y divide-[#E1E3E5] text-xs">
              {filesList.map((file, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between bg-white hover:bg-[#F6F6F7]/20">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[#1A1A1A] block">{file.name}</span>
                    <span className="text-[#6D7175] block">大小: {file.size} | 格式: {file.type} | 上载于: {file.creationDate}</span>
                  </div>
                  <button
                    onClick={() => {
                      updateSettings({
                        filesList: filesList.filter((_, i) => i !== idx)
                      });
                      triggerToast('静态文件资源已成功彻底销毁');
                    }}
                    className="text-red-600 font-bold hover:underline"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#F6F6F7]/30 border border-dashed border-[#E1E3E5] rounded-lg space-y-3">
              <span className="text-xs font-semibold text-[#1A1A1A] block">拖入或上传新的静态媒体资源</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="文件名 (例: spring-editorial-lookbook.png)"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded-md px-3 h-9 text-sm flex-1 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newFileName) return;
                    updateSettings({
                      filesList: [...filesList, {
                        name: newFileName,
                        size: '512 KB',
                        type: 'Image/PNG',
                        creationDate: '2026-06-17'
                      }]
                    });
                    setNewFileName('');
                    triggerToast('新资源文件上传及哈希哈校验锁完毕，已托管至CDN库面');
                  }}
                  className="h-9 px-4 bg-[#303030] hover:bg-[#1A1A1A] text-white text-xs font-semibold rounded-md cursor-pointer transition-all"
                >
                  添加文件
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'gift_cards') {
    return (
      <div className="space-y-4">
        {/* Card 1: 礼品卡 */}
        <div className="bg-white border border-[#E1E3E5] rounded-lg shadow-sm">
          <div className="p-5 border-b border-[#E1E3E5]">
            <h2 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#1A1A1A]" />
              在线发放礼品卡 (Gift Cards)
            </h2>
            <p className="text-xs text-[#6D7175] mt-1">生成或给高LTV核心用户派发用于抵账结账的可兑付数字礼资钱包。</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              {giftCards.map((gc, idx) => (
                <div key={idx} className="p-3.5 border border-[#E1E3E5] rounded-md bg-white flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono text-sm font-bold text-[#1A1A1A]">{gc.code}</span>
                    <span className="text-[#6D7175] block mt-1">发赠对象: {gc.customer} | 状态: {gc.status}</span>
                  </div>
                  <span className="text-xs font-bold text-black bg-[#F6F6F7] border border-[#E1E3E5] rounded py-1 px-2.5">
                    额度: €{gc.balance.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#F6F6F7]/30 border border-dashed border-[#E1E3E5] rounded-lg space-y-3">
              <span className="text-xs font-semibold text-[#1A1A1A] block">在线秒发福利礼品钱包</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="email"
                  placeholder="派发买家邮箱 (例: buyer@domain.it)"
                  value={giftEmail}
                  onChange={(e) => setGiftEmail(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded px-3 h-9 text-xs focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="额度金额 (EUR)"
                  value={giftAmount}
                  onChange={(e) => setGiftAmount(e.target.value)}
                  className="bg-white border border-[#8C9196] rounded px-3 h-9 text-xs focus:outline-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!giftEmail) return;
                    const rndCode = `GFT-${Math.floor(100+Math.random()*900)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
                    updateSettings({
                      giftCards: [...giftCards, {
                        code: rndCode,
                        balance: Number(giftAmount),
                        status: '有效',
                        customer: giftEmail
                      }]
                    });
                    setGiftEmail('');
                    triggerToast(`礼品福利钱包 ${rndCode} 已经流转并派发成功`);
                  }}
                  className="h-9 px-4.5 bg-[#303030] hover:bg-[#1A1A1A] text-white text-xs font-semibold rounded-md transition-all cursor-pointer"
                >
                  创建并发送礼品卡
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
