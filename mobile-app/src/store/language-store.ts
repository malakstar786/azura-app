import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { theme } from '@theme';

export type Language = 'en' | 'ar';

interface LanguageState {
  currentLanguage: Language;
  isRTL: boolean;
  isFirstTimeUser: boolean;
  isLoading: boolean;
  restartRequired: boolean;
  lastUpdated: number; // Add timestamp to track updates
  setLanguage: (language: Language) => Promise<void>;
  setIsFirstTimeUser: (isFirstTimeUser: boolean) => void;
  initialize: () => Promise<void>;
  clearRestartFlag: () => void;
}

// Create store with persistence
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      // Default state
      currentLanguage: 'en',
      isRTL: false,
      isFirstTimeUser: true,
      isLoading: true,
      restartRequired: false,
      lastUpdated: Date.now(), // Initialize with current timestamp
      
      // Sets the language, updates I18nManager, and persists
      setLanguage: async (language: Language) => {
        console.log(`Setting language to: ${language}`);
        const isNewRTL = language === 'ar';
        let needsRestart = false;

        // Check if direction needs to be flipped
        if (I18nManager.isRTL !== isNewRTL) {
          I18nManager.forceRTL(isNewRTL);
          needsRestart = true;
          // Forcing RTL requires a restart for *some* native components to re-layout correctly.
          // This is crucial. We'll handle this with a reload prompt/mechanism.
        }
        
        // Update theme RTL properties
        theme.rtl.isRTL = isNewRTL;
        theme.rtl.textAlign = isNewRTL ? 'right' : 'left';
        theme.rtl.flexDirection = isNewRTL ? 'row-reverse' : 'row';
        
        set({ 
          currentLanguage: language,
          isRTL: isNewRTL,
          restartRequired: needsRestart,
          lastUpdated: Date.now() // Update timestamp to force subscribers to re-render
        });
        await AsyncStorage.setItem('appLanguage', language);
      },
      
      // Update first-time user flag
      setIsFirstTimeUser: (isFirstTimeUser: boolean) => {
        console.log(`Setting isFirstTimeUser to: ${isFirstTimeUser}`);
        set({ isFirstTimeUser });
      },
      
      // Initializes language on app start
      initialize: async () => {
        try {
          console.log("Initializing language store...");
          
          // Get stored language preference from both sources for compatibility
          let storedLanguage = (await AsyncStorage.getItem('appLanguage')) as Language | null;
          
          // If no appLanguage found, check the old persistence format for backwards compatibility
          if (!storedLanguage) {
            const storedState = await AsyncStorage.getItem('language-storage');
            if (storedState) {
              try {
                const parsedState = JSON.parse(storedState);
                if (parsedState && parsedState.state && parsedState.state.currentLanguage) {
                  storedLanguage = parsedState.state.currentLanguage;
                }
              } catch (e) {
                console.error("Error parsing stored state:", e);
              }
            }
          }
          
          const initialLanguage = storedLanguage || 'en'; // Default to 'en' if no stored preference

          // Crucially, initialize I18nManager BEFORE rendering
          const initialIsRTL = initialLanguage === 'ar';
          if (I18nManager.isRTL !== initialIsRTL) {
            I18nManager.forceRTL(initialIsRTL);
            // Do NOT restart here immediately. We'll prompt the user for the very first switch.
          }
          
          // Update theme RTL properties
          theme.rtl.isRTL = initialIsRTL;
          theme.rtl.textAlign = initialIsRTL ? 'right' : 'left';
          theme.rtl.flexDirection = initialIsRTL ? 'row-reverse' : 'row';
          
          set({ 
            currentLanguage: initialLanguage, 
            isRTL: initialIsRTL,
            isLoading: false 
          });

        } catch (error) {
          console.error('Failed to load language from AsyncStorage', error);
          // Fallback to default if error
          set({ 
            currentLanguage: 'en', 
            isRTL: false,
            isLoading: false 
          });
        }
      },
      clearRestartFlag: () => {
        set({ restartRequired: false });
      }
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 