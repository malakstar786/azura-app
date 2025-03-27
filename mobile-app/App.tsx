import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CustomSplashScreen from './src/components/custom-splash-screen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <>
        <CustomSplashScreen onFinish={() => setIsLoading(false)} />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      {/* Your main app content will go here */}
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});