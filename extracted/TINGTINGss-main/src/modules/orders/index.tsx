/**
 * Ultimate Modular Orders Module - Level 10 Schema & Event Driven Order Ledger
 * Fully decoupled from UI pages. Combines DataGrid & FormBuilder with Service and EventBus layers.
 */

import React, { useState } from 'react';
import { useOrderStore } from '../../stores/orderStore';
import { usePanelStore } from '../../stores/panelStore';
import { useShopStore } from '../../stores/shopStore';
import { useProductStore } from '../../stores/productStore';
import { Order } from '../../types';
import { OrderEvents, NotificationEvents, eventBus } from '../../events';
import { orderSchemaMeta } from '../../schemas';
import DataGrid from '../../components/ui/DataGrid';
import { OrderService } from '../../services/order.service';

// De-coupled sub-components
import OrdersHeader from './components/OrdersHeader';
import OrdersTabs from './components/OrdersTabs';
import OrderForm from './components/OrderForm';

export default function OrdersView() {
  const { orders, orderFilter, setOrderFilter, addOrder } = useOrderStore();
  const { togglePreview } = usePanelStore();
  const { settings } = useShopStore();
  const { products } = useProductStore();
  const [isCreating, setIsCreating] = useState(false);

  const currencySymbol = settings.currencySymbol || '€';

  // Apply order store filters
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'All') return true;
    if (o.paymentStatus === orderFilter || o.fulfillmentStatus === orderFilter) return true;
    return false;
  });

  const handleCreateSubmit = async (formData: any) => {
    const assignedProd = products[0] || { id: 'fallback', title: 'Standard Luxury Article', price: formData.total, images: ['wallet'] };

    const subtotal = Number(formData.total);
    const tax = Math.round(subtotal * (settings.taxRate / 100) * 100) / 100;
    
    const freshOrder: Order = {
      id: `ord-${Date.now()}`,
      name: `#${1001 + orders.length}`,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      items: [
        {
          productId: assignedProd.id,
          title: assignedProd.title,
          quantity: 1,
          price: subtotal,
          image: assignedProd.images[0] || 'wallet'
        }
      ],
      subtotal,
      tax,
      shipping: Number(formData.shipping || 0),
      total: subtotal + tax + Number(formData.shipping || 0),
      paymentStatus: formData.paymentStatus || 'pending',
      fulfillmentStatus: formData.fulfillmentStatus || 'unfulfilled',
      createdAt: new Date().toISOString().split('T')[0],
      notes: formData.notes || 'Manually compiled via Admin OS Console.'
    };

    // 1. Commit and persist locally through the service layer proxy
    addOrder(freshOrder);
    await OrderService.saveOrders([...orders, freshOrder]);

    // 2. Distribute decoupled events to our listeners
    eventBus.emit(OrderEvents.CREATED, freshOrder);
    if (freshOrder.paymentStatus === 'paid') {
      eventBus.emit(OrderEvents.PAID, freshOrder);
    }
    eventBus.emit(NotificationEvents.CREATED, {
      text: `💸 新订单 [${freshOrder.name}] 生成自客户 [${freshOrder.customerName}]，合规金额: €${freshOrder.total}`
    });

    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <OrderForm 
        onBack={() => setIsCreating(false)}
        onSubmit={handleCreateSubmit}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Decoupled header block */}
      <OrdersHeader onAddClick={() => setIsCreating(true)} />

      {/* Decoupled tabs row */}
      <OrdersTabs 
        orderFilter={orderFilter}
        setOrderFilter={setOrderFilter}
        filteredCount={filteredOrders.length}
      />

      {/* Structured data table */}
      <DataGrid
        columns={orderSchemaMeta.columns}
        records={filteredOrders}
        searchPlaceholder="检索订单号、客户电子邮件、付款状态、履约状态..."
        currencySymbol={currencySymbol}
        onRowClick={(ord) => togglePreview('order', ord.id)}
      />
    </div>
  );
}
