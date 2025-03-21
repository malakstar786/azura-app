import { create } from 'zustand';
import { ImageSourcePropType } from 'react-native';
import { Product } from '../assets/types/product';

export type CartItemType = Product & {
  quantity: number;
};

type CartStore = {
  items: CartItemType[];
  addItem: (item: Product) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  incrementItem: (id: number) => void;
  decrementItem: (id: number) => void;
  getTotalPrice: () => string;
  getItemCount: () => number;
};

const initialCartItems: CartItemType[] = [];

export const useCartStore = create<CartStore>((set, get) => ({
  items: initialCartItems,
  addItem: (item: Product) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    });
  },
  removeItem: (id: number) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
  updateQuantity: (id: number, quantity: number) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    }));
  },
  incrementItem: (id: number) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      ),
    }));
  },
  decrementItem: (id: number) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  },
  getTotalPrice: () => {
    const total = get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return total.toFixed(3);
  },
  getItemCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  },
}));