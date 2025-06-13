import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  makeApiCall, 
  API_ENDPOINTS, 
  ApiResponse,
  setOCSESSID, 
  getCurrentOCSESSID, 
  NetworkErrorCodes, 
  API_BASE_URL, 
  getOrCreateOCSESSID,
  generateRandomOCSESSID 
} from '@utils/api-config';
import { Alert } from 'react-native';
import { useCartStore } from './cart-store';

// Constants imported from api-config
const OCSESSID_STORAGE_KEY = '@azura_ocsessid';

export interface Address {
  address_id: string;
  firstname: string;
  lastname: string;
  company: string;
  address_1: string;
  address_2: string;
  postcode: string;
  city: string;
  city_name?: string; // For shipping address responses
  zone_id: string;
  zone: string;
  zone_code?: string; // For shipping address responses
  country_id: string;
  country: string;
  iso_code_2?: string; // For shipping address responses
  iso_code_3?: string; // For shipping address responses
  address_format?: string; // For shipping address responses
  telephone?: string; // For shipping address responses
  custom_field: {
    '30': string; // block
    '31': string; // street  
    '32': string; // building
    '33': string; // apartment
    '35': string; // avenue
    [key: string]: any; // allow other fields
  };
  default: boolean;
}

export interface User {
  customer_id: string;
  firstname: string;
  lastname: string;
  email: string;
  telephone: string;
  token?: string;
}

export interface AuthState {
  user: User | null;
  addresses: Address[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  clearUser: () => void;
  signup: (userData: Omit<User, 'customer_id'> & { password: string }) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  fetchAddresses: () => Promise<Address[]>;
  addAddress: (address: Omit<Address, 'address_id'>) => Promise<void>;
  updateAddress: (address: Address) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  clearError: () => void;
  logout: () => void;
}

// Function to handle common API errors
const handleApiError = (error: any, fallbackMessage: string) => {
  console.error('Auth API Error:', error);
  
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      addresses: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          console.log('Attempting login with:', { email });

          // Generate and set a new OCSESSID for the session
          const ocsessid = await getOrCreateOCSESSID();
          await setOCSESSID(ocsessid);

          const response = await makeApiCall(API_ENDPOINTS.login, {
            method: 'POST',
            data: { 
              email, 
              password
            }
          });

          console.log('Login response:', response);

          if (response.success === 1 && response.data) {
            // Update user state with the correct data structure
            const userData = {
              customer_id: response.data.customer_id,
              firstname: response.data.firstname,
              lastname: response.data.lastname,
              email: response.data.email,
              telephone: response.data.telephone,
            };

            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            // After successful login, fetch user addresses
            try {
              const addresses = await get().fetchAddresses();
              set({ addresses });
            } catch (addressError) {
              console.error('Failed to fetch addresses after login:', addressError);
              // Continue even if address fetch fails
            }

            // Fetch cart after successful login
            console.log('Fetching cart after successful login');
            await useCartStore.getState().getCart();
            // Note: getCart() handles errors internally and doesn't throw
          } else {
            throw new Error(
              Array.isArray(response.error) ? response.error[0] : 'Invalid login credentials'
            );
          }
        } catch (error: any) {
          console.error('Login error:', error);
          
          // Get detailed error information for debugging
          const errorMessage = error.message || 'Login failed. Please try again.';
          const errorResponse = error.response?.data?.error || [];
          
          console.log('Login error details:', {
            message: errorMessage,
            response: error.response,
            errorData: errorResponse
          });
          
          set({ 
            isLoading: false, 
            error: errorMessage,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      clearUser: () => {
        set({ 
          user: null,
          addresses: [],
          isAuthenticated: false,
          error: null
        });
      },

      signup: async (userData) => {
        try {
          set({ isLoading: true, error: null });

          console.log('Attempting signup with:', { 
            email: userData.email,
            firstname: userData.firstname,
            lastname: userData.lastname 
          });

          // Generate and use a fresh OCSESSID for registration
          const freshOCSESSID = await generateRandomOCSESSID();
          await setOCSESSID(freshOCSESSID);

          try {
            const response = await makeApiCall(API_ENDPOINTS.register, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              data: {
                firstname: userData.firstname,
                lastname: userData.lastname,
                email: userData.email,
                telephone: userData.telephone,
                password: userData.password,
                confirm: userData.password, // Password confirmation
                agree: '1',  // Agreement to terms
                newsletter: '0', // Default to not subscribing to newsletter
                customer_group_id: '1', // Default customer group
                custom_field: {} // Empty custom fields object
              }
            });

            console.log('Signup response:', response);

            if (response.success === 1) {
              // If signup is successful, automatically log in
              try {
                await get().login(userData.email, userData.password);
              } catch (loginError) {
                console.error('Auto-login after signup failed:', loginError);
                // Still consider signup successful even if auto-login fails
                set({
                  isLoading: false,
                  error: null
                });
              }
            } else {
              throw new Error(
                Array.isArray(response.error) ? response.error[0] : 'Registration failed'
              );
            }
          } catch (error: any) {
            console.error('Signup API error:', error);
            
            // Check for server-side errors in the response
            if (error.response?.data && typeof error.response.data === 'string') {
              // Handle the specific utf8_strlen error from the server
              if (error.response.data.includes('utf8_strlen()')) {
                console.error('Server has a function definition error. Treating as temporary server issue.');
                throw new Error('The registration service is temporarily unavailable. Please try again later or contact support.');
              }
            }
            
            throw error; // Rethrow for general error handling
          }
        } catch (error: any) {
          console.error('Signup error:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Registration failed. Please try again.',
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      updateUser: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('You must be logged in to update your profile');
          }

          const response = await makeApiCall(API_ENDPOINTS.updateProfile, {
            method: 'POST',
            data: { 
              firstname: userData.firstname || currentUser.firstname,
              lastname: userData.lastname || currentUser.lastname,
              email: userData.email || currentUser.email,
              telephone: userData.telephone || currentUser.telephone
            }
          });

          if (response.success === 1) {
            set({
              user: { ...currentUser, ...userData },
              isLoading: false
            });
          } else {
            throw new Error(
              Array.isArray(response.error) ? response.error[0] : 'Failed to update profile'
            );
          }
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to update profile' 
          });
          throw error;
        }
      },

      fetchAddresses: async () => {
        set({ isLoading: true, error: null });

        try {
          // Must be authenticated
          const { isAuthenticated } = useAuthStore.getState();
          if (!isAuthenticated) {
            console.warn('User not authenticated, cannot fetch addresses');
            set({ isLoading: false });
            return [];
          }

          console.log('Fetching addresses from server...');
          
          // Use the proper addresses endpoint with GET method
          const response = await makeApiCall(API_ENDPOINTS.addresses, {
            method: 'GET'
          });

          console.log('Addresses fetch response:', response);

          if (response.success === 1 && Array.isArray(response.data)) {
            // We got an array of addresses from the server
            console.log('Successfully retrieved addresses:', response.data);
            return response.data;
          } else {
            // Probably an empty array or an error
            console.warn('Unexpected address response format:', response);
            return [];
          }
        } catch (error: any) {
          console.error('Error fetching addresses:', error);
          set({ isLoading: false, error: error.message || 'Failed to fetch addresses' });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      addAddress: async (address) => {
        try {
          set({ isLoading: true, error: null });
          
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('You must be logged in to add an address');
          }
          
          // Create FormData for multipart/form-data request
          const formData = new FormData();
          
          // DO NOT include address_id for new addresses
          // The server expects address_id to be absent for new address creation
          
          formData.append('firstname', address.firstname);
          formData.append('lastname', address.lastname);
          formData.append('company', address.company || '');
          formData.append('address_1', address.address_1);
          formData.append('address_2', address.address_2 || '');
          formData.append('city', address.city);
          formData.append('postcode', address.postcode || '');
          formData.append('country_id', address.country_id || '114'); // Kuwait default
          formData.append('zone_id', address.zone_id || '1785');  // Kuwait City default
          
          // Add custom fields
          if (address.custom_field) {
            Object.entries(address.custom_field).forEach(([key, value]) => {
              formData.append(`custom_field[${key}]`, String(value));
            });
          }
          
          // Add default flag
          formData.append('default', address.default ? '1' : '0');
          
          console.log('Adding address with data:', {
            firstname: address.firstname,
            lastname: address.lastname,
            city: address.city,
            custom_fields: address.custom_field
          });
          
          const response = await makeApiCall(API_ENDPOINTS.editAddress, {
            method: 'POST',
            data: formData,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          console.log('Add address API response:', response);
          
          if (response.success === 1) {
            // Fetch updated addresses
            const addresses = await get().fetchAddresses();
            set({ addresses, isLoading: false });
            return response.data;
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
          throw error;
        }
      },

      updateAddress: async (address) => {
        try {
          set({ isLoading: true, error: null });
          
          // Use account|edit_address endpoint with POST method as specified in the documentation
          // Format data as form-data as specified in the documentation
          const formData = new FormData();
          
          // Add address_id for the address to update
          formData.append('address_id', address.address_id);
          formData.append('firstname', address.firstname);
          formData.append('lastname', address.lastname);
          formData.append('country_id', address.country_id);
          formData.append('zone_id', address.zone_id);
          formData.append('city', address.city);
          
          // Handle custom fields for block, street, etc.
          if (address.custom_field) {
            if (address.custom_field['30']) formData.append('custom_field[30]', address.custom_field['30']);
            if (address.custom_field['31']) formData.append('custom_field[31]', address.custom_field['31']);
            if (address.custom_field['32']) formData.append('custom_field[32]', address.custom_field['32']);
            if (address.custom_field['33']) formData.append('custom_field[33]', address.custom_field['33']);
          }
          
          formData.append('address_2', address.address_2 || '');
          formData.append('default', address.default ? '1' : '0');
          
          const response = await makeApiCall(API_ENDPOINTS.editAddress, {
            method: 'POST',
            data: formData
          });
          
          if (response.success === 1) {
            // Address updated successfully
            set({ isLoading: false });
          } else {
            throw new Error(
              Array.isArray(response.error) ? response.error[0] : 'Failed to update address'
            );
          }
        } catch (error: any) {
          console.error('Update address error:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to update address' 
          });
          throw error;
        }
      },

      deleteAddress: async (addressId) => {
        try {
          set({ isLoading: true, error: null });
          
          // Check if user is authenticated
          if (!get().isAuthenticated || !get().user) {
            throw new Error('You must be logged in to delete an address');
          }
          
          // Use account|edit_address endpoint with POST method to delete an address
          const formData = new FormData();
          formData.append('address_id', addressId);
          formData.append('remove', '1'); // Flag to indicate deletion
          
          // Include user information as required
          formData.append('firstname', get().user?.firstname || '');
          formData.append('lastname', get().user?.lastname || '');
          
          console.log('Deleting address:', {
            address_id: addressId,
            remove: '1'
          });
          
          const response = await makeApiCall(API_ENDPOINTS.editAddress, {
            method: 'POST',
            data: formData
          });
          
          console.log('Delete address response:', response);
          
          if (response.success === 1) {
            // Address deleted successfully
            // Update the local addresses list by removing the deleted address
            const updatedAddresses = get().addresses.filter(
              address => address.address_id !== addressId
            );
            set({ addresses: updatedAddresses, isLoading: false });
            Alert.alert('Success', 'Address deleted successfully');
          } else {
            throw new Error(
              Array.isArray(response.error) ? response.error[0] : 'Failed to delete address'
            );
          }
        } catch (error: any) {
          console.error('Delete address error:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to delete address' 
          });
          Alert.alert('Error', error.message || 'Failed to delete address');
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      logout: () => {
        set({ 
          isAuthenticated: false, 
          user: null,
          addresses: [],
          isLoading: false,
          error: null
        });
        // Clear cart when logging out
        useCartStore.getState().clearCart();
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 