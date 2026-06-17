/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Order, Customer, Discount, StoreSettings } from '../types';

// Sleek Inline SVG icons and sketches to represent our high-end black & white collection
export const MOCK_PRODUCT_SVGS = {
  wallet: `<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-black stroke-2 stroke-round"><path d="M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/><path d="M12 11h9v4h-9zM3 10h6"/></svg>`,
  shirt: `<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-black stroke-2 stroke-round"><path d="M20.38 6.53l-3.34-3.34A2 2 0 0015.62 2.6H8.38A2 2 0 006.96 3.2L3.62 6.53A2 2 0 003 7.94v11.4a2 2 0 002 2h14a2 2 0 002-2V7.94c0-.53-.21-1.04-.62-1.41z"/><path d="M6 21v-5h12v5M3 10h18M12 2.6v7.4"/></svg>`,
  dripper: `<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-black stroke-2 stroke-round"><path d="M17 19H7a4 4 0 01-4-4V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v10a4 4 0 01-4 4z"/><path d="M3 8h18M5 19h14M8 23h8M12 3v5"/></svg>`,
  headphones: `<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-black stroke-2 stroke-round"><path d="M3 14c0-4.97 4.03-9 9-9s9 4.03 9 9"/><path d="M4 14a2 2 0 00-2 2v3a2 2 0 002 2h2V14H4zm16 0h-2v7h2a2 2 0 002-2v-3a2 2 0 00-2-2z"/></svg>`,
  deskpad: `<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-black stroke-2 stroke-round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M6 14h12M14 17h4"/></svg>`,
  backpack: `<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-black stroke-2 stroke-round"><rect x="5" y="6" width="14" height="15" rx="3"/><path d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2M5 11h14M12 6v15M9 21h6"/></svg>`,
  pencil: `<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-black stroke-2 stroke-round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  candle: `<svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 stroke-black stroke-2 stroke-round"><rect x="6" y="9" width="12" height="12" rx="2"/><path d="M12 9V5a1 1 0 012-1 1 1 0 01-2 5zM9 13h6M9 17h6"/></svg>`
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    title: 'Minimalist Leather Pocket Wallet',
    description: 'An ultra-slim, full-grain leather cardholder crafted to fit up to six cards and folded cash beautifully. Black aniline oiled finish with burnished edges.',
    vendor: 'Studio Nord',
    type: 'Accessories',
    status: 'active',
    price: 49.00,
    compareAtPrice: 65.00,
    costPerItem: 18.50,
    sku: 'SN-WLT-BLK',
    inventory: 42,
    inventoryByLocation: { 'Main Warehouse': 30, 'Berlin Outlet': 12 },
    images: ['wallet'],
    collections: ['Best Sellers', 'Minimalist Carry'],
    tags: ['leather', 'wallet', 'pocket', 'crafts']
  },
  {
    id: 'prod-02',
    title: 'Raw Organic Hemp Tee',
    description: 'Mediumweight 100% organic European hemp jersey. Naturally textured, moisture-wicking, structured drape that softens beautifully with every single wash.',
    vendor: 'EcoStitch',
    type: 'Apparel',
    status: 'active',
    price: 39.00,
    costPerItem: 11.20,
    sku: 'ES-HMP-RAW',
    inventory: 154,
    inventoryByLocation: { 'Main Warehouse': 100, 'Berlin Outlet': 54 },
    images: ['shirt'],
    collections: ['Essentials', 'Spring Launch'],
    tags: ['organic', 'shirt', 'hemp', 'sustainable']
  },
  {
    id: 'prod-03',
    title: 'Ceramic Pour-Over Coffee Brewer',
    description: 'Matte charcoal clay dripper with custom interior spiral ribs engineered for the perfect extraction rate. Fits standard conical paper filters.',
    vendor: 'Mono Ceramics',
    type: 'Kitchenware',
    status: 'active',
    price: 35.00,
    compareAtPrice: 42.00,
    costPerItem: 9.00,
    sku: 'MC-DRP-CHR',
    inventory: 3, // Low stock indicator highlight!
    inventoryByLocation: { 'Main Warehouse': 2, 'Berlin Outlet': 1 },
    images: ['dripper'],
    collections: ['Kitchen & Dining', 'New Season'],
    tags: ['ceramic', 'coffee', 'pour-over', 'manual']
  },
  {
    id: 'prod-04',
    title: 'Acoustic One Wireless Headphones',
    description: 'Pure high-definition audio drivers housed in dynamic matte-finished enclosures. Fully active noise suspension, 32-hour seamless playback.',
    vendor: 'Atmos Sound',
    type: 'Electronics',
    status: 'active',
    price: 249.00,
    compareAtPrice: 299.00,
    costPerItem: 95.00,
    sku: 'AT-HDP-BLK',
    inventory: 18,
    inventoryByLocation: { 'Main Warehouse': 18, 'Berlin Outlet': 0 },
    images: ['headphones'],
    collections: ['Tech Portfolio', 'Best Sellers'],
    tags: ['headphones', 'bluetooth', 'audio', 'premium']
  },
  {
    id: 'prod-05',
    title: 'Matte Graphite Desk Pad (Medium)',
    description: 'Felt-backed microtextured wool-poly composite writing and keyboard mat. Nonslip natural cork backing with anti-fraying perimeter stitching.',
    vendor: 'Studio Nord',
    type: 'Office',
    status: 'active',
    price: 45.00,
    costPerItem: 14.00,
    sku: 'SN-PAD-GRF',
    inventory: 64,
    inventoryByLocation: { 'Main Warehouse': 50, 'Berlin Outlet': 14 },
    images: ['deskpad'],
    collections: ['Minimalist Carry'],
    tags: ['office', 'desk', 'felt', 'studio']
  },
  {
    id: 'prod-06',
    title: 'Waterproof Adventure Pack',
    description: 'All-weather 24L rolled-top backpack assembled from recycled water bottles. Sealed water-tight zippers and secure padded compartment fits 16" laptop.',
    vendor: 'EcoStitch',
    type: 'Accessories',
    status: 'active',
    price: 120.00,
    costPerItem: 45.00,
    sku: 'ES-BPK-WPF',
    inventory: 28,
    inventoryByLocation: { 'Main Warehouse': 20, 'Berlin Outlet': 8 },
    images: ['backpack'],
    collections: ['Minimalist Carry', 'Essentials'],
    tags: ['backpack', 'waterproof', 'travel', 'sustainable']
  },
  {
    id: 'prod-07',
    title: 'Brass Mechanical Drafting Pencil',
    description: 'Solid unfinished alloy body with high-precision internal lead advance. Develops a distinct, rich dark patina through routine tactile usage.',
    vendor: 'Mono Ceramics',
    type: 'Office',
    status: 'draft',
    price: 28.00,
    costPerItem: 7.50,
    sku: 'MC-PNC-BRS',
    inventory: 0,
    inventoryByLocation: { 'Main Warehouse': 0 },
    images: ['pencil'],
    collections: ['New Season'],
    tags: ['brass', 'pencil', 'drafting', 'stationery']
  },
  {
    id: 'prod-08',
    title: 'Soy Sandalwood Wood-Wick Candle',
    description: 'Slow-burning organic soy wax infused with rich sandalwood essential oils when heated. Patented crackling raw pine wood wick generates gentle ambient sound.',
    vendor: 'Studio Nord',
    type: 'Home',
    status: 'archived',
    price: 24.00,
    costPerItem: 6.00,
    sku: 'SN-CDL-WCK',
    inventory: 0,
    inventoryByLocation: { 'Main Warehouse': 0 },
    images: ['candle'],
    collections: ['Kitchen & Dining'],
    tags: ['candle', 'scent', 'home', 'soy']
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-01',
    name: '#1001',
    customerName: 'Marcus Aurelius',
    customerEmail: 'marcus@philosophy.org',
    items: [
      { productId: 'prod-01', title: 'Minimalist Leather Pocket Wallet', quantity: 1, price: 49.00, image: 'wallet' },
      { productId: 'prod-03', title: 'Ceramic Pour-Over Coffee Brewer', quantity: 1, price: 35.00, image: 'dripper' }
    ],
    subtotal: 84.00,
    discountCode: 'WELCOME10',
    discountAmount: 8.40,
    tax: 15.12,
    shipping: 0.00, // free shipping
    total: 90.72,
    paymentStatus: 'paid',
    fulfillmentStatus: 'unfulfilled',
    createdAt: '2026-06-16T14:32:00-07:00',
    notes: 'Please leave package by the guard gate.'
  },
  {
    id: 'ord-02',
    name: '#1002',
    customerName: 'Clara Schumann',
    customerEmail: 'clara.sch@piano.de',
    items: [
      { productId: 'prod-04', title: 'Acoustic One Wireless Headphones', quantity: 1, price: 249.00, image: 'headphones' }
    ],
    subtotal: 249.00,
    tax: 44.82,
    shipping: 10.00,
    total: 303.82,
    paymentStatus: 'pending',
    fulfillmentStatus: 'unfulfilled',
    createdAt: '2026-06-16T08:15:00-07:00'
  },
  {
    id: 'ord-03',
    name: '#1003',
    customerName: 'Soren Kierkegaard',
    customerEmail: 'soren.k@exist.dk',
    items: [
      { productId: 'prod-02', title: 'Raw Organic Hemp Tee', quantity: 2, price: 39.00, image: 'shirt' },
      { productId: 'prod-05', title: 'Matte Graphite Desk Pad (Medium)', quantity: 1, price: 45.00, image: 'deskpad' }
    ],
    subtotal: 123.00,
    discountCode: 'SPRING15',
    discountAmount: 18.45,
    tax: 18.82,
    shipping: 5.00,
    total: 128.37,
    paymentStatus: 'paid',
    fulfillmentStatus: 'fulfilled',
    createdAt: '2026-06-15T19:40:00-07:00'
  },
  {
    id: 'ord-04',
    name: '#1004',
    customerName: 'Ada Lovelace',
    customerEmail: 'ada@computing.org',
    items: [
      { productId: 'prod-06', title: 'Waterproof Adventure Pack', quantity: 1, price: 120.00, image: 'backpack' }
    ],
    subtotal: 120.00,
    tax: 21.60,
    shipping: 0.00,
    total: 141.60,
    paymentStatus: 'refunded',
    fulfillmentStatus: 'fulfilled',
    createdAt: '2026-06-14T11:05:00-07:00',
    notes: 'Returned due to sizing mismatch.'
  },
  {
    id: 'ord-05',
    name: '#1005',
    customerName: 'Hokusai Katsushika',
    customerEmail: 'greatwave@edo.jp',
    items: [
      { productId: 'prod-01', title: 'Minimalist Leather Pocket Wallet', quantity: 3, price: 49.00, image: 'wallet' }
    ],
    subtotal: 147.00,
    tax: 26.46,
    shipping: 12.00,
    total: 185.46,
    paymentStatus: 'paid',
    fulfillmentStatus: 'unfulfilled',
    createdAt: '2026-06-13T16:20:00-07:00'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-01',
    firstName: 'Marcus',
    lastName: 'Aurelius',
    email: 'marcus@philosophy.org',
    phone: '+39 06 5831 294',
    ordersCount: 3,
    totalSpent: 412.50,
    tags: ['vip', 'editorial', 'quiet-luxury'],
    segment: 'VIP',
    company: 'Stoa Corp'
  },
  {
    id: 'cust-02',
    firstName: 'Clara',
    lastName: 'Schumann',
    email: 'clara.sch@piano.de',
    phone: '+49 30 9012 300',
    ordersCount: 1,
    totalSpent: 303.82,
    tags: ['music', 'premium'],
    segment: 'Returning'
  },
  {
    id: 'cust-03',
    firstName: 'Soren',
    lastName: 'Kierkegaard',
    email: 'soren.k@exist.dk',
    ordersCount: 4,
    totalSpent: 520.00,
    tags: ['philosophy', 'frequent-buyer'],
    segment: 'VIP'
  },
  {
    id: 'cust-04',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@computing.org',
    phone: '+44 20 7946 0192',
    ordersCount: 2,
    totalSpent: 285.00,
    tags: ['tech', 'B2B'],
    segment: 'B2B',
    company: 'Difference Engine Ltd'
  },
  {
    id: 'cust-05',
    firstName: 'Hokusai',
    lastName: 'Katsushika',
    email: 'greatwave@edo.jp',
    ordersCount: 1,
    totalSpent: 185.46,
    tags: ['artist'],
    segment: 'Returning'
  },
  {
    id: 'cust-06',
    firstName: 'Linus',
    lastName: 'Torvalds',
    email: 'torvalds@kernel.org',
    ordersCount: 0,
    totalSpent: 0.00,
    tags: ['banned-from-checkout'],
    segment: 'Abandoned Checkout'
  }
];

export const INITIAL_DISCOUNTS: Discount[] = [
  {
    id: 'disc-01',
    code: 'SUMMER20',
    type: 'percentage',
    value: 20,
    valueText: '20%折扣 (20% Off)',
    status: 'active',
    usageCount: 45,
    minRequirement: '无最低要求',
    method: 'code',
    usageLimit: 100,
    oncePerCustomer: true,
    combinable: false,
    startDate: '2026-06-17',
    startTime: '00:00',
    endDate: '2026-06-30',
    endTime: '23:59',
    hasEndDate: true
  },
  {
    id: 'disc-02',
    code: 'FREESHIP',
    type: 'free_shipping',
    value: 0,
    valueText: '免运费 (Free Shipping)',
    status: 'active',
    usageCount: 89,
    minRequirement: '全部商品',
    method: 'code',
    oncePerCustomer: false,
    combinable: true,
    startDate: '2026-06-17',
    startTime: '00:00',
    hasEndDate: false
  },
  {
    id: 'disc-03',
    code: '满减€10',
    type: 'fixed_amount',
    value: 10,
    valueText: '固定€10 (Flat €10 Off)',
    status: 'active',
    usageCount: 0,
    minRequirement: '最低消费金额: €100.00',
    method: 'automatic',
    oncePerCustomer: false,
    combinable: false,
    startDate: '2026-06-17',
    startTime: '00:00',
    endDate: '2026-06-30',
    endTime: '23:59',
    hasEndDate: true
  },
  {
    id: 'disc-04',
    code: 'VIP50',
    type: 'fixed_amount',
    value: 50,
    valueText: '固定€50 (Flat €50 Off)',
    status: 'active',
    usageCount: 12,
    minRequirement: '最低消费金额: €200.00',
    method: 'code',
    usageLimit: 50,
    oncePerCustomer: true,
    combinable: true,
    startDate: '2026-06-16',
    startTime: '12:00',
    hasEndDate: false
  },
  {
    id: 'disc-05',
    code: 'WINTER10',
    type: 'percentage',
    value: 10,
    valueText: '10%折扣 (10% Off)',
    status: 'expired',
    usageCount: 234,
    minRequirement: '无最低要求',
    method: 'code',
    oncePerCustomer: true,
    combinable: false,
    startDate: '2025-12-01',
    startTime: '00:00',
    endDate: '2026-02-28',
    endTime: '23:59',
    hasEndDate: true
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  shopName: 'Atelier Noir',
  shopEmail: 'hello@noiratelier.com',
  currency: 'EUR',
  currencySymbol: '€',
  timezone: 'GMT+1 (Berlin)',
  shippingStandardRate: 10.00,
  taxRate: 19.00, // 19% standard VAT
  plan: 'Shopify',
  language: 'zh',
  warehouseLocations: [
    { name: '米兰核心总仓', address: '米兰市商业区88号', type: '主管发货仓', status: '正常运行' },
    { name: '罗马自提服务柜', address: '罗马中心街45号院', type: '买家自提柜', status: '正常运行' }
  ],
  marketsList: [
    { id: '1', name: '欧洲核心市场', region: '意、法、德、西', status: '已激活' },
    { id: '2', name: '北美自由贸易区', region: '美国、加拿大', status: '配置中' },
  ],
  storeLanguages: ['简体中文', 'English (International)', 'Italiano'],
  paymentProviders: {
    shopifyPayments: true,
    paypal: true,
    stripe: false,
    manualCod: true,
  },
  shippingRates: [
    { id: '1', zone: '意大利国内', name: '标准航空', cost: 5.00, condition: '所有订单' },
    { id: '2', zone: '意大利国内', name: '特快直邮', cost: 12.00, condition: '所有订单' },
    { id: '3', zone: '意大利国内', name: '满额免邮', cost: 0.00, condition: '订单金额 ≥ €80' },
  ],
  packages: [
    { name: '标准中号硬纸箱', size: '30×20×15 cm', emptyWeight: '0.4 kg' },
    { name: '轻便防雨信封袋', size: '20×15×2 cm', emptyWeight: '0.05 kg' }
  ],
  checkoutConfig: {
    contactMethod: 'email',
    companyField: 'optional',
    phoneField: 'optional',
    enableTips: true,
    autoAbandonEmail: true,
  },
  customerAccounts: {
    loginRequirement: 'optional',
    loginFormat: 'new',
  },
  notifications: {
    orderConfirm: true,
    orderCancel: true,
    shippingUpdate: true,
    lowStockAlert: true,
  },
  domains: [
    { url: 'www.mystore.com', type: '自定义主域名', isPrimary: true, status: '正常连接', ip: '23.227.38.65' },
    { url: 'mystore-sandbox.myshopify.com', type: '默认系统子域名', isPrimary: false, status: '正常连接', ip: '23.227.38.65' },
  ],
  policyRefund: '【Atelier Noir 售后退换货政策】\n1. 遵照欧共体条例指引，支持买家签收后14个自然日内无责任申请退款/换币。\n2. 所有退还单据需配合吊牌完封。请联系官方邮箱：hello@noiratelier.com 投送原路邮寄条单。',
  policyPrivacy: '【Atelier Noir 隐私条款与 GDPR 完全符合性证明】\n我们坚信数据本权。您在本店录入的结账单据全部经过高安全传输直接投送至收单银行，我们的本地容器不会留存卡密码。如需销毁游览足迹，请与 hello@noiratelier.com 取得联系。',
  policyTerms: '【Atelier Noir 平台销售与服务权责白皮书】\n在完成支付即锁定货单契约。如因特定区域或大宗物流管制不可联，商家具有撤回交易并不受罚的最终解释权。',
  metafields: [
    { resource: '商品', key: 'custom.material_comp', name: '材质成分', type: '单行文本 (String)', count: 120 },
    { resource: '客户', key: 'custom.birthday_date', name: '生日结构', type: '日期结构 (Date)', count: 86 }
  ],
  devApps: [
    { name: '意北主发货系统对接 ERP 校验', key: 'apk_99018c11a', permissions: '产品只读、订单双向读写', status: '正常活动中' }
  ],
  filesList: [
    { name: 'brand-banner-home.jpg', size: '242 KB', type: 'Image/JPEG', creationDate: '2026-05-12' },
    { name: 'size-chart-winter.pdf', size: '1.2 MB', type: 'Application/PDF', creationDate: '2026-06-01' }
  ],
  giftCards: [
    { code: 'GFT-990-AX1', balance: 100.00, status: '有效', customer: 'buyer@domain.it' }
  ]
};
