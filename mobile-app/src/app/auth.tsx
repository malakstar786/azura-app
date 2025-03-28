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

export default function Auth() {
    const { login, signup, isAuthenticated } = useAuthStore();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const { redirect } = useLocalSearchParams<{ redirect?: string }>();

    // Redirect if already authenticated
    useEffect(() => {
      if (isAuthenticated) {
        if (redirect === 'checkout') {
          router.replace('/checkout');
        } else {
          router.replace('/');
        }
      }
    }, [isAuthenticated, redirect]);

    // Login form state
    const [loginForm, setLoginForm] = useState({
      email: '',
      password: '',
    });

    // Signup form state
    const [signupForm, setSignupForm] = useState({
      firstname: '',
      lastname: '',
      email: '',
      telephone: '',
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
        setErrors({ 
          email: !loginForm.email ? 'Email is required' : '',
          password: !loginForm.password ? 'Password is required' : ''
        });
        return;
      }
      
      setIsLoading(true);
      setErrors({});
      
      try {
        console.log('Login attempt with:', { email: loginForm.email });
        await login(loginForm.email, loginForm.password);
        
        // Router will handle redirection in the useEffect hook
      } catch (error: any) {
        console.error('Login failed:', error);
        let errorMessage = error.message || 'An unexpected error occurred';
        
        // Handle specific error codes
        if (error.code === 'SERVER_ERROR' && error.response?.status === 404) {
          errorMessage = 'The login service is currently unavailable. Please try again later.';
        }
        
        setErrors({ 
          email: errorMessage, 
          password: errorMessage  
        });
        Alert.alert('Login Failed', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    const handleSignup = async () => {
      if (!signupForm.firstname || !signupForm.lastname || !signupForm.email || !signupForm.telephone || !signupForm.password) {
        setErrors({ 
          firstname: !signupForm.firstname ? 'First name is required' : '',
          lastname: !signupForm.lastname ? 'Last name is required' : '',
          email: !signupForm.email ? 'Email is required' : '',
          telephone: !signupForm.telephone ? 'Mobile number is required' : '',
          password: !signupForm.password ? 'Password is required' : ''
        });
        return;
      }
      
      setIsLoading(true);
      setErrors({});
      
      try {
        await signup({
          firstname: signupForm.firstname,
          lastname: signupForm.lastname,
          email: signupForm.email,
          telephone: signupForm.telephone,
          password: signupForm.password,
        });
        
        // Router will handle redirection in the useEffect hook
      } catch (error: any) {
        setErrors({ 
          email: error.message || 'An error occurred during signup'
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
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="EMAIL"
            value={loginForm.email}
            onChangeText={text => handleLoginInputChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
            editable={!isLoading}
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
            editable={!isLoading}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>
        
        <Link href="/forgot-password" asChild>
          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>FORGOT PASSWORD?</Text>
          </TouchableOpacity>
        </Link>
        
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
          <Text style={styles.switchModeText}>NEW USER? CREATE ACCOUNT</Text>
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
            placeholder="FIRST NAME"
            value={signupForm.firstname}
            onChangeText={text => handleSignupInputChange('firstname', text)}
            placeholderTextColor="#999"
            editable={!isLoading}
          />
          {errors.firstname && <Text style={styles.errorText}>{errors.firstname}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="LAST NAME"
            value={signupForm.lastname}
            onChangeText={text => handleSignupInputChange('lastname', text)}
            placeholderTextColor="#999"
            editable={!isLoading}
          />
          {errors.lastname && <Text style={styles.errorText}>{errors.lastname}</Text>}
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
            editable={!isLoading}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="MOBILE NUMBER"
            value={signupForm.telephone}
            onChangeText={text => handleSignupInputChange('telephone', text)}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
            editable={!isLoading}
          />
          {errors.telephone && <Text style={styles.errorText}>{errors.telephone}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="PASSWORD"
            value={signupForm.password}
            onChangeText={text => handleSignupInputChange('password', text)}
            secureTextEntry
            placeholderTextColor="#999"
            editable={!isLoading}
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
          <Text style={styles.switchModeText}>ALREADY HAVE AN ACCOUNT? LOGIN</Text>
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
            title: '',
            headerShadowVisible: false,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
            ),
          }}
        />
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLogin ? renderLoginForm() : renderSignupForm()}
        </ScrollView>
      </KeyboardAvoidingView>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    formContainer: {
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
        paddingVertical: 20,
    },
    formTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#444',
        marginBottom: 15,
    },
    divider: {
        height: 2,
        backgroundColor: '#000',
        marginBottom: 20,
    },
    instructionText: {
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#000',
        padding: 15,
        fontSize: 14,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 25,
    },
    forgotPasswordText: {
        fontSize: 12,
        color: '#000',
    },
    submitButton: {
        backgroundColor: '#000',
        padding: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    switchModeButton: {
        alignItems: 'center',
    },
    switchModeText: {
        fontSize: 14,
        color: '#000',
    },
});
