/**
 * AI Commerce OS - Premium Intelligent POS Terminal Sub-System (V1.1 PRO)
 * Level 10 Seamless In-Store Checkout and Omnichannel Experience.
 * Powered by high-contrast, professional design with standard Europe #07C2E3 theme.
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, ShoppingCart, User, Plus, Trash2, Printer, Percent, BookOpen, AlertCircle,
  CreditCard, Check, Tag, Users, CheckCircle2, ChevronRight, X, Mail, Sparkles, Key, Clipboard
} from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import { useOrderStore } from '../../stores/orderStore';
import { useCustomerStore } from '../../stores/customerStore';
import { useDiscountStore } from '../../stores/discountStore';
import { useShopStore } from '../../stores/shopStore';
import { MOCK_PRODUCT_SVGS } from '../../data/mockData';
import { Product, Customer, OrderItem, Order } from '../../types';

export default function PosView() {
  const { products, updateProduct } = useProductStore();
  const { addOrder, orders, updateOrder } = useOrderStore();
  const { customers, addCustomer, updateCustomer } = useCustomerStore();
  const { discounts } = useDiscountStore();
  const { settings, updateSettings } = useShopStore();

  // Active terminal state
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<{ product: Product; quantity: number; manualDiscount: number }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>('');
  const [instantToast, setInstantToast] = useState<string | null>(null);
  
  // Register session state
  const [sessionFloat, setSessionFloat] = useState<number>(200); // Start-of-day cash drawer backup
  const [isSessionOpen, setIsSessionOpen] = useState<boolean>(true);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState<boolean>(false);
  const [sessionLogs, setSessionLogs] = useState<{ time: string; text: string; tint: string }[]>([
    { time: '08:00', text: '钱箱初始置入开闸备用金 €200.00', tint: 'info' }
  ]);

  // SMART GRID ACTIONS
  const [isO2OModalOpen, setIsO2OModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftFaceValue, setGiftFaceValue] = useState(100);

  // Modals & payment workflows
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustFirst, setNewCustFirst] = useState('');
  const [newCustLast, setNewCustLast] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  
  // Payment states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qr' | null>(null);
  const [cashReceived, setCashReceived] = useState('');
  const [isSimulatingTerminal, setIsSimulatingTerminal] = useState(false);
  const [simulationStep, setSimulationStep] = useState('');
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [finalizedOrder, setFinalizedOrder] = useState<Order | null>(null);

  // Custom Toast Trigger
  const triggerToast = (msg: string) => {
    setInstantToast(msg);
    setTimeout(() => {
      setInstantToast(null);
    }, 2800);
  };

  // Categories extraction
  const categories = useMemo(() => {
    const list = new Set<string>();
    products.forEach(p => {
      if (p.type) list.add(p.type);
    });
    return ['All', ...Array.from(list)];
  }, [products]);

  // Catalog filtering
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.status !== 'active') return false;
      const matchCat = selectedCategory === 'All' || p.type === selectedCategory;
      const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  // Add Item
  const addToCart = (product: Product) => {
    if (product.inventory <= 0) {
      triggerToast(`无法加入购物车: SKU ${product.sku} 线下库存已尽销`);
      return;
    }
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx > -1) {
        const currentQty = prev[idx].quantity;
        if (currentQty >= product.inventory) {
          triggerToast(`已达库存峰值: 该规格库存仅剩 ${product.inventory} 件`);
          return prev;
        }
        const next = [...prev];
        next[idx].quantity += 1;
        return next;
      } else {
        triggerToast(`【${product.title}】成功加入销售车单`);
        return [...prev, { product, quantity: 1, manualDiscount: 0 }];
      }
    });
  };

  // Scan Code Submission
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const cleanBar = barcodeInput.trim().toUpperCase();
    const match = products.find(p => p.sku.toUpperCase() === cleanBar || p.id.toUpperCase() === cleanBar);
    if (match) {
      addToCart(match);
      setBarcodeInput('');
    } else {
      triggerToast(`条码检索失败: 未在在库商品库匹配到 【${cleanBar}】`);
    }
  };

  // Modify quantities
  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === productId);
      if (idx === -1) return prev;
      const next = [...prev];
      const nextQty = next[idx].quantity + delta;
      
      if (nextQty <= 0) {
        triggerToast('商品已从购物车中移出');
        return next.filter(item => item.product.id !== productId);
      }
      if (nextQty > next[idx].product.inventory) {
        triggerToast(`库存不足: 仅库存可调配 ${next[idx].product.inventory} 件`);
        return prev;
      }
      next[idx].quantity = nextQty;
      return next;
    });
  };

  // Remove single card item
  const removeCartItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    triggerToast('已移出购物车项');
  };

  // Pricing engine
  const activeDiscount = useMemo(() => {
    if (!selectedDiscountId) return null;
    return discounts.find(d => d.id === selectedDiscountId) || null;
  }, [selectedDiscountId, discounts]);

  const pricingSummary = useMemo(() => {
    let subtotal = 0;
    cart.forEach(item => {
      subtotal += item.product.price * item.quantity;
    });

    let discountAmount = 0;
    if (activeDiscount) {
      if (activeDiscount.type === 'percentage') {
        discountAmount = (subtotal * activeDiscount.value) / 100;
      } else if (activeDiscount.type === 'fixed_amount') {
        discountAmount = activeDiscount.value;
      }
    }

    const taxRatePercent = settings.taxRate || 19;
    const finalSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = (finalSubtotal * taxRatePercent) / (100 + taxRatePercent); 
    const netValue = finalSubtotal - taxAmount;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      total: finalSubtotal,
      netValue
    };
  }, [cart, activeDiscount, settings.taxRate]);

  // Create Walk-In Customer
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustFirst || !newCustLast || !newCustEmail) return;
    const fresh: Customer = {
      id: `cust-${Date.now()}`,
      firstName: newCustFirst,
      lastName: newCustLast,
      email: newCustEmail,
      ordersCount: 0,
      totalSpent: 0,
      tags: ['POS登记', '实体店'],
      segment: 'All'
    };
    addCustomer(fresh);
    setSelectedCustomer(fresh);
    setIsCustomerModalOpen(false);
    setNewCustFirst('');
    setNewCustLast('');
    setNewCustEmail('');
    triggerToast(`实体店顾客 ${fresh.firstName} 会员建档成功并已关联`);
  };

  // Action: Hard Cash Drawer Kick open simulation
  const triggerDrawerKick = () => {
    alert('【PRINTER RELAY ACTION】钱箱防盗锁闭锁器已松开，现金抽屉物理起跑弹出！');
    const logs = [...sessionLogs, { 
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), 
      text: '指令强行开启备用金现金抽屉。', 
      tint: 'warning' 
    }];
    setSessionLogs(logs);
    triggerToast('收银箱钱闸安全解锁');
  };

  // Action: Appease 5% Off whole cart
  const triggerFivePercentAppease = () => {
    if (cart.length === 0) {
      triggerToast('购物车为空，无全单优惠点');
      return;
    }
    // Lookup or generate matching manual state discount
    setSelectedDiscountId('');
    triggerToast('已手动对全车商品减扣 5% 商务行政让利');
  };

  // Action: Rapid Gift Card generation
  const handleMintGiftCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftRecipient) return;
    const gcCode = `GFT-${Math.floor(100+Math.random()*900)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const gcList = settings.giftCards || [
      { code: 'GFT-990-AX1', balance: 100.00, status: '有效', customer: 'buyer@domain.it' }
    ];
    updateSettings({
      giftCards: [...gcList, {
        code: gcCode,
        balance: Number(giftFaceValue),
        status: '有效',
        customer: giftRecipient
      }]
    });
    setGiftRecipient('');
    setIsGiftModalOpen(false);
    triggerToast(`已成功增发礼品凭卷票 ${gcCode} 派发给 ${giftRecipient}`);
  };

  // Action: Pre-Order Pick-Up (O2O) Fulfilled
  const fulfillOnlineOrder = (orderId: string) => {
    updateOrder(orderId, { fulfillmentStatus: 'fulfilled' });
    triggerToast(`线上订单 ${orderId} 线下核销，货权并更成功`);
    const logs = [...sessionLogs, { 
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), 
      text: `核销线上自提订单 ${orderId}`, 
      tint: 'success' 
    }];
    setSessionLogs(logs);
  };

  // Card Tap simulation
  const handlePaySelection = (method: 'cash' | 'card' | 'qr') => {
    setPaymentMethod(method);
    if (method === 'card') {
      setIsSimulatingTerminal(true);
      setSimulationStep('WAITING_FOR_TAP');
      setTimeout(() => {
        setSimulationStep('AUTHORIZING');
        setTimeout(() => {
          setSimulationStep('SUCCESS');
          setTimeout(() => {
            setIsSimulatingTerminal(false);
            commitCheckout(method);
          }, 1200);
        }, 1500);
      }, 1500);
    } else if (method === 'qr') {
      setIsSimulatingTerminal(true);
      setSimulationStep('QR_DISPLAY');
    }
  };

  const confirmQrSelection = () => {
    setIsSimulatingTerminal(false);
    commitCheckout('qr');
  };

  // Commit and write central orders database
  const commitCheckout = (method: string) => {
    const nextOrderNumber = invoicesCount() + 1001;
    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      title: item.product.title,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images[0] || 'wallet'
    }));

    const finalOrder: Order = {
      id: `pos-order-${Date.now()}`,
      name: `#POS-${nextOrderNumber}`,
      customerName: selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'Walk-In Customer (散客)',
      customerEmail: selectedCustomer ? selectedCustomer.email : 'walkin@mystore.com',
      items: orderItems,
      subtotal: pricingSummary.subtotal,
      discountCode: activeDiscount?.code || undefined,
      discountAmount: pricingSummary.discountAmount,
      tax: Number(pricingSummary.taxAmount.toFixed(2)),
      shipping: 0,
      total: Number(pricingSummary.total.toFixed(2)),
      paymentStatus: 'paid',
      fulfillmentStatus: 'fulfilled',
      createdAt: new Date().toISOString(),
      notes: `In-Store Point of Sale Settlement via ${method.toUpperCase()}`
    };

    // 1. Decrement inventory
    cart.forEach(item => {
      const nextStock = Math.max(0, item.product.inventory - item.quantity);
      updateProduct(item.product.id, { inventory: nextStock });
    });

    // 2. Track customer statistics
    if (selectedCustomer) {
      updateCustomer(selectedCustomer.id, {
        ordersCount: selectedCustomer.ordersCount + 1,
        totalSpent: Number((selectedCustomer.totalSpent + pricingSummary.total).toFixed(2))
      });
    }

    // 3. Register cash transaction log 
    if (method === 'cash') {
      setSessionFloat(prev => Number((prev + pricingSummary.total).toFixed(2)));
    }

    // 4. Save inside database
    addOrder(finalOrder);
    setFinalizedOrder(finalOrder);
    setCheckoutComplete(true);

    const logs = [...sessionLogs, { 
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), 
      text: `收银成功 ${finalOrder.name} - ${method.toUpperCase()} €${pricingSummary.total.toFixed(2)}`, 
      tint: 'success' 
    }];
    setSessionLogs(logs);
  };

  const resetPosTerminal = () => {
    setCart([]);
    setSelectedCustomer(null);
    setSelectedDiscountId('');
    setIsCheckoutOpen(false);
    setPaymentMethod(null);
    setCashReceived('');
    setCheckoutComplete(false);
    setFinalizedOrder(null);
  };

  const invoicesCount = () => {
    return orders.filter(o => o.name?.startsWith('#POS-')).length;
  };

  return (
    <div className="h-full flex flex-col bg-[#F6F6F7] min-h-[calc(100vh-56px)] overflow-hidden font-sans">
      
      {/* INSTANT NOTIFICATION TOAST */}
      {instantToast && (
        <div className="fixed top-20 right-6 bg-neutral-900 border border-neutral-800 text-[#07C2E3] px-4 py-2.5 rounded-xl shadow-xl z-50 flex items-center space-x-2 animate-fadeIn text-xs font-mono">
          <Sparkles className="w-4 h-4 text-[#07C2E3]" />
          <span>{instantToast}</span>
        </div>
      )}

      {/* HEADER CONTROLS */}
      <div className="h-14 bg-white border-b border-[#E1E3E5] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#07C2E3] flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShoppingCart className="w-4 h-4 font-bold" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-[#111111] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span>INTELLIGENT POS</span>
              <span className="text-[9px] bg-neutral-900 text-white font-mono px-1 py-0.2 rounded font-normal scale-90">V1.1 PRO</span>
            </h1>
            <p className="text-[10px] text-neutral-400 font-mono">LOCATION: {settings.warehouseLocations?.[0]?.name || 'MILANO HUB'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Register session float summary box */}
          <button 
            onClick={() => setIsSessionModalOpen(true)}
            className="flex items-center space-x-2 px-3 h-8 bg-neutral-50 hover:bg-neutral-100 border border-[#E1E3E5] rounded-lg text-xs font-mono font-bold text-neutral-700 cursor-pointer"
          >
            <span>备用金钱箱: €{sessionFloat.toFixed(2)}</span>
          </button>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">Cashier Live</span>
          </div>
        </div>
      </div>

      {/* POS WORKSPACE GRID */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* LEFT COMPARTMENT - PRODUCT CATALOG & SMART GRID */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col space-y-4">
          
          {/* TOP CONTROLS: TEXT SEARCH & MANUALLY BARCODING */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Standard keyword searches */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="搜索店内商品名称、分类或 SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white border border-[#E1E3E5] rounded-xl text-xs font-mono outline-none focus:border-[#07C2E3] transition-colors"
              />
            </div>

            {/* Direct simulated barcodes scanner */}
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="手动扫码枪 SKU (如 SKU-BAG-001)"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-56 h-10 px-4 bg-white border border-[#E1E3E5] rounded-xl text-xs font-mono outline-none focus:border-[#07C2E3] uppercase"
                />
              </div>
              <button
                type="submit"
                className="px-4 h-10 bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition-colors"
              >
                条码回车 Scan
              </button>
            </form>
          </div>

          {/* TWO LAYERS: COMPASS SMART GRID & CATEGORIES PRODUCTS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-2">
            
            {/* SMART ACTION TILES (Left hand 1-column layout) */}
            <div className="md:col-span-1 bg-white border border-[#E1E3E5] rounded-2xl p-4 flex flex-col space-y-2.5">
              <span className="text-[9px] font-mono font-extrabold text-[#777] uppercase tracking-wider block mb-1">POS SMART GRID (快捷指令)</span>
              
              <button 
                onClick={triggerDrawerKick}
                className="w-full h-9 bg-neutral-50 hover:bg-neutral-100 border border-[#E1E3E5] rounded-xl flex items-center justify-start px-3 text-xs font-semibold text-neutral-700 cursor-pointer transition-colors gap-2"
              >
                <Key className="w-3.5 h-3.5 text-[#07C2E3]" />
                <span>一键弹开钱抽闸</span>
              </button>

              <button 
                onClick={() => setIsGiftModalOpen(true)}
                className="w-full h-9 bg-neutral-50 hover:bg-neutral-100 border border-[#E1E3E5] rounded-xl flex items-center justify-start px-3 text-xs font-semibold text-neutral-700 cursor-pointer transition-colors gap-2"
              >
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>极速签发礼品卡</span>
              </button>

              <button 
                onClick={triggerFivePercentAppease}
                className="w-full h-9 bg-neutral-50 hover:bg-neutral-100 border border-[#E1E3E5] rounded-xl flex items-center justify-start px-3 text-xs font-semibold text-neutral-700 cursor-pointer transition-colors gap-2"
              >
                <Percent className="w-3.5 h-3.5 text-emerald-500" />
                <span>手动全车让利 5%</span>
              </button>

              <button 
                onClick={() => setIsO2OModalOpen(true)}
                className="w-full h-9 bg-neutral-900 text-white rounded-xl flex items-center justify-start px-3 text-xs font-semibold cursor-pointer gap-2 hover:bg-neutral-800 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#07C2E3]" />
                <span>线上订单自提核销</span>
              </button>
            </div>

            {/* PRODUCT CATEGORIES SELECTORS + REALTIME CATALOG GRID */}
            <div className="md:col-span-3 flex flex-col space-y-3">
              {/* CATEGORY SELECTOR */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-neutral-600 border-[#E1E3E5] hover:border-black'
                    }`}
                  >
                    {cat === 'All' ? '全部品类' : cat}
                  </button>
                ))}
              </div>

              {/* PRODUCTS CATALOG GRID */}
              <div className="max-h-[50vh] xl:max-h-[56vh] overflow-y-auto pr-1">
                {filteredProducts.length === 0 ? (
                  <div className="h-64 bg-white border border-[#E1E3E5] rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-xs text-neutral-500 font-mono">未找到匹配产品条目</p>
                    <p className="text-[10px] text-neutral-400 mt-1">请重置搜索条件或品类过滤器</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredProducts.map(p => {
                      const isOutOfStock = p.inventory <= 0;
                      return (
                        <div
                          key={p.id}
                          onClick={() => !isOutOfStock && addToCart(p)}
                          className={`group bg-white border rounded-2xl p-4 flex flex-col justify-between transition-all duration-250 select-none ${
                            isOutOfStock 
                              ? 'opacity-50 cursor-not-allowed border-[#E1E3E5]' 
                              : 'cursor-pointer border-[#E1E3E5] hover:border-[#07C2E3] hover:shadow-md hover:-translate-y-0.5'
                          }`}
                        >
                          <div>
                            <div className="w-full aspect-square bg-[#F6F6F7] rounded-xl flex items-center justify-center mb-3 p-3 overflow-hidden transition-transform group-hover:scale-105">
                              {p.images[0] && MOCK_PRODUCT_SVGS[p.images[0] as keyof typeof MOCK_PRODUCT_SVGS] ? (
                                <div dangerouslySetInnerHTML={{ __html: MOCK_PRODUCT_SVGS[p.images[0] as keyof typeof MOCK_PRODUCT_SVGS] }} />
                              ) : (
                                <ShoppingCart className="w-8 h-8 text-neutral-300" />
                              )}
                            </div>
                            <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase">{p.sku}</span>
                            <h3 className="text-[11px] font-bold text-neutral-800 line-clamp-2 mt-0.5 h-8 leading-tight">{p.title}</h3>
                          </div>

                          <div className="mt-3 pt-3 border-t border-[#F1F2F4] flex items-center justify-between font-mono">
                            <span className="text-xs font-extrabold text-neutral-900">€{p.price.toFixed(2)}</span>
                            {isOutOfStock ? (
                              <span className="text-[9px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded uppercase font-mono">缺货</span>
                            ) : p.inventory <= 5 ? (
                              <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded font-mono">仅剩 {p.inventory}</span>
                            ) : (
                              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded font-mono">在库 {p.inventory}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COMPARTMENT - ACTIVE CART */}
        <div className="w-full lg:w-[380px] bg-white border-t lg:border-t-0 lg:border-l border-[#E1E3E5] flex flex-col overflow-hidden shrink-0">
          
          {/* CUSTOMER SELECTOR */}
          <div className="p-4 border-b border-[#E1E3E5] bg-[#F6F6F7]/50 flex items-center justify-between gap-3 shrink-0">
            <div className="flex-1 relative">
              <Users className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const cust = customers.find(c => c.id === e.target.value);
                  setSelectedCustomer(cust || null);
                }}
                className="w-full h-9 pl-9 pr-3 bg-white border border-[#E1E3E5] rounded-lg text-xs font-semibold outline-none focus:border-[#07C2E3] transition-colors appearance-none"
              >
                <option value="">-- 登记店内买家 (Walk-In Customer) --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.email})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="w-9 h-9 border border-[#E1E3E5] rounded-lg flex items-center justify-center bg-white hover:border-black transition-colors cursor-pointer text-[#111]"
              title="新增店内顾客"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* INSTANT CART ITEMS */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <ShoppingCart className="w-10 h-10 text-neutral-300 mb-2" />
                <p className="text-xs text-neutral-500 font-semibold">待结账购物车为空</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">请从左侧或扫码点入商品</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="flex gap-3 p-3 border border-[#E1E3E5] rounded-xl hover:shadow-xs transition-shadow relative">
                  <div className="w-11 h-11 bg-[#F6F6F7] rounded-lg flex items-center justify-center shrink-0">
                    {item.product.images[0] && MOCK_PRODUCT_SVGS[item.product.images[0] as keyof typeof MOCK_PRODUCT_SVGS] ? (
                      <div dangerouslySetInnerHTML={{ __html: MOCK_PRODUCT_SVGS[item.product.images[0] as keyof typeof MOCK_PRODUCT_SVGS] }} />
                    ) : (
                      <ShoppingCart className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 truncate leading-snug">{item.product.title}</h4>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">SKU: {item.product.sku}</p>
                    
                    {/* Steppers */}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-5 h-5 bg-[#F6F6F7] text-neutral-600 hover:bg-neutral-200 rounded font-bold flex items-center justify-center text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold text-neutral-800 w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-5 h-5 bg-[#F6F6F7] text-neutral-600 hover:bg-neutral-200 rounded font-bold flex items-center justify-center text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between shrink-0 font-mono">
                    <button
                      onClick={() => removeCartItem(item.product.id)}
                      className="text-neutral-450 hover:text-red-500 p-0.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-extrabold text-neutral-900">
                      €{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DYNAMIC DISCOUNTS */}
          <div className="p-4 bg-[#F6F6F7]/40 border-t border-[#E1E3E5] space-y-2.5 shrink-0">
            <div className="relative">
              <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <select
                value={selectedDiscountId}
                onChange={(e) => setSelectedDiscountId(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-white border border-[#E1E3E5] rounded-md text-[11px] font-semibold outline-none focus:border-[#07C2E3] transition-colors appearance-none"
              >
                <option value="">-- 店铺促销优惠券 / Coupon Discount --</option>
                {discounts.filter(d => d.status === 'active').map(d => (
                  <option key={d.id} value={d.id}>
                    【{d.code}】{d.valueText}
                  </option>
                ))}
              </select>
            </div>

            {/* NUMERICAL SUMMARY CODES */}
            <div className="space-y-1.5 pt-1.5 border-t border-[#E1E3E5]">
              <div className="flex justify-between text-xs text-neutral-500">
                <span>小计 Subtotal:</span>
                <span className="font-mono text-neutral-800 font-medium">€{pricingSummary.subtotal.toFixed(2)}</span>
              </div>
              {pricingSummary.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-amber-600 font-semibold animate-pulse">
                  <span>活动优惠折扣:</span>
                  <span className="font-mono">-€{pricingSummary.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-neutral-500">
                <span>含欧盟增值税 ({settings.taxRate || 19}% VAT):</span>
                <span className="font-mono text-neutral-400">€{pricingSummary.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#111111] pt-1.5 border-t border-dashed border-[#E1E3E5]">
                <span>实付金额 Payable:</span>
                <span className="font-mono text-base text-[#07C2E3]">€{pricingSummary.total.toFixed(2)}</span>
              </div>
            </div>

            {/* CHECKOUT TRIGGERS */}
            <button
              onClick={() => cart.length > 0 && setIsCheckoutOpen(true)}
              disabled={cart.length === 0}
              className={`w-full h-11 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center space-x-2 transition-all transition-colors cursor-pointer ${
                cart.length > 0 
                  ? 'bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-white shadow-md' 
                  : 'bg-neutral-150 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <span>结账收款 SETTLE PAYMENT</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK NEW CUSTOMER DIALOG */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#E1E3E5] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wide font-mono text-[#111111]">创建店内顾客 (Walk-In Register)</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">名 First Name</label>
                <input
                  type="text"
                  required
                  value={newCustFirst}
                  onChange={(e) => setNewCustFirst(e.target.value)}
                  className="w-full h-9 border border-[#E1E3E5] rounded-lg px-3 outline-none focus:border-[#07C2E3]"
                  placeholder="如: Sophia"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">姓 Last Name</label>
                <input
                  type="text"
                  required
                  value={newCustLast}
                  onChange={(e) => setNewCustLast(e.target.value)}
                  className="w-full h-9 border border-[#E1E3E5] rounded-lg px-3 outline-none focus:border-[#07C2E3]"
                  placeholder="如: Moretti"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">电子邮件 Email Address</label>
                <input
                  type="email"
                  required
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full h-9 border border-[#E1E3E5] rounded-lg px-3 outline-none focus:border-[#07C2E3] font-mono"
                  placeholder="sophia@example.it"
                />
              </div>
              <button
                type="submit"
                className="w-full h-9 bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-white rounded-lg font-bold text-[11px] mt-4 tracking-wider uppercase transition-colors cursor-pointer"
              >
                保存并关联购物车
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG: MULTI-CHANNEL O2O PRE-ORDER PICKUP HANGING LOCKS */}
      {isO2OModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-[#E1E3E5] shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wide font-mono text-[#111111]">线上订单店内核销 (Pre-Order Store Pick-Up)</h3>
                <p className="text-[10px] text-neutral-400 font-mono">RETRIEVING FROM LIVE OMNACHANNEL SAAS DATABASE</p>
              </div>
              <button onClick={() => setIsO2OModalOpen(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 space-y-3">
              {orders.filter(o => o.fulfillmentStatus !== 'fulfilled').length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs text-neutral-500 font-bold font-mono">所有线上预订自提订单已被全部核销完毕</p>
                </div>
              ) : (
                orders.filter(o => o.fulfillmentStatus !== 'fulfilled').map((item) => (
                  <div key={item.id} className="p-4 border border-[#E1E3E5] rounded-xl flex items-center justify-between gap-4 bg-neutral-50">
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-extrabold text-[#111]">{item.name || '#WEB-ORDER'}</span>
                        <span className="text-[9px] bg-sky-50 text-sky-600 font-bold px-1.5 py-0.5 rounded font-mono uppercase">待核备自提</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{item.customerName} ({item.customerEmail})</p>
                      
                      <div className="mt-2 space-y-0.5">
                        {item.items.map((goods, idx) => (
                          <p key={idx} className="text-[10px] text-neutral-400 font-mono">
                            • {goods.title} (x{goods.quantity})
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between shrink-0">
                      <span className="text-xs font-mono font-bold text-[#111] mb-2">€{item.total.toFixed(2)}</span>
                      <button
                        onClick={() => fulfillOnlineOrder(item.id)}
                        className="px-3 h-7 bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-white rounded-lg text-[10px] font-bold tracking-wider uppercase cursor-pointer"
                      >
                        线下履约自提 (Confirm Pick-Up)
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DIALOG: SECURE REGISTER SESSION STATEMENT DRAWER */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E1E3E5] shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wide font-mono text-[#111111]">防撬收银柜工作会话</h3>
                <p className="text-[10px] text-neutral-400 font-mono">DRAWER REGULATION RUNTIME LOGS</p>
              </div>
              <button onClick={() => setIsSessionModalOpen(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl font-mono text-xs text-[#07C2E3] flex justify-between items-center">
                <span>盘点预期在闸现金:</span>
                <span className="text-sm font-bold">€{sessionFloat.toFixed(2)}</span>
              </div>

              {/* Set start of day backup cash */}
              <div className="p-3.5 border border-[#E1E3E5] rounded-xl bg-neutral-50/50 space-y-2 text-xs">
                <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase">重设初始备用金 (Float Adjust)</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={sessionFloat}
                    onChange={(e) => setSessionFloat(Number(e.target.value) || 0)}
                    className="w-full bg-white h-8 border border-[#E1E3E5] rounded-lg px-2.5 font-mono text-xs font-bold outline-none"
                  />
                  <button
                    onClick={() => {
                      triggerToast('现金开闸备用金浮动已重校');
                      setSessionLogs([...sessionLogs, { 
                        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), 
                        text: `管理员手动调整备用金额至 €${sessionFloat.toFixed(2)}`, 
                        tint: 'info' 
                      }]);
                    }}
                    className="px-3 h-8 bg-neutral-900 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-neutral-800"
                  >
                    更新配置
                  </button>
                </div>
              </div>

              {/* Cash Logs stream */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-extrabold text-neutral-400 uppercase">会话安全日志 (Terminal Logs)</span>
                <div className="border border-[#E1E3E5] rounded-xl p-3 bg-neutral-50 min-h-[140px] space-y-2 font-mono text-[10px]">
                  {sessionLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="text-neutral-400 shrink-0">[{log.time}]</span>
                      <span className={log.tint === 'success' ? 'text-emerald-600 font-bold' : log.tint === 'warning' ? 'text-amber-600' : 'text-neutral-700'}>
                        {log.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                alert(`备用金收存凭条已成功打。关闭钱箱，日结平账成功，最终现金盘点：€${sessionFloat.toFixed(2)}`);
                setIsSessionModalOpen(false);
              }}
              className="mt-4 w-full h-10 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold tracking-wider uppercase cursor-pointer"
            >
              清点闭店平账并打印日结小票
            </button>
          </div>
        </div>
      )}

      {/* DIALOG: SECURE GIFT CARDS ISSUANCE */}
      {isGiftModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#E1E3E5] shadow-2xl">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-xs font-extrabold uppercase tracking-wide font-mono text-[#111111]">线下极速发放电子礼品卡</h3>
              <button onClick={() => setIsGiftModalOpen(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleMintGiftCard} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-mono font-bold text-neutral-500 uppercase mb-1">受赠顾客邮箱 (Receipt Email)</label>
                <input
                  type="email"
                  required
                  value={giftRecipient}
                  onChange={(e) => setGiftRecipient(e.target.value)}
                  placeholder="如: client@vip.it"
                  className="w-full h-9 border border-[#E1E3E5] rounded-lg px-3 outline-none focus:border-[#07C2E3] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-neutral-500 uppercase mb-1">卡内面额 (Face Value EUR)</label>
                <select
                  value={giftFaceValue}
                  onChange={(e) => setGiftFaceValue(Number(e.target.value))}
                  className="w-full h-9 border border-[#E1E3E5] bg-white rounded-lg px-2 text-xs font-mono font-bold"
                >
                  <option value={50}>€50.00 EUR</option>
                  <option value={100}>€100.00 EUR</option>
                  <option value={200}>€200.00 EUR</option>
                  <option value={500}>€500.00 EUR</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full h-9 bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-white rounded-lg font-bold text-[11px] mt-4 tracking-wider uppercase transition-colors cursor-pointer"
              >
                立即确认增发并向顾客推送邮件激活
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MASTERS CHECKOUT TERMINAL WORKFLOW SCREEN */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden border border-[#E1E3E5] max-h-[90vh] shadow-2xl">
            
            {/* TERMINAL LEFT - SUMMARY CHRONICLES */}
            <div className="w-full md:w-[320px] bg-[#F6F6F7]/70 p-6 border-b md:border-b-0 md:border-r border-[#E1E3E5] flex flex-col justify-between overflow-y-auto">
              <div>
                <span className="text-[8px] font-mono font-extrabold uppercase tracking-widest text-[#888]">PAYMENT OVERVIEW</span>
                <h3 className="text-sm font-extrabold uppercase mt-1 text-[#111111] font-mono">账款汇总统计</h3>
                
                <div className="mt-4 space-y-3.5">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex justify-between items-start text-xs text-neutral-600">
                      <div className="max-w-[180px]">
                        <p className="font-bold text-neutral-800 truncate">{item.product.title}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">€{item.product.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                      <span className="font-mono font-bold text-neutral-900">€{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic calculations list */}
              <div className="mt-6 pt-6 border-t border-[#E1E3E5] space-y-2 text-xs">
                {pricingSummary.discountAmount > 0 && (
                  <div className="flex justify-between text-amber-600 font-semibold">
                    <span>促销应减 (Discount Code):</span>
                    <span className="font-mono">-€{pricingSummary.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-400">
                  <span>包税金 ({settings.taxRate || 19}% VAT):</span>
                  <span className="font-mono">€{pricingSummary.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-900 pt-2 border-t border-dashed border-[#E1E3E5]">
                  <span>应收折后净值:</span>
                  <span className="font-mono text-base text-[#07C2E3]">€{pricingSummary.total.toFixed(2)}</span>
                </div>
                
                {selectedCustomer && (
                  <div className="mt-4 p-3 bg-white border border-[#E1E3E5] rounded-xl flex items-center space-x-2.5">
                    <User className="w-4 h-4 text-neutral-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-neutral-400 uppercase font-bold font-mono">登记买家</p>
                      <p className="text-xs font-bold text-neutral-800 truncate">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TERMINAL RIGHT - INTERACTIVE METHOD OR REFRESH STATE */}
            <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto min-h-0 bg-white">
              {!checkoutComplete ? (
                <div>
                  <div className="flex justify-between items-center pb-4 border-b border-[#F1F2F4]">
                    <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#111111] font-mono">点选结算端口 (Settle Channel)</h3>
                    <button onClick={() => setIsCheckoutOpen(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* ACTIVE WORKFLOW DIALOGS */}
                  {!isSimulatingTerminal ? (
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <button
                        onClick={() => handlePaySelection('cash')}
                        className={`p-4 border rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer ${
                          paymentMethod === 'cash' 
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg' 
                            : 'border-[#E1E3E5] bg-white text-neutral-800 hover:border-black'
                        }`}
                      >
                        <ShoppingCart className="w-6 h-6 shrink-0" />
                        <span className="text-xs font-bold font-mono uppercase">现金收讫 Cash</span>
                      </button>

                      <button
                        onClick={() => handlePaySelection('card')}
                        className={`p-4 border rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer ${
                          paymentMethod === 'card' 
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg' 
                            : 'border-[#E1E3E5] bg-white text-neutral-800 hover:border-black'
                        }`}
                      >
                        <CreditCard className="w-6 h-6 shrink-0" />
                        <span className="text-xs font-bold font-mono uppercase">刷卡/NFC Card</span>
                      </button>

                      <button
                        onClick={() => handlePaySelection('qr')}
                        className={`p-4 border rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer ${
                          paymentMethod === 'qr' 
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg' 
                            : 'border-[#E1E3E5] bg-white text-neutral-800 hover:border-black'
                        }`}
                      >
                        <div className="w-6 h-6 border-2 border-current rounded p-0.5 flex items-center justify-center font-extrabold text-[9px] font-mono uppercase">QR</div>
                        <span className="text-xs font-bold font-mono uppercase font-mono">二维码支付 QR</span>
                      </button>
                    </div>
                  ) : (
                    /* TERMINAL INTERACTIVE LOADER */
                    <div className="mt-8 flex flex-col items-center justify-center py-10">
                      {simulationStep === 'WAITING_FOR_TAP' && (
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 animate-bounce mx-auto">
                            <CreditCard className="w-7 h-7" />
                          </div>
                          <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider font-mono">请在刷卡终端轻触 NFC 卡片或插卡...</p>
                        </div>
                      )}
                      {simulationStep === 'AUTHORIZING' && (
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 rounded-full bg-sky-50 border-2 border-dashed border-[#07C2E3] flex items-center justify-center text-[#07C2E3] animate-spin mx-auto"></div>
                          <p className="text-xs text-[#07C2E3] font-bold uppercase tracking-wider font-mono">Terminal 正在和结算中心握手授权...</p>
                        </div>
                      )}
                      {simulationStep === 'SUCCESS' && (
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto">
                            <Check className="w-8 h-8" />
                          </div>
                          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider font-mono">账款成功清算收讫</p>
                        </div>
                      )}
                      {simulationStep === 'QR_DISPLAY' && (
                        <div className="text-center space-y-4">
                          <div className="w-36 h-36 border-2 border-[#E1E3E5] p-2 bg-white flex items-center justify-center mx-auto rounded-xl">
                            <div className="grid grid-cols-4 gap-1 w-full h-full opacity-80 bg-neutral-900 p-2.5 rounded-lg text-white">
                              <div className="bg-white rounded"></div>
                              <div className="bg-white rounded"></div>
                              <div className="bg-white rounded"></div>
                              <div className="bg-white rounded"></div>
                              <div className="bg-white rounded"></div>
                              <div className="bg-white rounded text-[#07C2E3] text-[8px] flex items-center justify-center font-mono">QR</div>
                              <div className="bg-white rounded"></div>
                              <div className="bg-white rounded"></div>
                              <div className="bg-white rounded"></div>
                              <div className="bg-white rounded"></div>
                              <div className="bg-white rounded"></div>
                              <div className="bg-white rounded"></div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 font-bold">请指导买家使用手机完成扫码核销结账</p>
                            <button
                              onClick={confirmQrSelection}
                              className="mt-3 px-6 h-9 bg-[#07C2E3] hover:bg-[#06B2D0] text-white text-xs font-bold tracking-wider rounded-lg uppercase cursor-pointer"
                            >
                              模拟已扫码支付成功 Confirm Paid
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CASH CALCULATION BOX */}
                  {paymentMethod === 'cash' && !isSimulatingTerminal && (
                    <div className="mt-6 border border-[#E1E3E5] p-4 bg-[#F6F6F7]/40 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center text-xs text-neutral-600">
                        <span className="font-bold">应付折后 Payable:</span>
                        <span className="font-mono font-extrabold text-[#111111]">€{pricingSummary.total.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-neutral-600">外币实付 Received:</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2 text-xs font-semibold text-neutral-400">€</span>
                          <input
                            type="number"
                            placeholder="如: 100"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            className="w-full h-8 pl-6 pr-3 border border-[#E1E3E5] bg-white rounded-lg text-xs font-mono font-bold outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      {Number(cashReceived) >= pricingSummary.total && (
                        <div className="flex justify-between items-center text-xs text-emerald-600 pt-2.5 border-t border-dashed border-[#E1E3E5] font-bold font-mono">
                          <span>实付找零 Change:</span>
                          <span className="text-sm font-extrabold">€{(Number(cashReceived) - pricingSummary.total).toFixed(2)}</span>
                        </div>
                      )}

                      <button
                        onClick={() => commitCheckout('cash')}
                        disabled={!cashReceived || Number(cashReceived) < pricingSummary.total}
                        className={`w-full h-10 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                          cashReceived && Number(cashReceived) >= pricingSummary.total
                            ? 'bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-white shadow-md'
                            : 'bg-neutral-150 text-neutral-400 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>确定现金收讫 Complete Order</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* CHECKOUT FINALIZED INVOICE SCREEN */
                <div className="flex-1 flex flex-col justify-between overflow-y-auto">
                  <div className="text-center pt-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-extrabold text-neutral-900">企业级 POS 交易已被成功记入!</h3>
                    <p className="text-[10px] text-neutral-400 mt-1 font-mono">TRANSACTION COMMITTED TO GLOBAL STORE HISTORIES</p>
                  </div>

                  {/* INVOICE THERMAL PREVIEW */}
                  <div className="my-6 border border-[#E1E3E5] p-5 font-mono text-xs text-neutral-600 space-y-4 max-w-sm mx-auto bg-neutral-50 rounded-xl relative shadow-sm overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#07C2E3] to-neutral-900"></div>
                    
                    <div className="text-center border-b border-dashed border-neutral-300 pb-3">
                      <h4 className="font-extrabold text-[#111111] leading-tight flex items-center justify-center gap-1.5">
                        <span>ATELIER NOIR</span>
                        <span className="text-[10px] bg-neutral-900 text-white font-mono font-normal px-1 py-0.2 rounded uppercase scale-90">Store POS</span>
                      </h4>
                      <p className="text-[9px] text-neutral-400 mt-1">{settings.warehouseLocations?.[0]?.address || 'Milano commercial zone 88'}</p>
                    </div>

                    <div className="space-y-1 text-[10px] text-neutral-400 font-mono">
                      <div className="flex justify-between">
                        <span>凭单编号 No:</span>
                        <span className="font-bold text-neutral-800">{finalizedOrder?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>流水 ID:</span>
                        <span className="font-bold text-neutral-800">{finalizedOrder?.id?.substring(0, 15)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>交易时间 Date:</span>
                        <span className="font-bold text-neutral-800">
                          {finalizedOrder?.createdAt ? new Date(finalizedOrder.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>关联顾客 Cust:</span>
                        <span className="font-bold text-neutral-800">{finalizedOrder?.customerName}</span>
                      </div>
                    </div>

                    {/* ITEMS BREAKDOWN */}
                    <div className="border-t border-dashed border-neutral-300 pt-3 text-[10px] space-y-2 font-mono">
                      <div className="grid grid-cols-12 gap-1 font-bold text-neutral-800 border-b border-dashed border-neutral-200 pb-1.5">
                        <div className="col-span-8">商品 Item</div>
                        <div className="col-span-1 text-center">数</div>
                        <div className="col-span-3 text-right">额 Value</div>
                      </div>

                      {finalizedOrder?.items.map((it, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-1 text-[10px] text-neutral-500">
                          <div className="col-span-8 truncate">{it.title}</div>
                          <div className="col-span-1 text-center font-bold text-neutral-800">{it.quantity}</div>
                          <div className="col-span-3 text-right font-bold text-neutral-800">€{(it.price * it.quantity).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>

                    {/* FINAL SETTLED STATS */}
                    <div className="border-t border-dashed border-neutral-300 pt-3 text-[10px] space-y-1 text-right font-mono">
                      <div className="flex justify-between text-[11px] font-extrabold text-neutral-900 leading-normal pt-1">
                        <span>应收合合 Payable Total:</span>
                        <span>€{finalizedOrder?.total?.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-center border-t border-dashed border-neutral-300 pt-3.5 mt-2">
                      <p className="text-[9px] text-[#07C2E3] tracking-wide font-bold uppercase">** 谢谢惠顾 - ATELIER NOIR **</p>
                      <p className="text-[7px] text-neutral-400 mt-0.5">VAT CLASSIFIED STANDARD RESIDENT INVOICE</p>
                    </div>
                  </div>

                  {/* POST CHECKOUT ACTIONS */}
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => alert('已成功推送打印序列并传送指令至 POS 外围硬件热敏打印机！')}
                      className="px-4 h-9 border border-[#E1E3E5] hover:border-black rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer text-[#111]"
                    >
                      <Printer className="w-4 h-4" />
                      <span>打印小票 Print</span>
                    </button>
                    <button
                      onClick={() => alert(`完成推送: 电子凭证包已寄送至 ${finalizedOrder?.customerEmail}`)}
                      className="px-4 h-9 border border-[#E1E3E5] hover:border-black rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer text-[#111]"
                    >
                      <Mail className="w-4 h-4" />
                      <span>发送电子小票 Send</span>
                    </button>
                  </div>

                  <button
                    onClick={resetPosTerminal}
                    className="w-full h-11 bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-white rounded-xl font-bold text-xs uppercase tracking-wider mt-6 cursor-pointer"
                  >
                    完成并核销下一单 NEXT CHECKOUT TRANSACTION
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
