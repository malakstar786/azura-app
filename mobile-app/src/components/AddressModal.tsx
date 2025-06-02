import React from 'react';
import { Modal, View, StyleSheet, Dimensions } from 'react-native';
import type { Address } from '@store/address-store';
import AddEditAddress from './add-edit-address';

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  isNewAddress: boolean;
  address?: Address;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function AddressModal({ visible, onClose, isNewAddress, address }: AddressModalProps) {
  // Convert Address to FormData format
  const formData = address ? {
    firstname: address.firstName,
    lastname: address.lastName,
    phone: '+965 66112321', // Default phone for now
    company: '',
    address_1: `Block ${address.block}, Street ${address.street}, House ${address.houseNumber}${address.apartmentNumber ? `, Apt ${address.apartmentNumber}` : ''}`,
    address_2: address.additionalDetails,
    city: address.city,
    postcode: '',
    country_id: '114', // Kuwait
    zone_id: '1785', // Al Asimah (Kuwait City)
    custom_field: {
      '30': address.block,
      '31': address.street,
      '32': address.houseNumber,
      '33': address.apartmentNumber
    },
    default: address.isDefault,
    address_id: address.id
  } : undefined;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <AddEditAddress
          onClose={onClose}
          address={formData}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
}); 