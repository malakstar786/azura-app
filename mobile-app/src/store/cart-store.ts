import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../assets/types/product';
import { ImageSourcePropType } from 'react-native';

export type CartItemType = {
  id: number;
  title: string;
  price: number;
  heroImage: ImageSourcePropType;
  quantity: number;
};

export interface CartStore {
  items: CartItemType[];
  total: number;
  addItem: (item: CartItemType) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  incrementItem: (itemId: number) => void;
  decrementItem: (itemId: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.id === item.id);

        if (existingItem) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            total: state.total + item.price,
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...item, quantity: 1 }],
            total: state.total + item.price,
          }));
        }
      },
      removeItem: (itemId) => {
        const { items } = get();
        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
          total: state.total - item.price * item.quantity,
        }));
      },
      updateQuantity: (itemId, quantity) => {
        const { items } = get();
        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        const oldTotal = item.price * item.quantity;
        const newTotal = item.price * quantity;

        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
          total: state.total - oldTotal + newTotal,
        }));
      },
      incrementItem: (itemId) => {
        const { items } = get();
        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
          ),
          total: state.total + item.price,
        }));
      },
      decrementItem: (itemId) => {
        const { items } = get();
        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        if (item.quantity === 1) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
          ),
          total: state.total - item.price,
        }));
      },
      clearCart: () => {
        set({ items: [], total: 0 });
      },
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);