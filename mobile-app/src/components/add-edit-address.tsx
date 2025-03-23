import React from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAddressStore, Address } from '../store/address-store';

type Props = {
  address?: Address | null;
  onClose: () => void;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

const CITIES = [
  'Hawally',
  'Jahra',
  'Farwaniyah',
  'Jabriya',
  'Mubarak Al Kabeer',
];

export default function AddEditAddress({ address, onClose }: Props) {
  const { addAddress, updateAddress } = useAddressStore();
  const [showCityPicker, setShowCityPicker] = React.useState(false);
  const [form, setForm] = React.useState({
    fullName: address?.fullName || '',
    mobileNumber: address?.mobileNumber || '',
    country: 'Kuwait',
    city: address?.city || '',
    area: address?.area || '',
    block: address?.block || '',
    street: address?.street || '',
    houseBuilding: address?.houseBuilding || '',
    apartment: address?.apartment || '',
    addressLine2: address?.addressLine2 || '',
  });

  const handleSave = () => {
    if (address?.id) {
      updateAddress(address.id, form);
    } else {
      addAddress(form);
    }
    onClose();
  };

  const handleSelectCity = (city: string) => {
    setForm(prev => ({ ...prev, city }));
    setShowCityPicker(false);
  };

  const isFormValid = form.fullName && form.mobileNumber && form.area && form.block;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {address ? 'EDIT' : 'ADD'}{'\n'}ADDRESS
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={form.fullName}
          onChangeText={(text) => setForm({ ...form, fullName: text })}
          placeholderTextColor="#000"
        />

        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          value={form.mobileNumber}
          onChangeText={(text) => setForm({ ...form, mobileNumber: text })}
          keyboardType="phone-pad"
          placeholderTextColor="#000"
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

        <TextInput
          style={styles.input}
          placeholder="Area"
          value={form.area}
          onChangeText={(text) => setForm({ ...form, area: text })}
          placeholderTextColor="#000"
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Block"
            value={form.block}
            onChangeText={(text) => setForm({ ...form, block: text })}
            placeholderTextColor="#000"
          />

          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Street"
            value={form.street}
            onChangeText={(text) => setForm({ ...form, street: text })}
            placeholderTextColor="#000"
          />
        </View>

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="House Building No."
            value={form.houseBuilding}
            onChangeText={(text) => setForm({ ...form, houseBuilding: text })}
            placeholderTextColor="#000"
          />

          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Apartment No."
            value={form.apartment}
            onChangeText={(text) => setForm({ ...form, apartment: text })}
            placeholderTextColor="#000"
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Address line 2"
          value={form.addressLine2}
          onChangeText={(text) => setForm({ ...form, addressLine2: text })}
          placeholderTextColor="#000"
        />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={styles.cancelButton}
          onPress={onClose}
        >
          <Text style={styles.cancelButtonText}>CANCEL</Text>
        </Pressable>

        <Pressable 
          style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!isFormValid}
        >
          <Text style={styles.saveButtonText}>SAVE</Text>
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
                    city === form.city && styles.selectedCity
                  ]}
                  onPress={() => handleSelectCity(city)}
                >
                  <Text style={[
                    styles.cityOptionText,
                    city === form.city && styles.selectedCityText
                  ]}>
                    {city}
                  </Text>
                  {city === form.city && (
                    <Ionicons name="checkmark" size={24} color="white" />
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
    height: SCREEN_HEIGHT * 0.9,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 38,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
  },
  inputText: {
    fontSize: 16,
    color: '#000',
  },
  placeholder: {
    color: '#000',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingHorizontal: 24,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#000',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '90%',
    maxHeight: SCREEN_HEIGHT * 0.7,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
    borderBottomColor: '#E5E5E5',
  },
  selectedCity: {
    backgroundColor: '#000',
  },
  cityOptionText: {
    fontSize: 16,
    color: '#000',
  },
  selectedCityText: {
    color: '#fff',
  },
}); 