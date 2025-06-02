import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, router } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import { useAuthStore } from '@store/auth-store';
import { useCartStore } from '@store/cart-store';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

const signupSchema = zod.object({
  fullName: zod.string().min(1, { message: 'Full name is required' }),
  email: zod.string().email({ message: 'Invalid email address' }),
  mobile: zod.string().min(8, { message: 'Invalid mobile number' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const signup = useAuthStore((state) => state.signup);
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

      // Parse full name into first name and last name
      let firstName = data.fullName;
      let lastName = '';

      // Split the full name by space and handle different cases
      const nameParts = data.fullName.trim().split(' ');
      if (nameParts.length > 1) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      }

      // Prepare user data for signup
      const userData = {
        firstname: firstName,
        lastname: lastName,
        email: data.email,
        telephone: data.mobile,
        password: data.password
      };

      console.log('Signing up with userData:', JSON.stringify(userData, null, 2));

      await signup(userData);
      
      toast.show('Account created successfully!', {
        type: 'success',
        placement: 'top',
        duration: 3000,
      });
      
      router.replace('/');
    } catch (error) {
      console.error('Signup error:', error);
      
      let errorMessage = 'Sign up failed. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Special case for server issues
      if (errorMessage.includes('temporarily unavailable') || 
          errorMessage.includes('Server configuration error')) {
        errorMessage = 'The registration service is currently unavailable. Please try again later or contact support.';
      }
      
      toast.show(errorMessage, {
        type: 'error',
        placement: 'top',
        duration: 4000,
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
                placeholderTextColor={theme.colors.mediumGray}
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
                placeholderTextColor={theme.colors.mediumGray}
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
                placeholderTextColor={theme.colors.mediumGray}
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
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="PASSWORD"
                  style={styles.passwordInput}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  placeholderTextColor={theme.colors.mediumGray}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={theme.colors.mediumGray}
                  />
                </TouchableOpacity>
              </View>
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
            <ActivityIndicator color={theme.colors.white} />
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
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.black,
    fontWeight: theme.typography.weights.medium as any,
    marginBottom: theme.spacing.md,
  },
  divider: {
    height: 2,
    backgroundColor: theme.colors.black,
    marginBottom: theme.spacing.lg,
  },
  instruction: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.black,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.black,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.black,
    backgroundColor: theme.colors.white,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.black,
    backgroundColor: theme.colors.white,
  },
  passwordInput: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.black,
  },
  eyeButton: {
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.red,
    fontSize: theme.typography.sizes.sm,
    marginTop: theme.spacing.xs,
  },
  signupButton: {
    backgroundColor: theme.colors.black,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  signupButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold as any,
  },
  loginLink: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.black,
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium as any,
  },
}); 