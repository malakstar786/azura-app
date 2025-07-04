import { Stack, useRouter } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import { useEffect, useState, useRef } from 'react';
import { I18nManager } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from '@components/custom-splash-screen';
import { getOrCreateOCSESSID } from '@utils/api-config';
import { useLanguageStore } from '@store/language-store';
import { theme } from '@theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetAppState, clearNavigationLock, resetFirstTimeUser } from '@utils/reset-app';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { isFirstTimeUser, isRTL, initialize, checkAndSetNavigationLock } = useLanguageStore();
  const router = useRouter();
  const navigationPerformedRef = useRef<boolean>(false);
  const initialNavigationCompleteRef = useRef<boolean>(false);

  useEffect(() => {
    async function prepare() {
      try {
        // For debugging - uncomment to reset specific parts of app state
        // await resetAppState(); // Reset all app state
        // await clearNavigationLock(); // Only clear navigation lock
        // await resetFirstTimeUser(); // Only reset first-time user flag
        
        // Initialize OCSESSID first
        await getOrCreateOCSESSID();
        
        // Initialize language store
        await initialize();
        
        // Simulate any other initialization if needed
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Hide the native splash screen
        await SplashScreen.hideAsync();
        
        // Mark the app as ready
        setIsReady(true);
      } catch (e) {
        console.warn('Error preparing app:', e);
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (isReady) {
      // Show our custom splash for 3 seconds as per requirements
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  // Handle navigation once after splash screen is hidden
  useEffect(() => {
    async function handleNavigation() {
      if (!showSplash && !navigationPerformedRef.current) {
        navigationPerformedRef.current = true;
        
        // Check if we've already navigated to language selection in this session
        const hasNavigationLock = await checkAndSetNavigationLock();
        
        if (isFirstTimeUser && !hasNavigationLock) {
          console.log("First time user detected, navigating to language selection");
          // Set AsyncStorage directly to ensure consistency
          await AsyncStorage.setItem('isFirstTimeUser', 'false');
          // Navigate to language selection
          router.replace("/language-selection");
        } else {
          console.log("Not first time user or navigation already occurred, staying on main screen");
        }
      }
    }
    handleNavigation();
  }, [showSplash, isFirstTimeUser, checkAndSetNavigationLock, router]);

  if (!isReady || showSplash) {
    return <CustomSplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <ToastProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.white,
          },
          headerTintColor: theme.colors.black,
          // Configure RTL-aware navigation direction
          animation: isRTL ? 'slide_from_left' : 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="(shop)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="categories"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="product"
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="auth" 
          options={{ headerShown: true }} 
        />
        <Stack.Screen
          name="orders/index"
          options={{
            headerShown: false,
            animation: isRTL ? 'slide_from_left' : 'slide_from_right',
            presentation: 'card'
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            headerShown: false,
            presentation: 'modal'
          }}
        />
        <Stack.Screen
          name="language-selection/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="policies" 
          options={{ headerShown: true }} 
        />
        <Stack.Screen
          name="order-success"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="order-failure"
          options={{ headerShown: false }}
        />
      </Stack>
    </ToastProvider>
  );
}
