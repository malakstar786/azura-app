import { Stack } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import CustomSplashScreen from '../components/custom-splash-screen';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Hide the native splash screen
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();

    // Show our custom splash for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <CustomSplashScreen />;
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
      </Stack>
    </ToastProvider>
  );
}
