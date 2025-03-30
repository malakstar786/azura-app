import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Address } from '../store/address-store';
import { theme } from '../theme';

interface AddressSelectionModalProps {
  visible: boolean;
  addresses: Address[];
  onSelect: (address: Address) => void;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function AddressSelectionModal({
  visible,
  addresses,
  onSelect,
  onClose,
}: AddressSelectionModalProps) {
  const getAddressText = (address: Address) => {
    return `${address.block} Block, ${address.street} Street, House ${address.houseNumber}${
      address.apartmentNumber ? `, Apartment ${address.apartmentNumber}` : ''
    }`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Address</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.addressList}>
            {addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={styles.addressOption}
                onPress={() => onSelect(address)}
              >
                <Text style={styles.addressText}>{getAddressText(address)}</Text>
                {address.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.addNewAddressButton} onPress={onClose}>
            <Text style={styles.addNewAddressText}>+ ADD NEW ADDRESS</Text>
          </TouchableOpacity>
        </View>
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
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  addressList: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  addressOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  addressText: {
    color: theme.colors.text,
  },
  defaultBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: theme.colors.primary,
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  addNewAddressButton: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  addNewAddressText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
}); 