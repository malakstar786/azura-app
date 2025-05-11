import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'ar';

interface LanguageState {
  currentLanguage: Language;
  isFirstTime: boolean;
  isLoading: boolean;
  setLanguage: (language: Language) => Promise<void>;
  setFirstTimeComplete: () => Promise<void>;
  initialize: () => Promise<{ language: Language; isFirstTime: boolean }>;
}

const LANGUAGE_STORAGE_KEY = '@azura_language';
const FIRST_TIME_STORAGE_KEY = '@azura_first_time';

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: 'en',
  isFirstTime: true,
  isLoading: true,

  setLanguage: async (language: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      set({ currentLanguage: language });
    } catch (error) {
      console.error('Failed to store language preference:', error);
    }
  },

  setFirstTimeComplete: async () => {
    try {
      await AsyncStorage.setItem(FIRST_TIME_STORAGE_KEY, 'false');
      set({ isFirstTime: false });
    } catch (error) {
      console.error('Failed to update first time status:', error);
    }
  },

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // Check if it's first time
      const firstTimeValue = await AsyncStorage.getItem(FIRST_TIME_STORAGE_KEY);
      const isFirstTime = firstTimeValue === null || firstTimeValue === 'true';
      
      // Get stored language or default to English
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      const language = (storedLanguage === 'ar' ? 'ar' : 'en') as Language;
      
      set({ 
        currentLanguage: language,
        isFirstTime,
        isLoading: false 
      });
      
      return { language, isFirstTime };
    } catch (error) {
      console.error('Failed to initialize language store:', error);
      set({ 
        currentLanguage: 'en',
        isFirstTime: false,
        isLoading: false 
      });
      return { language: 'en' as Language, isFirstTime: false };
    }
  }
})); 