import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { makeApiCall, API_ENDPOINTS } from '../utils/api-config';
import { useAuthStore } from './auth-store';

// Define Address interface for UI usage
interface Address {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  block: string;
  street: string;
  houseNumber: string;
  apartmentNumber: string;
  additionalDetails: string;
  isDefault: boolean;
}

// Convert UI address format to API format
const convertToApiAddress = (address: Address | Omit<Address, 'id'>, addressId: string = '') => {
  const formData = new FormData();
  
  // Add address_id if provided
  if (addressId) {
    formData.append('address_id', addressId);
  }
  
  // Add required fields
  formData.append('firstname', address.firstName);
  formData.append('lastname', address.lastName);
  formData.append('country_id', '114'); // Kuwait
  formData.append('zone_id', ''); // Not used but required
  formData.append('city', address.city);
  
  // Format address_1 with block, street, and house number
  formData.append('address_1', `${address.block}, Block ${address.block}, Street ${address.street}, House/Building ${address.houseNumber}${address.apartmentNumber ? ', Apt ' + address.apartmentNumber : ''}`);
  formData.append('address_2', address.additionalDetails);
  
  // Add custom fields
  formData.append('custom_field[30]', address.block);
  formData.append('custom_field[31]', address.street);
  formData.append('custom_field[32]', address.houseNumber);
  formData.append('custom_field[33]', address.apartmentNumber);
  
  // Add default flag
  formData.append('default', address.isDefault ? '1' : '0');
  
  return formData;
};

// Helper function to convert API address format to UI format
export const convertToUIAddress = (authAddress: any): Address => {
  // Get user's telephone from auth store to use for mobile number
  const { user } = useAuthStore.getState();
  
  // Handle custom fields to extract block, street, etc.
  const customField = authAddress.custom_field || {};
  const block = typeof customField === 'object' ? customField['30'] || '' : '';
  const street = typeof customField === 'object' ? customField['31'] || '' : '';
  const houseNumber = typeof customField === 'object' ? customField['32'] || '' : '';
  const apartmentNumber = typeof customField === 'object' ? customField['33'] || '' : '';
  
  return {
    id: authAddress.address_id,
    firstName: authAddress.firstname || '',
    lastName: authAddress.lastname || '',
    city: authAddress.city || '',
    block: block,
    street: street,
    houseNumber: houseNumber,
    apartmentNumber: apartmentNumber,
    additionalDetails: authAddress.address_2 || '',
    isDefault: Boolean(authAddress.default)
  };
};

interface AddressStore {
  addresses: Address[];
  selectedAddress: string | null;
  isLoading: boolean;
  error: string | null;
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Omit<Address, 'id'>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setSelectedAddress: (id: string) => void;
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddress: null,
      isLoading: false,
      error: null,
      
      fetchAddresses: async () => {
        set({ isLoading: true, error: null });

        try {
          // Get addresses from auth store
          const addresses = await useAuthStore.getState().fetchAddresses();
          
          if (Array.isArray(addresses)) {
            console.log('Raw addresses from API:', addresses);
            
            // Convert addresses to UI format
            const uiAddresses: Address[] = addresses.map(addr => {
              const customField = addr.custom_field || {};
              return {
                id: addr.address_id,
                firstName: addr.firstname,
                lastName: addr.lastname,
                city: addr.city,
                block: typeof customField === 'object' ? customField['30'] || '' : '',
                street: typeof customField === 'object' ? customField['31'] || '' : '',
                houseNumber: typeof customField === 'object' ? customField['32'] || '' : '',
                apartmentNumber: typeof customField === 'object' ? customField['33'] || '' : '',
                additionalDetails: addr.address_2 || '',
                isDefault: addr.default === true
              };
            });

            console.log('Converted UI addresses:', uiAddresses);
            set({ addresses: uiAddresses, isLoading: false });
          } else {
            console.warn('No addresses received from auth store');
            set({ addresses: [], isLoading: false });
          }
        } catch (error: any) {
          console.error('Error in address store:', error);
          set({ 
            addresses: [], 
            isLoading: false, 
            error: error.message || 'Failed to fetch addresses' 
          });
        }
      },
      
      addAddress: async (address: Omit<Address, 'id'>) => {
        try {
          set({ isLoading: true, error: null });

          // Convert UI address to auth format
          const authAddress = convertToApiAddress(address, '');

          // Use the account|edit_address endpoint with POST method
          const response = await makeApiCall(API_ENDPOINTS.editAddress, {
            method: 'POST',
            data: authAddress
          });

          if (response.success === 1) {
            // Refresh addresses list
            await get().fetchAddresses();
          } else {
            throw new Error(Array.isArray(response.error) ? response.error[0] : 'Failed to add address');
          }
        } catch (error: any) {
          console.error('Error adding address:', error);
          set({ error: error.message || 'Failed to add address' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateAddress: async (id: string, address: Omit<Address, 'id'>) => {
        try {
          set({ isLoading: true, error: null });

          // Convert UI address to auth format
          const authAddress = convertToApiAddress(address, id);

          // Use the account|edit_address endpoint with POST method
          const response = await makeApiCall(API_ENDPOINTS.editAddress, {
            method: 'POST',
            data: authAddress
          });

          if (response.success === 1) {
            // Refresh addresses list
            await get().fetchAddresses();
          } else {
            throw new Error(Array.isArray(response.error) ? response.error[0] : 'Failed to update address');
          }
        } catch (error: any) {
          console.error('Error updating address:', error);
          set({ error: error.message || 'Failed to update address' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      deleteAddress: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Check if user is authenticated
          const { isAuthenticated } = useAuthStore.getState();
          if (!isAuthenticated) {
            throw new Error('You must be logged in to delete an address');
          }
          
          // Create form data
          const formData = new FormData();
          formData.append('address_id', String(id));
          formData.append('remove', '1');
          
          const response = await makeApiCall(API_ENDPOINTS.editAddress, {
            method: 'POST',
            data: formData
          });
          
          if (response.success === 1) {
            // Refresh addresses after deleting
            await get().fetchAddresses();
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
        } finally {
          set({ isLoading: false });
        }
      },
      
      setSelectedAddress: (id: string) => {
        set({ selectedAddress: id });
      },
    }),
    {
      name: 'address-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 