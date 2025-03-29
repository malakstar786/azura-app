import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAddressStore } from '../../../store/address-store';
import AddEditAddress from '../../../components/add-edit-address';
import { useAuthStore } from '../../../store/auth-store';

// Define the interface for Address from store
interface Address {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  block: string;
  street: string;
  houseNumber: string;
  apartmentNumber: string;
  additionalDetails: string;
  isDefault: boolean;
}

// Define the interface for AddressFormData
interface AddressFormData {
  address_id?: string;
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
}

export default function AddressScreen() {
  const { addresses, fetchAddresses, deleteAddress, isLoading } = useAddressStore();
  const { isAuthenticated } = useAuthStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressFormData | undefined>(undefined);

  // Fetch addresses when the component mounts
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Fetching addresses...');
      fetchAddresses()
        .then(() => {
          console.log('Addresses fetched successfully');
        })
        .catch((error) => {
          console.error('Error fetching addresses:', error);
        });
    }
  }, [isAuthenticated, fetchAddresses]);

  // Log addresses when they change
  useEffect(() => {
    console.log('Current addresses:', addresses);
  }, [addresses]);

  const handleAddAddress = () => {
    setEditingAddress(undefined);
    setIsModalVisible(true);
  };

  const handleEditAddress = (address: Address) => {
    // Convert address format for the edit form
    const formData: AddressFormData = {
      address_id: address.id,
      firstname: address.firstName,
      lastname: address.lastName,
      city: address.city,
      address_1: '',
      address_2: address.additionalDetails,
      company: '',
      postcode: '',
      country_id: '114', // Kuwait
      zone_id: '1785',   // Kuwait City
      custom_field: {
        '30': address.block, // Block
        '31': address.street, // Street
        '32': address.houseNumber, // Building
        '33': address.apartmentNumber // Apartment
      },
      default: address.isDefault
    };
    
    setEditingAddress(formData);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingAddress(undefined);
    fetchAddresses(); // Refresh the addresses after modal is closed
  };

  const renderAddress = (address: Address) => (
    <View key={address.id} style={styles.addressCard}>
      <View style={styles.addressContent}>
        <Text style={styles.name}>{address.firstName} {address.lastName}</Text>
        <Text style={styles.addressText}>
          Kuwait,
        </Text>
        <Text style={styles.addressText}>
          {address.city}
        </Text>
        <Text style={styles.addressText}>
          Block {address.block}, Street {address.street}, House Building {address.houseNumber}
          {address.apartmentNumber ? `, Apartment ${address.apartmentNumber}` : ''}
        </Text>
        {address.additionalDetails ? (
          <Text style={styles.addressText}>{address.additionalDetails}</Text>
        ) : null}
      </View>
      <Pressable 
        onPress={() => handleEditAddress(address)}
        style={styles.editButton}
      >
        <Ionicons name="create-outline" size={18} color="black" />
        <Text style={styles.editButtonText}>Edit Address</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'MY ADDRESS',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
          ),
          headerShadowVisible: false,
        }}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          {addresses.length === 0 ? (
            <Pressable 
              style={styles.addAddressButton}
              onPress={handleAddAddress}
            >
              <Text style={styles.addAddressText}>Add Address</Text>
            </Pressable>
          ) : (
            <>
              {addresses.map(renderAddress)}
              <Pressable 
                style={[styles.addAddressButton, styles.addMoreButton]}
                onPress={handleAddAddress}
              >
                <Text style={styles.addAddressText}>Add Another Address</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={handleCloseModal}
      >
        <AddEditAddress
          address={editingAddress}
          onClose={handleCloseModal}
          onAddressUpdated={fetchAddresses}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  addAddressButton: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  addMoreButton: {
    marginTop: 12,
  },
  addAddressText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  addressCard: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 16,
    marginBottom: 16,
  },
  addressContent: {
    marginBottom: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  editButtonText: {
    fontSize: 14,
    color: '#000',
  },
}); 