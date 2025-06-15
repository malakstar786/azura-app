import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@store/auth-store';
import { useTranslation } from '@utils/translations';
import { getTextAlign, getFlexDirection } from '@utils/rtlStyles';

export interface EditUserDetailsProps {
  userData?: {
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
  };
  onCancel: () => void;
  onSubmit: (data: {
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
  }) => void;
}

export default function EditUserDetails({ 
  userData, 
  onCancel, 
  onSubmit 
}: EditUserDetailsProps) {
  const { user, updateUser } = useAuthStore();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form data with provided userData or fallback to user from store
  const [formData, setFormData] = useState({
    firstname: userData?.firstname || user?.firstname || '',
    lastname: userData?.lastname || user?.lastname || '',
    email: userData?.email || user?.email || '',
    telephone: userData?.telephone || user?.telephone || '',
  });

  const [errors, setErrors] = useState({
    firstname: '',
    lastname: '',
    email: '',
    telephone: '',
  });

  const validate = () => {
    let isValid = true;
    const newErrors = {
      firstname: '',
      lastname: '',
      email: '',
      telephone: '',
    };

    // Validate firstname
    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
      isValid = false;
    }

    // Validate lastname
    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
      isValid = false;
    }

    // Validate telephone
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Mobile number is required';
      isValid = false;
    } else if (!/^\d{8,}$/.test(formData.telephone.replace(/\D/g, ''))) {
      newErrors.telephone = 'Enter a valid mobile number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    try {
      setIsLoading(true);
      
      if (onSubmit) {
        // Use the provided onSubmit callback
        onSubmit(formData);
      } else {
        // Fallback to direct API call via auth store
        await updateUser({
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          telephone: formData.telephone,
        });
        
        Alert.alert('Success', 'Your details have been updated successfully!');
        onCancel();
      }
    } catch (error: any) {
      console.error('Error updating user details:', error);
      Alert.alert('Error', error.message || 'Failed to update details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView>
        <View style={styles.header}>
                  <Text style={styles.title}>{t('userDetails.title')}</Text>
        <Text style={styles.subtitle}>Update your account information</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>FIRST NAME</Text>
            <TextInput
              style={[styles.input, errors.firstname ? styles.inputError : null]}
              value={formData.firstname}
              onChangeText={(text) => setFormData({...formData, firstname: text})}
              placeholder="Enter your first name"
              autoCapitalize="words"
            />
            {errors.firstname ? <Text style={styles.errorText}>{errors.firstname}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>LAST NAME</Text>
            <TextInput
              style={[styles.input, errors.lastname ? styles.inputError : null]}
              value={formData.lastname}
              onChangeText={(text) => setFormData({...formData, lastname: text})}
              placeholder="Enter your last name"
              autoCapitalize="words"
            />
            {errors.lastname ? <Text style={styles.errorText}>{errors.lastname}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>MOBILE NUMBER</Text>
            <TextInput
              style={[styles.input, errors.telephone ? styles.inputError : null]}
              value={formData.telephone}
              onChangeText={(text) => setFormData({...formData, telephone: text})}
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
            />
            {errors.telephone ? <Text style={styles.errorText}>{errors.telephone}</Text> : null}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'SAVING...' : 'SAVE CHANGES'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 16,
    fontSize: 16,
    textAlign: getTextAlign(),
  },
  inputError: {
    borderColor: '#F05454',
  },
  errorText: {
    color: '#F05454',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: getFlexDirection('row'),
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 10,
    marginBottom: 30,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    paddingVertical: 16,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 4,
    paddingVertical: 16,
    width: '48%',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
  },
}); 