import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { theme } from '@theme';

export type Language = 'en' | 'ar';

interface LanguageState {
  currentLanguage: Language;
  isFirstTimeUser: boolean;
  isLoading: boolean;
  lastUpdated: number; // Add timestamp to track updates
  setLanguage: (language: Language) => void;
  setIsFirstTimeUser: (isFirstTimeUser: boolean) => void;
  initialize: () => Promise<void>;
  isRTL: () => boolean;
}

// Create store with persistence
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      // Default state
      currentLanguage: 'en',
      isFirstTimeUser: true,
      isLoading: true,
      lastUpdated: Date.now(), // Initialize with current timestamp
      
      // Check if current language is RTL
      isRTL: () => {
        const { currentLanguage } = get();
        return currentLanguage === 'ar';
      },
      
      // Update language and log for debugging
      setLanguage: (language: Language) => {
        console.log(`Setting language to: ${language}`);
        const isRTL = language === 'ar';
        
        // Update theme RTL properties
        theme.rtl.isRTL = isRTL;
        theme.rtl.textAlign = isRTL ? 'right' : 'left';
        theme.rtl.flexDirection = isRTL ? 'row-reverse' : 'row';
        
        // Update React Native RTL setting
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        
        set({ 
          currentLanguage: language,
          lastUpdated: Date.now() // Update timestamp to force subscribers to re-render
        });
      },
      
      // Update first-time user flag
      setIsFirstTimeUser: (isFirstTimeUser: boolean) => {
        console.log(`Setting isFirstTimeUser to: ${isFirstTimeUser}`);
        set({ isFirstTimeUser });
      },
      
      // Initialize store
      initialize: async () => {
        try {
          console.log("Initializing language store...");
          
          // Check if storage has values already to determine if it's actually first time
          const storedState = await AsyncStorage.getItem('language-storage');
          if (storedState) {
            try {
              const parsedState = JSON.parse(storedState);
              console.log("Found stored state:", parsedState);
              
              // Only update if we have valid stored values
              if (parsedState && parsedState.state) {
                const { currentLanguage, isFirstTimeUser } = parsedState.state;
                console.log(`Stored values - language: ${currentLanguage}, isFirstTimeUser: ${isFirstTimeUser}`);
                
                // Set RTL for stored language
                if (currentLanguage) {
                  const isRTL = currentLanguage === 'ar';
                  theme.rtl.isRTL = isRTL;
                  theme.rtl.textAlign = isRTL ? 'right' : 'left';
                  theme.rtl.flexDirection = isRTL ? 'row-reverse' : 'row';
                  I18nManager.allowRTL(isRTL);
                  I18nManager.forceRTL(isRTL);
                }
              }
            } catch (e) {
              console.error("Error parsing stored state:", e);
            }
          } else {
            console.log("No stored state found, assumed first time user");
          }
          
          // Mark as loaded
          set({ isLoading: false });
        } catch (error) {
          console.error('Failed to initialize language store:', error);
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 