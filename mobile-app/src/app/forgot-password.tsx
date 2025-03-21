import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, router } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import { useAuthStore } from '../store/auth-store';
import { Ionicons } from '@expo/vector-icons';

const forgotPasswordSchema = zod.object({
  email: zod.string().email({ message: 'Invalid email address' }),
});

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const checkEmail = useAuthStore((state) => state.checkEmail);
  const toast = useToast();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: zod.infer<typeof forgotPasswordSchema>) => {
    try {
      setIsLoading(true);
      await checkEmail(data.email);
      toast.show('Password has been sent to your email', {
        type: 'success',
        placement: 'top',
        duration: 3000,
      });
      router.back();
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Email not registered', {
        type: 'error',
        placement: 'top',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerTitle: '',
          headerShadowVisible: false,
        }} 
      />

      <View style={styles.content}>
        <Text style={styles.title}>FORGOT PASSWORD</Text>
        <Text style={styles.subtitle}>PASSWORD WILL BE SENT ON EMAIL</Text>

        <View style={styles.divider} />

        <Text style={styles.instruction}>
          ENTER YOUR REGISTERED EMAIL
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="REGISTERED EMAIL"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>
          )}
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>SEND</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 16,
  },
  divider: {
    height: 2,
    backgroundColor: '#000',
    marginBottom: 24,
  },
  instruction: {
    fontSize: 12,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 12,
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  sendButton: {
    backgroundColor: '#000',
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 