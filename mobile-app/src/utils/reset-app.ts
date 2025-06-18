import AsyncStorage from '@react-native-async-storage/async-storage';

// Navigation lock key - must match the one in language-store.ts
const NAVIGATION_LOCK_KEY = '@azura_navigation_lock';

/**
 * Resets the app to its initial state by clearing AsyncStorage
 * This is useful for debugging purposes
 */
export const resetAppState = async (): Promise<void> => {
  try {
    // Clear all AsyncStorage data
    await AsyncStorage.clear();
    console.log('App state reset successfully');
    
    // Return true to indicate success
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to reset app state:', error);
    return Promise.reject(error);
  }
};

/**
 * Clears only the navigation lock
 * Useful for testing the first-time user flow without resetting other app state
 */
export const clearNavigationLock = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(NAVIGATION_LOCK_KEY);
    console.log('Navigation lock cleared successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to clear navigation lock:', error);
    return Promise.reject(error);
  }
};

/**
 * Resets first-time user flag
 * Sets the user back to first-time status for testing the onboarding flow
 */
export const resetFirstTimeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem('isFirstTimeUser', 'true');
    console.log('First-time user flag reset successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to reset first-time user flag:', error);
    return Promise.reject(error);
  }
}; 