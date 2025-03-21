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

const signupSchema = zod.object({
  fullName: zod.string().min(1, { message: 'Full name is required' }),
  email: zod.string().email({ message: 'Invalid email address' }),
  mobile: zod.string().min(8, { message: 'Invalid mobile number' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const signUp = useAuthStore((state) => state.signUp);
  const toast = useToast();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
      password: '',
    },
  });

  const onSubmit = async (data: zod.infer<typeof signupSchema>) => {
    try {
      setIsLoading(true);
      await signUp(data);
      router.replace('/');
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Sign up failed', {
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
        <Text style={styles.title}>CREATE ACCOUNT</Text>
        <Text style={styles.subtitle}>EASY SHOPPING WITH AZURA</Text>

        <View style={styles.divider} />

        <Text style={styles.instruction}>
          CREATE AN ACCOUNT AND BENEFIT FROM A MORE PERSONAL SHOPPING EXPERIENCE, AND QUICKER ONLINE CHECKOUT.
        </Text>

        <Controller
          control={control}
          name="fullName"
          render={({ field: { value, onChange, onBlur } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="FULL NAME"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                editable={!isLoading}
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="EMAIL"
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

        <Controller
          control={control}
          name="mobile"
          render={({ field: { value, onChange, onBlur } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="MOBILE"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
              {errors.mobile && (
                <Text style={styles.errorText}>{errors.mobile.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="PASSWORD"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>
          )}
        />

        <TouchableOpacity
          style={styles.signupButton}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signupButtonText}>SIGN UP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth')}>
          <Text style={styles.loginLink}>ALREADY HAVE ACCOUNT LOGIN?</Text>
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
  signupButton: {
    backgroundColor: '#000',
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loginLink: {
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
  },
}); 