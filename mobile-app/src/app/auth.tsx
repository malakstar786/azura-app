import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Stack, router } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import { useAuthStore } from '../store/auth-store';
import { Ionicons } from '@expo/vector-icons';
// import { useAuth } from '../providers/auth-provider';
  
const authSchema = zod.object({
email: zod.string().email({ message: 'Invalid email address' }),
password: zod
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
});
  
export default function Auth() {
    // const { session } = useAuth();
  
    // if (session) return <Redirect href='/' />;
  
    const [isLoading, setIsLoading] = useState(false);
    const login = useAuthStore((state) => state.login);
    const toast = useToast();
  
    const { control, handleSubmit, formState: { errors } } = useForm({
      resolver: zodResolver(authSchema),
      defaultValues: {
        email: '',
        password: '',
      },
    });
  
    const onSubmit = async (data: zod.infer<typeof authSchema>) => {
      try {
        setIsLoading(true);
        await login(data.email, data.password);
        router.replace('/');
      } catch (error) {
        toast.show(error instanceof Error ? error.message : 'Login failed', {
          type: 'error',
          placement: 'top',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    const signUp = async (data: zod.infer<typeof authSchema>) => {
      console.log(data);
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
          <Text style={styles.title}>SIGN IN</Text>
          <Text style={styles.subtitle}>WELCOME BACK TO AZURA</Text>
  
          <View style={styles.divider} />
  
          <Text style={styles.instruction}>
            SIGN IN WITH YOUR REGISTERED EMAIL AND PASSWORD
          </Text>
  
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
  
          <TouchableOpacity onPress={() => router.push('/forgot-password')}>
            <Text style={styles.forgotPassword}>FORGOT PASSWORD?</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>LOGIN</Text>
            )}
          </TouchableOpacity>
  
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.createAccount}>NEW USER? CREATE ACCOUNT</Text>
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
    forgotPassword: {
      fontSize: 12,
      color: '#000',
      textAlign: 'right',
      marginBottom: 24,
    },
    loginButton: {
      backgroundColor: '#000',
      padding: 16,
      alignItems: 'center',
      marginBottom: 24,
    },
    loginButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    createAccount: {
      fontSize: 12,
      color: '#000',
      textAlign: 'center',
    },
  });
