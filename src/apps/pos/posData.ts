import { Product as MainProduct, Order as MainOrder, OrderItem as MainOrderItem } from '../../types';

/**
 * Normalized POS Product data structure mapping to Main Admin Product database.
 */
export interface POSProduct extends MainProduct {
  barcode?: string;
  category?: string;
  isCustomItem?: boolean;
}

/**
 * Normalized Inventory Level payload for POS and primary warehouse sync.
 */
export interface POSInventoryUpdate {
  productId: string;
  locationName: string;
  quantityChange: number;
  newQuantity: number;
  updatedAt: string;
}

/**
 * Transaction record wrapping standard orders with retail-specific registers, shifts, and cash details.
 */
export interface POSTransaction extends MainOrder {
  registerId: string;
  cashierId: string;
  paymentMethod: 'cash' | 'credit_card' | 'multi_payment';
  cashAmountReceived?: number;
  cashChangeReturned?: number;
  posDeviceModel?: string;
  locationName: string;
}
