import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeApiCall, API_ENDPOINTS, NetworkErrorCodes } from '../utils/api-config';
import { useAuthStore } from './auth-store';
import { Alert } from 'react-native';

export interface Address {
  address_id?: string;
  firstname: string;
  lastname: string;
  country_id: string;
  zone_id: string;
  city: string;
  custom_field: {
    '30': string; // block
    '31': string; // street
    '32': string; // house/building
    '33': string; // apartment
  };
  address_1: string;
  address_2?: string;
  default?: string | boolean;
  telephone?: string;
}

export interface AddressState {
  addresses: Address[];
  selectedAddress: string | null;
  isLoading: boolean;
  error: string | null;
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, 'address_id'>) => Promise<void>;
  updateAddress: (addressId: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  selectAddress: (addressId: string) => void;
  clearError: () => void;
}

// Helper function to handle API errors
const handleApiError = (error: any, fallbackMessage: string): never => {
  console.error('Address API Error:', error);
  
  if (error.code === NetworkErrorCodes.NO_CONNECTION) {
    throw new Error('Unable to connect to server. Please check your internet connection and try again.');
  } else if (error.code === NetworkErrorCodes.TIMEOUT) {
    throw new Error('Request timed out. Please try again.');
  } else if (error.response?.data?.error) {
    // Handle server error messages
    const errorMessage = Array.isArray(error.response.data.error) 
      ? error.response.data.error[0] 
      : error.response.data.error;
    throw new Error(errorMessage || fallbackMessage);
  } else {
    throw new Error(error.message || fallbackMessage);
  }
};

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddress: null,
      isLoading: false,
      error: null,

      fetchAddresses: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Check if user is authenticated
          const { isAuthenticated } = useAuthStore.getState();
          if (!isAuthenticated) {
            set({ isLoading: false });
            return;
          }

          const response = await makeApiCall(API_ENDPOINTS.addresses, {
            method: 'GET'
          });

          if (response.success === 1 && Array.isArray(response.data)) {
            set({ 
              addresses: response.data, 
              isLoading: false,
              // Select default address if available
              selectedAddress: response.data.find(addr => addr.default === '1')?.address_id || 
                              (response.data.length > 0 ? response.data[0].address_id : null)
            });
          } else {
            throw new Error(
              Array.isArray(response.error) ? response.error[0] : 'Failed to fetch addresses'
            );
          }
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to fetch addresses'
          });
          console.error('Fetch addresses error:', error);
          // Don't throw here to prevent UI disruption
        }
      },

      addAddress: async (address) => {
        try {
          set({ isLoading: true, error: null });
          
          // Check if user is authenticated
          const { isAuthenticated } = useAuthStore.getState();
          if (!isAuthenticated) {
            throw new Error('You must be logged in to add an address');
          }

          // Ensure the address has default flag (usually '1' for true)
          const addressWithDefault = {
            ...address,
            default: address.default || '1'
          };

          const response = await makeApiCall(API_ENDPOINTS.addAddress, {
            method: 'POST',
            data: addressWithDefault
          });

          if (response.success === 1) {
            // Fetch addresses again to get the updated list with IDs
            await get().fetchAddresses();
            
            // Show success message
            Alert.alert('Success', 'Address added successfully');
          } else {
            throw new Error(
              Array.isArray(response.error) ? response.error[0] : 'Failed to add address'
            );
          }
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to add address'
          });
          
          Alert.alert('Error', error.message || 'Failed to add address');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateAddress: async (addressId, addressUpdates) => {
        try {
          set({ isLoading: true, error: null });
          
          // Check if user is authenticated
          const { isAuthenticated } = useAuthStore.getState();
          if (!isAuthenticated) {
            throw new Error('You must be logged in to update an address');
          }

          // Get the current address
          const currentAddress = get().addresses.find(a => a.address_id === addressId);
          if (!currentAddress) {
            throw new Error('Address not found');
          }

          // Merge current address with updates
          const updatedAddress = {
            ...currentAddress,
            ...addressUpdates,
            address_id: addressId
          };

          const response = await makeApiCall(API_ENDPOINTS.editAddress, {
            method: 'POST',
            data: updatedAddress
          });

          if (response.success === 1) {
            // Fetch addresses again to get the updated list
            await get().fetchAddresses();
            
            // Show success message
            Alert.alert('Success', 'Address updated successfully');
          } else {
            throw new Error(
              Array.isArray(response.error) ? response.error[0] : 'Failed to update address'
            );
          }
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to update address'
          });
          
          Alert.alert('Error', error.message || 'Failed to update address');
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteAddress: async (addressId) => {
        try {
          set({ isLoading: true, error: null });
          
          // Check if user is authenticated
          const { isAuthenticated } = useAuthStore.getState();
          if (!isAuthenticated) {
            throw new Error('You must be logged in to delete an address');
          }

          const response = await makeApiCall(API_ENDPOINTS.deleteAddress, {
            method: 'POST',
            data: { address_id: addressId }
          });

          if (response.success === 1) {
            // Update local state
            const updatedAddresses = get().addresses.filter(a => a.address_id !== addressId);
            
            // Update selectedAddress if it was deleted
            let newSelectedId = get().selectedAddress;
            if (newSelectedId === addressId) {
              newSelectedId = updatedAddresses.length > 0 ? updatedAddresses[0].address_id || null : null;
            }
            
            set({ 
              addresses: updatedAddresses,
              selectedAddress: newSelectedId,
              isLoading: false
            });
            
            // Show success message
            Alert.alert('Success', 'Address deleted successfully');
          } else {
            throw new Error(
              Array.isArray(response.error) ? response.error[0] : 'Failed to delete address'
            );
          }
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to delete address'
          });
          
          Alert.alert('Error', error.message || 'Failed to delete address');
          throw error;
        }
      },

      selectAddress: (addressId) => {
        const addresses = get().addresses;
        const addressExists = addresses.some(a => a.address_id === addressId);
        
        if (addressExists) {
          set({ selectedAddress: addressId });
        } else {
          console.warn(`Address with ID ${addressId} does not exist`);
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'address-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 