import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, Address as AuthAddress } from '../store/auth-store';
import { useAddressStore } from '../store/address-store';
import { KUWAIT_CITIES, KUWAIT_COUNTRY_ID } from '../utils/cities';
import { makeApiCall, API_ENDPOINTS } from '../utils/api-config';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{formData.address_id ? 'EDIT ADDRESS' : 'ADD ADDRESS'}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* First Name Input */}
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={formData.firstname}
          onChangeText={(text) => setFormData({ ...formData, firstname: text })}
        />

        {/* Phone Number Input */}
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={formData.lastname}  // In the screenshot, this is used for phone
          onChangeText={(text) => setFormData({ ...formData, lastname: text })}
          keyboardType="phone-pad"
        />

        {/* Country Dropdown */}
        <TouchableOpacity 
          style={styles.dropdownInput}
          onPress={() => setShowCountryPicker(true)}
        >
          <Text style={formData.country_id === '114' ? styles.dropdownText : styles.dropdownPlaceholder}>
            {formData.country_id === '114' ? 'Kuwait' : 'Select Country'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="black" />
        </TouchableOpacity>

        {/* City Dropdown */}
        <TouchableOpacity 
          style={styles.dropdownInput}
          onPress={() => setShowCityPicker(true)}
        >
          <Text style={formData.city ? styles.dropdownText : styles.dropdownPlaceholder}>
            {formData.city || 'City'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="black" />
        </TouchableOpacity>

        {/* Area Input */}
        <TextInput
          style={styles.input}
          placeholder="Area"
          value={formData.address_1}
          onChangeText={(text) => setFormData({ ...formData, address_1: text })}
        />

        {/* Block and Street in Row */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Block"
            value={formData.custom_field['30']}
            onChangeText={(text) => setFormData({
              ...formData,
              custom_field: { ...formData.custom_field, '30': text }
            })}
            keyboardType="number-pad"
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Street"
            value={formData.custom_field['31']}
            onChangeText={(text) => setFormData({
              ...formData,
              custom_field: { ...formData.custom_field, '31': text }
            })}
          />
        </View>

        {/* House/Building No. and Apartment No. in Row */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="House Building No."
            value={formData.custom_field['32']}
            onChangeText={(text) => setFormData({
              ...formData,
              custom_field: { ...formData.custom_field, '32': text }
            })}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Apartment No."
            value={formData.custom_field['33']}
            onChangeText={(text) => setFormData({
              ...formData,
              custom_field: { ...formData.custom_field, '33': text }
            })}
          />
        </View>

        {/* Address Line 2 */}
        <TextInput
          style={styles.input}
          placeholder="Address line 2"
          value={formData.address_2}
          onChangeText={(text) => setFormData({ ...formData, address_2: text })}
        />

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSubmit}
            disabled={isLoading || localLoading}
          >
            {isLoading || localLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>SAVE</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* City Picker Modal */}
      {showCityPicker && (
        <View style={styles.pickerModal}>
          <ScrollView>
            {KUWAIT_CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                style={styles.pickerItem}
                onPress={() => {
                  setFormData({ ...formData, city });
                  setShowCityPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{city}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closePickerButton}
            onPress={() => setShowCityPicker(false)}
          >
            <Text style={styles.closePickerButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 15,
    marginBottom: 16,
    fontSize: 16,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 15,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  halfInput: {
    width: '48%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 15,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 15,
    width: '48%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    maxHeight: '50%',
  },
  pickerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  pickerItemText: {
    fontSize: 16,
  },
  closePickerButton: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  closePickerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 