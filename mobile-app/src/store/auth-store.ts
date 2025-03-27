import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeApiCall, API_ENDPOINTS, NetworkErrorCodes } from '../utils/api-config';
import { Alert } from 'react-native';

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
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: Omit<User, 'customer_id'> & { password: string }) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  clearError: () => void;
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
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          console.log('Attempting login with:', { email });

          const response = await makeApiCall(API_ENDPOINTS.login, {
            method: 'POST',
            data: { 
              email, 
              password,
              // Add required parameters from API docs
              redirect: '',
              agree: '1'
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

            // Fetch user profile after successful login
            try {
              const profileResponse = await makeApiCall(API_ENDPOINTS.profile, {
                method: 'GET'
              });

              if (profileResponse.success === 1 && profileResponse.data) {
                set({
                  user: {
                    ...userData,
                    ...profileResponse.data
                  }
                });
              }
            } catch (profileError) {
              console.error('Error fetching profile after login:', profileError);
              // Don't fail the login if profile fetch fails
            }
          } else {
            throw new Error(
              Array.isArray(response.error) ? response.error[0] : 'Invalid login credentials'
            );
          }
        } catch (error: any) {
          console.error('Login error:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Login failed. Please try again.',
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          
          // Attempt to call logout API endpoint, but don't wait for it
          // This ensures we log out locally even if the API call fails
          makeApiCall(API_ENDPOINTS.logout, { method: 'POST' })
            .catch(err => console.error('Logout API error:', err));
          
          // Always clear local state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Still clear local state even if there's an error
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },

      signup: async (userData) => {
        try {
          set({ isLoading: true, error: null });

          console.log('Attempting signup with:', { 
            email: userData.email,
            firstname: userData.firstname,
            lastname: userData.lastname 
          });

          const response = await makeApiCall(API_ENDPOINTS.register, {
            method: 'POST',
            data: {
              ...userData,
              // Add required parameters from API docs
              agree: '1',
              newsletter: '0'
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
                user: {
                  customer_id: '0',
                  ...userData,
                },
                isAuthenticated: true,
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
            data: { ...userData }
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

      forgotPassword: async (email) => {
        try {
          set({ isLoading: true, error: null });

          const response = await makeApiCall(API_ENDPOINTS.forgotPassword, {
            method: 'POST',
            data: { email }
          });

          if (response.success === 1) {
            set({ isLoading: false });
            Alert.alert(
              'Password Reset',
              'Password reset instructions have been sent to your email'
            );
          } else {
            throw new Error(
              Array.isArray(response.error) ? response.error[0] : 'Failed to reset password'
            );
          }
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to reset password' 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
); 