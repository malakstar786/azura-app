import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from '@store/language-store';

export default function CategoryLayout() {
  const { isRTL } = useLanguageStore();
  
  return (
    <Stack
      screenOptions={{
        animation: isRTL ? 'slide_from_left' : 'slide_from_right',
      }}
    >
      <Stack.Screen
        name='[slug]'
        options={({ navigation }) => ({
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color='black' />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack>
  );
}