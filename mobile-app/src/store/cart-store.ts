import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from '../utils/api-config';
import { Toast } from 'react-native-toast-notifications';

interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  incrementQuantity: (productId: string) => Promise<void>;
  decrementQuantity: (productId: string) => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      getTotalPrice: () => {
        const state = get();
        return state.items.reduce((sum, item) => 
          sum + (parseFloat(item.price) * item.quantity), 0
        );
      },
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.product_id === item.product_id);
          if (existingItem) {
            const newItems = state.items.map((i) =>
              i.product_id === item.product_id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            );
            return {
              items: newItems,
              total: get().getTotalPrice(),
            };
          }
          const newItems = [...state.items, item];
          return {
            items: newItems,
            total: get().getTotalPrice(),
          };
        });
      },
      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.product_id !== productId);
          return {
            items: newItems,
            total: get().getTotalPrice(),
          };
        });
      },
      clearCart: () => {
        set({ items: [], total: 0 });
      },
      incrementQuantity: async (productId) => {
        try {
          // Fetch current product quantity from API
          const response = await fetch(`https://new.azurakwt.com/index.php?route=extension/mstore/product|detail&productId=${productId}`);
          const data = await response.json();
          
          if (data.success === 1 && data.data) {
            const availableQuantity = data.data.quantity;
            
            set((state) => {
              const item = state.items.find((i) => i.product_id === productId);
              if (!item) return state;
              
              if (item.quantity >= availableQuantity) {
                Toast.show(`Only ${availableQuantity} items available.`, {
                  type: 'error',
                  placement: 'bottom',
                });
                return state;
              }
              
              const newItems = state.items.map((i) =>
                i.product_id === productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              );
              return {
                items: newItems,
                total: get().getTotalPrice(),
              };
            });
          }
        } catch (error) {
          console.error('Error checking product quantity:', error);
        }
      },
      decrementQuantity: (productId) => {
        set((state) => {
          const item = state.items.find((i) => i.product_id === productId);
          if (!item || item.quantity <= 1) return state;
          const newItems = state.items.map((i) =>
            i.product_id === productId
              ? { ...i, quantity: i.quantity - 1 }
              : i
          );
          return {
            items: newItems,
            total: get().getTotalPrice(),
          };
        });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);