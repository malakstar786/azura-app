import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    Alert,
    Dimensions,
} from 'react-native';
import { Link, Stack, router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../store/auth-store';
import { Ionicons } from '@expo/vector-icons';
import { makeApiCall, API_ENDPOINTS } from '../utils/api-config';

export default function Auth() {
    const { login, signup, isAuthenticated } = useAuthStore();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const { redirect } = useLocalSearchParams<{ redirect?: string }>();

    // Redirect if already authenticated
    useEffect(() => {
      if (isAuthenticated) {
        router.replace('/');
      }
    }, [isAuthenticated]);

    // Login form state
    const [loginForm, setLoginForm] = useState({
      email: '',
      password: '',
    });

    // Signup form state
    const [signupForm, setSignupForm] = useState({
      fullName: '',
      email: '',
      mobile: '',
      password: '',
    });

    const handleLoginInputChange = (field: keyof typeof loginForm, value: string) => {
      setLoginForm(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

    const handleSignupInputChange = (field: keyof typeof signupForm, value: string) => {
      setSignupForm(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

    const handleLogin = async () => {
      if (!loginForm.email || !loginForm.password) {
        setErrors({ email: 'Please fill in all fields', password: 'Please fill in all fields' });
        return;
      }

      setIsLoading(true);
      setErrors({});

      try {
        const response = await makeApiCall(API_ENDPOINTS.login, {
          method: 'POST',
          data: {
            email: loginForm.email,
            password: loginForm.password
          }
        });

        if (response.success === 1) {
          await login(loginForm.email, loginForm.password);
          // If we came from checkout, go back there
          if (redirect === 'checkout') {
            router.replace('/checkout');
          } else {
            router.back();
          }
        } else {
          setErrors({ email: response.error?.[0] || 'Login failed', password: response.error?.[0] || 'Login failed' });
        }
      } catch (err: any) {
        setErrors({ email: err.message || 'An error occurred', password: err.message || 'An error occurred' });
      } finally {
        setIsLoading(false);
      }
    };

    const handleSignup = async () => {
      if (!signupForm.fullName || !signupForm.email || !signupForm.mobile || !signupForm.password) {
        setErrors({ 
          fullName: !signupForm.fullName ? 'Full name is required' : '',
          email: !signupForm.email ? 'Email is required' : '',
          mobile: !signupForm.mobile ? 'Mobile number is required' : '',
          password: !signupForm.password ? 'Password is required' : ''
        });
        return;
      }
      
      setIsLoading(true);
      setErrors({});
      
      try {
        // Extract first and last name from full name
        const nameParts = signupForm.fullName.split(' ');
        const firstname = nameParts[0] || '';
        const lastname = nameParts.slice(1).join(' ') || '';
        
        await signup({
          firstname,
          lastname,
          email: signupForm.email,
          telephone: signupForm.mobile,
          password: signupForm.password,
        });
        
        // If we came from checkout, go back there
        if (redirect === 'checkout') {
          router.replace('/checkout');
        } else {
          router.back();
        }
      } catch (error: any) {
        setErrors({ 
          fullName: error.message || 'An error occurred during signup',
          email: error.message || '', 
          mobile: '', 
          password: ''  
        });
        Alert.alert('Signup Failed', error.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    const renderLoginForm = () => (
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>SIGN IN</Text>
        <Text style={styles.formSubtitle}>WELCOME BACK TO AZURA</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.instructionText}>
          SIGN IN WITH YOUR REGISTERED EMAIL AND PASSWORD
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="EMAIL"
            value={loginForm.email}
            onChangeText={text => handleLoginInputChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="PASSWORD"
            value={loginForm.password}
            onChangeText={text => handleLoginInputChange('password', text)}
            secureTextEntry
            placeholderTextColor="#999"
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>
        
        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => router.push('/forgot-password')}
        >
          <Text style={styles.forgotPasswordText}>FORGOT PASSWORD?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>LOGIN</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.switchModeButton}
          onPress={() => setIsLogin(false)}
        >
          <Text style={styles.switchModeText}>CREATE ACCOUNT?</Text>
        </TouchableOpacity>
      </View>
    );

    const renderSignupForm = () => (
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>CREATE ACCOUNT</Text>
        <Text style={styles.formSubtitle}>EASY SHOPPING WITH AZURA</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.instructionText}>
          CREATE AN ACCOUNT AND BENEFIT FROM A MORE PERSONAL SHOPPING EXPERIENCE, AND QUICKER ONLINE CHECKOUT.
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="FULL NAME"
            value={signupForm.fullName}
            onChangeText={text => handleSignupInputChange('fullName', text)}
            placeholderTextColor="#999"
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="EMAIL"
            value={signupForm.email}
            onChangeText={text => handleSignupInputChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="MOBILE"
            value={signupForm.mobile}
            onChangeText={text => handleSignupInputChange('mobile', text)}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
          {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="PASSWORD"
            value={signupForm.password}
            onChangeText={text => handleSignupInputChange('password', text)}
            secureTextEntry
            placeholderTextColor="#999"
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>SIGN UP</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.switchModeButton}
          onPress={() => setIsLogin(true)}
        >
          <Text style={styles.switchModeText}>ALREADY HAVE ACCOUNT LOGIN?</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <Stack.Screen
          options={{
            headerShown: true,
            title: '',
            headerShadowVisible: false,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
            ),
          }}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {isLogin ? renderLoginForm() : renderSignupForm()}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    backButton: {
      padding: 10,
    },
    formContainer: {
      flex: 1,
      paddingTop: 20,
    },
    formTitle: {
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
    },
    formSubtitle: {
      fontSize: 14,
      color: '#000',
      marginTop: 4,
      textAlign: 'center',
    },
    divider: {
      height: 1,
      backgroundColor: '#E0E0E0',
      marginVertical: 15,
    },
    instructionText: {
      fontSize: 12,
      marginBottom: 20,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 16,
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 12,
      marginTop: 4,
    },
    forgotPassword: {
      marginBottom: 20,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: '#000',
    },
    submitButton: {
      backgroundColor: '#000',
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 10,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    switchModeButton: {
      marginTop: 20,
      alignItems: 'center',
    },
    switchModeText: {
      fontSize: 14,
      color: '#000',
    },
  });
