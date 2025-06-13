import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Image, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, Address } from '@store/auth-store';
import { useCartStore } from '@store/cart-store';
import { makeApiCall, API_ENDPOINTS } from '@utils/api-config';
import AddEditAddress from '@components/add-edit-address';
import { theme } from '@theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CheckoutScreen() {
  const { isAuthenticated } = useAuthStore();
  const { addresses, fetchAddresses } = useAuthStore();
  const { items, total, clearCart, getCart } = useCartStore();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showShippingAddressModal, setShowShippingAddressModal] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [localAddress, setLocalAddress] = useState<any>(null); // For unauthenticated users
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(false);

  const shippingCost = 5.000;
  const orderTotal = total + shippingCost;

  // Load addresses and cart on mount
  useEffect(() => {
    const initializeCheckout = async () => {
      // Always fetch cart data
      await getCart();
      
      if (isAuthenticated) {
        loadAddresses();
      } else {
        // Load local address for unauthenticated users
        loadLocalAddress();
      }
    };
    
    initializeCheckout();
  }, [isAuthenticated]);

  // Set address in checkout session and fetch shipping/payment methods when address is available
  useEffect(() => {
    if ((isAuthenticated && selectedAddress) || (!isAuthenticated && localAddress)) {
      setAddressInCheckoutAndFetchMethods();
    } else {
      // Clear methods when no address
      setShippingMethods([]);
      setPaymentMethods([]);
      setSelectedShippingMethod(null);
      setSelectedPaymentMethod(null);
    }
  }, [selectedAddress, localAddress, isAuthenticated]);

  const loadAddresses = async () => {
    setAddressLoading(true);
    
    try {
      // Fetch addresses directly for checkout to get the original order
      const response = await makeApiCall(API_ENDPOINTS.addresses, {
        method: 'GET'
      });
      
      if (response.success === 1 && Array.isArray(response.data) && response.data.length > 0) {
        // Get the last address from the original API response (most recent)
        const lastAddress = response.data[response.data.length - 1];
        setSelectedAddress(lastAddress);
        
        console.log('Selected last address from API response:', lastAddress);
      }
      
      // Also fetch for the address store (for the address modal)
      await fetchAddresses();
    } catch (error) {
      console.error('Error loading addresses for checkout:', error);
    }
    
    setAddressLoading(false);
  };

  const loadLocalAddress = async () => {
    try {
      const savedAddress = await AsyncStorage.getItem('@checkout_local_address');
      if (savedAddress) {
        setLocalAddress(JSON.parse(savedAddress));
      }
    } catch (error) {
      console.error('Error loading local address:', error);
    }
  };

  const saveLocalAddress = async (address: any) => {
    try {
      await AsyncStorage.setItem('@checkout_local_address', JSON.stringify(address));
      setLocalAddress(address);
    } catch (error) {
      console.error('Error saving local address:', error);
    }
  };

  const setAddressInCheckoutAndFetchMethods = async () => {
    setMethodsLoading(true);
    
    try {
      const currentAddress = isAuthenticated ? selectedAddress : localAddress;
      
      if (!currentAddress) {
        return;
      }

      // For both authenticated and unauthenticated users, send complete address data
      if (isAuthenticated && selectedAddress) {
        // Get user's email and phone from auth store
        const { user } = useAuthStore.getState();
        
        // Set payment address in checkout session using complete address data
        const addressData = {
          firstname: selectedAddress.firstname,
          lastname: selectedAddress.lastname,
          email: user?.email || '', // Use user's email from auth store
          telephone: selectedAddress.telephone || user?.telephone || '',
          country_id: "114", // Kuwait
          city: selectedAddress.city,
          zone_id: selectedAddress.zone_id,
          address_2: selectedAddress.address_2 || "",
          custom_field: {
            "32": selectedAddress.custom_field['32'] || "", // House Building
            "30": selectedAddress.custom_field['30'] || "", // Block
            "31": selectedAddress.custom_field['31'] || "", // Street
            "33": selectedAddress.custom_field['33'] || "", // Apartment No.
            "35": selectedAddress.custom_field['35'] || ""  // avenue
          }
        };

        // Set payment address
        await makeApiCall('/index.php?route=extension/mstore/payment_address|save', {
          method: 'POST',
          data: addressData
        });

        // Set shipping address (same as payment)
        await makeApiCall('/index.php?route=extension/mstore/shipping_address|save', {
          method: 'POST',
          data: addressData
        });
      } else if (!isAuthenticated && localAddress) {
        // For unauthenticated users, set address data directly
        const addressData = {
          firstname: localAddress.firstname,
          lastname: localAddress.lastname,
          email: localAddress.email || '', // Use email from local address data
          telephone: localAddress.telephone || '',
          country_id: "114", // Kuwait
          city: localAddress.city,
          zone_id: localAddress.zone_id,
          address_2: localAddress.address_2 || "",
          custom_field: {
            "32": localAddress.custom_field?.['32'] || "", // House Building
            "30": localAddress.custom_field?.['30'] || "", // Block
            "31": localAddress.custom_field?.['31'] || "", // Street
            "33": localAddress.custom_field?.['33'] || "", // Apartment No.
            "35": localAddress.custom_field?.['35'] || ""  // avenue
          }
        };

        // Set payment address
        await makeApiCall('/index.php?route=extension/mstore/payment_address|save', {
          method: 'POST',
          data: addressData
        });

        // Set shipping address (same as payment)
        await makeApiCall('/index.php?route=extension/mstore/shipping_address|save', {
          method: 'POST',
          data: addressData
        });
      }

      // Now fetch shipping and payment methods
      await fetchShippingAndPaymentMethods();

    } catch (error) {
      console.error('Error setting address in checkout session:', error);
      setShippingMethods([]);
      setPaymentMethods([]);
      setSelectedShippingMethod(null);
      setSelectedPaymentMethod(null);
    } finally {
      setMethodsLoading(false);
    }
  };

  const fetchShippingAndPaymentMethods = async () => {
    try {
      // Fetch shipping methods
      const shippingResponse = await makeApiCall('/index.php?route=extension/mstore/shipping_method', {
        method: 'GET'
      });
      
      console.log('Shipping methods response:', shippingResponse);
      
      if (shippingResponse.success === 1 && shippingResponse.data) {
        // Check if shipping_methods array exists and is not empty
        if (shippingResponse.data.shipping_methods && shippingResponse.data.shipping_methods.length > 0) {
          setShippingMethods(shippingResponse.data.shipping_methods);
          
          // Auto-select first shipping method
          if (!selectedShippingMethod) {
            setSelectedShippingMethod(shippingResponse.data.shipping_methods[0]);
          }
        } else {
          // No shipping methods available - this is expected if address is not set properly
          console.log('No shipping methods available, address may not be set in checkout session');
          setShippingMethods([]);
          setSelectedShippingMethod(null);
        }
      }
      
      // Fetch payment methods
      const paymentResponse = await makeApiCall('/index.php?route=extension/mstore/payment_method', {
        method: 'GET'
      });
      
      console.log('Payment methods response:', paymentResponse);
      
      if (paymentResponse.success === 1 && paymentResponse.data) {
        // Check if payment_methods array exists and is not empty
        if (paymentResponse.data.payment_methods && paymentResponse.data.payment_methods.length > 0) {
          setPaymentMethods(paymentResponse.data.payment_methods);
          
          // Auto-select first payment method
          if (!selectedPaymentMethod) {
            setSelectedPaymentMethod(paymentResponse.data.payment_methods[0]);
          }
        } else {
          // No payment methods available - this is expected if address is not set properly
          console.log('No payment methods available, address may not be set in checkout session');
          setPaymentMethods([]);
          setSelectedPaymentMethod(null);
        }
      }
      
    } catch (error) {
      console.error('Error fetching shipping/payment methods:', error);
      setShippingMethods([]);
      setPaymentMethods([]);
      setSelectedShippingMethod(null);
      setSelectedPaymentMethod(null);
    }
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

    if (!selectedShippingMethod) {
      Alert.alert('Shipping Method Required', 'Please select a shipping method to continue.');
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
      await makeApiCall(API_ENDPOINTS.paymentAddressSave, {
        method: 'POST',
        data: {
          payment_address: 'existing',
          address_id: selectedAddress.address_id
        }
      });

      // Set shipping address (either same as billing or different)
      await makeApiCall(API_ENDPOINTS.shippingAddressSave, {
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
          shipping_method: selectedShippingMethod
        }
      });

      // Set payment method
      await makeApiCall(API_ENDPOINTS.paymentMethods, {
        method: 'POST',
        data: {
          payment_method: selectedPaymentMethod
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

  const addPaymentAddress = async (addressData: any) => {
    try {
      setIsLoading(true);
      
      if (isAuthenticated) {
        // Get user's email from auth store
        const { user } = useAuthStore.getState();
        
        // For authenticated users, use the payment address endpoint
        const requestData = {
          firstname: addressData.firstname,
          lastname: addressData.lastname,
          email: addressData.email || user?.email || '',
          telephone: addressData.telephone || addressData.phone || user?.telephone || '',
          country_id: "114", // Kuwait
          city: addressData.city,
          zone_id: addressData.zone_id,
          address_2: addressData.address_2 || "",
          custom_field: {
            "32": addressData.custom_field?.['32'] || "", // House Building
            "30": addressData.custom_field?.['30'] || "", // Block
            "31": addressData.custom_field?.['31'] || "", // Street
            "33": addressData.custom_field?.['33'] || "", // Apartment No.
            "35": addressData.custom_field?.['35'] || ""  // avenue
          }
        };

        console.log('Adding payment address:', requestData);

        const response = await makeApiCall('/index.php?route=extension/mstore/payment_address|save', {
          method: 'POST',
          data: requestData,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Payment address response:', response);

        if (response.success === 1) {
          // Refresh addresses for authenticated users
          await loadAddresses();
          // Explicitly trigger method fetching after address is set
          await setAddressInCheckoutAndFetchMethods();
          setIsLoading(false);
          return true;
        } else {
          throw new Error(response.error?.[0] || 'Failed to add address');
        }
      } else {
        // For unauthenticated users, save in the same format as API response
        const localAddressData = {
          address_id: Date.now().toString(), // Generate a temporary ID
          firstname: addressData.firstname,
          lastname: addressData.lastname,
          company: '',
          address_1: `${addressData.custom_field?.['30']} ${addressData.custom_field?.['31']} ${addressData.custom_field?.['32']}`,
          address_2: addressData.address_2 || '',
          city: addressData.city,
          postcode: '',
          country_id: addressData.country_id,
          zone_id: addressData.zone_id,
          custom_field: {
            '30': addressData.custom_field?.['30'] || '', // Block
            '31': addressData.custom_field?.['31'] || '', // Street
            '32': addressData.custom_field?.['32'] || '', // Building
            '33': addressData.custom_field?.['33'] || '', // Apartment
            '35': addressData.custom_field?.['35'] || ''  // Avenue
          },
          default: false
        };

        await saveLocalAddress(localAddressData);
        // Explicitly trigger method fetching after address is set
        await setAddressInCheckoutAndFetchMethods();
        setIsLoading(false);
        return true;
      }
    } catch (error: any) {
      console.error('Error adding payment address:', error);
      setIsLoading(false);
      Alert.alert('Error', error.message || 'Failed to add address');
      return false;
    }
  };

  const addShippingAddress = async (addressData: any) => {
    try {
      setIsLoading(true);
      
      // Get user's email from auth store
      const { user } = useAuthStore.getState();
      
      const requestData = {
        firstname: addressData.firstname,
        lastname: addressData.lastname,
        email: addressData.email || user?.email || '',
        telephone: addressData.telephone || addressData.phone || user?.telephone || '',
        country_id: "114", // Kuwait
        city: addressData.city || "1",
        zone_id: addressData.zone_id || "4868",
        address_2: addressData.address_2 || "",
        custom_field: {
          "32": addressData.custom_field?.['32'] || "", // House Building
          "30": addressData.custom_field?.['30'] || "", // Block
          "31": addressData.custom_field?.['31'] || "", // Street
          "33": addressData.custom_field?.['33'] || "", // Apartment No.
          "35": addressData.custom_field?.['35'] || ""  // avenue
        }
      };

      console.log('Adding shipping address:', requestData);

      const response = await makeApiCall('/index.php?route=extension/mstore/shipping_address|save', {
        method: 'POST',
        data: requestData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Shipping address response:', response);

      if (response.success === 1) {
        // Use the response data directly for shipping address
        setShippingAddress(response.data);
        setIsLoading(false);
        return true;
      } else {
        throw new Error(response.error?.[0] || 'Failed to add shipping address');
      }
    } catch (error: any) {
      console.error('Error adding shipping address:', error);
      setIsLoading(false);
      Alert.alert('Error', error.message || 'Failed to add shipping address');
      return false;
    }
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
          
          {/* Display address based on authentication status */}
          {(isAuthenticated && selectedAddress) || (!isAuthenticated && localAddress) ? (
            <View style={styles.addressCard}>
              <Text style={styles.addressName}>
                {isAuthenticated && selectedAddress ? 
                  `${selectedAddress.firstname} ${selectedAddress.lastname}` :
                  localAddress ? `${localAddress.firstname} ${localAddress.lastname}` : ''
                }
              </Text>
              <Text style={styles.addressLocation}>
                Kuwait,
              </Text>
              <Text style={styles.addressLocation}>
                {isAuthenticated && selectedAddress ? selectedAddress.city : localAddress?.city}, Area
              </Text>
              <Text style={styles.addressDetails}>
                {isAuthenticated && selectedAddress ? 
                  `Block ${selectedAddress.custom_field['30']}, Street ${selectedAddress.custom_field['31']}, House Building ${selectedAddress.custom_field['32']}${selectedAddress.custom_field['35'] ? ', Avenue ' + selectedAddress.custom_field['35'] : ''}` :
                  localAddress ? `Block ${localAddress.custom_field?.['30']}, Street ${localAddress.custom_field?.['31']}, House Building ${localAddress.custom_field?.['32']}${localAddress.custom_field?.['35'] ? ', Avenue ' + localAddress.custom_field?.['35'] : ''}` : ''
                }
              </Text>
              {((isAuthenticated && selectedAddress?.address_2) || (!isAuthenticated && localAddress?.address_2)) && (
                <Text style={styles.addressDetails}>
                  {isAuthenticated && selectedAddress ? selectedAddress.address_2 : localAddress?.address_2}
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
              <Text style={styles.shippingAddressTitle}>SHIPPING ADDRESS</Text>
              {shippingAddress ? (
                <View style={styles.addressCard}>
                  <Text style={styles.addressName}>
                    {shippingAddress.firstname} {shippingAddress.lastname}
                  </Text>
                  <Text style={styles.addressLocation}>
                    Kuwait,
                  </Text>
                  <Text style={styles.addressLocation}>
                    {shippingAddress.city_name || shippingAddress.city}, {shippingAddress.zone || 'Area'}
                  </Text>
                  <Text style={styles.addressDetails}>
                    Block {shippingAddress.custom_field['30']}, Street {shippingAddress.custom_field['31']}, House Building {shippingAddress.custom_field['32']}{shippingAddress.custom_field['35'] ? ', Avenue ' + shippingAddress.custom_field['35'] : ''}
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
          
          {/* Product subheading and product list */}
          <Text style={styles.productSubheading}>Product</Text>
          
          <FlatList
            data={items}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.cart_id}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <Image
                  source={{ uri: item.thumb }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name.toUpperCase()}</Text>
                  <Text style={styles.productQuantity}>x {item.quantity}</Text>
                  <Text style={styles.productPrice}>{item.total}</Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.productsContainer}
            ListEmptyComponent={
              <View style={styles.emptyProductsContainer}>
                <Text style={styles.emptyProductsText}>No products in cart</Text>
              </View>
            }
          />
          
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Item Sub total</Text>
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

        {/* Shipping Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="car-outline" size={20} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Select Shipping Method</Text>
          </View>
          
          {methodsLoading ? (
            <View style={styles.methodsLoadingContainer}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.methodsLoadingText}>Loading shipping methods...</Text>
            </View>
          ) : shippingMethods.length > 0 ? (
            <View style={styles.methodsList}>
              {shippingMethods.map((method: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.methodOption,
                    selectedShippingMethod === method && styles.selectedMethodOption
                  ]}
                  onPress={() => setSelectedShippingMethod(method)}
                >
                  <View style={styles.methodRadio}>
                    <View style={[
                      styles.radioOuter,
                      selectedShippingMethod === method && styles.radioSelected
                    ]}>
                      {selectedShippingMethod === method && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>{method.title || method.name}</Text>
                    {method.cost && (
                      <Text style={styles.methodCost}>{method.cost}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noMethodsContainer}>
              <Text style={styles.noMethodsText}>
                {(isAuthenticated && selectedAddress) || (!isAuthenticated && localAddress) 
                  ? "No shipping methods available for your address"
                  : "Please add an address to see shipping methods"
                }
              </Text>
            </View>
          )}
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="card-outline" size={20} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          
          {methodsLoading ? (
            <View style={styles.methodsLoadingContainer}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.methodsLoadingText}>Loading payment methods...</Text>
            </View>
          ) : paymentMethods.length > 0 ? (
            <View style={styles.methodsList}>
              {paymentMethods.map((method: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.methodOption,
                    selectedPaymentMethod === method && styles.selectedMethodOption
                  ]}
                  onPress={() => setSelectedPaymentMethod(method)}
                >
                  <View style={styles.methodRadio}>
                    <View style={[
                      styles.radioOuter,
                      selectedPaymentMethod === method && styles.radioSelected
                    ]}>
                      {selectedPaymentMethod === method && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>{method.title || method.name}</Text>
                    {method.terms && (
                      <Text style={styles.methodTerms}>{method.terms}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noMethodsContainer}>
              <Text style={styles.noMethodsText}>
                {(isAuthenticated && selectedAddress) || (!isAuthenticated && localAddress) 
                  ? "No payment methods available for your address"
                  : "Please add an address to see payment methods"
                }
              </Text>
            </View>
          )}
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (isLoading || !selectedAddress || !selectedPaymentMethod || !selectedShippingMethod) && styles.disabledButton
          ]}
          onPress={handlePlaceOrder}
          disabled={isLoading || !selectedAddress || !selectedPaymentMethod || !selectedShippingMethod}
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
          context="checkout"
          customSaveFunction={addPaymentAddress}
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
              '33': selectedAddress.custom_field['33'] || '',
              '35': selectedAddress.custom_field['35'] || ''
            },
            default: selectedAddress.default,
            address_id: selectedAddress.address_id
          } : undefined}
          onAddressUpdated={async () => {
            // Refresh addresses and methods when address is updated
            if (isAuthenticated) {
              await loadAddresses();
            }
            
            // Always refresh shipping and payment methods after address change
            setTimeout(() => {
              setAddressInCheckoutAndFetchMethods();
            }, 500); // Small delay to ensure address is properly set
            
            setShowAddressModal(false);
            setIsAddingNewAddress(false);
            setIsEditingAddress(false);
          }}
        />
      )}

      {/* Add/Edit Shipping Address Modal */}
      {showShippingAddressModal && (
        <AddEditAddress
          context="checkout"
          customSaveFunction={addShippingAddress}
          onClose={() => {
            setShowShippingAddressModal(false);
            setIsAddingNewAddress(false);
            setIsEditingAddress(false);
          }}
          address={isEditingAddress && shippingAddress ? {
            firstname: shippingAddress.firstname,
            lastname: shippingAddress.lastname,
            phone: shippingAddress.telephone || '',
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
              '33': shippingAddress.custom_field['33'] || '',
              '35': shippingAddress.custom_field['35'] || ''
            },
            default: shippingAddress.default,
            address_id: shippingAddress.address_id
          } : undefined}
          onAddressUpdated={async () => {
            // Refresh shipping and payment methods after shipping address is updated
            setTimeout(() => {
              setAddressInCheckoutAndFetchMethods();
            }, 500); // Small delay to ensure address is properly set
            
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
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#000',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
  shippingAddressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  productInfo: {
    flex: 1,
    paddingLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  productQuantity: {
    fontSize: 12,
    color: '#666',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  productsContainer: {
    padding: 8,
  },
  productSubheading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptyProductsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyProductsText: {
    fontSize: 14,
    color: '#666',
  },
  methodsLoader: {
    marginTop: 8,
    marginBottom: 8,
  },
  methodTextContainer: {
    flex: 1,
  },
  methodSubtext: {
    fontSize: 12,
    color: '#666',
  },
  methodsList: {
    padding: 8,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  selectedMethodOption: {
    borderColor: '#000',
    backgroundColor: '#f8f8f8',
  },
  methodRadio: {
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  methodCost: {
    fontSize: 12,
    color: '#666',
  },
  methodTerms: {
    fontSize: 12,
    color: '#666',
  },
  methodsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'center',
  },
  methodsLoadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  noMethodsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noMethodsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 