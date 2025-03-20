import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OrdersLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'My Orders',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: 5 }}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="[slug]"
        options={{
          title: 'Order Details',
          headerBackVisible: true,
        }}
      />
    </Stack>
  );
} 