import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAddressStore, Address } from '../../store/address-store';
import { useCartStore } from '../../store/cart-store';
import { useAuthStore } from '../../store/auth-store';
import AddEditAddress from '../../components/add-edit-address';
import { makeApiCall, API_ENDPOINTS } from '../../utils/api-config';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function CheckoutScreen() {
  const { addresses, selectedAddress, fetchAddresses, isLoading: addressesLoading } = useAddressStore();
  const { user, isAuthenticated } = useAuthStore();
  const { items, getTotalPrice, clearCart } = useCartStore();
  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showShippingAddressModal, setShowShippingAddressModal] = useState(false);
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card' | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [shippingAddressId, setShippingAddressId] = useState<string | null>(null);
  
  // Shipping constants
  const SHIPPING_COST = 50.000;
  const cartTotal = getTotalPrice();
  const grandTotal = cartTotal + SHIPPING_COST;
  
  // Check if user is authenticated and fetch addresses if needed
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to auth if not authenticated
      router.replace('/auth');
    } else {
      fetchAddresses();
    }
  }, [isAuthenticated]);
  
  // Get shipping address based on selected ID
  const shippingAddress = shippingAddressId 
    ? addresses.find(addr => addr.address_id === shippingAddressId) 
    : selectedAddress;
  
  // If shipping address not set, use selected address
  useEffect(() => {
    if (!shippingAddressId && selectedAddress) {
      setShippingAddressId(selectedAddress.address_id);
    }
  }, [selectedAddress]);

  // Listen for changes in the addresses array after address modal is closed
  useEffect(() => {
    if (!showShippingAddressModal && shipToDifferentAddress && addresses.length > 0) {
      // Use the most recently added address for shipping if we were adding a shipping address
      const mostRecentAddress = addresses[addresses.length - 1];
      setShippingAddressId(mostRecentAddress.address_id);
    }
  }, [showShippingAddressModal, addresses]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setShowAddressModal(true);
      return;
    }
    
    if (!selectedPaymentMethod) {
      setOrderError('Please select a payment method');
      return;
    }
    
    setIsProcessingOrder(true);
    setOrderError(null);
    
    try {
      // Step 1: Set billing address
      await makeApiCall(
        API_ENDPOINTS.checkout,
        {
          method: 'POST',
          data: {
            payment_address: 'existing',
            address_id: selectedAddress.address_id
          }
        }
      );
      
      // Step 2: Set shipping address (either same as billing or different)
      await makeApiCall(
        API_ENDPOINTS.checkout,
        {
          method: 'POST',
          data: {
            shipping_address: 'existing',
            address_id: shipToDifferentAddress && shippingAddress 
              ? shippingAddress.address_id 
              : selectedAddress.address_id
          }
        }
      );
      
      // Step 3: Set shipping method
      await makeApiCall(
        API_ENDPOINTS.shippingMethods,
        {
          method: 'POST',
          data: {
            shipping_method: 'flat.flat'
          }
        }
      );
      
      // Step 4: Set payment method
      await makeApiCall(
        API_ENDPOINTS.paymentMethods,
        {
          method: 'POST',
          data: {
            payment_method: selectedPaymentMethod === 'cash' ? 'cod' : 'card'
          }
        }
      );
      
      // Step 5: Confirm order
      const confirmResponse = await makeApiCall(
        API_ENDPOINTS.confirmOrder,
        { method: 'POST' }
      );
      
      if (confirmResponse.success === 1) {
        setOrderSuccess(true);
        clearCart();
        
        // Redirect to success page after a short delay
        setTimeout(() => {
          router.replace('/');
        }, 3000);
      } else {
        setOrderError(confirmResponse.error || 'Failed to place order');
      }
    } catch (error: any) {
      setOrderError(error.message || 'Failed to place order');
      console.error('Order placement error:', error);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toFixed(3) + ' KD';
  };
  
  const getAddressText = (address: Address) => {
    const block = address.custom_field['30'] || '';
    const street = address.custom_field['31'] || '';
    const house = address.custom_field['32'] || '';
    const apartment = address.custom_field['33'] || '';
    
    return `${address.firstname} ${address.lastname}
${address.telephone || ''}
${address.city},
${address.address_1 || ''}
Block ${block}, Street ${street}, House Building ${house}
${address.address_2 || ''}`;
  };
  
  if (addressesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading checkout...</Text>
      </View>
    );
  }
  
  if (orderSuccess) {
    return (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={80} color="green" />
        <Text style={styles.successTitle}>Order Placed Successfully!</Text>
        <Text style={styles.successText}>
          Thank you for your order. We will process it right away.
        </Text>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.continueButtonText}>CONTINUE SHOPPING</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>CHECKOUT</Text>
          <Text style={styles.subtitle}>EASY SHOPPING WITH AZURA</Text>
          <View style={styles.divider} />
        </View>

        {/* Billing and Shipping Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="car-outline" size={20} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>BILLING & SHIPPING ADDRESS</Text>
          </View>
          
          {selectedAddress ? (
            <View style={styles.addressCard}>
              <Text style={styles.addressText}>
                {getAddressText(selectedAddress)}
              </Text>
              <TouchableOpacity 
                style={styles.editAddressButton}
                onPress={() => setShowAddressModal(true)}
              >
                <Ionicons name="create-outline" size={18} color="#000" />
                <Text style={styles.editAddressText}>Edit Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={() => setShowAddressModal(true)}
            >
              <Text style={styles.addAddressText}>+ADD ADDRESS</Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.infoText}>
            All Orders Will Be Shipped Within 3 Days.{'\n'}
            Order Notifications are Sent Only on Emails.{'\n'}
            Please ensure you have entered the correct email.
          </Text>
          
          {selectedAddress && (
            <View style={styles.shipToDifferentContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setShipToDifferentAddress(!shipToDifferentAddress)}
              >
                <View style={[styles.checkbox, shipToDifferentAddress && styles.checkboxChecked]}>
                  {shipToDifferentAddress && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>Ship to Different Address?</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Different shipping address if selected */}
          {shipToDifferentAddress && selectedAddress && (
            <View style={styles.shippingAddressContainer}>
              {shippingAddress && shippingAddress.address_id !== selectedAddress.address_id ? (
                <View style={styles.addressCard}>
                  <Text style={styles.addressText}>
                    {getAddressText(shippingAddress)}
                  </Text>
                  <TouchableOpacity 
                    style={styles.editAddressButton}
                    onPress={() => setShowShippingAddressModal(true)}
                  >
                    <Ionicons name="create-outline" size={18} color="#000" />
                    <Text style={styles.editAddressText}>Edit Address</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addAddressButton}
                  onPress={() => setShowShippingAddressModal(true)}
                >
                  <Text style={styles.addAddressText}>+ADD SHIPPING ADDRESS</Text>
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
          
          {/* Products list */}
          <View style={styles.productsList}>
            {items.map(item => (
              <View key={item.product_id} style={styles.productItem}>
                <Image
                  source={{ uri: `https://new.azurakwt.com/image/${item.image}` }}
                  style={styles.productImage}
                />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productQuantity}>x {item.quantity}</Text>
                  <Text style={styles.productPrice}>
                    {(parseFloat(item.price) * item.quantity).toFixed(3)} K.D
                  </Text>
                </View>
              </View>
            ))}
          </View>
          
          {/* Order totals */}
          <View style={styles.orderTotals}>
            <View style={styles.orderTotalRow}>
              <Text style={styles.orderTotalLabel}>Item Sub total</Text>
              <Text style={styles.orderTotalValue}>{formatPrice(cartTotal)}</Text>
            </View>
            <View style={styles.orderTotalRow}>
              <Text style={styles.orderTotalLabel}>Shipping Fee</Text>
              <Text style={styles.orderTotalValue}>{formatPrice(SHIPPING_COST)}</Text>
            </View>
            <View style={[styles.orderTotalRow, styles.grandTotalRow]}>
              <Text style={[styles.orderTotalLabel, styles.grandTotalLabel]}>Grand Total</Text>
              <Text style={[styles.orderTotalValue, styles.grandTotalValue]}>{formatPrice(grandTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="card-outline" size={20} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
          </View>
          
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => setSelectedPaymentMethod('cash')}
            >
              <View style={styles.paymentOptionContent}>
                <Ionicons name="cash-outline" size={24} color="#000" />
                <Text style={styles.paymentOptionText}>Cash</Text>
              </View>
              <View style={styles.radioButton}>
                {selectedPaymentMethod === 'cash' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => setSelectedPaymentMethod('card')}
            >
              <View style={styles.paymentOptionContent}>
                <Ionicons name="card-outline" size={24} color="#000" />
                <Text style={styles.paymentOptionText}>Visa Credit Card</Text>
              </View>
              <View style={styles.radioButton}>
                {selectedPaymentMethod === 'card' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          </View>
          
          {orderError && (
            <Text style={styles.errorText}>{orderError}</Text>
          )}
          
          <TouchableOpacity
            style={[
              styles.placeOrderButton,
              (!selectedAddress || !selectedPaymentMethod || isProcessingOrder) && styles.disabledButton
            ]}
            onPress={handlePlaceOrder}
            disabled={!selectedAddress || !selectedPaymentMethod || isProcessingOrder}
          >
            {isProcessingOrder ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.placeOrderButtonText}>Place order</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={styles.buttonIcon} />
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.termsText}>
            By Proceeding, I've read and accept the terms & conditions.
          </Text>
          
          <View style={styles.paymentMethodsContainer}>
            <Text style={styles.paymentMethodsTitle}>PAYMENT METHODS</Text>
            <View style={styles.paymentMethodsLogos}>
              <View style={styles.paymentLogoContainer}>
                <Ionicons name="card-outline" size={30} color="#000" />
                <Text style={styles.paymentLogoText}>Visa</Text>
              </View>
              <View style={styles.paymentLogoContainer}>
                <Ionicons name="card-outline" size={30} color="#000" />
                <Text style={styles.paymentLogoText}>Mastercard</Text>
              </View>
              <View style={styles.paymentLogoContainer}>
                <Ionicons name="card-outline" size={30} color="#000" />
                <Text style={styles.paymentLogoText}>Amex</Text>
              </View>
            </View>
            <Text style={styles.securePaymentTitle}>SECURE PAYMENT</Text>
            <Text style={styles.securePaymentText}>
              YOUR CREDIT CARD DETAILS ARE SAFE WITH US.{'\n'}
              ALL THE INFORMATION IS PROTECTED USING SECURE SOCKETS LAYER (SSL) TECHNOLOGY.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Address selection modal */}
      {showAddressModal && (
        <Modal
          visible={showAddressModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddressModal(false)}
        >
          <AddEditAddress
            address={selectedAddress || undefined}
            onClose={() => setShowAddressModal(false)}
          />
        </Modal>
      )}
      
      {/* Shipping Address selection modal */}
      {showShippingAddressModal && (
        <Modal
          visible={showShippingAddressModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowShippingAddressModal(false)}
        >
          <AddEditAddress
            address={shippingAddress && shippingAddress !== selectedAddress ? shippingAddress : undefined}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#000',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  continueButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 10,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    fontSize: 16,
    fontWeight: '600',
  },
  addressCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 0,
    padding: 16,
    marginBottom: 16,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  editAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAddressText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  addAddressButton: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addAddressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 16,
    lineHeight: 18,
  },
  shipToDifferentContainer: {
    marginBottom: 16,
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
  shippingAddressContainer: {
    marginTop: 16,
  },
  productsList: {
    marginBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 40,
    height: 60,
    resizeMode: 'contain',
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderTotals: {
    marginTop: 16,
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderTotalLabel: {
    fontSize: 14,
    color: '#000',
  },
  orderTotalValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  grandTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  grandTotalLabel: {
    fontWeight: '600',
  },
  grandTotalValue: {
    fontWeight: '700',
  },
  paymentOptions: {
    marginTop: 12,
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentOptionText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  placeOrderButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentMethodsContainer: {
    alignItems: 'center',
  },
  paymentMethodsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  paymentMethodsLogos: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 16,
  },
  paymentLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentLogoText: {
    fontSize: 12,
    marginTop: 4,
    color: '#555',
  },
  securePaymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  securePaymentText: {
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
    lineHeight: 14,
  },
}); 