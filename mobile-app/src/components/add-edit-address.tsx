import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, Address as AuthAddress } from '../store/auth-store';
import { useAddressStore } from '../store/address-store';
import { KUWAIT_CITIES, KUWAIT_COUNTRY_ID } from '../utils/cities';
import { makeApiCall, API_ENDPOINTS } from '../utils/api-config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FormData {
  firstname: string;
  lastname: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  postcode: string;
  country_id: string;
  zone_id: string;
  custom_field: {
    '30': string; // block
    '31': string; // street
    '32': string; // building
    '33': string; // apartment
  };
  default: boolean;
  address_id?: string;
}

interface AddEditAddressProps {
  address?: FormData;
  onClose: () => void;
  onAddressUpdated?: () => void;
}

export default function AddEditAddress({ address, onClose, onAddressUpdated }: AddEditAddressProps) {
  const authStore = useAuthStore();
  const { addAddress, updateAddress, isLoading, fetchAddresses } = useAddressStore();
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // Initialize form with address data or defaults
  const [formData, setFormData] = useState<FormData>({
    firstname: address?.firstname || '',
    lastname: address?.lastname || '',
    company: address?.company || '',
    address_1: address?.address_1 || '',
    address_2: address?.address_2 || '',
    city: address?.city || 'Kuwait City', // Default to Kuwait City
    postcode: address?.postcode || '',
    country_id: address?.country_id || '114', // Kuwait
    zone_id: address?.zone_id || '1785', // Al Asimah (Kuwait City)
    custom_field: {
      '30': address?.custom_field?.['30'] || '',
      '31': address?.custom_field?.['31'] || '',
      '32': address?.custom_field?.['32'] || '',
      '33': address?.custom_field?.['33'] || ''
    },
    default: address?.default || false,
    address_id: address?.address_id // Only present for edit
  });

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const validateForm = () => {
    // Required fields validation
    if (!formData.firstname) {
      Alert.alert('Error', 'Please enter your first name');
      return false;
    }
    if (!formData.lastname) {
      Alert.alert('Error', 'Please enter your last name');
      return false;
    }
    if (!formData.city) {
      Alert.alert('Error', 'Please select a city');
      return false;
    }
    if (!formData.custom_field['30']) {
      Alert.alert('Error', 'Please enter your block number');
      return false;
    }
    if (!formData.custom_field['31']) {
      Alert.alert('Error', 'Please enter your street');
      return false;
    }
    if (!formData.custom_field['32']) {
      Alert.alert('Error', 'Please enter your house/building number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    try {
      setLocalLoading(true);
      setError('');
      
      if (!validateForm()) {
        setLocalLoading(false);
        return;
      }

      // Create an address object that matches the Address interface from the store
      const addressData = {
        firstName: formData.firstname,
        lastName: formData.lastname,
        city: formData.city,
        block: formData.custom_field['30'],
        street: formData.custom_field['31'],
        houseNumber: formData.custom_field['32'],
        apartmentNumber: formData.custom_field['33'] || '',
        additionalDetails: formData.address_2 || '',
        isDefault: formData.default
      };

      console.log('Form data being submitted:', formData);
      console.log('Converted store data:', addressData);

      if (formData.address_id) {
        // Update existing address - MUST include address_id
        console.log(`Updating address with ID: ${formData.address_id}`);
        await updateAddress(formData.address_id, addressData);
      } else {
        // Add new address - MUST NOT include address_id
        console.log('Adding new address');
        await addAddress(addressData);
      }

      // Refresh address list
      await fetchAddresses();
      
      // Close modal and refresh addresses
      if (onAddressUpdated) {
        onAddressUpdated();
      }
      
      setLocalLoading(false);
      onClose();
    } catch (err: any) {
      console.error('Failed to save address:', err);
      setError(err.message || 'Failed to save address');
      Alert.alert('Error', err.message || 'Could not save address. Please try again.');
      setLocalLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.title}>{address ? 'EDIT ADDRESS' : 'ADD ADDRESS'}</Text>
            </View>

            {/* Form Content */}
            <ScrollView style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={formData.firstname}
                onChangeText={(text) => setFormData({ ...formData, firstname: text })}
                placeholderTextColor="#999"
              />

              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={formData.lastname}
                onChangeText={(text) => setFormData({ ...formData, lastname: text })}
                placeholderTextColor="#999"
              />

              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={formData.lastname}
                onChangeText={(text) => setFormData({ ...formData, lastname: text })}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />

              <TouchableOpacity 
                style={styles.input}
                onPress={() => setShowCountryPicker(true)}
              >
                <Text style={formData.country_id ? styles.inputText : styles.placeholderText}>
                  {formData.country_id ? 'Kuwait' : 'Country'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#000" style={styles.dropdownIcon} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.input}
                onPress={() => setShowCityPicker(true)}
              >
                <Text style={formData.city ? styles.inputText : styles.placeholderText}>
                  {formData.city || 'City'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#000" style={styles.dropdownIcon} />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Area"
                value={formData.address_1}
                onChangeText={(text) => setFormData({ ...formData, address_1: text })}
                placeholderTextColor="#999"
              />

              <View style={styles.rowInputs}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Block"
                  value={formData.custom_field['30']}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    custom_field: { ...formData.custom_field, '30': text }
                  })}
                  placeholderTextColor="#999"
                />

                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Street"
                  value={formData.custom_field['31']}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    custom_field: { ...formData.custom_field, '31': text }
                  })}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.rowInputs}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="House Building No."
                  value={formData.custom_field['32']}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    custom_field: { ...formData.custom_field, '32': text }
                  })}
                  placeholderTextColor="#999"
                />

                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Apartment No."
                  value={formData.custom_field['33']}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    custom_field: { ...formData.custom_field, '33': text }
                  })}
                  placeholderTextColor="#999"
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Address line 2 (Optional)"
                value={formData.address_2}
                onChangeText={(text) => setFormData({ ...formData, address_2: text })}
                placeholderTextColor="#999"
              />
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>SAVE</Text>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT * 0.9,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 4,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  halfInput: {
    width: '48%',
    marginBottom: 0,
  },
  inputText: {
    fontSize: 14,
    color: '#000',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
  },
  dropdownIcon: {
    position: 'absolute',
    right: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#000',
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
}); 