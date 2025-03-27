import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAddressStore, Address } from '../store/address-store';
import { makeApiCall, API_ENDPOINTS } from '../utils/api-config';

type Props = {
  address?: Address | null;
  onClose: () => void;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

// List of hardcoded Kuwait cities that users can select from
const CITIES = [
  'Kuwait City',
  'Hawalli',
  'Salmiya',
  'Ahmadi',
  'Jahra',
  'Farwaniya',
  'Fahaheel',
  'Mangaf',
  'Mubarak Al-Kabeer',
  'Sabah Al-Salem',
];

// Kuwait country code for the API
const KUWAIT_COUNTRY_ID = '114';
const KUWAIT_ZONE_ID = '1785'; // Default Kuwait zone ID

export default function AddEditAddress({ address, onClose }: Props) {
  const { addAddress, updateAddress } = useAddressStore();
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form state that matches the API expected fields
  const [form, setForm] = useState({
    firstname: address?.firstname || '',
    lastname: address?.lastname || '',
    telephone: address?.telephone || '',
    address_1: address?.address_1 || '',
    address_2: address?.address_2 || '',
    city: address?.city || '',
    custom_field: {
      '30': address?.custom_field?.['30'] || '', // Block
      '31': address?.custom_field?.['31'] || '', // Street
      '32': address?.custom_field?.['32'] || '', // House/Building
      '33': address?.custom_field?.['33'] || '', // Apartment
    },
    country_id: KUWAIT_COUNTRY_ID,
    zone_id: KUWAIT_ZONE_ID,
    default: address?.default || '0',
  });

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleCustomFieldChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      custom_field: {
        ...prev.custom_field,
        [field]: value
      }
    }));
    setFormError(null);
  };

  const handleSelectCity = (city: string) => {
    setForm(prev => ({ ...prev, city }));
    setShowCityPicker(false);
  };

  const validateForm = () => {
    if (!form.firstname.trim()) return 'First name is required';
    if (!form.lastname.trim()) return 'Last name is required';
    if (!form.telephone.trim()) return 'Mobile number is required';
    if (!form.address_1.trim()) return 'Address is required';
    if (!form.city.trim()) return 'City is required';
    if (!form.custom_field['30'].trim()) return 'Block is required';
    if (!form.custom_field['31'].trim()) return 'Street is required';
    if (!form.custom_field['32'].trim()) return 'House/Building number is required';
    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    setLoading(true);
    try {
      if (address?.address_id) {
        // Update existing address
        await updateAddress(address.address_id, form);
      } else {
        // Add new address
        await addAddress(form);
      }
      onClose();
    } catch (error: any) {
      setFormError(error.message || 'Failed to save address');
      Alert.alert('Error', error.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {address ? 'EDIT' : 'ADD'} ADDRESS
        </Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#000" />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {formError && (
          <Text style={styles.errorText}>{formError}</Text>
        )}
        
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="First Name"
            value={form.firstname}
            onChangeText={(text) => handleInputChange('firstname', text)}
            placeholderTextColor="#999"
          />

          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Last Name"
            value={form.lastname}
            onChangeText={(text) => handleInputChange('lastname', text)}
            placeholderTextColor="#999"
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          value={form.telephone}
          onChangeText={(text) => handleInputChange('telephone', text)}
          keyboardType="phone-pad"
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Address Line 1"
          value={form.address_1}
          onChangeText={(text) => handleInputChange('address_1', text)}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Address Line 2 (Optional)"
          value={form.address_2}
          onChangeText={(text) => handleInputChange('address_2', text)}
          placeholderTextColor="#999"
        />

        <View style={[styles.input, styles.selectInput]}>
          <Text style={styles.inputText}>Kuwait</Text>
          <Ionicons name="chevron-down" size={20} color="#999" />
        </View>

        <Pressable 
          style={[styles.input, styles.selectInput]}
          onPress={() => setShowCityPicker(true)}
        >
          <Text style={[styles.inputText, !form.city && styles.placeholder]}>
            {form.city || 'City'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="black" />
        </Pressable>

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Block"
            value={form.custom_field['30']}
            onChangeText={(text) => handleCustomFieldChange('30', text)}
            placeholderTextColor="#999"
          />

          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Street"
            value={form.custom_field['31']}
            onChangeText={(text) => handleCustomFieldChange('31', text)}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="House/Building No."
            value={form.custom_field['32']}
            onChangeText={(text) => handleCustomFieldChange('32', text)}
            placeholderTextColor="#999"
          />

          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Apartment No."
            value={form.custom_field['33']}
            onChangeText={(text) => handleCustomFieldChange('33', text)}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.defaultAddressContainer}>
          <Pressable
            style={styles.checkboxContainer}
            onPress={() => handleInputChange('default', form.default === '1' ? '0' : '1')}
          >
            <View style={[styles.checkbox, form.default === '1' && styles.checkboxChecked]}>
              {form.default === '1' && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Make this my default address</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={styles.cancelButton}
          onPress={onClose}
        >
          <Text style={styles.cancelButtonText}>CANCEL</Text>
        </Pressable>

        <Pressable 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>SAVE</Text>
          )}
        </Pressable>
      </View>

      <Modal
        visible={showCityPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCityPicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowCityPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select City</Text>
              <Pressable onPress={() => setShowCityPicker(false)}>
                <Ionicons name="close" size={24} color="black" />
              </Pressable>
            </View>
            <ScrollView>
              {CITIES.map((city) => (
                <Pressable
                  key={city}
                  style={[
                    styles.cityOption,
                    city === form.city && styles.selectedCityOption
                  ]}
                  onPress={() => handleSelectCity(city)}
                >
                  <Text style={styles.cityOptionText}>{city}</Text>
                  {city === form.city && (
                    <Ionicons name="checkmark" size={20} color="black" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 16,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  halfInput: {
    width: '48%',
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 16,
  },
  placeholder: {
    color: '#999',
  },
  defaultAddressContainer: {
    marginVertical: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#000',
  },
  checkboxLabel: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#000',
    marginLeft: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: SCREEN_HEIGHT * 0.7,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedCityOption: {
    backgroundColor: '#F8F8F8',
  },
  cityOptionText: {
    fontSize: 16,
  },
}); 