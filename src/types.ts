/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  title: string;
  description: string;
  vendor: string;
  type: string;
  status: 'active' | 'draft' | 'archived';
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  sku: string;
  inventory: number;
  inventoryByLocation: Record<string, number>;
  images: string[];
  collections: string[];
  tags: string[];
}

export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  name: string; // e.g. "#1001"
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount?: number;
  tax: number;
  shipping: number;
  total: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  fulfillmentStatus: 'unfulfilled' | 'fulfilled';
  createdAt: string;
  notes?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  tags: string[];
  segment: 'All' | 'VIP' | 'Returning' | 'Abandoned Checkout' | 'B2B';
  company?: string;
  notes?: string;
  addresses?: CustomerAddress[];
  createdAt?: string;
}

export interface CustomerAddress {
  id: string;
  isDefault: boolean;
  addressLines: string;
  city: string;
  country: string;
  zipCode: string;
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  query: string; // e.g. "totalSpent > 100"
  memberCount: number;
  category: 'prebuilt' | 'custom';
}

export interface B2BCompany {
  id: string;
  name: string;
  businessId: string;
  location: string;
  primaryContactName: string;
  primaryContactEmail: string;
  ordersCount: number;
  totalSpent: number;
  paymentTerm: 'Net 30' | 'Net 60' | 'Due on receipt';
  creditLimit: number;
  catalogId?: string; 
  contacts: B2BContact[];
}

export interface B2BContact {
  customerId: string;
  name: string;
  email: string;
  role: 'admin' | 'buyer';
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
  value: number; // e.g. 15 for 15%
  valueText: string;
  status: 'active' | 'expired' | 'scheduled';
  usageCount: number;
  minRequirement?: string;
  buyQuantity?: number;
  getYQuantity?: number;
  method?: 'code' | 'automatic';
  usageLimit?: number;
  oncePerCustomer?: boolean;
  combinable?: boolean;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  hasEndDate?: boolean;
  
  buyTargetType?: 'products' | 'collections' | 'all';
  buyTargetIds?: string[];
  getGiftType?: 'same' | 'products' | 'collections';
  getGiftIds?: string[];
  getGiftDiscountType?: 'free' | 'percentage' | 'fixed_amount';
  getGiftDiscountValue?: number;
  limitPerOrderUsed?: boolean;
  limitPerOrderValue?: number;

  customerEligibility?: 'all' | 'segment' | 'specific';
  eligibleSegmentId?: string;
  eligibleCustomerIds?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface StoreSettings {
  shopName: string;
  shopEmail: string;
  currency: 'EUR' | 'USD' | 'GBP' | 'CNY';
  currencySymbol: string;
  timezone: string;
  shippingStandardRate: number;
  taxRate: number;
  plan: 'Basic' | 'Shopify' | 'Advanced' | 'Plus';
  language?: 'auto' | 'zh' | 'en';
  warehouseLocations?: { name: string; address: string; type: string; status: string; }[];
  marketsList?: { id: string; name: string; region: string; status: string; }[];
  storeLanguages?: string[];
  paymentProviders?: Record<string, boolean>;
  shippingRates?: { id: string; zone: string; name: string; cost: number; condition: string }[];
  packages?: { name: string; size: string; emptyWeight: string }[];
  checkoutConfig?: { contactMethod: string; companyField: string; phoneField: string; enableTips: boolean; autoAbandonEmail: boolean };
  customerAccounts?: { loginRequirement: string; loginFormat: string };
  notifications?: Record<string, boolean>;
  domains?: { url: string; type: string; isPrimary: boolean; status: string; ip: string }[];
  policyRefund?: string;
  policyPrivacy?: string;
  policyTerms?: string;
  metafields?: { resource: string; key: string; name: string; type: string; count: number }[];
  devApps?: { name: string; key: string; permissions: string; status: string }[];
  filesList?: { name: string; size: string; type: string; creationDate: string }[];
  giftCards?: { code: string; balance: number; status: string; customer: string }[];
}

export interface MarketDomain {
  type: 'subdirectory' | 'subdomain' | 'domain';
  value: string;
}

export interface MarketPricingStrategy {
  mode: 'exchange_rate' | 'manual_adjustment';
  exchangeRate: number; // conversion from EUR
  adjustmentType: 'increase' | 'decrease';
  adjustmentValue: number; // percentage or fixed
  adjustmentMode: 'percentage' | 'fixed';
  roundRule: '.99' | '.00' | 'none';
  taxIncluded: boolean;
}

export interface MarketTaxAndDuty {
  rates: Record<string, number>;
  collectDutyAtCheckout: boolean;
  dutyMode: 'DDP' | 'DAP';
}

export interface MarketShippingRule {
  name: string;
  cost: number;
  duration: string;
  freeOver?: number;
}

export interface Market {
  id: string;
  name: string;
  type: 'primary' | 'international' | 'b2b';
  icon: string; // flag emoji or map emoji
  countries: string[];
  currency: string;
  currencySymbol: string;
  languages: string[];
  primaryLanguage: string;
  domains: MarketDomain;
  pricingStrategy: MarketPricingStrategy;
  catalog: {
    type: 'all' | 'specific';
    collectionIds?: string[];
  };
  taxAndDuty: MarketTaxAndDuty;
  shipping: {
    ruleId: string;
    rules: MarketShippingRule[];
  };
  salesThisMonth: number;
  ordersThisMonth: number;
  status: 'active' | 'paused';
}

export interface B2BWholesaleConfig {
  accessControl: 'invited' | 'login' | 'anyone';
  catalogName: string;
  discountPercentage: number;
  paymentTerm: 'Net 30' | 'Net 60' | 'Due on receipt';
  minOrderValue: number;
  minOrderQty: number;
  taxExempt: boolean;
}

export interface ProductTranslation {
  productId: string;
  locale: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  urlAlias: string;
}

