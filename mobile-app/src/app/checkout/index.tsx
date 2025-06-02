import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, Address } from '@store/auth-store';
import { useCartStore } from '@store/cart-store';
import { makeApiCall, API_ENDPOINTS } from '@utils/api-config';
import AddEditAddress from '@components/add-edit-address';
import { formatPrice } from '@utils/price-formatter';
import { theme } from '@theme';

export default function CheckoutScreen() {
  const { isAuthenticated } = useAuthStore();
  const { addresses, fetchAddresses } = useAuthStore();
  const { total, clearCart } = useCartStore();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [shippingAddressId, setShippingAddressId] = useState<string | null>(null);
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showShippingAddressModal, setShowShippingAddressModal] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card' | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const shippingCost = 5.000;
  const orderTotal = total + shippingCost;

  // Get the selected address object
  const selectedAddress = selectedAddressId ? addresses.find(addr => addr.address_id === selectedAddressId) : null;
  const shippingAddress = shippingAddressId ? addresses.find(addr => addr.address_id === shippingAddressId) : null;

  // Load addresses on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses();
    } else {
      router.push('/auth');
    }
  }, [isAuthenticated]);

  // Always select the last address (most recently added)
  useEffect(() => {
    if (addresses.length > 0) {
      // Get the most recent address (last in the array)
      const mostRecentAddress = addresses[addresses.length - 1];
      setSelectedAddressId(mostRecentAddress.address_id);
    }
  }, [addresses]);

  const loadAddresses = async () => {
    setAddressLoading(true);
    await fetchAddresses();
    setAddressLoading(false);
  };

  const handleEditAddress = () => {
    setIsEditingAddress(true);
    setIsAddingNewAddress(false);
    setShowAddressModal(true);
  };

  const handleAddAddress = () => {
    setIsAddingNewAddress(true);
    setIsEditingAddress(false);
    setShowAddressModal(true);
  };

  const handleAddShippingAddress = () => {
    setIsAddingNewAddress(true);
    setIsEditingAddress(false);
    setShowShippingAddressModal(true);
  };

  const handleEditShippingAddress = () => {
    setIsEditingAddress(true);
    setIsAddingNewAddress(false);
    setShowShippingAddressModal(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please add a billing address to continue.');
      return;
    }

    if (shipToDifferentAddress && !shippingAddress) {
      Alert.alert('Error', 'Please add a shipping address to continue.');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Set billing address
      await makeApiCall(API_ENDPOINTS.checkout, {
        method: 'POST',
        data: {
          payment_address: 'existing',
          address_id: selectedAddress.address_id
        }
      });

      // Set shipping address (either same as billing or different)
      await makeApiCall(API_ENDPOINTS.checkout, {
        method: 'POST',
        data: {
          shipping_address: 'existing',
          address_id: shipToDifferentAddress && shippingAddress ? shippingAddress.address_id : selectedAddress.address_id
        }
      });

      // Set shipping method
      await makeApiCall(API_ENDPOINTS.shippingMethods, {
        method: 'POST',
        data: {
          shipping_method: 'flat.flat'
        }
      });

      // Set payment method
      await makeApiCall(API_ENDPOINTS.paymentMethods, {
        method: 'POST',
        data: {
          payment_method: selectedPaymentMethod === 'cash' ? 'cod' : 'card'
        }
      });

      // Confirm order
      const confirmResponse = await makeApiCall(API_ENDPOINTS.confirmOrder, {
        method: 'POST'
      });

      if (confirmResponse.success === 1) {
        setOrderSuccess(true);
        clearCart();

        // Redirect to success page
        router.push('/order-success');
      } else {
        // Handle error which can be string or array
        const errorMessage = typeof confirmResponse.error === 'string' 
          ? confirmResponse.error 
          : Array.isArray(confirmResponse.error) && confirmResponse.error.length > 0
            ? confirmResponse.error[0]
            : 'Failed to place order';
            
        setError(errorMessage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while placing the order');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `KD ${price.toFixed(3)}`;
  };

  const getAddressText = (address: Address) => {
    return `${address.firstname} ${address.lastname}
${address.city}
Block ${address.custom_field['30']}, Street ${address.custom_field['31']}
House/Building ${address.custom_field['32']}${address.custom_field['33'] ? ', Apt ' + address.custom_field['33'] : ''}
${address.address_2 || ''}`;
  };

  const getSimpleAddressText = (address: Address) => {
    return `Block ${address.custom_field['30']}, Street ${address.custom_field['31']}, House ${address.custom_field['32']}${
      address.custom_field['33'] ? ', Apt ' + address.custom_field['33'] : ''
    }`;
  };

  const convertAddressToFormData = (address: Address) => {
    return {
      address_id: address.address_id,
      firstname: address.firstname,
      lastname: address.lastname,
      company: address.company || '',
      address_1: address.address_1,
      address_2: address.address_2 || '',
      city: address.city,
      postcode: address.postcode || '',
      country_id: address.country_id,
      zone_id: address.zone_id,
      custom_field: address.custom_field,
      default: address.default
    };
  };

  if (addressLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>CHECKOUT</Text>
          <Text style={styles.subtitle}>EASY SHOPPING WITH AZURA</Text>
        </View>

        {/* Billing Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="location-outline" size={20} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>BILLING & SHIPPING ADDRESS</Text>
          </View>
          
          {selectedAddress ? (
            <View style={styles.addressCard}>
              <Text style={styles.addressName}>
                {selectedAddress.firstname} {selectedAddress.lastname}
              </Text>
              <Text style={styles.addressPhone}>
                +965 66112233
              </Text>
              <Text style={styles.addressLocation}>
                Kuwait,
              </Text>
              <Text style={styles.addressLocation}>
                {selectedAddress.city}, Area
              </Text>
              <Text style={styles.addressDetails}>
                Block {selectedAddress.custom_field['30']}, Street {selectedAddress.custom_field['31']}, House Building {selectedAddress.custom_field['32']}
              </Text>
              {selectedAddress.address_2 && (
                <Text style={styles.addressDetails}>
                  {selectedAddress.address_2}
                </Text>
              )}
              <TouchableOpacity 
                style={styles.editAddressButton}
                onPress={handleEditAddress}
              >
                <Ionicons name="create-outline" size={16} color="#000" />
                <Text style={styles.editAddressText}>Edit Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={handleAddAddress}
            >
              <View style={styles.addAddressContent}>
                <Ionicons name="add-circle-outline" size={24} color="#000" />
                <Text style={styles.addAddressText}>ADD ADDRESS</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.shipToDifferentRow}
            onPress={() => setShipToDifferentAddress(!shipToDifferentAddress)}
          >
            <View style={styles.customCheckbox}>
              {shipToDifferentAddress && <View style={styles.checkboxFill} />}
            </View>
            <Text style={styles.shipToDifferentText}>Ship to Different Address?</Text>
          </TouchableOpacity>

          {shipToDifferentAddress && (
            <View style={[styles.section, styles.shippingAddressSection]}>
              {shippingAddress ? (
                <View style={styles.addressCard}>
                  <Text style={styles.addressName}>
                    {shippingAddress.firstname} {shippingAddress.lastname}
                  </Text>
                  <Text style={styles.addressPhone}>
                    +965 66112233
                  </Text>
                  <Text style={styles.addressLocation}>
                    Kuwait,
                  </Text>
                  <Text style={styles.addressLocation}>
                    {shippingAddress.city}, Area
                  </Text>
                  <Text style={styles.addressDetails}>
                    Block {shippingAddress.custom_field['30']}, Street {shippingAddress.custom_field['31']}, House Building {shippingAddress.custom_field['32']}
                  </Text>
                  {shippingAddress.address_2 && (
                    <Text style={styles.addressDetails}>
                      {shippingAddress.address_2}
                    </Text>
                  )}
                  <TouchableOpacity 
                    style={styles.editAddressButton}
                    onPress={handleEditShippingAddress}
                  >
                    <Ionicons name="create-outline" size={16} color="#000" />
                    <Text style={styles.editAddressText}>Edit Address</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addAddressButton}
                  onPress={handleAddShippingAddress}
                >
                  <View style={styles.addAddressContent}>
                    <Ionicons name="add-circle-outline" size={24} color="#000" />
                    <Text style={styles.addAddressText}>ADD SHIPPING ADDRESS</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="cube-outline" size={20} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
          
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Item Sub Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping Fee</Text>
              <Text style={styles.totalValue}>{formatPrice(shippingCost)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{formatPrice(orderTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="card-outline" size={20} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
          </View>

          <TouchableOpacity
            style={[styles.paymentOption, selectedPaymentMethod === 'cash' && styles.selectedPayment]}
            onPress={() => setSelectedPaymentMethod('cash')}
          >
            <View style={styles.radioContainer}>
              <Ionicons 
                name="cash-outline" 
                size={24} 
                color={selectedPaymentMethod === 'cash' ? '#000' : '#666'} 
                style={styles.paymentIcon}
              />
              <Text style={[styles.paymentText, selectedPaymentMethod === 'cash' && styles.selectedPaymentText]}>Cash</Text>
              <View style={styles.radioOuter}>
                {selectedPaymentMethod === 'cash' && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.paymentOption, selectedPaymentMethod === 'card' && styles.selectedPayment]}
            onPress={() => setSelectedPaymentMethod('card')}
          >
            <View style={styles.radioContainer}>
              <Ionicons 
                name="card-outline" 
                size={24} 
                color={selectedPaymentMethod === 'card' ? '#000' : '#666'} 
                style={styles.paymentIcon}
              />
              <Text style={[styles.paymentText, selectedPaymentMethod === 'card' && styles.selectedPaymentText]}>Visa Credit Card</Text>
              <View style={styles.radioOuter}>
                {selectedPaymentMethod === 'card' && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (isLoading || !selectedAddress || !selectedPaymentMethod) && styles.disabledButton
          ]}
          onPress={handlePlaceOrder}
          disabled={isLoading || !selectedAddress || !selectedPaymentMethod}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderText}>Place order</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>By Proceeding, I've read and accept the terms & conditions.</Text>
          
          <View style={styles.paymentMethodsSection}>
            <Text style={styles.paymentMethodsTitle}>PAYMENT METHODS</Text>
            <View style={styles.paymentMethodsRow}>
              <Ionicons name="card" size={24} color="#666" style={styles.paymentMethodIcon} />
              <Ionicons name="card" size={24} color="#666" style={styles.paymentMethodIcon} />
              <Ionicons name="card" size={24} color="#666" style={styles.paymentMethodIcon} />
            </View>
          </View>

          <View style={styles.securePaymentSection}>
            <Text style={styles.securePaymentTitle}>SECURE PAYMENT</Text>
            <Text style={styles.securePaymentText}>
              YOUR CREDIT CARD DETAILS ARE SAFE WITH US.{'\n'}
              ALL THE INFORMATION IS PROTECTED USING SECURE SOCKETS{'\n'}
              LAYER (SSL) TECHNOLOGY.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add/Edit Address Modal */}
      {showAddressModal && (
        <AddEditAddress
          onClose={() => {
            setShowAddressModal(false);
            setIsAddingNewAddress(false);
            setIsEditingAddress(false);
          }}
          address={isEditingAddress && selectedAddress ? {
            firstname: selectedAddress.firstname,
            lastname: selectedAddress.lastname,
            phone: '',
            company: selectedAddress.company || '',
            address_1: selectedAddress.address_1,
            address_2: selectedAddress.address_2 || '',
            city: selectedAddress.city,
            postcode: selectedAddress.postcode || '',
            country_id: selectedAddress.country_id,
            zone_id: selectedAddress.zone_id,
            custom_field: {
              '30': selectedAddress.custom_field['30'] || '',
              '31': selectedAddress.custom_field['31'] || '',
              '32': selectedAddress.custom_field['32'] || '',
              '33': selectedAddress.custom_field['33'] || ''
            },
            default: selectedAddress.default,
            address_id: selectedAddress.address_id
          } : undefined}
          onAddressUpdated={() => {
            loadAddresses();
            setShowAddressModal(false);
            setIsAddingNewAddress(false);
            setIsEditingAddress(false);
          }}
        />
      )}

      {/* Add/Edit Shipping Address Modal */}
      {showShippingAddressModal && (
        <AddEditAddress
          onClose={() => {
            setShowShippingAddressModal(false);
            setIsAddingNewAddress(false);
            setIsEditingAddress(false);
          }}
          address={isEditingAddress && shippingAddress ? {
            firstname: shippingAddress.firstname,
            lastname: shippingAddress.lastname,
            phone: '',
            company: shippingAddress.company || '',
            address_1: shippingAddress.address_1,
            address_2: shippingAddress.address_2 || '',
            city: shippingAddress.city,
            postcode: shippingAddress.postcode || '',
            country_id: shippingAddress.country_id,
            zone_id: shippingAddress.zone_id,
            custom_field: {
              '30': shippingAddress.custom_field['30'] || '',
              '31': shippingAddress.custom_field['31'] || '',
              '32': shippingAddress.custom_field['32'] || '',
              '33': shippingAddress.custom_field['33'] || ''
            },
            default: shippingAddress.default,
            address_id: shippingAddress.address_id
          } : undefined}
          onAddressUpdated={() => {
            loadAddresses();
            setShowShippingAddressModal(false);
            setIsAddingNewAddress(false);
            setIsEditingAddress(false);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.black,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.mediumGray,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textTransform: 'uppercase',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  addressLocation: {
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  addressDetails: {
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  editAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 18,
    borderTopWidth: 2,
    borderColor: theme.colors.black,
    paddingVertical: 12,
    paddingHorizontal: 115,
  },
  editAddressText: {
    fontSize: 15,
    color: theme.colors.black,
    marginLeft: 4,
  },
  addAddressButton: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
  },
  addAddressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAddressText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
  },
  shipToDifferentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingLeft: 3,
  },
  customCheckbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxFill: {
    width: 12,
    height: 12,
    backgroundColor: '#000',
  },
  shipToDifferentText: {
    fontSize: 14,
    color: '#000',
  },
  totalSection: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 4,
    padding: 12,
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
    color: '#000',
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
    color: '#000',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  paymentOption: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 4,
    padding: 16,
    marginBottom: 8,
  },
  selectedPayment: {
    borderColor: '#000',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    marginRight: 12,
  },
  paymentText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  selectedPaymentText: {
    color: '#000',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  placeOrderButton: {
    backgroundColor: '#000',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  paymentMethodsSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  paymentMethodsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paymentMethodIcon: {
    marginHorizontal: 4,
  },
  securePaymentSection: {
    alignItems: 'center',
  },
  securePaymentTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  securePaymentText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#000',
  },
  shippingAddressSection: {
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
}); 