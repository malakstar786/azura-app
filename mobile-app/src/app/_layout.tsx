import { Stack, useRouter } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from '../components/custom-splash-screen';
import { getOrCreateOCSESSID } from '../utils/api-config';
import { useLanguageStore } from '../store/language-store';
import { theme } from '../theme';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { isFirstTimeUser, initialize } = useLanguageStore();
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
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

  useEffect(() => {
    if (!showSplash && isFirstTimeUser) {
      console.log("First time user detected, navigating to language selection");
      // Need to navigate to the index file within the directory
      router.replace("language-selection");
    } else if (!showSplash) {
      console.log("Not first time user, staying on main screen");
    }
  }, [showSplash, isFirstTimeUser, router]);

  if (!isReady || showSplash) {
    return <CustomSplashScreen />;
  }

  return (
    <ToastProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.white,
          },
          headerTintColor: theme.colors.black,
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
          name="orders"
          options={{
            headerShown: false,
            presentation: 'modal'
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
          name="language-selection"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="policies" 
          options={{ headerShown: true }} 
        />
      </Stack>
    </ToastProvider>
  );
}

