import { create } from 'zustand';
import { Alert } from 'react-native';
import { makeApiCall, API_ENDPOINTS } from '../utils/api-config';

export interface Order {
  order_id: string;
  firstname: string;
  lastname: string;
  status: string;
  date_added: string;
  total: string;
  currency_code: string;
  currency_value: string;
}

interface OrderStore {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    try {
      set({ isLoading: true, error: null });
      console.log('Fetching order history...');

      const response = await makeApiCall(API_ENDPOINTS.orderHistory, {
        method: 'GET'
      });

      console.log('Order history response:', response);

      if (response.success === 1 && Array.isArray(response.data)) {
        // Process orders to ensure all required fields are present
        const enhancedOrders = response.data.map((order: Order) => {
          return {
            ...order,
            // Ensure required fields have default values if missing
            status: order.status || 'Processing',
            currency_code: order.currency_code || 'KWD',
            currency_value: order.currency_value || '1.000'
          };
        });

        set({ 
          orders: enhancedOrders, 
          isLoading: false 
        });
      } else {
        console.warn('No orders received or invalid format:', response);
        set({ 
          orders: [], 
          isLoading: false,
          error: 'No orders found'
        });
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      const errorMessage = error.message || 'Failed to load orders';
      set({ 
        isLoading: false, 
        error: errorMessage 
      });
      
      if (!error.handled) {
        Alert.alert('Error', errorMessage);
      }
    }
  }
})); 