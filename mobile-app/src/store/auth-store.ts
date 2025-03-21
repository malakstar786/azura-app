import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
  id: string;
  email: string;
  fullName: string;
  mobileNumber: string;
};

interface AuthState {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { email: string; password: string; fullName: string; mobile: string; }) => Promise<void>;
  signOut: () => void;
  checkEmail: (email: string) => Promise<void>;
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
    (set) => ({
      user: null,
      signIn: async (email: string, password: string) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const user = TEMP_USERS.find(
          (u) => u.email === email && u.password === password
        );
        
        if (!user) {
          throw new Error('Invalid email or password');
        }
        
        const { password: _, ...userData } = user;
        set({ user: userData });
      },
      signUp: async (data) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Check if user already exists
        const existingUser = TEMP_USERS.find(
          (u) => u.email === data.email
        );
        
        if (existingUser) {
          throw new Error('Email already registered');
        }
        
        // Create new user
        const newUser = {
          id: (TEMP_USERS.length + 1).toString(),
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          mobileNumber: data.mobile,
        };
        
        // Add to temporary users (in real app, this would be an API call)
        TEMP_USERS.push(newUser);
        
        // Set the user state (excluding password)
        const { password: _, ...userData } = newUser;
        set({ user: userData });
      },
      checkEmail: async (email: string) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Check if user exists
        const user = TEMP_USERS.find(
          (u) => u.email === email
        );
        
        if (!user) {
          throw new Error('Email not registered');
        }
        
        // In a real app, this would trigger a password reset email
        // For now, we just simulate success
        return;
      },
      signOut: () => {
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
); 