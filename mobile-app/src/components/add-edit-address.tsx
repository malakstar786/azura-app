import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  Modal, 
  SafeAreaView, 
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@store/auth-store';
import { useAddressStore } from '@store/address-store';
import { LocationService, Country, Governorate, Zone } from '@utils/location-service';
import { theme } from '@theme';
import { useTranslation } from '@utils/translations';
import { getTextAlign, getFlexDirection } from '@utils/rtlStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FormData {
  firstname: string;
  lastname: string;
  phone: string;
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
    '35': string; // avenue
  };
  default: boolean;
  address_id?: string;
}

interface ImprovedAddEditAddressProps {
  address?: FormData;
  onClose: () => void;
  onAddressUpdated?: () => void;
  context?: 'account' | 'checkout';
  customSaveFunction?: (addressData: any) => Promise<boolean>;
}

export default function ImprovedAddEditAddress({ address, onClose, onAddressUpdated, context, customSaveFunction }: ImprovedAddEditAddressProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { addAddress, updateAddress, isLoading, fetchAddresses } = useAddressStore();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    firstname: address?.firstname || '',
    lastname: address?.lastname || '',
    phone: address?.phone || '',
    company: address?.company || '',
    address_1: address?.address_1 || '',
    address_2: address?.address_2 || '',
    city: address?.city || '',
    postcode: address?.postcode || '',
    country_id: address?.country_id || '114', // Kuwait
    zone_id: address?.zone_id || '',
    custom_field: {
      '30': address?.custom_field?.['30'] || '',
      '31': address?.custom_field?.['31'] || '',
      '32': address?.custom_field?.['32'] || '',
      '33': address?.custom_field?.['33'] || '',
      '35': address?.custom_field?.['35'] || ''
    },
    default: address?.default || false,
    address_id: address?.address_id
  });

  // Separate state for full name to allow free typing with spaces
  const [fullName, setFullName] = useState(() => {
    const first = address?.firstname || '';
    const last = address?.lastname || '';
    return first + (last ? ' ' + last : '');
  });

  // Location data state
  const [countries, setCountries] = useState<Country[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [areas, setAreas] = useState<Zone[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(null);
  const [selectedArea, setSelectedArea] = useState<Zone | null>(null);

  // Modal states
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showGovernorateModal, setShowGovernorateModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  
  // Loading states
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingGovernorates, setLoadingGovernorates] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  // Load countries on component mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load governorates when country is selected
  useEffect(() => {
    if (formData.country_id) {
      loadGovernorates(formData.country_id);
    }
  }, [formData.country_id]);

  // Pre-populate form when editing an address
  useEffect(() => {
    if (address) {
      // Pre-populate form with existing address data
      setFormData({
        firstname: address.firstname || '',
        lastname: address.lastname || '',
        phone: address.phone || '',
        company: address.company || '',
        address_1: address.address_1 || '',
        address_2: address.address_2 || '',
        city: address.city || '',
        postcode: address.postcode || '',
        country_id: address.country_id || '114',
        zone_id: address.zone_id || '',
        custom_field: address.custom_field || {
          '30': '',
          '31': '',
          '32': '',
          '33': '',
          '35': ''
        },
        default: address.default || false,
        address_id: address.address_id
      });
      
      // Set selected country
      if (address.country_id && countries.length > 0) {
        const country = countries.find(c => c.country_id === address.country_id);
        if (country) {
          setSelectedCountry(country);
        }
      }
      
      // Set selected governorate
      if (address.zone_id && governorates.length > 0) {
        const governorate = governorates.find(g => g.governorate_id === address.zone_id);
        if (governorate) {
          setSelectedGovernorate(governorate);
          loadAreas(address.zone_id);
        }
      }
    }
    // Note: For new addresses, we keep the form empty (no pre-filling with user data)
  }, [address, countries, governorates]);

  const loadCountries = async () => {
    try {
      setLoadingCountries(true);
      const countriesData = await LocationService.getCountries();
      setCountries(countriesData);
      
      // Set Kuwait as default if available
      const kuwait = countriesData.find(c => c.country_id === '114');
      if (kuwait) {
        setSelectedCountry(kuwait);
      }
    } catch (error) {
      console.error('Error loading countries:', error);
      Alert.alert('Error', 'Failed to load countries');
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadGovernorates = async (countryId: string) => {
    try {
      setLoadingGovernorates(true);
      const locationData = await LocationService.getGovernoratesAndAreas(countryId);
      setGovernorates(locationData.governorates || []);
      setAreas([]); // Clear areas when country changes
      setSelectedGovernorate(null);
      setSelectedArea(null);
    } catch (error) {
      console.error('Error loading governorates:', error);
      Alert.alert('Error', 'Failed to load governorates');
    } finally {
      setLoadingGovernorates(false);
    }
  };

  const loadAreas = async (governorateId: string) => {
    try {
      setLoadingAreas(true);
      const areasData = await LocationService.getAreasByGovernorate(formData.country_id, governorateId);
      setAreas(areasData);
      setSelectedArea(null);
    } catch (error) {
      console.error('Error loading areas:', error);
      Alert.alert('Error', 'Failed to load areas');
    } finally {
      setLoadingAreas(false);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setFormData({ ...formData, country_id: country.country_id, zone_id: '' });
    setShowCountryModal(false);
  };

  const handleGovernorateSelect = (governorate: Governorate) => {
    setSelectedGovernorate(governorate);
    setFormData({ ...formData, city: governorate.name });
    loadAreas(governorate.governorate_id);
    setShowGovernorateModal(false);
  };

  const handleAreaSelect = (area: Zone) => {
    setSelectedArea(area);
    setFormData({ ...formData, zone_id: area.zone_id });
    setShowAreaModal(false);
  };

  const validateForm = () => {
    const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
    
    if (nameParts.length < 2) {
      Alert.alert('Error', 'Please add first name and last name with a space in between');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!formData.country_id) {
      Alert.alert('Error', 'Please select a country');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Error', 'Please select a city/governorate');
      return false;
    }
    if (!formData.zone_id) {
      Alert.alert('Error', 'Please select an area');
      return false;
    }
    if (!formData.custom_field['30'].trim()) {
      Alert.alert('Error', 'Please enter your block number');
      return false;
    }
    if (!formData.custom_field['31'].trim()) {
      Alert.alert('Error', 'Please enter your street number');
      return false;
    }
    if (!formData.custom_field['32'].trim()) {
      Alert.alert('Error', 'Please enter your house/building number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    // Split full name before validation and submission
    const splitName = () => {
      const trimmedName = fullName.trim();
      if (trimmedName === '') {
        return { firstname: '', lastname: '' };
      }
      
      const lastSpaceIndex = trimmedName.lastIndexOf(' ');
      if (lastSpaceIndex === -1) {
        return { firstname: trimmedName, lastname: '' };
      }
      
      return {
        firstname: trimmedName.substring(0, lastSpaceIndex),
        lastname: trimmedName.substring(lastSpaceIndex + 1)
      };
    };

    const { firstname, lastname } = splitName();
    const updatedFormData = { ...formData, firstname, lastname };

    if (!validateForm()) return;

    try {
      // Prepare address data for different contexts
      if (context === 'checkout' && customSaveFunction && !formData.address_id) {
        // Get user's email from auth store
        const { user } = useAuthStore.getState();
        
        // For new addresses in checkout context, use custom payment address endpoint
        const addressData = {
          firstname: updatedFormData.firstname,
          lastname: updatedFormData.lastname || '',
          telephone: updatedFormData.phone || user?.telephone || '',
          email: user?.email || '', // Use user's email from auth store
          country_id: updatedFormData.country_id,
          city: updatedFormData.city,
          zone_id: updatedFormData.zone_id,
          address_2: updatedFormData.address_2 || '',
          custom_field: {
            '30': updatedFormData.custom_field['30'], // Block
            '31': updatedFormData.custom_field['31'], // Street
            '32': updatedFormData.custom_field['32'], // House Building
            '33': updatedFormData.custom_field['33'], // Apartment No.
            '35': updatedFormData.custom_field['35'] || '' // avenue
          }
        };

        const success = await customSaveFunction(addressData);
        if (success) {
          if (onAddressUpdated) {
            onAddressUpdated();
          }
          onClose();
        }
      } else {
        // For account context or editing existing addresses, use existing address store logic
        const addressData = {
          firstName: updatedFormData.firstname,
          lastName: updatedFormData.lastname || '',
          phone: updatedFormData.phone,
          city: updatedFormData.city,
          block: updatedFormData.custom_field['30'],
          street: updatedFormData.custom_field['31'],
          houseNumber: updatedFormData.custom_field['32'],
          apartmentNumber: updatedFormData.custom_field['33'] || '',
          avenue: updatedFormData.custom_field['35'] || '',
          additionalDetails: updatedFormData.address_2 || '',
          isDefault: updatedFormData.default
        };

        if (updatedFormData.address_id) {
          await updateAddress(updatedFormData.address_id, addressData);
        } else {
          await addAddress(addressData);
        }

        // Auto-refresh addresses
        await fetchAddresses();
        
        if (onAddressUpdated) {
          onAddressUpdated();
        }
        
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to save address:', error);
      Alert.alert('Error', error.message || 'Failed to save address');
    }
  };

  const renderDropdownModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    data: any[],
    onSelect: (item: any) => void,
    loading: boolean,
    renderItem: (item: any) => string
  ) => (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.dropdownModal}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.black} />
            </View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item, index) => {
                // Create unique keys based on the modal type and item properties
                if (title === 'Select Country') {
                  return `country-${item.country_id || index}`;
                } else if (title === 'Select City') {
                  return `governorate-${item.governorate_id || index}`;
                } else if (title === 'Select Area') {
                  return `area-${item.zone_id || index}`;
                }
                return `${title}-${index}`;
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => onSelect(item)}
                >
                  <Text style={styles.dropdownItemText}>{renderItem(item)}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {address ? 'EDIT ADDRESS' : 'ADD ADDRESS'}
          </Text>
        </View>

        {/* Form Content */}
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            style={styles.formContainer} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
          {/* Full Name Field */}
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholderTextColor="#999"
          />

          {/* Phone Field */}
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />

          {/* Country Dropdown */}
          <TouchableOpacity 
            style={styles.dropdownInput}
            onPress={() => setShowCountryModal(true)}
          >
            <Text style={selectedCountry ? styles.inputText : styles.placeholderText}>
              {selectedCountry ? selectedCountry.name : 'Kuwait'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#000" />
          </TouchableOpacity>

          {/* City/Governorate Dropdown */}
          <TouchableOpacity 
            style={styles.dropdownInput}
            onPress={() => setShowGovernorateModal(true)}
            disabled={!formData.country_id}
          >
            <Text style={selectedGovernorate ? styles.inputText : styles.placeholderText}>
              {selectedGovernorate ? selectedGovernorate.name : 'City'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#000" />
          </TouchableOpacity>

          {/* Area Dropdown */}
          <TouchableOpacity 
            style={styles.dropdownInput}
            onPress={() => setShowAreaModal(true)}
            disabled={!selectedGovernorate}
          >
            <Text style={selectedArea ? styles.inputText : styles.placeholderText}>
              {selectedArea ? selectedArea.name : 'Area'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#000" />
          </TouchableOpacity>

          {/* Block and Street Row */}
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

          {/* House Building and Apartment Row */}
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

          {/* Avenue Field */}
          <TextInput
            style={styles.input}
            placeholder="Avenue"
            value={formData.custom_field['35']}
            onChangeText={(text) => setFormData({
              ...formData,
              custom_field: { ...formData.custom_field, '35': text }
            })}
            placeholderTextColor="#999"
          />

          {/* Address Line 2 */}
          <TextInput
            style={styles.input}
            placeholder="Address line 2"
            value={formData.address_2}
            onChangeText={(text) => setFormData({ ...formData, address_2: text })}
            placeholderTextColor="#999"
            multiline
          />

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.saveButton} 
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
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Dropdown Modals */}
        {renderDropdownModal(
          showCountryModal,
          () => setShowCountryModal(false),
          'Select Country',
          countries,
          handleCountrySelect,
          loadingCountries,
          (country: Country) => country.name
        )}

        {renderDropdownModal(
          showGovernorateModal,
          () => setShowGovernorateModal(false),
          'Select City',
          governorates,
          handleGovernorateSelect,
          loadingGovernorates,
          (governorate: Governorate) => governorate.name
        )}

        {renderDropdownModal(
          showAreaModal,
          () => setShowAreaModal(false),
          'Select Area',
          areas,
          handleAreaSelect,
          loadingAreas,
          (area: Zone) => area.name
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: getFlexDirection('row'),
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
    marginEnd: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 0,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    textAlign: getTextAlign(),
  },
  dropdownInput: {
    height: 56,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 0,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: getFlexDirection('row'),
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  rowInputs: {
    flexDirection: getFlexDirection('row'),
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  inputText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  footer: {
    flexDirection: getFlexDirection('row'),
    padding: 16,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  saveButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  dropdownHeader: {
    flexDirection: getFlexDirection('row'),
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  dropdownItem: {
    padding: 16,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#000',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
}); 