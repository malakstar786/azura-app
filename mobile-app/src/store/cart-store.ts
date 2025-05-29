import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'react-native-toast-notifications';
import { 
  fetchCartData, 
  addToCart as apiAddToCart, 
  updateCartQuantity as apiUpdateCartQuantity,
  removeCartItem as apiRemoveCartItem,
  emptyCart as apiEmptyCart
} from '../utils/api-config';

export interface CartItem {
  cart_id: string;
  product_id: string;
  name: string;
  model: string;
  thumb: string;    // Thumbnail image URL
  image?: string;   // Full image URL (might not be present)
  sku: string;
  quantity: string | number;
  stock: boolean;   // Whether the item is in stock
  minimum: boolean; // Whether quantity is at minimum
  maximum: boolean; // Whether quantity is at maximum
  reward: number;   // Reward points
  price: string;    // Price with currency, e.g. "0.500 KD"
  total: string;    // Total price with currency, e.g. "0.500 KD"
  option?: any[];   // Product options
  href?: string;    // Product URL
}

export interface CartApiResponse {
  success: number;
  error: string[];
  data: null | { 
    total_product_count?: number; 
    products?: CartItem[];
  };
}

interface CartStore {
  items: CartItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
  
  // API operations
  getCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (cartId: string) => Promise<void>;
  updateQuantity: (cartId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // UI convenience methods
  incrementQuantity: (cartId: string) => Promise<void>;
  decrementQuantity: (cartId: string) => Promise<void>;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      isLoading: false,
      error: null,

      getCart: async () => {
        try {
          set({ isLoading: true, error: null });
          console.log('Fetching cart data...');

          const response = await fetchCartData();
          console.log('Cart response:', response);

          if (response.success === 1) {
            // Handle case where the response data is null (empty cart)
            if (!response.data) {
              console.log('Cart is empty (null data)');
              set({ 
                items: [],
                total: 0,
                isLoading: false
              });
              return;
            }
            
            // Handle case where data contains total_product_count
            if (response.data && typeof response.data === 'object' && 'total_product_count' in response.data) {
              console.log(`Cart has ${response.data.total_product_count} items count`);
              
              if (!response.data.total_product_count) {
                set({
                  items: [],
                  total: 0,
                  isLoading: false
                });
                return;
              }
            }
            
            // Handle case where data contains products array
            if (response.data && typeof response.data === 'object' && 'products' in response.data) {
              const products = response.data.products || [];
              console.log(`Cart has ${products.length} products`);
              
              set({
                items: products,
                total: products.reduce((sum: number, item: CartItem) => {
                  const price = typeof item.price === 'string' 
                    ? parseFloat(item.price.replace(/[^\d.]/g, '')) 
                    : 0;
                  const quantity = typeof item.quantity === 'string' 
                    ? parseInt(item.quantity, 10) 
                    : (typeof item.quantity === 'number' ? item.quantity : 0);
                    
                  return sum + (price * quantity);
                }, 0),
                isLoading: false
              });
              return;
            }

            // Fallback for unexpected response format
            console.warn('Unexpected cart response format:', response.data);
            set({ 
              items: [],
              total: 0,
              isLoading: false
            });
          } else {
            throw new Error(
              Array.isArray(response.error) ? response.error[0] : 'Failed to fetch cart'
            );
          }
        } catch (error: any) {
          console.error('Error fetching cart:', error);
          
          // Check for specific network errors
          let errorMessage = 'Failed to fetch cart';
          if (error.message === 'Network request failed') {
            errorMessage = 'Network connection failed. Please check your internet connection and try again.';
          } else if (error.message === 'Failed to fetch') {
            errorMessage = 'Unable to connect to the server. Please try again.';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ 
            isLoading: false, 
            error: errorMessage,
            items: [], // Ensure items are initialized even on error
            total: 0
          });
          // Don't rethrow the error - handle it gracefully
        }
      },

      addToCart: async (productId: string, quantity: number = 1) => {
        try {
          set({ isLoading: true, error: null });
          console.log(`Adding product ${productId} to cart, quantity: ${quantity}`);
          
          const response = await apiAddToCart(productId, quantity);
          
          if (response.success === 1) {
            // Refresh cart after successful add
            await get().getCart();
            Toast.show('Product has been added to your cart.', {
              type: 'success',
              placement: 'bottom',
              duration: 2000
            });
          } else {
            throw new Error(
              Array.isArray(response.error) ? response.error[0] : 'Failed to add product to cart'
            );
          }
        } catch (error: any) {
          console.error('Error adding to cart:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to add product to cart'
          });
          Toast.show(error.message || 'Failed to add product to cart', {
            type: 'error',
            placement: 'bottom',
            duration: 2000
          });
        }
      },
      
      removeItem: async (cartId: string) => {
        try {
          set({ isLoading: true, error: null });
          console.log(`Removing item ${cartId} from cart`);
          
          const response = await apiRemoveCartItem(cartId);
          
          if (response.success === 1) {
            try {
              // Get current items to check if this is the last item
              const currentItems = get().items;
              if (currentItems.length === 1) {
                // If we're removing the last item, just set to empty directly rather than fetching
                console.log('Removing last item from cart, setting to empty');
                set({ 
                  items: [],
                  total: 0,
                  isLoading: false
                });
              } else {
                // Otherwise refresh cart after successful removal
                await get().getCart();
              }
              
              Toast.show('Product removed from cart', {
                type: 'success',
                placement: 'bottom',
                duration: 2000
              });
            } catch (fetchError) {
              console.error('Error refreshing cart after item removal:', fetchError);
              // If getCart fails, ensure we update the UI anyway by removing the item locally
              const remainingItems = get().items.filter(item => item.cart_id !== cartId);
              set({
                items: remainingItems,
                total: remainingItems.reduce((sum: number, item: CartItem) => {
                  const price = typeof item.price === 'string' 
                    ? parseFloat(item.price.replace(/[^\d.]/g, '')) 
                    : 0;
                  const quantity = typeof item.quantity === 'string' 
                    ? parseInt(item.quantity, 10) 
                    : (typeof item.quantity === 'number' ? item.quantity : 0);
                    
                  return sum + (price * quantity);
                }, 0),
                isLoading: false
              });
            }
          } else {
            throw new Error(
              Array.isArray(response.error) ? response.error[0] : 'Failed to remove product from cart'
            );
          }
        } catch (error: any) {
          console.error('Error removing from cart:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to remove product from cart'
          });
          Toast.show(error.message || 'Failed to remove product from cart', {
            type: 'error',
            placement: 'bottom',
            duration: 2000
          });
        }
      },
      
      clearCart: async () => {
        try {
          set({ isLoading: true, error: null });
          console.log('Clearing cart');
          
          const response = await apiEmptyCart();
          
          if (response.success === 1) {
            set({ 
              items: [],
              total: 0,
              isLoading: false
            });
            Toast.show('Cart cleared', {
              type: 'success',
              placement: 'bottom',
              duration: 2000
            });
          } else {
            throw new Error(
              Array.isArray(response.error) ? response.error[0] : 'Failed to clear cart'
            );
          }
        } catch (error: any) {
          console.error('Error clearing cart:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to clear cart'
          });
          Toast.show(error.message || 'Failed to clear cart', {
            type: 'error',
            placement: 'bottom',
            duration: 2000
          });
        }
      },
      
      updateQuantity: async (cartId: string, newQuantity: number) => {
        try {
          if (newQuantity <= 0) {
            // If quantity is 0 or negative, remove the item
            return await get().removeItem(cartId);
          }
          
          set({ isLoading: true, error: null });
          console.log(`Updating quantity for item ${cartId} to ${newQuantity}`);
          
          const response = await apiUpdateCartQuantity(cartId, newQuantity);
          
          if (response.success === 1) {
            // Refresh cart after successful update
            await get().getCart();
            Toast.show('Cart updated', {
              type: 'success',
              placement: 'bottom',
              duration: 2000
            });
          } else {
            throw new Error(
              Array.isArray(response.error) ? response.error[0] : 'Failed to update cart'
            );
          }
        } catch (error: any) {
          console.error('Error updating cart quantity:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to update cart'
          });
          Toast.show(error.message || 'Failed to update cart', {
            type: 'error',
            placement: 'bottom',
            duration: 2000
          });
        }
      },
      
      incrementQuantity: async (cartId: string) => {
        const item = get().items.find(i => i.cart_id === cartId);
        if (!item) return;
        
        const currentQuantity = typeof item.quantity === 'string' 
          ? parseInt(item.quantity, 10) 
          : (typeof item.quantity === 'number' ? item.quantity : 0);
          
        await get().updateQuantity(cartId, currentQuantity + 1);
      },
      
      decrementQuantity: async (cartId: string) => {
        const item = get().items.find(i => i.cart_id === cartId);
        if (!item) return;
        
        const currentQuantity = typeof item.quantity === 'string' 
          ? parseInt(item.quantity, 10) 
          : (typeof item.quantity === 'number' ? item.quantity : 0);
          
        if (currentQuantity <= 1) return;
        
        await get().updateQuantity(cartId, currentQuantity - 1);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((sum: number, item: CartItem) => {
          const price = typeof item.price === 'string' 
            ? parseFloat(item.price.replace(/[^\d.]/g, '')) 
            : 0;
          const quantity = typeof item.quantity === 'string' 
            ? parseInt(item.quantity, 10) 
            : (typeof item.quantity === 'number' ? item.quantity : 0);
            
          return sum + (price * quantity);
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);