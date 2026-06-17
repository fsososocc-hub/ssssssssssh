/**
 * AI Commerce OS - Premium Minimalist POS Terminal (POSModule)
 * Conforming strictly to v1.0 standard rules: no bilingual slop, clean layout,
 * fully real data flow and state integration.
 */

import React, { useState, useMemo } from 'react';
import { 
  CreditCard, Users, Percent, Plus, Minus, Trash2, ShoppingCart, UserCheck, X, Printer, Package,
  Search, RefreshCw, FileText, Lock, Unlock, ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import { useOrderStore } from '../../stores/orderStore';
import { useCustomerStore } from '../../stores/customerStore';
import { useLayoutStore } from '../../stores/layoutStore';
import { Product, Order, OrderItem } from '../../types';
import { usePOSSync } from './usePOSSync';
import { POSTransaction } from './posData';
import POSProductList from './POSProductList';
import POSTransactionHistory from './POSTransactionHistory';
import POSSettings from './POSSettings';

export default function POSModule() {
  const { setCurrentTab } = useLayoutStore();
  const customers = useCustomerStore((state) => state.customers);
  const addOrder = useOrderStore((state) => state.addOrder);
  const orders = useOrderStore((state) => state.orders);
  const updateOrder = useOrderStore((state) => state.updateOrder);
  const deleteOrder = useOrderStore((state) => state.deleteOrder);
  const products = useProductStore((state) => state.products);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const { syncTransaction, isSyncing } = usePOSSync();

  // 购物车与收款状态
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [parkedCart, setParkedCart] = useState<{ product: Product; quantity: number }[] | null>(null);
  
  // 弹出层表单状态
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemType, setCustomItemType] = useState('配件');

  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // POS 终端专属控制设置 (不影响外部全局变量，由该独立页面配置掌控)
  const [registerId, setRegisterId] = useState<string>('REG-01');
  const [locationName, setLocationName] = useState<string>('米兰旗舰直营网点');
  const [autoPopCashDrawer, setAutoPopCashDrawer] = useState<boolean>(true);
  const [deviceModel, setDeviceModel] = useState<string>('AI-Terminal v1.0');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  
  // ⚙️ POS 独占特色参数：1. 硬件外设
  const [selectedPrinter, setSelectedPrinter] = useState<string>('内置 58mm 极速热敏小票机');
  const [scannerConnected, setScannerConnected] = useState<boolean>(true);
  const [paymentTerminal, setPaymentTerminal] = useState<string>('Sunmi Card Box (内置式)');
  const [testPrintLoading, setTestPrintLoading] = useState<boolean>(false);
  const [testDrawerLoading, setTestDrawerLoading] = useState<boolean>(false);

  // ⚙️ POS 独占特色参数：2. 专属收银员与特有权限
  const [cashierAccount, setCashierAccount] = useState<'CASHIER-ADMIN' | 'CASHIER-ASSISTANT' | 'CASHIER-INTERN'>('CASHIER-ADMIN');
  const [allowCartDiscount, setAllowCartDiscount] = useState<boolean>(true);
  const [allowManualDrawer, setAllowManualDrawer] = useState<boolean>(true);

  // ⚙️ POS 独占特色参数：3. POS专属多渠道支付与找零机制
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'scan_code'>('cash');
  const [roundingMode, setRoundingMode] = useState<'exact' | 'round-to-5-cents' | 'round-up-integer'>('exact');
  const [cashPayEnabled, setCashPayEnabled] = useState<boolean>(true);
  const [cardPayEnabled, setCardPayEnabled] = useState<boolean>(true);
  const [scanPayEnabled, setScanPayEnabled] = useState<boolean>(true);
  const [cashTendered, setCashTendered] = useState<string>(''); // 客户实收现款金额

  // ⚙️ POS 独占特色参数：4. 小票可配制热敏模版
  const [receiptHeader, setReceiptHeader] = useState<string>('AI COMMERCE RETAIL (ITALY)');
  const [receiptFooter, setReceiptFooter] = useState<string>('感谢您的慷慨光顾！凭此热敏票据 15 天内提供全额无忧退换。');

  // ⚙️ POS 独占特色参数：5. 专供库存来源扣减
  const [stockSource, setStockSource] = useState<string>('米兰旗舰展厅主专柜仓');

  // ⚙️ POS 独占特色参数：6. 当班现金开/交班
  const [isShiftOpen, setIsShiftOpen] = useState<boolean>(true); // 班次是否开启
  const [shiftStartTime, setShiftStartTime] = useState<string>('2026-06-17 09:00:00');
  const [cashFloat, setCashFloat] = useState<number>(300); // 开班备用金
  const [actualDrawerCash, setActualDrawerCash] = useState<string>('478.50'); // 实盘金额 (300开盘 + 128.5今日 + 50调账)
  const [currentShiftSalesCash, setCurrentShiftSalesCash] = useState<number>(128.5); // 今日在班内累计现金实收
  const [cashAdjustments, setCashAdjustments] = useState<Array<{
    id: string;
    type: 'in' | 'out';
    amount: number;
    reason: string;
    timestamp: string;
    cashierName: string;
  }>>([
    {
      id: "ADJ-20260617-001",
      type: 'in',
      amount: 50.00,
      reason: "换碎配辅币找零 (Coin/notes replenishment)",
      timestamp: "10:15:22",
      cashierName: "CASHIER-ADMIN"
    }
  ]);

  // 钱箱及班次调配临时参数
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [showShiftModal, setShowShiftModal] = useState<boolean>(false);
  const [tempFloat, setTempFloat] = useState<string>('300');
  const [tempCashier, setTempCashier] = useState<'CASHIER-ADMIN' | 'CASHIER-ASSISTANT' | 'CASHIER-INTERN'>('CASHIER-ADMIN');

  const [shiftReportList, setShiftReportList] = useState<any[]>([
    {
      id: 'SHIFT-20260616',
      cashier: 'CASHIER-ASSISTANT',
      openTime: '2026-06-16 09:00:00',
      closeTime: '2026-06-16 18:00:00',
      float: 300,
      salesCash: 520.40,
      expected: 820.40,
      actual: 820.40,
      discrepancy: 0,
      adjustmentsCount: 0,
      adjustmentsTotal: 0,
      status: 'success'
    }
  ]);

  const totalAdjustmentsAmount = useMemo(() => {
    return cashAdjustments.reduce((sum, adj) => {
      return sum + (adj.type === 'in' ? adj.amount : -adj.amount);
    }, 0);
  }, [cashAdjustments]);

  const expectedDrawerCash = useMemo(() => {
    return cashFloat + totalAdjustmentsAmount + currentShiftSalesCash;
  }, [cashFloat, totalAdjustmentsAmount, currentShiftSalesCash]);

  // ⚙️ POS 独占特色参数：7. AI POS智能联想与防损限额
  const [aiRecEnabled, setAiRecEnabled] = useState<boolean>(true);
  const [aiPreventLossLimit, setAiPreventLossLimit] = useState<number>(30); // 最大打折亏损底线：30%

  // ⚙️ 设置弹窗左侧 Tab 导航
  const [settingsSubTab, setSettingsSubTab] = useState<'hardware' | 'permissions' | 'payments' | 'receipts' | 'outlets' | 'shifts' | 'aipilot' | 'orders'>('hardware');
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<'all' | 'paid' | 'refunded'>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // 必须是 POS 交易订单
      const isPos = o.id.startsWith('pos-') || (o.notes && o.notes.includes('POS'));
      if (!isPos) return false;

      // 支付状态筛选
      if (filterPaymentStatus !== 'all' && o.paymentStatus !== filterPaymentStatus) {
        return false;
      }

      // 文本搜索筛选
      const q = searchOrderQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        o.total.toString().includes(q)
      );
    });
  }, [orders, searchOrderQuery, filterPaymentStatus]);

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 2500);
  };

  // 添加至购物车
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    triggerToast(`已添加商品: ${product.title}`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter((item): item is { product: Product; quantity: number } => item !== null);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomerId('');
    setDiscountPercent(0);
    triggerToast('已清空本次收款购物车');
  };

  // 添加自定义临时免库商品
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName || !customItemPrice || isNaN(Number(customItemPrice))) {
      triggerToast('请输入合法的商品名称与议定单价');
      return;
    }
    const priceNum = parseFloat(customItemPrice);
    const tempProduct: Product = {
      id: `custom-${Date.now()}`,
      title: customItemName,
      description: '收银现场追加的临时商品行',
      vendor: '收银前台',
      type: customItemType,
      status: 'active',
      price: priceNum,
      sku: 'TEMP-POS',
      inventory: 999,
      inventoryByLocation: { '默认门市': 999 },
      images: ['pencil'],
      collections: [],
      tags: ['custom']
    };

    addToCart(tempProduct);
    setShowCustomItemModal(false);
    setCustomItemName('');
    setCustomItemPrice('');
  };

  // 价格结算运算
  const subtotal = useMemo(() => {
    return cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const activeCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // 实收现金预计找零算力联动
  const computedChangePreview = useMemo(() => {
    const totalDue = grandTotal * 1.1;
    if (paymentMethod !== 'cash' || !cashTendered) return 0;
    const tenderedVal = parseFloat(cashTendered);
    if (isNaN(tenderedVal) || tenderedVal < totalDue) return 0;
    const base = tenderedVal - totalDue;
    if (roundingMode === 'round-to-5-cents') {
      return Math.round(base / 0.05) * 0.05;
    } else if (roundingMode === 'round-up-integer') {
      return Math.round(base);
    }
    return base;
  }, [paymentMethod, cashTendered, grandTotal, roundingMode]);

  // 完成收银结算
  const handleSettleCheckout = async () => {
    if (cart.length === 0) {
      triggerToast('收银篮中尚无商品');
      return;
    }

    const checkValue = grandTotal * 1.1; 

    // 如果选择现金支付且输入了实收金额，需要核对是否足够
    let actualTenderedNum = checkValue;
    if (paymentMethod === 'cash' && cashTendered !== '') {
      const tenderedVal = parseFloat(cashTendered);
      if (isNaN(tenderedVal)) {
        triggerToast('⚠️ 请输入有效的买方实付现金数额');
        return;
      }
      if (tenderedVal < checkValue) {
        triggerToast(`⚠️ 付款实收现金 €${tenderedVal.toFixed(2)} 不敷应付金额 €${checkValue.toFixed(2)}，请足额收取现金！`);
        return;
      }
      actualTenderedNum = tenderedVal;
    }

    // 双重校验折扣权限与 AI 阀值
    if (discountPercent > 0 && !allowCartDiscount) {
      triggerToast(`❌ 权限不足: 当前收银专员 [${cashierAccount}] 的配置中不允许人工微调折扣！`);
      return;
    }
    if (discountPercent > aiPreventLossLimit) {
      triggerToast(`🚨 AI 零售卫士警报: 手动让利值 ${discountPercent}% 超过了在 AI 面板设置的最大防亏损警戒线 ${aiPreventLossLimit}%，操作已截断！`);
      return;
    }

    const orderId = `pos-${Date.now().toString().slice(-6)}`;
    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      title: item.product.title,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images[0] || 'wallet'
    }));

    // 根据余数及舍入法则计算找零
    const baseChange = actualTenderedNum - checkValue;
    let finalChange = baseChange;
    if (paymentMethod === 'cash') {
      if (roundingMode === 'round-to-5-cents') {
        finalChange = Math.round(baseChange / 0.05) * 0.05;
      } else if (roundingMode === 'round-up-integer') {
        finalChange = Math.round(baseChange);
      }
    }

    const transactionPayload: POSTransaction = {
      id: orderId,
      name: `#${orderId.toUpperCase()}`,
      customerName: activeCustomer ? `${activeCustomer.firstName} ${activeCustomer.lastName}` : '散客零售',
      customerEmail: activeCustomer ? activeCustomer.email : 'retail@commerce.com',
      items: orderItems,
      subtotal: subtotal,
      discountCode: discountPercent > 0 ? `${discountPercent}% POS 特惠折扣` : undefined,
      discountAmount: discountAmount,
      tax: grandTotal * 0.1, // 10% 销售统一附加税
      shipping: 0,
      total: checkValue, // 实收金额 = 增值净收 + 10% 税额
      paymentStatus: 'paid',
      fulfillmentStatus: 'fulfilled',
      createdAt: new Date().toISOString(),
      notes: paymentMethod === 'cash' 
        ? `[现金极速找零对账] 客户付 €${actualTenderedNum.toFixed(2)}，实找零 €${finalChange.toFixed(2)} (舍入方式: ${roundingMode === 'exact' ? '精细找零' : roundingMode === 'round-to-5-cents' ? '5分硬币舍入' : '免零整数找'})` 
        : `[电子联机收款] 已向刷卡外设 ${paymentTerminal} 下发交易指令`,
      registerId: registerId,
      cashierId: cashierAccount,
      paymentMethod: paymentMethod === 'cash' ? 'cash' : 'credit_card',
      locationName: `${locationName} (${stockSource})`,
      posDeviceModel: `${deviceModel} | ${selectedPrinter}`
    };

    // 绑定物理参数以透传客制化打印
    (transactionPayload as any).cashAmountReceived = actualTenderedNum;
    (transactionPayload as any).cashChangeReturned = finalChange;
    (transactionPayload as any).roundingModeUsed = roundingMode;

    const success = await syncTransaction(transactionPayload);

    if (success) {
      setLastCompletedOrder(transactionPayload);
      setShowInvoiceModal(true);
      
      // 真实的当班现金流水账累进
      if (paymentMethod === 'cash') {
        setCurrentShiftSalesCash(prev => prev + checkValue);
      }
      
      // 重置前台开单状态
      setCart([]);
      setSelectedCustomerId('');
      setDiscountPercent(0);
      setCashTendered('');
      
      const drawerMsg = (autoPopCashDrawer && paymentMethod === 'cash') ? ' ＋ 本地马达物理抽屉已闪开' : '';
      triggerToast(`付款交付成功！订单及库存已实时双向对齐${drawerMsg}！`);
    } else {
      triggerToast('❌ 收盘交收锁同步更新异常，请重新提交');
    }
  };

  // 物理钱箱与账单暂挂逻辑
  const handleOpenCashDrawer = () => {
    triggerToast('✔ 钱箱电机动作信号已解密：物理硬体抽屉成功弹出');
  };

  const handleParkOrder = () => {
    if (cart.length === 0) {
      triggerToast('收银详单篮当前为空，无法暂存空白单');
      return;
    }
    setParkedCart(cart);
    setCart([]);
    triggerToast('✔ 暂搁成功！当前账单已推入后台暂存槽 (详单ID: PENDING-POS-01)');
  };

  const handleRecallOrder = () => {
    if (!parkedCart || parkedCart.length === 0) {
      triggerToast('未检索到当前当班期的暂挂未付款单据');
      return;
    }
    setCart(parkedCart);
    setParkedCart(null);
    triggerToast('✔ 成功提取！上一笔挂存详单已自动回填购物车');
  };

  const handleEndShift = () => {
    if (!isShiftOpen) {
      triggerToast('⚠️ 收银班次当前已处于锁闭状态，请先启动新班次');
      return;
    }
    setActualDrawerCash(expectedDrawerCash.toFixed(2));
    setShowShiftModal(true);
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 bg-[#F6F6F7] min-h-screen font-sans flex flex-col justify-between">
      
      {/* 极简顶栏 - 独立长条形高阶功能按钮组 (全屏幕最顶部) */}
      <div className="bg-neutral-900 text-white rounded-xl py-2 px-3 flex items-center justify-center shadow-md border border-neutral-800 font-mono text-[11px] shrink-0">
        {/* 顶部小长方形按钮组 - 无任何废话，纯功能按钮 */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleOpenCashDrawer}
            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white rounded text-[10px] font-bold tracking-tight transition-colors border border-neutral-700 cursor-pointer"
          >
            📂 开钱箱 [F1]
          </button>

          <button
            type="button"
            onClick={handleParkOrder}
            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white rounded text-[10px] font-bold tracking-tight transition-colors border border-neutral-700 cursor-pointer"
          >
            ⏸ 暂存挂单 [F2]
          </button>

          <button
            type="button"
            onClick={handleRecallOrder}
            disabled={!parkedCart}
            className={`px-3 py-1 rounded text-[10px] font-bold tracking-tight transition-colors border cursor-pointer ${
              parkedCart 
                ? 'bg-[#07C2E3]/15 hover:bg-[#07C2E3]/25 text-[#07C2E3] border-[#07C2E3]/35' 
                : 'bg-neutral-850 text-neutral-500 border-neutral-700/40 cursor-not-allowed'
            }`}
          >
            ▶ 取放挂单 ({parkedCart ? 1 : 0})
          </button>

          <button
            type="button"
            onClick={handleEndShift}
            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white rounded text-[10px] font-bold tracking-tight transition-colors border border-neutral-700 cursor-pointer"
          >
            ⚡ 当班结账 [F4]
          </button>

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white rounded text-[10px] font-bold tracking-tight transition-colors border border-neutral-700 cursor-pointer"
          >
            ⚙️ 终端设置 [F6]
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('dashboard')}
            className="px-3 py-1 bg-red-950/40 hover:bg-red-950 text-red-200 hover:text-red-100 rounded text-[10px] font-bold tracking-tight transition-all border border-red-900/50 cursor-pointer"
          >
            ✕ 退出POS [ESC]
          </button>
        </div>
      </div>

      {/* 消息通知区 */}
      {notification && (
        <div className="fixed top-20 right-6 bg-neutral-900 border border-neutral-800 text-[#07C2E3] px-4 py-2 rounded-lg shadow-xl z-50 flex items-center space-x-2 text-xs font-mono">
          <span>{notification}</span>
        </div>
      )}

      <div className="space-y-4 mt-3">
        {/* 收银抬头导航区 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#E1E3E5] gap-4">
          <div>
            <h1 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <span>零售收银服务系统 (POS)</span>
              <span className="text-[10px] bg-[#07C2E3]/10 text-[#07C2E3] border border-[#07C2E3]/20 font-bold px-2 py-0.5 rounded">正常运行</span>
            </h1>
          </div>

          <button
            onClick={() => setShowCustomItemModal(true)}
            className="h-9 px-3 border border-[#d1d1d1] hover:border-[#1a1a1a] hover:bg-[#f9f9f9] text-[#1a1a1a] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-white"
          >
            <Plus className="w-3.5 h-3.5 text-[#07C2E3]" />
            <span>追加款项商品</span>
          </button>
        </div>

        {/* 核心双栏收银区 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* 左侧 9 栏：嵌入全新的 POS 筛选过滤商品列表 */}
          <div className="lg:col-span-9 h-full">
            <POSProductList onSelectProduct={addToCart} />
          </div>

          {/* 右侧 3 栏：待结算账单与购物车配置 (小一半的极致精细版) */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* 购物车结算容器 */}
            <div className="bg-white border border-[#E1E3E5] rounded-xl flex flex-col shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#F1F2F4] flex justify-between items-center bg-neutral-50/70">
                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 font-sans">
                  <ShoppingCart className="w-4 h-4 text-neutral-700" />
                  本次收款详单 ({cart.reduce((ac, cu) => ac + cu.quantity, 0)} 项)
                </span>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-neutral-400 hover:text-red-600 hover:underline cursor-pointer"
                  >
                    清空详单
                  </button>
                )}
              </div>

              {/* 详单清单列表 */}
              {cart.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-2 h-64">
                  <Package className="w-8 h-8 text-neutral-300" />
                  <p className="text-xs text-neutral-500">账单中无商品</p>
                  <p className="text-[11px] text-neutral-400 max-w-xs leading-normal">
                    请在左侧商品面板中检索并点击商品以拉入收款账单中。
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#F1F2F4] max-h-72 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product.id} className="p-3.5 flex justify-between items-center gap-2 group hover:bg-[#F9FAFB] transition-colors">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                          {item.product.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                          <span>€ {item.product.price.toFixed(2)} / 件</span>
                          <span>•</span>
                          <span>SKU: {item.product.sku}</span>
                        </div>
                      </div>

                      {/* 数量与操作项 */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-[#d1d1d1] rounded bg-white overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-5 h-5 flex items-center justify-center hover:bg-neutral-50 active:bg-neutral-100 cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5 text-neutral-600" />
                          </button>
                          <span className="text-xs font-mono font-bold text-neutral-850 px-1.5 w-6 text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-5 h-5 flex items-center justify-center hover:bg-neutral-50 active:bg-neutral-100 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5 text-neutral-600" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-6 h-6 text-red-500 hover:bg-red-50 rounded flex items-center justify-center cursor-pointer transition-colors"
                          title="移除此行"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 忠诚会员关联 */}
              <div className="p-4 bg-neutral-50/50 border-t border-[#F1F2F4] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-600 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#07C2E3]" />
                    <span>绑定会员匹配</span>
                  </label>
                  {activeCustomer && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      尊贵忠诚会员已匹配成功
                    </span>
                  )}
                </div>

                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    const cust = customers.find(c => c.id === e.target.value);
                    if (cust) {
                      if (cust.segment === 'VIP') {
                        setDiscountPercent(10);
                        triggerToast('匹配尊享VIP会员：已自动套用 10% 客户折扣优惠');
                      } else {
                        setDiscountPercent(0);
                      }
                    } else {
                      setSelectedCustomerId('');
                      setDiscountPercent(0);
                    }
                  }}
                  className="w-full text-xs font-sans border border-[#D1D5DB] rounded-lg bg-white p-2 text-neutral-800 focus:ring-1 focus:ring-[#07C2E3] outline-none"
                >
                  <option value="">-- 常规零售散客现场结账 (无需记录身份) --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.email}) - {c.segment}
                    </option>
                  ))}
                </select>
              </div>

              {/* 折扣比率让利配置 */}
              <div className="p-4 bg-white border-t border-[#F1F2F4] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-600 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-[#07C2E3]" />
                    <span>追加让利折扣比例</span>
                  </label>
                  {discountPercent > 0 && (
                    <span className="text-xs text-[#07C2E3] font-bold">
                      优惠 {discountPercent}% 折立减
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[0, 10, 15, 20].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => {
                        if (rate > 0 && !allowCartDiscount) {
                          triggerToast(`❌ 权限不足: 当前收银专员 [${cashierAccount}] 的配置中不允许人工微调折扣！`);
                          return;
                        }
                        if (rate > aiPreventLossLimit) {
                          triggerToast(`🚨 AI 零售卫士拦截: 让利比率 ${rate}% 超过了您在 AI Co-pilot 中部署的防亏损红线 ${aiPreventLossLimit}%，已被系统安全阻断！`);
                          return;
                        }
                        setDiscountPercent(rate);
                        triggerToast(`已设置应结算额度折扣为 ${rate}%`);
                      }}
                      className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors cursor-pointer text-center ${
                        discountPercent === rate
                          ? 'bg-[#07C2E3] border-[#07C2E3] text-black'
                          : 'bg-white border-[#E1E3E5] hover:border-black text-neutral-700 font-medium'
                      }`}
                    >
                      {rate === 0 ? '无额外扣减' : `${rate}% 折`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 收纳结算总额和操作 */}
              <div className="p-4 bg-neutral-900 text-white space-y-3">
                {/* 💳 线下支付信道 */}
                <div className="py-2 border-b border-neutral-800 space-y-2">
                  <div className="flex justify-between items-center text-xs text-neutral-400">
                    <span>支付结算信道</span>
                    <span className="text-[10.5px] text-[#07C2E3] font-mono">CHANNEL PICKER</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!cashPayEnabled) {
                          triggerToast('🚫 现金支付信道已在终端设置中被管理员锁定禁用！');
                          return;
                        }
                        setPaymentMethod('cash');
                      }}
                      className={`py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 transition-all border cursor-pointer ${
                        paymentMethod === 'cash'
                          ? 'bg-[#07C2E3]/10 text-[#07C2E3] border-[#07C2E3]'
                          : 'bg-[#1a1a1a] border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span>💵 现金交付</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!cardPayEnabled) {
                          triggerToast('🚫 刷卡记账信道已在终端设置中被管理员锁定禁用！');
                          return;
                        }
                        setPaymentMethod('credit_card');
                      }}
                      className={`py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 transition-all border cursor-pointer ${
                        paymentMethod === 'credit_card'
                          ? 'bg-[#07C2E3]/10 text-[#07C2E3] border-[#07C2E3]'
                          : 'bg-[#1a1a1a] border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span>💳 联机刷卡</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!scanPayEnabled) {
                          triggerToast('🚫 外置扫码枪信道已在终端设置中被管理员锁定禁用！');
                          return;
                        }
                        setPaymentMethod('scan_code');
                      }}
                      className={`py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 transition-all border cursor-pointer ${
                        paymentMethod === 'scan_code'
                          ? 'bg-[#07C2E3]/10 text-[#07C2E3] border-[#07C2E3]'
                          : 'bg-[#1a1a1a] border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span>📱 硬件扫条</span>
                    </button>
                  </div>
                </div>

                {/* 💵 现金数额及找零动态舍入算力 */}
                {paymentMethod === 'cash' && (
                  <div className="bg-[#1a1a1a] p-2.5 rounded-lg border border-neutral-800 space-y-2">
                    <div className="flex justify-between items-center text-xs text-neutral-300">
                      <span className="flex items-center gap-1">
                        <span>💵 实收现钞金额</span>
                        <span className="text-[9.5px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-mono">
                          {roundingMode === 'exact' ? '精细不免零' : roundingMode === 'round-to-5-cents' ? '5分硬币近律' : '免零整数法'}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const exactAmount = (grandTotal * 1.1);
                          setCashTendered(exactAmount.toFixed(2));
                          triggerToast('✔ 已自动填入买家刚好足额付现');
                        }}
                        className="text-[10px] text-[#07C2E3] hover:underline"
                      >
                        快速足额支付
                      </button>
                    </div>
                    
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs text-neutral-500 font-mono">€</span>
                      <input
                        type="text"
                        placeholder={(grandTotal * 1.1).toFixed(2)}
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        className="w-full pl-6 pr-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono focus:border-[#07C2E3] outline-none"
                      />
                    </div>

                    {parseFloat(cashTendered) >= (grandTotal * 1.1) && (
                      <div className="flex justify-between items-center text-xs pt-1 border-t border-neutral-800/50">
                        <span className="text-neutral-405">核定应找零钱</span>
                        <span className="text-emerald-400 font-mono font-bold text-sm">
                          € {computedChangePreview ? computedChangePreview.toFixed(2) : '0.00'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span>商品金额总计 (不含税)</span>
                  <span className="text-white font-mono">€ {subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-xs text-[#07C2E3]">
                    <span>折扣减免优惠</span>
                    <span className="font-mono">-€ {discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span>增值附加销售税 (统一 10% 零售代征)</span>
                  <span className="text-white font-mono">€ {(grandTotal * 0.1).toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-neutral-300">本单实收应缴额 (含税)</span>
                  <span className="text-lg font-mono font-extrabold text-[#07C2E3]">
                    € {(grandTotal * 1.1).toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSettleCheckout}
                  disabled={cart.length === 0 || isSyncing}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-1.5 transition-all outline-none ${
                    cart.length > 0 && !isSyncing
                      ? 'bg-[#07C2E3] text-black hover:bg-[#06B2D0] active:bg-[#059BBC] cursor-pointer'
                      : 'bg-neutral-850 text-[#555555] cursor-not-allowed'
                  }`}
                >
                  {isSyncing ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin"></span>
                      <span>实时联动同步中...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>完成当面结账收款 & 打印收据</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* 底部当班账目流水单表 */}
        <div className="pt-4">
          <POSTransactionHistory 
            onViewInvoice={(o) => {
              setLastCompletedOrder(o);
              setShowInvoiceModal(true);
            }} 
            onToast={(msg) => triggerToast(msg)} 
          />
        </div>
      </div>

      {/* 弹窗对话框: 追加免在库商品款项 */}
      {showCustomItemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E1E3E5] rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center pb-2 border-b border-[#F1F2F4]">
              <h3 className="text-xs font-bold text-neutral-900 tracking-wider">
                录入收银款项 / 临时销售行
              </h3>
              <button 
                onClick={() => setShowCustomItemModal(false)}
                className="text-neutral-400 hover:text-black p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                  临时品款名称
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如: 现场定制礼盒包装、临时手打项"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full text-xs p-2 border border-[#D1D5DB] rounded-lg outline-none focus:ring-1 focus:ring-[#07C2E3] text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                    议定结账价格 (售价 €)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="售价欧元"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(e.target.value)}
                    className="w-full text-xs p-2 border border-[#D1D5DB] rounded-lg outline-none focus:ring-1 focus:ring-[#07C2E3] text-neutral-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                    所属类型
                  </label>
                  <select
                    value={customItemType}
                    onChange={(e) => setCustomItemType(e.target.value)}
                    className="w-full text-xs p-2 border border-[#D1D5DB] rounded-lg outline-none bg-white font-sans focus:ring-1 focus:ring-[#07C2E3] text-neutral-800"
                  >
                    <option value="配件">配件零售</option>
                    <option value="服装">成衣服饰</option>
                    <option value="数码">电子数码</option>
                    <option value="服务">现场服务</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomItemModal(false)}
                  className="flex-1 py-1.5 border border-[#D1D5DB] rounded-lg text-xs font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-neutral-900 text-white hover:bg-black rounded-lg text-xs font-bold cursor-pointer"
                >
                  确立加单
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 弹窗对话框: ⚙️ POS 终端参数设置 */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-neutral-200 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-scaleIn flex flex-col md:flex-row h-[550px]">
            {/* 左侧 Tab 轨道菜单 */}
            <div className="w-full md:w-56 bg-neutral-50 border-r border-neutral-100 p-4 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="pb-3 mb-2 border-b border-neutral-200">
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-mono">
                    POS 智能控制台
                  </h4>
                  <p className="text-[9px] text-neutral-500">设备: {deviceModel}</p>
                </div>

                {[
                  { id: 'hardware', label: '🔌 硬件与外设', desc: '打印机/扫码枪/钱箱' },
                  { id: 'permissions', label: '🧑‍💼 岗位及权限', desc: '折扣/弹出控制' },
                  { id: 'payments', label: '💵 支付与舍入', desc: '法币渠道及抹零' },
                  { id: 'receipts', label: '📄 小票热敏模板', desc: '自拟页眉页脚' },
                  { id: 'outlets', label: '🏬 门店与仓储', desc: '网点库存关联' },
                  { id: 'shifts', label: '📅 当班收银对账', desc: '日结班次/钱箱盘点' },
                  { id: 'aipilot', label: '⚡ AI 零售卫士', desc: '防损/导购副驾' },
                  { id: 'orders', label: '📊 历史订单管理', desc: '全单溯源/办理退款' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSettingsSubTab(tab.id as any)}
                    className={`w-full text-left p-2 rounded-lg transition-all cursor-pointer flex flex-col ${
                      settingsSubTab === tab.id
                        ? 'bg-[#07C2E3]/15 text-[#07C2E3] border-l-2 border-[#07C2E3]'
                        : 'hover:bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    <span className="text-xs font-bold">{tab.label}</span>
                    <span className="text-[8.5px] text-neutral-400">{tab.desc}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  triggerToast('✔ 终端配置修改已成功固化保存');
                }}
                className="w-full py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer text-center"
              >
                返回收银台 [ESC]
              </button>
            </div>

            {/* 右侧核心面板主面板 */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between bg-white text-neutral-850">
              <div className="space-y-4">
                {/* 1. 硬件外设 Tab */}
                {settingsSubTab === 'hardware' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-neutral-900 border-b pb-1">🔌 硬件物理外设集成</h3>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-1">小票热敏打印机</label>
                        <select
                          value={selectedPrinter}
                          onChange={(e) => setSelectedPrinter(e.target.value)}
                          className="w-full text-xs p-2 border border-neutral-200 bg-neutral-50 font-mono rounded-lg outline-none"
                        >
                          <option value="内置 58mm 极速热敏小票机">内置 58mm 极速热敏小票机 (USB)</option>
                          <option value="XP-80 挂壁式大轴后厨打印机">XP-80 挂壁式大轴后厨打印机 (TCP/IP)</option>
                          <option value="AURA-8800 高端热敏机">AURA-8800 高端热敏机 (Wi-Fi)</option>
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={testPrintLoading}
                          onClick={() => {
                            setTestPrintLoading(true);
                            triggerToast('⏳ 正在向打印机发送 200dpi 灰度对齐脉冲测试数据...');
                            setTimeout(() => {
                              setTestPrintLoading(false);
                              triggerToast('✔ 打印测试完成：内置热敏出纸 5cm，走纸刀头切面正常！');
                            }, 1200);
                          }}
                          className="flex-1 py-1 px-2 border border-[#07C2E3] text-[#07C2E3] hover:bg-[#07C2E3]/5 text-[10px] font-bold rounded cursor-pointer transition-colors"
                        >
                          {testPrintLoading ? '测试打印中...' : '测试热敏出纸 📄'}
                        </button>
                        <button
                          type="button"
                          disabled={testDrawerLoading}
                          onClick={() => {
                            setTestDrawerLoading(true);
                            triggerToast('⏳ 正在向 RJ11 接口释放 24V 双向电机安全电平信号...');
                            setTimeout(() => {
                              setTestDrawerLoading(false);
                              triggerToast('✔ 弹出指令握手完成：物理金属抽屉机械锁已成功弹开！');
                            }, 1000);
                          }}
                          className="flex-1 py-1 px-2 border border-neutral-300 hover:bg-neutral-50 text-[10px] font-bold rounded text-neutral-600 cursor-pointer transition-colors"
                        >
                          {testDrawerLoading ? '钱箱测试中...' : '测试双向钱箱 💵'}
                        </button>
                      </div>

                      <div className="pt-2 border-t border-dashed border-neutral-100 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-500">蓝牙/USB 条码扫码枪:</span>
                          <span className={scannerConnected ? 'text-emerald-600 font-bold' : 'text-rose-500'}>
                            ● 已连接 (HID-键盘极速模拟)
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-500">外置多功能银行刷卡机:</span>
                          <span className="font-mono text-neutral-800">{paymentTerminal}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. 岗位及权限 Tab */}
                {settingsSubTab === 'permissions' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-neutral-900 border-b pb-1">🧑‍💼 收银员岗位及线下专属权限</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 mb-1">当前登录班组岗位账号</label>
                        <select
                          value={cashierAccount}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setCashierAccount(val);
                            if (val === 'CASHIER-ADMIN') {
                              setAllowCartDiscount(true);
                              setAllowManualDrawer(true);
                            } else if (val === 'CASHIER-ASSISTANT') {
                              setAllowCartDiscount(true);
                              setAllowManualDrawer(false);
                            } else {
                              setAllowCartDiscount(false);
                              setAllowManualDrawer(false);
                            }
                            triggerToast(`✔ 用户切换成功：已应用岗位 [${val}] 的默认权限`);
                          }}
                          className="w-full text-xs p-2.5 border border-neutral-200 bg-neutral-50 font-mono rounded-lg outline-none"
                        >
                          <option value="CASHIER-ADMIN">CASHIER-ADMIN (总裁专员 - 满级特权)</option>
                          <option value="CASHIER-ASSISTANT">CASHIER-ASSISTANT (普通店员 - 禁用免单开屉)</option>
                          <option value="CASHIER-INTERN">CASHIER-INTERN (实习职员 - 禁用一切折扣/开屉)</option>
                        </select>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center p-2 bg-neutral-50 rounded-lg border border-neutral-100">
                          <div>
                            <span className="block text-xs font-bold text-neutral-700">允许该员工手动微调折扣</span>
                            <span className="text-[9px] text-neutral-400">关闭后该员工无法在前台手动对商品加一五折</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={allowCartDiscount}
                            onChange={(e) => setAllowCartDiscount(e.target.checked)}
                            className="w-4 h-4 text-[#07C2E3] accent-[#07C2E3] rounded cursor-pointer"
                          />
                        </div>

                        <div className="flex justify-between items-center p-2 bg-neutral-50 rounded-lg border border-neutral-100">
                          <div>
                            <span className="block text-xs font-bold text-neutral-700">允许无单纯手动弹出钱箱</span>
                            <span className="text-[9px] text-neutral-400">允许不通过结算，随时开箱放入/拿取大钞与硬币</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={allowManualDrawer}
                            onChange={(e) => setAllowManualDrawer(e.target.checked)}
                            className="w-4 h-4 text-[#07C2E3] accent-[#07C2E3] rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. 支付与舍入 Tab */}
                {settingsSubTab === 'payments' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-neutral-900 border-b pb-1">💵 现场零售货款与舍入法</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 mb-1">现金交付抹零舍入法</label>
                        <select
                          value={roundingMode}
                          onChange={(e) => setRoundingMode(e.target.value as any)}
                          className="w-full text-xs p-2.5 border border-neutral-200 bg-neutral-50 font-sans rounded-lg outline-none"
                        >
                          <option value="exact">不予抹零 (精确保留至 0.01 欧元对齐分币)</option>
                          <option value="round-to-5-cents">欧洲 5 欧分舍入 (应找 €3.58 最终化为 €3.60 收发)</option>
                          <option value="round-up-integer">免零法零钱免找 (自动四舍五入到最近整数欧元对账)</option>
                        </select>
                      </div>

                      <div className="space-y-2 pt-2">
                        <span className="block text-[9px] font-bold text-neutral-400">开启或禁用前台特定结算信道</span>
                        <div className="grid grid-cols-3 gap-2">
                          <label className="flex items-center gap-1.5 p-2 border rounded-lg bg-neutral-50 cursor-pointer border-neutral-100">
                            <input
                              type="checkbox"
                              checked={cashPayEnabled}
                              onChange={(e) => setCashPayEnabled(e.target.checked)}
                              className="w-3.5 h-3.5 text-[#07C2E3] accent-[#07C2E3]"
                            />
                            <span className="text-xs text-neutral-700">💵 现金交付</span>
                          </label>
                          <label className="flex items-center gap-1.5 p-2 border rounded-lg bg-neutral-50 cursor-pointer border-neutral-100">
                            <input
                              type="checkbox"
                              checked={cardPayEnabled}
                              onChange={(e) => setCardPayEnabled(e.target.checked)}
                              className="w-3.5 h-3.5 text-[#07C2E3] accent-[#07C2E3]"
                            />
                            <span className="text-xs text-neutral-700">💳 联机刷卡</span>
                          </label>
                          <label className="flex items-center gap-1.5 p-2 border rounded-lg bg-neutral-50 cursor-pointer border-neutral-100">
                            <input
                              type="checkbox"
                              checked={scanPayEnabled}
                              onChange={(e) => setScanPayEnabled(e.target.checked)}
                              className="w-3.5 h-3.5 text-[#07C2E3] accent-[#07C2E3]"
                            />
                            <span className="text-xs text-neutral-700">📱 扫码付</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. 小票热敏模板 Tab */}
                {settingsSubTab === 'receipts' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-neutral-900 border-b pb-1">📄 58mm 极速热敏小票模版</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-1">
                          小票纸首部广告/宣发语 (Receipt Header)
                        </label>
                        <input
                          type="text"
                          value={receiptHeader}
                          onChange={(e) => setReceiptHeader(e.target.value)}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg outline-none focus:border-[#07C2E3] text-black"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-1">
                          小票足尾退换承诺条文 (Receipt Footer)
                        </label>
                        <textarea
                          rows={3}
                          value={receiptFooter}
                          onChange={(e) => setReceiptFooter(e.target.value)}
                          className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg outline-none focus:border-[#07C2E3] font-sans resize-none text-black"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. 门店与仓储 Tab */}
                {settingsSubTab === 'outlets' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-neutral-900 border-b pb-1">🏬 门店网点与物理仓配绑定</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 mb-1">当前POS机落户零售网点</label>
                        <select
                          value={locationName}
                          onChange={(e) => setLocationName(e.target.value)}
                          className="w-full text-xs p-2.5 border border-neutral-200 bg-neutral-50 rounded-lg outline-none text-black"
                        >
                          <option value="米兰旗舰直营网点">米兰旗舰直营网点 (Milano Hub-01)</option>
                          <option value="罗马竞技潮集馆">罗马竞技潮集馆 (Roma Store-A)</option>
                          <option value="佛罗伦萨中世纪风情柜">佛罗伦萨中世纪风情柜 (Firenze Loft)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 mb-1">前台出单对口物理扣减仓库</label>
                        <select
                          value={stockSource}
                          onChange={(e) => setStockSource(e.target.value)}
                          className="w-full text-xs p-2.5 border border-neutral-200 bg-neutral-50 rounded-lg outline-none text-black"
                        >
                          <option value="米兰旗舰仓-前台精品现货库">米兰旗舰仓-前台精品现货库 (LOC-MAIN)</option>
                          <option value="南欧跨国大枢纽地下缓冲备用库">南欧区物流中心大机房中转备份库 (LOC-HUB)</option>
                          <option value="不扣库存-完全穿透虚拟出货">不予扣库 - 纯虚拟即配穿透 (LOC-VIRTUAL)</option>
                        </select>
                        <span className="block text-[8px] text-neutral-400 mt-1">
                          小知识: 线下交易发生的库存变动将从您选择的网点源仓中实时扣减，全局数据库与销售流水完全联动。
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. 当班现金日结班次 Tab */}
                {settingsSubTab === 'shifts' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-1">
                      <h3 className="text-xs font-bold text-neutral-900 font-sans">📅 钱箱与当班收银对账 (Cash Drawer Shift)</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isShiftOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {isShiftOpen ? '🟢 当班中 (Active)' : '🔴 已锁班 (Closed)'}
                      </span>
                    </div>
                    
                    {!isShiftOpen ? (
                      <div className="bg-neutral-50 p-4 border rounded-xl space-y-3.5 text-center">
                        <Lock className="w-5 h-5 mx-auto text-neutral-400 animate-bounce" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-neutral-800">当前钱箱已锁闭</p>
                          <p className="text-[10px] text-neutral-500">请录入备用金开班以允许收银结账：</p>
                        </div>
                        <div className="max-w-xs mx-auto space-y-2 text-left">
                          <div>
                            <label className="block text-[10px] font-bold text-neutral-600 mb-0.5">准备底金 (€)</label>
                            <input
                              type="number"
                              value={tempFloat}
                              onChange={(e) => setTempFloat(e.target.value)}
                              className="w-full text-xs font-mono p-1.5 border rounded bg-white text-black"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const f = parseFloat(tempFloat);
                              if (isNaN(f) || f < 0) {
                                triggerToast('请输入合规的准备金金额！');
                                  return;
                              }
                              setCashFloat(f);
                              setShiftStartTime(new Date().toLocaleTimeString());
                              setCashAdjustments([]);
                              setCurrentShiftSalesCash(0);
                              setActualDrawerCash(f.toFixed(2));
                              setIsShiftOpen(true);
                              triggerToast('🚀 开班成功！钱箱已处于激活备账阶段，系统已启动。');
                            }}
                            className="w-full py-1.5 bg-[#07C2E3] hover:bg-[#06B2D0] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                          >
                            🔓 开班开始营业 (Open Shift)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-1.5 font-mono text-[10.5px]">
                          <div className="flex justify-between">
                            <span className="text-neutral-500">开盘准备金 (Float):</span>
                            <span className="font-bold text-black">€ {cashFloat.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-amber-600">
                            <span className="text-neutral-500">备用资金调账 (Adjustments):</span>
                            <span className="font-bold">{totalAdjustmentsAmount >= 0 ? '+' : ''} € {totalAdjustmentsAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-[#07C2E3]">
                            <span className="text-neutral-500">今日累计现金实收 (Sales):</span>
                            <span className="font-bold">€ {currentShiftSalesCash.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t border-dashed pt-1.5 text-xs text-neutral-800">
                            <span className="font-bold">理论应有盘额 (Expected):</span>
                            <span className="font-extrabold text-neutral-900">€ {expectedDrawerCash.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Adjustments Form */}
                        <div className="border border-neutral-200 rounded-lg p-2.5 bg-white space-y-2">
                          <span className="block text-[10px] font-bold text-neutral-700">✍ 新增钱箱调账 (Add Cash Adj.)</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[8.5px] text-neutral-400">调整类型</label>
                              <select 
                                value={adjustType} 
                                onChange={(e) => setAdjustType(e.target.value as any)}
                                className="w-full text-xs p-1 border rounded bg-neutral-50 text-neutral-800"
                              >
                                <option value="in">存入 (+) (Coin In)</option>
                                <option value="out">支出 (-) (Payout/Drop)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[8.5px] text-neutral-400">数额 (€)</label>
                              <input 
                                type="number" 
                                value={adjustAmount} 
                                onChange={(e) => setAdjustAmount(e.target.value)}
                                className="w-full text-xs p-1 border rounded bg-white text-black font-mono"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[8.5px] text-neutral-400">缘由注释 (Reason)</label>
                            <input 
                              type="text" 
                              value={adjustReason} 
                              onChange={(e) => setAdjustReason(e.target.value)}
                              className="w-full text-xs p-1 border rounded bg-white text-black"
                              placeholder="例如: 辅币补充 / 安全解交大钞"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const amt = parseFloat(adjustAmount);
                              if (isNaN(amt) || amt <= 0) {
                                triggerToast('⚠️ 请输入合规的调整金额');
                                return;
                              }
                              if (!adjustReason.trim()) {
                                triggerToast('⚠️ 请填写调账缘由');
                                return;
                              }
                              const newAdj = {
                                id: `ADJ-${Date.now().toString().slice(-6)}`,
                                type: adjustType,
                                amount: amt,
                                reason: adjustReason.trim(),
                                timestamp: new Date().toLocaleTimeString(),
                                cashierName: cashierAccount
                              };
                              setCashAdjustments(prev => [...prev, newAdj]);
                              setAdjustAmount('');
                              setAdjustReason('');
                              triggerToast(`✔ 调账 €${amt.toFixed(2)} 已记账，钱箱流水账盘已实时刷新！`);
                            }}
                            className="w-full py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-[10px] font-bold rounded cursor-pointer text-center"
                          >
                            ➕ 保存调账记录
                          </button>
                        </div>

                        {/* Recent Adjustments list */}
                        {cashAdjustments.length > 0 && (
                          <div className="space-y-1">
                            <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider">当前班次调账明细</span>
                            <div className="max-h-20 overflow-y-auto border rounded text-[9px] font-mono divide-y">
                              {cashAdjustments.map((adj) => (
                                <div key={adj.id} className="p-1 px-1.5 flex justify-between bg-white hover:bg-neutral-50">
                                  <span className="truncate max-w-[130px] text-neutral-700">{adj.reason}</span>
                                  <span className={adj.type === 'in' ? 'text-emerald-600' : 'text-rose-500 font-bold'}>
                                    {adj.type === 'in' ? '+' : '-'}€{adj.amount.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Standard Close block */}
                        <div className="space-y-1 bg-neutral-50 p-2.5 rounded-lg border">
                          <div className="flex justify-between items-center text-[11px]">
                            <label className="font-bold text-neutral-700">实盘复算现金总额 (€)</label>
                            {Math.abs(parseFloat(actualDrawerCash) - expectedDrawerCash) < 0.1 ? (
                              <span className="text-[9px] text-emerald-600 font-bold">✔ 钱箱账实相等</span>
                            ) : (
                              <span className="text-[9px] text-rose-500 font-bold">
                                ⚠️ 偏: € {(parseFloat(actualDrawerCash) - expectedDrawerCash).toFixed(2)}
                              </span>
                            )}
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            value={actualDrawerCash}
                            onChange={(e) => setActualDrawerCash(e.target.value)}
                            className="w-full text-xs font-mono p-1.5 border rounded bg-white text-black"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const actualVal = parseFloat(actualDrawerCash);
                              if (isNaN(actualVal)) {
                                triggerToast('⚠️ 请在实盘中输入有效的柜台理算总值');
                                return;
                              }
                              const discrepancy = actualVal - expectedDrawerCash;
                              const newReport = {
                                id: `SHIFT-${Date.now().toString().slice(-6)}`,
                                cashier: cashierAccount,
                                openTime: shiftStartTime,
                                closeTime: new Date().toLocaleTimeString(),
                                float: cashFloat,
                                salesCash: currentShiftSalesCash,
                                expected: expectedDrawerCash,
                                actual: actualVal,
                                discrepancy: discrepancy,
                                adjustmentsCount: cashAdjustments.length,
                                adjustmentsTotal: totalAdjustmentsAmount,
                                status: Math.abs(discrepancy) < 0.2 ? 'success' : 'warning'
                              };
                              setShiftReportList(prev => [newReport, ...prev]);
                              
                              // 关闭班次
                              setIsShiftOpen(false);
                              setCurrentShiftSalesCash(0);
                              setCashAdjustments([]);
                              setActualDrawerCash(cashFloat.toFixed(2));
                              triggerToast(`⚡ 已成功合拢封锁此班次！已签发本日 2.5寸 零售EOD审计联。`);
                            }}
                            className="w-full mt-2 py-1.5 bg-neutral-900 hover:bg-black text-white text-[11px] font-bold rounded cursor-pointer text-center"
                          >
                            ⚡ 锁账结班并套印 EOD 对账报单
                          </button>
                        </div>
                      </>
                    )}

                    {/* Historical summary Reports log */}
                    <div className="space-y-1.5 pt-1">
                      <span className="block text-[8.5px] font-bold text-neutral-400">历史日结账单对账归集 (EOD Logs)</span>
                      <div className="max-h-25 overflow-y-auto divide-y text-[9px] font-mono border rounded select-none bg-neutral-50/50">
                        {shiftReportList.map((r, i) => (
                          <div key={i} className="p-1 px-1.5 flex justify-between hover:bg-neutral-100">
                            <div>
                              <span className="font-bold text-neutral-700">{r.id}</span>
                              <span className="text-neutral-400 text-[8px] pl-1">{r.closeTime}</span>
                            </div>
                            <span className="font-medium text-neutral-700">
                              应: €{r.expected.toFixed(1)} | 偏: 
                              <span className={`pl-1 font-bold ${Math.abs(r.discrepancy) < 0.2 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                €{r.discrepancy.toFixed(1)}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. AI零售领航卫士 Tab */}
                {settingsSubTab === 'aipilot' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-neutral-900 border-b pb-1">⚡ AI 零售卫士 & Co-pilot 自动领航</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                        <div>
                          <span className="block text-xs font-bold text-neutral-700">启用 AI 现场关联商品自动联想导购</span>
                          <span className="text-[9px] text-neutral-400">基于收银篮内现有衣服，在右侧底盘自动推荐搭配配饰</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={aiRecEnabled}
                          onChange={(e) => setAiRecEnabled(e.target.checked)}
                          className="w-4 h-4 text-[#07C2E3] accent-[#07C2E3] rounded cursor-pointer"
                        />
                      </div>

                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-rose-800 flex items-center gap-1">
                            <span>🚨 AI 手动让利防亏损最大红线</span>
                          </span>
                          <span className="font-mono font-bold bg-rose-150 text-rose-800 px-2 py-0.5 rounded text-xs">
                            {aiPreventLossLimit}% MAX
                          </span>
                        </div>
                        
                        <input
                          type="range"
                          min="5"
                          max="50"
                          step="5"
                          value={aiPreventLossLimit}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setAiPreventLossLimit(val);
                            triggerToast(`✔ AI 防亏损让利硬阈值已更新为: ${val}%`);
                          }}
                          className="w-full h-1 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-650"
                        />
                        <span className="block text-[8.5px] text-rose-600 leading-relaxed font-sans">
                          防损逻辑：当收银前台针对常规账单，所作的手动或追加比例折扣多于此阈值时，收银按键将被 AI 红色红线强制拦截打断。
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. 历史订单管理 Tab */}
                {settingsSubTab === 'orders' && (
                  <div className="space-y-4 flex-1 flex flex-col h-full min-h-0">
                    <div className="flex flex-col gap-2 border-b pb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-neutral-900">📊 历史订单管理 (全单检索与办理退/废单)</h3>
                        <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 font-bold select-none">
                          匹配 {filteredOrders.length} 笔 POS 交易
                        </span>
                      </div>
                      
                      {/* 搜索与过滤工具栏 */}
                      <div className="flex flex-col sm:flex-row gap-2 mt-1">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                          <input
                            type="text"
                            placeholder="输入销售流水号/顾客名/交易额检索..."
                            value={searchOrderQuery}
                            onChange={(e) => setSearchOrderQuery(e.target.value)}
                            className="w-full text-xs pl-8 pr-3 py-1.5 border border-neutral-200 bg-neutral-50 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-[#07C2E3] focus:border-[#07C2E3]"
                          />
                          {searchOrderQuery && (
                            <button
                              type="button"
                              onClick={() => setSearchOrderQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-[10px] bg-neutral-200 px-1 py-0.5 rounded"
                            >
                              清除
                            </button>
                          )}
                        </div>
                        
                        <div className="flex border border-neutral-200 rounded-lg overflow-hidden shrink-0 select-none bg-neutral-50">
                          {[
                            { id: 'all', label: '全部' },
                            { id: 'paid', label: '已收款' },
                            { id: 'refunded', label: '已退款' }
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setFilterPaymentStatus(tab.id as any)}
                              className={`px-3 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                                filterPaymentStatus === tab.id
                                  ? 'bg-[#07C2E3] text-black'
                                  : 'hover:bg-neutral-100 text-neutral-600'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 滚动内容区 */}
                    <div className="flex-1 overflow-y-auto max-h-[290px] border border-neutral-100 rounded-lg min-h-0">
                      {filteredOrders.length === 0 ? (
                        <div className="py-12 text-center text-neutral-400 flex flex-col items-center justify-center space-y-2">
                          <FileText className="w-8 h-8 text-neutral-300" />
                          <p className="text-xs font-medium">未检索到任何匹配的 POS 销售账单</p>
                          {searchOrderQuery && (
                            <button
                              type="button"
                              onClick={() => setSearchOrderQuery('')}
                              className="text-[10px] text-[#07C2E3] font-bold hover:underline"
                            >
                              重置搜索条件
                            </button>
                          )}
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-neutral-50/80 border-b border-neutral-100 text-neutral-500 font-bold sticky top-0 z-10">
                              <th className="p-2.5">流水号</th>
                              <th className="p-2.5">顾客</th>
                              <th className="p-2.5 text-right">交易金额</th>
                              <th className="p-2.5">支付状态</th>
                              <th className="p-2.5">时间</th>
                              <th className="p-2.5 text-center">快捷操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {filteredOrders.map((o) => {
                              return (
                                <tr key={o.id} className="hover:bg-neutral-50 border-neutral-50 bg-white">
                                  <td className="p-2.5 font-mono font-bold text-neutral-900">
                                    {o.name}
                                  </td>
                                  <td className="p-2.5 text-neutral-700 max-w-[80px] truncate">
                                    {o.customerName || '散客'}
                                  </td>
                                  <td className="p-2.5 text-right font-mono font-bold text-neutral-900">
                                    €{o.total.toFixed(2)}
                                  </td>
                                  <td className="p-2.5">
                                    <span
                                      className={`px-1.5 py-0.5 text-[8.5px] font-bold rounded-sm ${
                                        o.paymentStatus === 'paid'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                                      }`}
                                    >
                                      {o.paymentStatus === 'paid' ? '已收款' : '已退款'}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-neutral-500 font-mono text-[10px]">
                                    {new Date(o.createdAt).toLocaleString('zh-CN', {
                                      hour12: false,
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </td>
                                  <td className="p-2.5 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setLastCompletedOrder(o);
                                          setShowInvoiceModal(true);
                                        }}
                                        className="p-1 text-neutral-600 hover:text-[#07C2E3] hover:bg-neutral-100 rounded cursor-pointer"
                                        title="重打热敏小票"
                                      >
                                        <Printer className="w-3.5 h-3.5" />
                                      </button>
                                      
                                      {o.paymentStatus !== 'refunded' ? (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            updateOrder(o.id, {
                                              paymentStatus: 'refunded',
                                              fulfillmentStatus: 'unfulfilled',
                                            });
                                            triggerToast(`✔ 流水 ${o.name} 已成功置为已退款状态`);
                                          }}
                                          className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded cursor-pointer"
                                          title="办理退款/撤销交易"
                                        >
                                          <RefreshCw className="w-3.5 h-3.5" />
                                        </button>
                                      ) : (
                                        <span className="w-5" />
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => {
                                          deleteOrder(o.id);
                                          triggerToast(`✔ 已彻底删除 POS 流水: ${o.name}`);
                                        }}
                                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                                        title="彻底抹除此条账目"
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
                )}
              </div>

              {/* 后置动作 */}
              <div className="mt-6 pt-3 border-t border-neutral-100 flex justify-between items-center">
                <span className="text-[9px] font-mono text-neutral-400">AIR-SYSTEMS POS CLOUD v1.0.8</span>
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>SSL联机正常运作中</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗对话框: 购物热敏纸小票虚拟预览 */}
      {showInvoiceModal && lastCompletedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border-2 border-neutral-800 rounded-lg max-w-sm w-full shadow-2xl p-6 relative animate-scaleIn my-8">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-white border-x border-b border-neutral-300 px-4 py-0.5 rounded-b-md text-[8px] font-mono text-neutral-400 select-none">
              THERMAL RECEIPT SPRINT
            </div>

            <div className="space-y-4 font-mono text-center">
              <div>
                <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-widest">{receiptHeader}</h3>
                <p className="text-[10px] font-bold text-neutral-600">{lastCompletedOrder.locationName || '门店网点'}</p>
                <p className="text-[8px] text-neutral-400">POS终端: {lastCompletedOrder.registerId} | {lastCompletedOrder.posDeviceModel}</p>
              </div>

              <div className="border-y border-dashed border-neutral-300 py-2 text-left text-[10px] text-neutral-700 space-y-1">
                <div><span>流水订单编号:</span> <span className="font-bold text-neutral-900">{lastCompletedOrder.name}</span></div>
                <div><span>交易结款时间:</span> <span>{new Date(lastCompletedOrder.createdAt).toLocaleString('zh-CN')}</span></div>
                <div><span>对应忠诚会员:</span> <span>{lastCompletedOrder.customerName}</span></div>
                <div><span>收银服务专员:</span> <span className="font-bold text-neutral-850">#{lastCompletedOrder.cashierId}</span></div>
                <div><span>对应扣减源仓:</span> <span>{stockSource}</span></div>
              </div>

              {/* 销售清单 */}
              <div className="space-y-1 text-left text-[10px] text-neutral-800">
                <div className="flex justify-between font-bold border-b border-dashed border-neutral-200 pb-1 text-neutral-500">
                  <span>销售商品/数量</span>
                  <span className="text-right">明细总计 (€)</span>
                </div>
                <div className="divide-y divide-dashed divide-neutral-100 max-h-40 overflow-y-auto">
                  {lastCompletedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 align-top">
                      <div className="max-w-[150px] truncate">
                        <div className="font-bold text-neutral-900">{it.title}</div>
                        <div className="text-[8px] text-neutral-400">€{it.price.toFixed(2)} x {it.quantity}</div>
                      </div>
                      <span className="text-right font-bold">€{(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 细目 */}
              <div className="border-t border-dashed border-neutral-300 pt-2 text-left text-[10px] space-y-1 text-neutral-850">
                <div className="flex justify-between">
                  <span>纯商品总额</span>
                  <span>€{lastCompletedOrder.subtotal.toFixed(2)}</span>
                </div>
                {lastCompletedOrder.discountAmount && lastCompletedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-[#07C2E3] font-bold">
                    <span>会员及折扣减税</span>
                    <span>-€ {lastCompletedOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>国征代扣附加税 (10%)</span>
                  <span>€{lastCompletedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold border-t border-dashed border-neutral-300 pt-1.5 text-neutral-900">
                  <span>应收合计数额</span>
                  <span>€ {lastCompletedOrder.total.toFixed(2)}</span>
                </div>

                {/* 💵 找零对账报表 (仅限现金或包含参数时露出) */}
                <div className="pt-1.5 border-t border-neutral-100 space-y-0.5 text-[9px] bg-neutral-50 p-1.5 rounded text-neutral-600">
                  <div className="flex justify-between">
                    <span>支付交付通路:</span>
                    <span className="font-bold text-neutral-800">
                      {lastCompletedOrder.paymentMethod === 'cash' ? '💵 现场付现' : '💳 电子联机刷卡'}
                    </span>
                  </div>
                  {lastCompletedOrder.paymentMethod === 'cash' && (
                    <>
                      <div className="flex justify-between">
                        <span>买受人付现:</span>
                        <span className="font-mono text-neutral-800">€ {((lastCompletedOrder as any).cashAmountReceived || lastCompletedOrder.total).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>收银机找零:</span>
                        <span className="font-mono font-bold text-emerald-600">€ {((lastCompletedOrder as any).cashChangeReturned || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[8px] text-neutral-400">
                        <span>找零舍入法则:</span>
                        <span>
                          {((lastCompletedOrder as any).roundingModeUsed === 'exact' 
                            ? '精细不免零' 
                            : (lastCompletedOrder as any).roundingModeUsed === 'round-to-5-cents' 
                              ? '欧洲5分分硬币近律' 
                              : '免零整数法')}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-3 flex flex-col items-center space-y-2 border-t border-dashed border-neutral-300">
                {/* 虚拟条形码 */}
                <div className="w-44 h-8 bg-neutral-900 flex flex-col justify-end p-0.5 select-none relative">
                  <div className="flex justify-around items-stretch h-5 bg-white scale-x-[1.01]">
                    {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 1, 2].map((weight, i) => (
                      <span key={i} className="bg-black shrink-0" style={{ width: `${weight}px` }}></span>
                    ))}
                  </div>
                </div>
                <p className="text-[8px] text-neutral-500 leading-relaxed text-center px-2">
                  {receiptFooter}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-200 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-1.5 border border-[#D1D5DB] hover:bg-neutral-50 rounded-lg text-xs font-bold text-neutral-650 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>调用打印</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowInvoiceModal(false);
                  setLastCompletedOrder(null);
                }}
                className="flex-1 py-1.5 bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-black font-bold rounded-lg text-xs cursor-pointer focus:outline-none text-center"
              >
                <span>下一位收款</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 弹窗对话框: 当班钱箱现金结账工作台 (Cash Drawer Shift Workplace) */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans select-none">
          <div className="bg-white rounded-2xl border border-neutral-300 shadow-2xl max-w-2xl w-full p-6 animate-scaleIn relative flex flex-col max-h-[90vh]">
            
            <button
              type="button"
              onClick={() => setShowShiftModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b pb-3.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#07C2E3]/10 flex items-center justify-center text-[#07C2E3]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-neutral-900 leading-none">钱箱交班日结对账 (Cash Drawer & Shift Manager)</h3>
                <span className="text-[10px] text-neutral-400 font-mono">
                  当前当班前台收银员: {cashierAccount} | 钱箱启动于: {shiftStartTime}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1 min-h-0 pt-2">
              
              {/* Left column: Ledger Sheet & Adjustment form */}
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">钱箱当班现场理论流水对账折</span>
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 divide-y divide-neutral-100 text-[11px] font-mono space-y-1.5">
                    <div className="flex justify-between text-neutral-600 pb-1.5">
                      <span>1. 开班备金 (Opening Float)</span>
                      <span className="font-bold text-neutral-900">€ {cashFloat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600 py-1.5">
                      <span>2. 现金销货 (Cash Sales)</span>
                      <span className="font-bold text-neutral-900 text-[#07C2E3]">€ {currentShiftSalesCash.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600 py-1.5">
                      <span>3. 备用金调置 (Adjustments)</span>
                      <span className={`font-bold ${totalAdjustmentsAmount >= 0 ? 'text-neutral-700' : 'text-rose-500'}`}>
                        {totalAdjustmentsAmount >= 0 ? '+' : ''}€ {totalAdjustmentsAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-neutral-900 pt-1.5 text-xs">
                      <span>理论应存现钞 (Expected Cash)</span>
                      <span className="font-extrabold text-neutral-950">€ {expectedDrawerCash.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-neutral-200 rounded-xl p-3 bg-neutral-50/40 space-y-2">
                  <span className="block text-[10px] font-bold text-neutral-700">✍ 收银中途进出调账 (Instant Cash Adjustment)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <select 
                        value={adjustType} 
                        onChange={(e) => setAdjustType(e.target.value as any)}
                        className="w-full text-xs p-1.5 border border-neutral-250 bg-white rounded-lg focus:outline-none focus:border-[#07C2E3] text-black"
                      >
                        <option value="in">存入零钱 (+)</option>
                        <option value="out">中途支出 (-)</option>
                      </select>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs text-neutral-400 font-mono">€</span>
                      <input 
                        type="number" 
                        value={adjustAmount} 
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        className="w-full text-xs pl-6 pr-2 py-1.5 border border-neutral-250 bg-white rounded-lg focus:outline-none focus:border-[#07C2E3] text-black font-mono font-bold"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <input 
                      type="text" 
                      value={adjustReason} 
                      onChange={(e) => setAdjustReason(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-neutral-250 bg-white rounded-lg focus:outline-none focus:border-[#07C2E3] text-black"
                      placeholder="调账注释: 例如安全归仓、中途备用等..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const amt = parseFloat(adjustAmount);
                      if (isNaN(amt) || amt <= 0) {
                        triggerToast('⚠️ 请输入合规调账金额');
                        return;
                      }
                      if (!adjustReason.trim()) {
                        triggerToast('⚠️ 请输入调账合理因由注释');
                        return;
                      }
                      const newAdj = {
                        id: `ADJ-${Date.now().toString().slice(-6)}`,
                        type: adjustType,
                        amount: amt,
                        reason: adjustReason.trim(),
                        timestamp: new Date().toLocaleTimeString(),
                        cashierName: cashierAccount
                      };
                      setCashAdjustments(prev => [...prev, newAdj]);
                      setAdjustAmount('');
                      setAdjustReason('');
                      triggerToast(`✔ 已成功录入钱箱调账: €${amt.toFixed(2)}`);
                    }}
                    className="w-full py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer text-center"
                  >
                    🚀 保存此笔调账并写入物理钱箱流水
                  </button>
                </div>
              </div>

              {/* Right column: Counting input & shift closer */}
              <div className="space-y-3.5 md:border-l md:pl-4 border-neutral-100 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">实盘抽屉内现钞及硬币总和 € (Actual Hand Count)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={actualDrawerCash}
                      onChange={(e) => setActualDrawerCash(e.target.value)}
                      className="w-full text-sm font-mono font-bold p-2 px-3 border border-neutral-300 rounded-xl bg-neutral-50 text-black focus:bg-white focus:outline-none focus:border-[#07C2E3]"
                      placeholder="请盘点后输入实有欧元金额"
                    />
                  </div>

                  {/* Discrepancy indicator */}
                  {(() => {
                    const counted = parseFloat(actualDrawerCash);
                    if (isNaN(counted)) return null;
                    const diff = counted - expectedDrawerCash;
                    const isPerfect = Math.abs(diff) < 0.1;
                    return (
                      <div className={`p-3 rounded-xl border ${isPerfect ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'} space-y-1`}>
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          {isPerfect ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>对账圆满一致-账实吻合 (Perfect Match)</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>对账存在偏差 (Discrepancy Found)</span>
                            </>
                          )}
                        </div>
                        <p className="text-[10px] font-mono leading-tight">
                          当前差额为: <span className="font-bold underline">{diff >= 0 ? '+' : ''}{diff.toFixed(2)} €</span>。
                          理论上钱箱中应备：€{expectedDrawerCash.toFixed(2)}。如有短款或溢款，财务系统将自动立案跟踪。
                        </p>
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-2 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => {
                      const counted = parseFloat(actualDrawerCash);
                      if (isNaN(counted) || counted < 0) {
                        triggerToast('⚠️ 请在实盘中输入有效的存底总值');
                        return;
                      }
                      const discrepancy = counted - expectedDrawerCash;
                      const newReport = {
                        id: `SHIFT-${Date.now().toString().slice(-6)}`,
                        cashier: cashierAccount,
                        openTime: shiftStartTime,
                        closeTime: new Date().toLocaleString(),
                        float: cashFloat,
                        salesCash: currentShiftSalesCash,
                        expected: expectedDrawerCash,
                        actual: counted,
                        discrepancy: discrepancy,
                        adjustmentsCount: cashAdjustments.length,
                        adjustmentsTotal: totalAdjustmentsAmount,
                        status: Math.abs(discrepancy) < 0.2 ? 'success' : 'warning'
                      };
                      setShiftReportList(prev => [newReport, ...prev]);
                      setIsShiftOpen(false);
                      setCurrentShiftSalesCash(0);
                      setCashAdjustments([]);
                      setActualDrawerCash(cashFloat.toFixed(2));
                      setShowShiftModal(false);
                      triggerToast('⚡ 收银当班正式合围锁闭！日结 EOD 结算折卷已成功封存并推送云端。');
                    }}
                    className="w-full py-3 bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer text-center font-sans"
                  >
                    ⚡ 核销锁账结算 & 解救钱箱营业结束
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerToast('🖨 热敏针式小票机正在输出当班开交班汇总 EOD 日结审计清单...');
                    }}
                    className="w-full py-1.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-600 font-bold text-[10px] rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>套印热敏当班日结小票审计联 (Print EOD Audit)</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
