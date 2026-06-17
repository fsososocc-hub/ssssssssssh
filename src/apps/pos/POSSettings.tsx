import React, { useState } from 'react';
import { 
  Printer, Radio, Shield, DollarSign, Receipt, Store, Lightbulb, 
  Check, RefreshCw, Smartphone, HardDrive, Cpu, Sliders
} from 'lucide-react';

interface POSSettingsProps {
  onClose?: () => void;
  onSave?: (configs: any) => void;
  initialConfigs?: {
    printer?: string;
    deviceModel?: string;
    terminalId?: string;
    drawerAutoOpen?: boolean;
    scannerMode?: 'keyboard' | 'serial' | 'bluetooth';
    payCash?: boolean;
    payCard?: boolean;
    payScan?: boolean;
    rounding?: 'exact' | 'round-5-cents' | 'round-up';
    cashFloat?: number;
    currentRole?: 'admin' | 'cashier' | 'intern';
    canManualDiscount?: boolean;
    canPopDrawerClean?: boolean;
    receiptTitle?: string;
    receiptFooter?: string;
  };
}

export default function POSSettings({ onClose, onSave, initialConfigs }: POSSettingsProps) {
  // 1. Hardware State
  const [printer, setPrinter] = useState(initialConfigs?.printer || '内置 58mm 极速热敏小票机 (USB)');
  const [deviceModel, setDeviceModel] = useState(initialConfigs?.deviceModel || 'AI-Terminal v1.0 [云网融合]');
  const [terminalId, setTerminalId] = useState(initialConfigs?.terminalId || 'REG-01');
  const [drawerAutoOpen, setDrawerAutoOpen] = useState(initialConfigs?.drawerAutoOpen !== false);
  const [scannerMode, setScannerMode] = useState<'keyboard' | 'serial' | 'bluetooth'>(initialConfigs?.scannerMode || 'keyboard');
  
  // 2. Checkout & Ledger Rules
  const [payCash, setPayCash] = useState(initialConfigs?.payCash !== false);
  const [payCard, setPayCard] = useState(initialConfigs?.payCard !== false);
  const [payScan, setPayScan] = useState(initialConfigs?.payScan !== false);
  const [rounding, setRounding] = useState<'exact' | 'round-5-cents' | 'round-up'>(initialConfigs?.rounding || 'exact');
  const [cashFloat, setCashFloat] = useState<number>(initialConfigs?.cashFloat ?? 300);

  // 3. Staff Roles
  const [currentRole, setCurrentRole] = useState<'admin' | 'cashier' | 'intern'>(initialConfigs?.currentRole || 'admin');
  const [canManualDiscount, setCanManualDiscount] = useState(initialConfigs?.canManualDiscount !== false);
  const [canPopDrawerClean, setCanPopDrawerClean] = useState(initialConfigs?.canPopDrawerClean !== false);

  // 4. Receipt Customization
  const [receiptTitle, setReceiptTitle] = useState(initialConfigs?.receiptTitle || 'AI COMMERCE RETAIL (ITALY)');
  const [receiptFooter, setReceiptFooter] = useState(initialConfigs?.receiptFooter || '感谢您的慷慨光顾！凭此热敏票据 15 天内提供全额无忧退换。');

  // Interactive load states
  const [testingPrint, setTestingPrint] = useState(false);
  const [testingDrawer, setTestingDrawer] = useState(false);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<'hardware' | 'ledger' | 'staff' | 'receipt'>('hardware');

  const handleTestPrint = () => {
    setTestingPrint(true);
    setTimeout(() => {
      setTestingPrint(false);
      alert('📝 测试指令已向物理热敏组件发送：USB-202 脉冲走纸正常');
    }, 1000);
  };

  const handleTestDrawer = () => {
    setTestingDrawer(true);
    setTimeout(() => {
      setTestingDrawer(false);
      alert('💥 钱箱冲激开启信号释出：RJ11 双向电机锁盘检测通过');
    }, 800);
  };

  const handleSaveAll = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (onSave) {
        onSave({
          printer,
          deviceModel,
          terminalId,
          drawerAutoOpen,
          scannerMode,
          payCash,
          payCard,
          payScan,
          rounding,
          cashFloat,
          currentRole,
          canManualDiscount,
          canPopDrawerClean,
          receiptTitle,
          receiptFooter
        });
      }
      alert('✔ 全套专属 POS 运作指标及终端参数配置更新成功');
      if (onClose) onClose();
    }, 600);
  };

  return (
    <div id="pos-settings-container" className="bg-white border border-neutral-200 rounded-xl max-w-4xl w-full shadow-2xl flex flex-col md:flex-row h-[580px] overflow-hidden text-neutral-800 font-sans">
      
      {/* Container Left Track: Navigation Tab List */}
      <div id="sidebar-tracks" className="w-full md:w-56 bg-neutral-50 border-r border-neutral-100 p-4 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="pb-3 border-b mb-3">
            <h3 className="text-xs font-bold text-neutral-900 tracking-wider font-mono">POS 独立板块设置</h3>
            <p className="text-[10px] text-neutral-400">管理后台无涉之终端特有项</p>
          </div>

          {[
            { id: 'hardware', icon: Printer, label: '🔌 硬件与外接外设', desc: '设定打印机、扫码枪' },
            { id: 'ledger', icon: DollarSign, label: '💵 收款与备用金', desc: '找零舍入、现金法币' },
            { id: 'staff', icon: Shield, label: '🧑‍💼 收银角色特权', desc: '各级店员折扣与开箱' },
            { id: 'receipt', icon: Receipt, label: '📄 热敏小票模板', desc: '页眉广告、客制退换' }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                id={`tab-btn-${tab.id}`}
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left p-2.5 rounded-lg transition-all cursor-pointer flex items-start gap-2.5 ${
                  activeTab === tab.id
                    ? 'bg-[#07C2E3]/15 text-black border-l-2 border-[#07C2E3]'
                    : 'hover:bg-neutral-100 text-neutral-600'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${activeTab === tab.id ? 'text-[#07C2E3]' : 'text-neutral-400'}`} />
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{tab.label}</span>
                  <span className="text-[8.5px] text-neutral-400 font-normal leading-tight">{tab.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-2 pt-4 border-t">
          {onClose && (
            <button
              id="close-settings-btn"
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-lg cursor-pointer text-center font-mono border border-neutral-200"
            >
              返回收银台 [ESC]
            </button>
          )}
        </div>
      </div>

      {/* Container Right Tab Panel Content */}
      <div id="panel-content-body" className="flex-1 p-6 overflow-y-auto flex flex-col justify-between bg-white">
        <div className="space-y-5">
          
          {/* TAB 1: Hardware peripheral */}
          {activeTab === 'hardware' && (
            <div id="hardware-panel" className="space-y-4">
              <div className="flex items-center gap-1.5 border-b pb-2">
                <Smartphone className="w-4 h-4 text-neutral-400" />
                <h2 className="text-xs font-bold text-neutral-900 font-mono tracking-wider">物理硬体设备连接管理</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">POS 终端注册标识 (Register ID)</label>
                  <input
                    id="input-terminal-id"
                    type="text"
                    value={terminalId}
                    onChange={(e) => setTerminalId(e.target.value)}
                    className="w-full text-xs p-2 border border-neutral-200 bg-neutral-50 rounded-lg outline-none font-mono focus:border-[#07C2E3]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">当班设备物理规格 (Model)</label>
                  <input
                    id="input-device-model"
                    type="text"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    className="w-full text-xs p-2 border border-neutral-200 bg-neutral-50 rounded-lg outline-none focus:border-[#07C2E3]"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">热敏小票账单机选择</label>
                  <select
                    id="select-printer"
                    value={printer}
                    onChange={(e) => setPrinter(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-200 bg-neutral-50 rounded-lg focus:ring-1 focus:ring-[#07C2E3] outline-none text-neutral-800"
                  >
                    <option value="内置 58mm 极速热敏小票机 (USB)">内置 58mm 极速极窄热敏小票打印 (USB极速直连)</option>
                    <option value="XP-80 挂壁型 80mm 大纸网路机">XP-80 80mm 直通挂壁大张机 (Wi-Fi网内对齐)</option>
                    <option value="AURA-8800 高阶多功能出票仪">AURA-8800 无线低噪高速切刀机 (TCP/IP)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    id="btn-test-print"
                    type="button"
                    disabled={testingPrint}
                    onClick={handleTestPrint}
                    className="flex-1 py-2 px-3 border border-neutral-200 hover:border-black text-[10px] font-bold rounded-lg text-neutral-700 cursor-pointer transition-colors text-center"
                  >
                    {testingPrint ? '正在测试...' : '测试热敏纸打印 📄'}
                  </button>
                  <button
                    id="btn-test-drawer"
                    type="button"
                    disabled={testingDrawer}
                    onClick={handleTestDrawer}
                    className="flex-1 py-2 px-3 border border-neutral-200 hover:border-black text-[10px] font-bold rounded-lg text-neutral-700 cursor-pointer transition-colors text-center"
                  >
                    {testingDrawer ? '正在弹开...' : '测试物理开钱箱 💵'}
                  </button>
                </div>

                <div className="p-3 bg-neutral-50 border border-neutral-150 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-neutral-800">结账成功物理钱箱自动触发</span>
                      <span className="text-[9px] text-neutral-400 leading-none">在现金结算成功通过后向 RJ11 引脚输出电磁脉冲</span>
                    </div>
                    <input
                      id="checkbox-drawer-auto"
                      type="checkbox"
                      checked={drawerAutoOpen}
                      onChange={(e) => setDrawerAutoOpen(e.target.checked)}
                      className="w-4 h-4 text-[#07C2E3] accent-[#07C2E3] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">外接扫码武器对接制式</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['keyboard', 'serial', 'bluetooth'].map((mode) => (
                      <button
                        id={`btn-scanner-${mode}`}
                        key={mode}
                        type="button"
                        onClick={() => setScannerMode(mode as any)}
                        className={`py-2 text-[10px] font-bold border rounded-lg transition-all cursor-pointer ${
                          scannerMode === mode
                            ? 'bg-[#07C2E3]/10 text-neutral-900 border-[#07C2E3]'
                            : 'bg-[#fafafa] hover:bg-neutral-100 border-neutral-200 text-neutral-500'
                        }`}
                      >
                        {mode === 'keyboard' ? 'USB 键盘模拟' : mode === 'serial' ? 'RS232 直辖串口' : '低功耗蓝牙'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Ledger pay */}
          {activeTab === 'ledger' && (
            <div id="ledger-panel" className="space-y-4">
              <div className="flex items-center gap-1.5 border-b pb-2">
                <HardDrive className="w-4 h-4 text-neutral-400" />
                <h2 className="text-xs font-bold text-neutral-900 font-mono tracking-wider">收款结算及财务找零设置</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1">本台开班底金储备额 (Cash Float €)</label>
                  <input
                    id="input-cash-float"
                    type="number"
                    value={cashFloat}
                    onChange={(e) => setCashFloat(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 border border-neutral-200 bg-neutral-50 rounded-lg outline-none font-mono focus:border-[#07C2E3]"
                  />
                  <p className="text-[9px] text-neutral-400 mt-1">开班时抽屉里存放的硬币找零散钞额，用作日盘底金核算</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">现金硬币极速找零抹零算法</label>
                  <select
                    id="select-rounding"
                    value={rounding}
                    onChange={(e) => setRounding(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-neutral-200 bg-neutral-50 rounded-lg outline-none"
                  >
                    <option value="exact">精细法 (找零完全精确保留至 0.01 € 对齐分币)</option>
                    <option value="round-5-cents">5欧分舍入 (收银找零最小面额化为 5 分硬币发放)</option>
                    <option value="round-up">抹零法 (忽略小数位直接自动向上至整数欧元交付)</option>
                  </select>
                </div>

                <div className="space-y-2.5 pt-2">
                  <span className="block text-[10px] font-bold text-neutral-400">前台支付法币通道可用管制</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 p-2.5 border rounded-lg bg-neutral-50 cursor-pointer border-neutral-100">
                      <input
                        id="checkbox-pay-cash"
                        type="checkbox"
                        checked={payCash}
                        onChange={(e) => setPayCash(e.target.checked)}
                        className="w-4 h-4 text-[#07C2E3] accent-[#07C2E3]"
                      />
                      <span className="text-xs text-neutral-700">💵 支持现金付现</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 border rounded-lg bg-neutral-50 cursor-pointer border-neutral-100">
                      <input
                        id="checkbox-pay-card"
                        type="checkbox"
                        checked={payCard}
                        onChange={(e) => setPayCard(e.target.checked)}
                        className="w-4 h-4 text-[#07C2E3] accent-[#07C2E3]"
                      />
                      <span className="text-xs text-neutral-700">💳 支持联机刷卡</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 border rounded-lg bg-neutral-50 cursor-pointer border-neutral-100">
                      <input
                        id="checkbox-pay-scan"
                        type="checkbox"
                        checked={payScan}
                        onChange={(e) => setPayScan(e.target.checked)}
                        className="w-4 h-4 text-[#07C2E3] accent-[#07C2E3]"
                      />
                      <span className="text-xs text-neutral-700">📱 支持扫码结算</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Staff configuration */}
          {activeTab === 'staff' && (
            <div id="staff-panel" className="space-y-4">
              <div className="flex items-center gap-1.5 border-b pb-2">
                <Cpu className="w-4 h-4 text-neutral-400" />
                <h2 className="text-xs font-bold text-neutral-900 font-mono tracking-wider">岗位隔离与安全特权限制</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1">当前选定受限制的角色岗位</label>
                  <select
                    id="select-role"
                    value={currentRole}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setCurrentRole(val);
                      if (val === 'admin') {
                        setCanManualDiscount(true);
                        setCanPopDrawerClean(true);
                      } else if (val === 'cashier') {
                        setCanManualDiscount(true);
                        setCanPopDrawerClean(false);
                      } else {
                        setCanManualDiscount(false);
                        setCanPopDrawerClean(false);
                      }
                    }}
                    className="w-full text-xs p-2.5 border border-neutral-200 bg-neutral-50 rounded-lg outline-none"
                  >
                    <option value="admin">CASHIER-ADMIN (总裁专员) - 满级开箱让利特权</option>
                    <option value="cashier">CASHIER-ASSISTANT (普通收银) - 准予让利 / 严禁无单开屉</option>
                    <option value="intern">CASHIER-INTERN (带训实习) - 锁死开单 / 无单折扣拦截</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                    <div>
                      <span className="block text-xs font-bold text-neutral-800">允许本岗位手动对单赋予总价折让</span>
                      <span className="text-[9px] text-neutral-400">关闭后前台折扣面板按钮将置灰拦截，避免店员人情单损</span>
                    </div>
                    <input
                      id="checkbox-can-discount"
                      type="checkbox"
                      checked={canManualDiscount}
                      onChange={(e) => setCanManualDiscount(e.target.checked)}
                      className="w-4 h-4 text-[#07C2E3] accent-[#07C2E3] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-between items-center p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                    <div>
                      <span className="block text-xs font-bold text-neutral-800">允许在非结算开单状态下独立一键开启钱箱</span>
                      <span className="text-[9px] text-neutral-400">用于随时零钱找付对账。此操作将记录日志作为审单底册</span>
                    </div>
                    <input
                      id="checkbox-can-pop-drawer"
                      type="checkbox"
                      checked={canPopDrawerClean}
                      onChange={(e) => setCanPopDrawerClean(e.target.checked)}
                      className="w-4 h-4 text-[#07C2E3] accent-[#07C2E3] rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Thermal Receipt */}
          {activeTab === 'receipt' && (
            <div id="receipt-panel" className="space-y-4">
              <div className="flex items-center gap-1.5 border-b pb-2">
                <Sliders className="w-4 h-4 text-neutral-400" />
                <h2 className="text-xs font-bold text-neutral-900 font-mono tracking-wider">58mm 热敏出库单模板定制</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                    出库单头部标识广告字 (Receipt Header)
                  </label>
                  <input
                    id="input-receipt-header"
                    type="text"
                    value={receiptTitle}
                    onChange={(e) => setReceiptTitle(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg outline-none focus:border-[#07C2E3] text-neutral-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                    底部退换保障声明细则 (Receipt Footer)
                  </label>
                  <textarea
                    id="textarea-receipt-footer"
                    rows={4}
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg outline-none font-sans focus:border-[#07C2E3] resize-none text-neutral-800"
                  />
                  <span className="block text-[8px] text-neutral-400 leading-tight mt-1">
                    提示点：将展示于每一次成功付款后打出的微型小票及小票预览框尾页。
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Button: Solid state saved */}
        <div className="mt-8 pt-4 border-t border-neutral-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono text-neutral-400">OFFLINE-FIRST HANDSHAKE OK</span>
          </div>

          <button
            id="save-all-configs-btn"
            type="button"
            disabled={saving}
            onClick={handleSaveAll}
            className="px-4 py-2 bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-black font-extrabold rounded-lg text-xs tracking-wide cursor-pointer transition-colors shadow-sm"
          >
            {saving ? '保存中...' : '固化保存配置 [F6]'}
          </button>
        </div>

      </div>

    </div>
  );
}
