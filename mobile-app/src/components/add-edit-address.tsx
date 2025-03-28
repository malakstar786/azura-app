import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuthStore, Address as AuthAddress } from '../store/auth-store';
import { useAddressStore } from '../store/address-store';
import { KUWAIT_CITIES, KUWAIT_COUNTRY_ID } from '../utils/cities';

interface AddEditAddressProps {
  onClose: () => void;
  address?: any;
  isEdit?: boolean;
}

const AddEditAddress: React.FC<AddEditAddressProps> = ({ onClose, address, isEdit = false }) => {
  const authStore = useAuthStore();
  const addressStore = useAddressStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form with address data or defaults
  const [formData, setFormData] = useState({
    firstname: address?.firstname || authStore.user?.firstname || '',
    lastname: address?.lastname || authStore.user?.lastname || '',
    country_id: KUWAIT_COUNTRY_ID, // Kuwait
    zone_id: '0', // Default zone for Kuwait
    city: address?.city || 'Kuwait City', 
    custom_field: {
      '30': address?.custom_field?.['30'] || '', // Block
      '31': address?.custom_field?.['31'] || '', // Street
      '32': address?.custom_field?.['32'] || '', // House/Building
      '33': address?.custom_field?.['33'] || '', // Apartment
    },
    address_1: address?.address_1 || '',
    address_2: address?.address_2 || '',
    default: address?.default || false,
  });

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
      Alert.alert('Error', 'Please enter your building number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      // Prepare address data for submission - convert to the AuthAddress format
      const addressData: Omit<AuthAddress, 'address_id'> = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        company: '',
        address_1: formData.address_1 || `Block ${formData.custom_field['30']}, Street ${formData.custom_field['31']}, Building ${formData.custom_field['32']}`,
        address_2: formData.address_2 || '',
        postcode: '',
        city: formData.city,
        zone_id: formData.zone_id,
        zone: '',
        country_id: formData.country_id,
        country: 'Kuwait',
        custom_field: formData.custom_field,
        default: formData.default
      };
      
      console.log('Submitting address data:', addressData);
      
      if (isEdit && address?.address_id) {
        // Update existing address
        await authStore.updateAddress({
          ...addressData,
          address_id: address.address_id,
        });
        Alert.alert('Success', 'Address updated successfully');
      } else {
        // Add new address
        await authStore.addAddress(addressData);
        Alert.alert('Success', 'Address added successfully');
      }
      
      // Refresh both stores to ensure consistency
      await addressStore.fetchAddresses();
      
      onClose();
    } catch (error: any) {
      console.error('Failed to save address:', error);
      Alert.alert('Error', error.message || 'Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{isEdit ? 'EDIT ADDRESS' : 'ADD ADDRESS'}</Text>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter first name"
          value={formData.firstname}
          onChangeText={(text) => setFormData({ ...formData, firstname: text })}
        />
      </View>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter last name"
          value={formData.lastname}
          onChangeText={(text) => setFormData({ ...formData, lastname: text })}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>City *</Text>
        <TouchableOpacity 
          style={styles.input}
          onPress={() => setShowCityPicker(true)}
        >
          <Text>{formData.city || 'Select City'}</Text>
        </TouchableOpacity>
      </View>

      {showCityPicker && (
        <View style={styles.cityPicker}>
          <ScrollView>
            {KUWAIT_CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                style={styles.cityItem}
                onPress={() => {
                  setFormData({ ...formData, city });
                  setShowCityPicker(false);
                }}
              >
                <Text>{city}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCityPicker(false)}
          >
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Block *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter block number"
          value={formData.custom_field['30']}
          onChangeText={(text) => setFormData({
            ...formData,
            custom_field: { ...formData.custom_field, '30': text }
          })}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Street *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter street name/number"
          value={formData.custom_field['31']}
          onChangeText={(text) => setFormData({
            ...formData,
            custom_field: { ...formData.custom_field, '31': text }
          })}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>House/Building Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter house/building number"
          value={formData.custom_field['32']}
          onChangeText={(text) => setFormData({
            ...formData,
            custom_field: { ...formData.custom_field, '32': text }
          })}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Apartment Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter apartment number (optional)"
          value={formData.custom_field['33']}
          onChangeText={(text) => setFormData({
            ...formData,
            custom_field: { ...formData.custom_field, '33': text }
          })}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Additional Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter additional address details (optional)"
          value={formData.address_2}
          onChangeText={(text) => setFormData({ ...formData, address_2: text })}
        />
      </View>

      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => setFormData({ ...formData, default: !formData.default })}
      >
        <View style={[styles.checkboxBox, formData.default && styles.checkboxChecked]} />
        <Text style={styles.checkboxLabel}>Make this my default address</Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={onClose}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Address'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 5,
  },
  cityPicker: {
    position: 'absolute',
    top: '20%',
    left: 20,
    right: 20,
    maxHeight: '60%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cityItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeButton: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginTop: 10,
    borderRadius: 5,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#000',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#000',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#000',
    marginLeft: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default AddEditAddress; 