import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '../store/auth-store';
import { Ionicons } from '@expo/vector-icons';
import { makeApiCall, API_ENDPOINTS } from '../utils/api-config';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await makeApiCall(API_ENDPOINTS.forgotPassword, {
        method: 'POST',
        data: { email }
      });

      if (response.success === 1) {
        Alert.alert(
          'Password Sent',
          'Password has been sent to your email address',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        setError(response.error?.[0] || 'Email not found');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: '',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }} 
      />

      <View style={styles.content}>
        <Text style={styles.title}>FORGOT PASSWORD</Text>
        <Text style={styles.subtitle}>PASSWORD WILL BE SENT ON EMAIL</Text>

        <View style={styles.divider} />

        <Text style={styles.instruction}>
          ENTER YOUR REGISTERED EMAIL
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="REGISTERED EMAIL"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSubmit}
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