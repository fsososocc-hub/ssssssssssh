/**
 * Ultimate Modular Products Module - Level 10 Schema & Event Driven Catalog Manager
 * Uses Zod schemas, FormBuilder, DataGrid, plus live ProductService proxying.
 */

import React, { useState, useEffect } from 'react';
import { useProductStore } from '../../stores/productStore';
import { usePanelStore } from '../../stores/panelStore';
import { useShopStore } from '../../stores/shopStore';
import { Product } from '../../types';
import { ProductEvents, InventoryEvents, NotificationEvents, eventBus } from '../../events';
import { productSchemaMeta } from '../../schemas';
import DataGrid from '../../components/ui/DataGrid';
import { ProductService } from '../../services/product.service';

// De-coupled sub-components
import ProductsHeader from './components/ProductsHeader';
import ProductsTabs from './components/ProductsTabs';
import ProductForm from './components/ProductForm';

export default function ProductsView() {
  const { products, productFilter, setProductFilter, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { togglePreview, closePreview } = usePanelStore();
  const { settings } = useShopStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const currencySymbol = settings.currencySymbol || '€';

  // Subscriptions to full-blown editing form events
  useEffect(() => {
    const handleEditStart = (p: Product) => {
      setEditingProduct(p);
      setIsCreating(false);
      closePreview(); // Clear sidebar to make ample space
    };

    const handleDeleteCommand = async (productId: string) => {
      deleteProduct(productId);
      const updatedProducts = products.filter(p => p.id !== productId);
      await ProductService.saveProducts(updatedProducts);
      
      eventBus.emit(ProductEvents.DELETED, { id: productId });
      eventBus.emit(NotificationEvents.CREATED, {
        text: `🗑️ 商品被永久除档，ID: ${productId}`
      });

      setEditingProduct(null);
      setIsCreating(false);
    };

    const editUnsubscribe = eventBus.subscribe('product:edit-details', handleEditStart);
    const deleteUnsubscribe = eventBus.subscribe('product:delete-product', handleDeleteCommand);

    return () => {
      editUnsubscribe();
      deleteUnsubscribe();
    };
  }, [products, deleteProduct, closePreview]);

  // Filter products by tabs status
  const filteredProducts = products.filter((p) => {
    if (productFilter !== 'All' && p.status !== productFilter) return false;
    return true;
  });

  // Handle active creation & editing submissions
  const handleFormSubmit = async (formData: any) => {
    if (editingProduct) {
      // Edit Mode Update
      const updatedItem: Product = {
        ...editingProduct,
        ...formData
      };

      updateProduct(editingProduct.id, updatedItem);
      
      const newProductList = products.map(p => p.id === editingProduct.id ? updatedItem : p);
      await ProductService.saveProducts(newProductList);

      eventBus.emit(ProductEvents.UPDATED, updatedItem);
      eventBus.emit(InventoryEvents.CHANGED, { sku: updatedItem.sku, value: updatedItem.inventory });
      eventBus.emit(NotificationEvents.CREATED, {
        text: `✏️ 已同步更新 [${updatedItem.title}] 后台组织与多仓微配额`
      });

      setEditingProduct(null);
    } else {
      // Creation Mode
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        title: formData.title,
        description: formData.description || '',
        vendor: formData.vendor,
        type: formData.type || 'High-End Leather',
        status: formData.status || 'active',
        price: Number(formData.price),
        compareAtPrice: Number(formData.compareAtPrice),
        costPerItem: Number(formData.costPerItem),
        sku: formData.sku,
        inventory: Number(formData.inventory),
        inventoryByLocation: formData.inventoryByLocation || { 'Main Warehouse': Number(formData.inventory) },
        images: formData.images || ['wallet'],
        collections: formData.collections || [],
        tags: formData.tags || [],
      };

      // 1. Commit and sync with Service Proxy
      addProduct(newProd);
      await ProductService.saveProducts([...products, newProd]);

      // 2. Transmit changes to asynchronous EventBus for real-time decoupled listeners
      eventBus.emit(ProductEvents.UPDATED, newProd);
      eventBus.emit(InventoryEvents.CHANGED, { sku: newProd.sku, value: newProd.inventory });
      eventBus.emit(NotificationEvents.CREATED, {
        text: `📦 新入库商品 [${newProd.title}]，货号: ${newProd.sku}，配额: ${newProd.inventory} Pcs`
      });

      setIsCreating(false);
    }
  };

  if (isCreating || editingProduct) {
    return (
      <ProductForm 
        productToEdit={editingProduct}
        onBack={() => {
          setIsCreating(false);
          setEditingProduct(null);
        }}
        onSubmit={handleFormSubmit}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Decoupled title section */}
      <ProductsHeader onAddClick={() => setIsCreating(true)} />

      {/* Decoupled tabs filter bar */}
      <ProductsTabs 
        productFilter={productFilter}
        setProductFilter={setProductFilter}
        filteredCount={filteredProducts.length}
      />

      {/* Fully dynamic DataGrid governed by schemas */}
      <DataGrid
        columns={productSchemaMeta.columns}
        records={filteredProducts}
        searchPlaceholder="检索商品标题、条码、品牌供应商、类型..."
        currencySymbol={currencySymbol}
        onRowClick={(p) => togglePreview('product', p.id)}
      />
    </div>
  );
}
