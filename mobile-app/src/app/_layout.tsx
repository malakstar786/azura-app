import { Stack } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import CustomSplashScreen from '../components/custom-splash-screen';
import LanguageSelection from '../components/language-selection';
import { getOrCreateOCSESSID } from '../utils/api-config';
import { useLanguageStore } from '../store/language-store';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { isFirstTime, isLoading, initialize } = useLanguageStore();
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);

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
        // Even if there's an error, we should proceed to show the app
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isReady) {
      // Show our custom splash for 1 second after initialization
      const timer = setTimeout(() => {
        setShowSplash(false);
        // Check if it's first time use to show language selection
        if (!isLoading && isFirstTime) {
          setShowLanguageSelection(true);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isReady, isLoading, isFirstTime]);

  if (!isReady || showSplash) {
    return <CustomSplashScreen />;
  }

  if (showLanguageSelection) {
    return <LanguageSelection onLanguageSelected={() => setShowLanguageSelection(false)} />;
  }

  return (
    <ToastProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#000',
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
      </Stack>
    </ToastProvider>
  );
}
