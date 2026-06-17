import { useState, useCallback } from 'react';
import { useProductStore } from '../../stores/productStore';
import { useOrderStore } from '../../stores/orderStore';
import { eventBus } from '../../services/eventBus';
import { OrderEvents } from '../../events/order.events';
import { POSTransaction } from './posData';

export function usePOSSync() {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const products = useProductStore((state) => state.products);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const addOrder = useOrderStore((state) => state.addOrder);

  const syncTransaction = useCallback(
    async (transaction: POSTransaction): Promise<boolean> => {
      setIsSyncing(true);
      
      // Simulate highly optimized multi-tenant backpressure sync handshake
      await new Promise((resolve) => setTimeout(resolve, 300));

      try {
        // 1. Decoupled inventory dynamic adjustments
        transaction.items.forEach((item) => {
          const matchPrd = products.find((p) => p.id === item.productId);
          if (matchPrd) {
            const nextInventory = Math.max(0, matchPrd.inventory - item.quantity);
            
            let locations = matchPrd.inventoryByLocation;
            if (locations) {
              locations = { ...locations };
              const currentLoc = transaction.locationName || Object.keys(locations)[0] || 'Default';
              locations[currentLoc] = Math.max(0, (locations[currentLoc] || 0) - item.quantity);
            }

            // Persistence
            updateProduct(matchPrd.id, {
              inventory: nextInventory,
              inventoryByLocation: locations,
            });

            // Trigger low inventory event if dropping below threshold
            if (nextInventory <= 5) {
              eventBus.emit('inventory.low', {
                productId: matchPrd.id,
                productName: matchPrd.title,
                remaining: nextInventory,
              });
            }
          }
        });

        // 2. Add standard order to center control database
        addOrder(transaction);

        // 3. Emit decoupled Shopify standard event hooks
        eventBus.emit(OrderEvents.CREATED, transaction);
        eventBus.emit(OrderEvents.PAID, transaction);
        eventBus.emit('pos.transaction_synced', {
          transactionId: transaction.id,
          syncedAt: new Date().toISOString(),
        });

        setLastSyncedAt(new Date().toISOString());
        setIsSyncing(false);
        return true;
      } catch (error) {
        console.error('[POS Sync Error] Failed to execute inventory transaction write:', error);
        setIsSyncing(false);
        return false;
      }
    },
    [products, updateProduct, addOrder]
  );

  return {
    syncTransaction,
    isSyncing,
    lastSyncedAt,
  };
}
