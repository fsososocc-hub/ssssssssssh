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
}
