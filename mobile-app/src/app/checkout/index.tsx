import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAddressStore } from '../../store/address-store';
import { useCartStore } from '../../store/cart-store';
import AddEditAddress from '../../components/add-edit-address';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function CheckoutScreen() {
  const { addresses } = useAddressStore();
  const { items, total } = useCartStore();
  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const [showShippingAddressModal, setShowShippingAddressModal] = React.useState(false);
  const [shipToDifferentAddress, setShipToDifferentAddress] = React.useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<'cash' | 'card' | null>(null);

  const defaultAddress = addresses[0];
  const shippingFee = 50.000;
  const grandTotal = total + shippingFee;

  const handlePlaceOrder = () => {
    // Implement order placement logic
    if (selectedPaymentMethod === 'card') {
      // Handle card payment
    } else {
      // Handle cash payment
    }
  };

  const formatPrice = (price: number) => {
    return price.toFixed(3);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>CHECKOUT</Text>
          <Text style={styles.subtitle}>EASY SHOPPING WITH AZURA</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="location-outline" size={20} color="black" style={styles.icon} />
            BILLING & SHIPPING ADDRESS
          </Text>

          {defaultAddress ? (
            <View style={styles.addressCard}>
              <Text style={styles.addressName}>{defaultAddress.fullName}</Text>
              <Text style={styles.addressPhone}>{defaultAddress.mobileNumber}</Text>
              <Text style={styles.addressDetails}>
                {defaultAddress.country},
              </Text>
              <Text style={styles.addressDetails}>
                {[
                  defaultAddress.area,
                  'Block ' + defaultAddress.block,
                  'Street ' + defaultAddress.street,
                  'House Building ' + defaultAddress.houseBuilding,
                ].filter(Boolean).join(', ')}
              </Text>
              {defaultAddress.addressLine2 && (
                <Text style={styles.addressDetails}>{defaultAddress.addressLine2}</Text>
              )}
              <Pressable 
                style={styles.editAddress}
                onPress={() => setShowAddressModal(true)}
              >
                <Ionicons name="create-outline" size={20} color="black" />
                <Text style={styles.editAddressText}>Edit Address</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable 
              style={styles.addAddressButton}
              onPress={() => setShowAddressModal(true)}
            >
              <Text style={styles.addAddressText}>+ADD ADDRESS</Text>
            </Pressable>
          )}

          <Pressable 
            style={styles.shipToOption}
            onPress={() => setShipToDifferentAddress(!shipToDifferentAddress)}
          >
            <View style={styles.checkbox}>
              {shipToDifferentAddress && (
                <Ionicons name="checkmark" size={16} color="black" />
              )}
            </View>
            <Text style={styles.shipToText}>Ship to Different Address?</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="cube-outline" size={20} color="black" style={styles.icon} />
            ORDER SUMMARY
          </Text>

          {items.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <Image source={item.heroImage} style={styles.productImage} />
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.title}</Text>
                <Text style={styles.productQuantity}>x {item.quantity}</Text>
                <Text style={styles.productPrice}>{formatPrice(item.price * item.quantity)} KD</Text>
              </View>
            </View>
          ))}

          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Item Sub total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)} KD</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping Fee</Text>
              <Text style={styles.totalValue}>{formatPrice(shippingFee)} KD</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{formatPrice(grandTotal)} KD</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="card-outline" size={20} color="black" style={styles.icon} />
            Select Payment Method
          </Text>

          <Pressable 
            style={[
              styles.paymentOption,
              selectedPaymentMethod === 'cash' && styles.selectedPayment
            ]}
            onPress={() => setSelectedPaymentMethod('cash')}
          >
            <Ionicons name="cash-outline" size={24} color="black" />
            <Text style={styles.paymentText}>Cash</Text>
            <View style={styles.radioButton}>
              {selectedPaymentMethod === 'cash' && (
                <View style={styles.radioButtonSelected} />
              )}
            </View>
          </Pressable>

          <Pressable 
            style={[
              styles.paymentOption,
              selectedPaymentMethod === 'card' && styles.selectedPayment
            ]}
            onPress={() => setSelectedPaymentMethod('card')}
          >
            <Ionicons name="card-outline" size={24} color="black" />
            <Text style={styles.paymentText}>Visa Credit Card</Text>
            <View style={styles.radioButton}>
              {selectedPaymentMethod === 'card' && (
                <View style={styles.radioButtonSelected} />
              )}
            </View>
          </Pressable>
        </View>

        <Text style={styles.termsText}>
          By Proceeding, I've read and accept the terms & conditions.
        </Text>

        <View style={styles.paymentMethods}>
          <Text style={styles.paymentMethodsTitle}>PAYMENT METHODS</Text>
          <View style={styles.paymentMethodIcons}>
            <Ionicons name="card" size={32} color="black" />
            <Ionicons name="card-outline" size={32} color="black" />
            <Ionicons name="wallet-outline" size={32} color="black" />
          </View>
          <Text style={styles.securePaymentTitle}>SECURE PAYMENT</Text>
          <Text style={styles.securePaymentText}>
            YOUR CREDIT CARD DETAILS ARE SAFE WITH US.{'\n'}
            ALL THE INFORMATION IS PROTECTED USING SECURE SOCKETS{'\n'}
            LAYER (SSL) TECHNOLOGY.
          </Text>
        </View>
      </ScrollView>

      <Pressable 
        style={[
          styles.placeOrderButton,
          (!defaultAddress || !selectedPaymentMethod) && styles.placeOrderButtonDisabled
        ]}
        onPress={handlePlaceOrder}
        disabled={!defaultAddress || !selectedPaymentMethod}
      >
        <Text style={styles.placeOrderText}>Place order</Text>
        <Ionicons name="arrow-forward" size={20} color="white" />
      </Pressable>

      <Modal
        visible={showAddressModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <AddEditAddress
          address={defaultAddress}
          onClose={() => setShowAddressModal(false)}
        />
      </Modal>

      {shipToDifferentAddress && (
        <Modal
          visible={showShippingAddressModal}
          animationType="slide"
          presentationStyle="formSheet"
          onRequestClose={() => setShowShippingAddressModal(false)}
        >
          <AddEditAddress
            onClose={() => setShowShippingAddressModal(false)}
          />
        </Modal>
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
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginTop: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    marginBottom: 16,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '500',
  },
  addressPhone: {
    fontSize: 14,
    marginTop: 4,
  },
  addressDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  editAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  editAddressText: {
    fontSize: 14,
    marginLeft: 4,
  },
  addAddressButton: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  addAddressText: {
    fontSize: 16,
  },
  shipToOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shipToText: {
    fontSize: 14,
  },
  productCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  productImage: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  totalSection: {
    marginTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 16,
  },
  selectedPayment: {
    borderColor: '#000',
  },
  paymentText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  paymentMethods: {
    alignItems: 'center',
    padding: 16,
    paddingBottom: 32,
  },
  paymentMethodsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  paymentMethodIcons: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  securePaymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  securePaymentText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    padding: 16,
    margin: 16,
    gap: 8,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#999',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 