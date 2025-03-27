import { Stack } from 'expo-router';

export default function CheckoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: '#fff' },
        animation: 'slide_from_right',
        presentation: 'card',
      }}
    />
  );
} 