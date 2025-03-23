import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: { email: string; password: string; fullName: string; mobileNumber: string }) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

// Temporary user data for testing
const TEMP_USERS = [
  {
    id: '1',
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
    mobileNumber: '+965 1234 5678',
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const user = TEMP_USERS.find(
          (u) => u.email === email && u.password === password
        );
        
        if (!user) {
          throw new Error('Invalid email or password');
        }
        
        const { password: _, ...userData } = user;
        set({ user: userData, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      signup: async (userData) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Check if user already exists
        const existingUser = TEMP_USERS.find(
          (u) => u.email === userData.email
        );
        
        if (existingUser) {
          throw new Error('Email already registered');
        }
        
        // Create new user
        const newUser = {
          id: (TEMP_USERS.length + 1).toString(),
          email: userData.email,
          password: userData.password,
          fullName: userData.fullName,
          mobileNumber: userData.mobileNumber,
        };
        
        // Add to temporary users (in real app, this would be an API call)
        TEMP_USERS.push(newUser);
        
        // Set the user state (excluding password)
        const { password: _, ...userDataWithoutPassword } = newUser;
        set({ user: userDataWithoutPassword, isAuthenticated: true });
      },
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            ...updates,
          } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
); 