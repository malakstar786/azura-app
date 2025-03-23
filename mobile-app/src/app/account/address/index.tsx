import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAddressStore, Address } from '../../../store/address-store';
import { Modal } from 'react-native';
import AddEditAddress from '../../../components/add-edit-address';

export default function AddressScreen() {
  const { addresses, deleteAddress } = useAddressStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsModalVisible(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingAddress(null);
  };

  const renderAddress = (address: Address) => (
    <View key={address.id} style={styles.addressCard}>
      <View style={styles.addressContent}>
        <Text style={styles.name}>{address.fullName}</Text>
        <Text style={styles.phone}>{address.mobileNumber}</Text>
        <Text style={styles.addressText}>
          {address.country},
        </Text>
        <Text style={styles.addressText}>
          {address.area}, {address.city}
        </Text>
        <Text style={styles.addressText}>
          Block {address.block}, Street {address.street}, House Building {address.houseBuilding}
        </Text>
        {address.addressLine2 ? (
          <Text style={styles.addressText}>{address.addressLine2}</Text>
        ) : null}
      </View>
      <View style={styles.addressActions}>
        <Pressable 
          onPress={() => handleEditAddress(address)}
          style={styles.actionButton}
        >
          <Ionicons name="pencil-outline" size={20} color="black" />
        </Pressable>
        <Pressable 
          onPress={() => deleteAddress(address.id)}
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={20} color="black" />
        </Pressable>
      </View>
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

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={handleCloseModal}
      >
        <AddEditAddress
          address={editingAddress}
          onClose={handleCloseModal}
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
  phone: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
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