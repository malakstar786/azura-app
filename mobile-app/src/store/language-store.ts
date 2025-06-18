import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { theme } from '@theme';

export type Language = 'en' | 'ar';

// Navigation lock key
const NAVIGATION_LOCK_KEY = '@azura_navigation_lock';

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
  checkAndSetNavigationLock: () => Promise<boolean>;
}

// Check if navigation lock exists
const checkNavigationLock = async (): Promise<boolean> => {
  try {
    const lockExists = await AsyncStorage.getItem(NAVIGATION_LOCK_KEY);
    return lockExists === 'true';
  } catch (error) {
    console.error('Error checking navigation lock:', error);
    return false;
  }
};

// Set navigation lock
const setNavigationLock = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(NAVIGATION_LOCK_KEY, 'true');
  } catch (error) {
    console.error('Error setting navigation lock:', error);
  }
};

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
        
        // Store language directly in AsyncStorage for immediate persistence
        try {
          await AsyncStorage.setItem('appLanguage', language);
        } catch (error) {
          console.error('Failed to save language to AsyncStorage', error);
        }
        
        set({ 
          currentLanguage: language,
          isRTL: isNewRTL,
          restartRequired: needsRestart,
          lastUpdated: Date.now() // Update timestamp to force subscribers to re-render
        });
      },
      
      // Update first-time user flag
      setIsFirstTimeUser: (isFirstTimeUser: boolean) => {
        console.log(`Setting isFirstTimeUser to: ${isFirstTimeUser}`);
        
        // Persist the first-time user status in AsyncStorage immediately
        try {
          AsyncStorage.setItem('isFirstTimeUser', isFirstTimeUser ? 'true' : 'false');
        } catch (err) {
          console.error('Error saving first-time user status:', err);
        }
        
        set({ isFirstTimeUser });
      },
      
      // Check and set navigation lock
      checkAndSetNavigationLock: async () => {
        const lockExists = await checkNavigationLock();
        if (!lockExists) {
          await setNavigationLock();
          return false;
        }
        return true;
      },
      
      // Initializes language on app start
      initialize: async () => {
        try {
          console.log("Initializing language store...");
          
          // Check if user has completed first-time setup
          const isFirstTimeUserStored = await AsyncStorage.getItem('isFirstTimeUser');
          const isFirstTime = isFirstTimeUserStored !== 'false';
          
          // Get stored language preference from AsyncStorage
          const storedLanguage = await AsyncStorage.getItem('appLanguage');
          let initialLanguage: Language = 'en'; // Default to 'en'
          
          // If appLanguage found, use it
          if (storedLanguage === 'en' || storedLanguage === 'ar') {
            initialLanguage = storedLanguage;
          } else {
            // If no appLanguage found, check the old persistence format for backwards compatibility
            const storedState = await AsyncStorage.getItem('language-storage');
            if (storedState) {
              try {
                const parsedState = JSON.parse(storedState);
                if (parsedState && parsedState.state && 
                    (parsedState.state.currentLanguage === 'en' || parsedState.state.currentLanguage === 'ar')) {
                  initialLanguage = parsedState.state.currentLanguage;
                  // Migrate the old format to the new one
                  await AsyncStorage.setItem('appLanguage', initialLanguage);
                }
              } catch (e) {
                console.error("Error parsing stored state:", e);
              }
            }
          }

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
            isLoading: false,
            isFirstTimeUser: isFirstTime
          });

        } catch (error) {
          console.error('Failed to load language from AsyncStorage', error);
          // Fallback to default if error
          set({ 
            currentLanguage: 'en', 
            isRTL: false,
            isLoading: false,
            isFirstTimeUser: true
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