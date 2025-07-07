import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Image, FlatList, Modal, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useAuthStore, Address } from '@store/auth-store';
import { useCartStore } from '@store/cart-store';
import { makeApiCall, API_ENDPOINTS, API_BASE_URL } from '@utils/api-config';
import AddEditAddress from '@components/add-edit-address';
import { theme } from '@theme';
import { useTranslation } from '@utils/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTextAlign, getFlexDirection } from '@utils/rtlStyles';
import ApplePay, { MerchantCapability, PaymentNetwork, CompleteStatus } from 'apple-pay-react-native-expo';

export default function CheckoutScreen() {
  const { isAuthenticated } = useAuthStore();
  const { addresses, fetchAddresses } = useAuthStore();
  const { items, total, clearCart, getCart } = useCartStore();
  const { t } = useTranslation();
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<any>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [localAddress, setLocalAddress] = useState<any>(null); // For unauthenticated users
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(false);
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showApplePayButton, setShowApplePayButton] = useState(false);
  const [applePayLoading, setApplePayLoading] = useState(false);
  const [canMakePayments, setCanMakePayments] = useState(false);

  // Check if Apple Pay is available on this device
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // Check if device supports Apple Pay
      const checkApplePaySupport = async () => {
        console.log('📱 [ApplePay] Starting device capability check for Apple Pay');
        try {
          console.log('📱 [ApplePay] iOS platform detected, checking Apple Pay availability');
          // Use ApplePay.isAvailable() if it exists, otherwise fall back to a manual check
          setCanMakePayments(true); // Assume support until we can properly check
          console.log('📱 [ApplePay] Setting canMakePayments to true (placeholder implementation)');
          
          // Add actual implementation once we have the correct API reference
          // This will be replaced with actual API call when we have accurate documentation
          console.log('📱 [ApplePay] Capability check completed successfully');
        } catch (error) {
          console.error('❌ [ApplePay] Error checking Apple Pay availability:', error);
          setCanMakePayments(false);
          console.log('❌ [ApplePay] Setting canMakePayments to false due to error');
        }
      };
      
      checkApplePaySupport();
    } else {
      console.log('📱 [ApplePay] Non-iOS platform detected, Apple Pay not supported');
    }
  }, []);

  // Dynamic shipping cost calculation based on selected shipping method
  const getShippingCost = () => {
    if (!selectedShippingMethod || !selectedShippingMethod.cost) {
      return 0;
    }
    // Parse cost from string like "0.000 KD" to number
    const costString = selectedShippingMethod.cost.toString();
    const costNumber = parseFloat(costString.replace(/[^\d.]/g, ''));
    return isNaN(costNumber) ? 0 : costNumber;
  };

  const shippingCost = getShippingCost();
  const orderTotal = total + shippingCost;

  // Helper function to check if all required fields are completed
  const isCheckoutComplete = () => {
    const hasAddress = isAuthenticated ? !!selectedAddress : !!localAddress;
    const hasShippingAddress = shipToDifferentAddress ? !!shippingAddress : true;
    return hasAddress && hasShippingAddress && !!selectedShippingMethod && !!selectedPaymentMethod;
  };

  // Helper function to parse price strings to numeric values for Apple Pay
  const parsePrice = (priceString: string): number => {
    // Remove all non-digit and non-decimal characters
    const numericValue = parseFloat(priceString.replace(/[^\d.]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
  };

  // Check if Apple Pay should be shown (iOS only, all requirements met)
  const shouldShowApplePayButton = () => {
    console.log('🧐 [ApplePay] Checking if Apple Pay button should be shown');
    console.log(`🧐 [ApplePay] Platform.OS: ${Platform.OS}`);
    console.log(`🧐 [ApplePay] canMakePayments: ${canMakePayments}`);
    console.log(`🧐 [ApplePay] isCheckoutComplete: ${isCheckoutComplete()}`);
    console.log(`🧐 [ApplePay] selectedPaymentMethod?.code: ${selectedPaymentMethod?.code || 'none'}`);
    
    const shouldShow = Platform.OS === 'ios' && 
                      canMakePayments &&
                      isCheckoutComplete() && 
                      selectedPaymentMethod?.code === 'applepay_knet';
                      
    console.log(`🧐 [ApplePay] Should show Apple Pay button: ${shouldShow}`);
    return shouldShow;
  };

  // Apple Pay payment processor - called when Place Order button is clicked
  const onApplePayButtonClicked = async (orderId: string) => {
    console.log('🍏 [ApplePay] Starting Apple Pay payment flow for order:', orderId);
    
    if (Platform.OS !== 'ios') {
      console.log('❌ [ApplePay] Not on iOS platform, aborting Apple Pay');
      Alert.alert('Apple Pay is only available on iOS.');
      return false;
    }

    console.log('🍏 [ApplePay] Setting Apple Pay loading state to true');
    setApplePayLoading(true);
    
    try {
      // Calculate total amount for Apple Pay
      const totalAmount = parsePrice(formatPrice(orderTotal));
      console.log('🍏 [ApplePay] Calculated total amount:', totalAmount);
      console.log('🍏 [ApplePay] Formatted price:', formatPrice(orderTotal));
      console.log('🍏 [ApplePay] Order total:', orderTotal);
      console.log('🍏 [ApplePay] Subtotal:', total);
      console.log('🍏 [ApplePay] Shipping cost:', shippingCost);
      
      console.log(`🍏 [ApplePay] Preparing Apple Pay request for order ID: ${orderId} with amount: ${totalAmount}`);
      
      // Prepare Apple Pay request with detailed line items for better user experience
      const paymentRequest = {
        merchantIdentifier: 'merchant.kw.com.azura',
        countryCode: 'KW',
        currencyCode: 'KWD',
        supportedNetworks: [
          PaymentNetwork.visa,
          PaymentNetwork.masterCard,
        ],
        merchantCapabilities: [
          MerchantCapability["3DS"],
          MerchantCapability.Credit,
          MerchantCapability.Debit
        ],
        paymentSummaryItems: [
          // Add items from cart with subtotal
          {
            label: 'Items Subtotal',
            amount: total
          },
          // Add shipping if applicable
          ...(shippingCost > 0 ? [{
            label: 'Shipping',
            amount: shippingCost
          }] : []),
          // Grand total (must be the last item and match the sum of previous items)
          {
            label: 'Azura', // Company name as the final line item
            amount: totalAmount
          }
        ]
      };
      
      console.log('🍏 [ApplePay] Payment request configured:', JSON.stringify(paymentRequest, null, 2));
      console.log('🍏 [ApplePay] Showing Apple Pay sheet to customer...');

      // Request Apple Pay payment
      const paymentResponse = await ApplePay.show(paymentRequest);
      
      console.log('✅ [ApplePay] Payment authorized by customer');
      console.log('🔍 [ApplePay] Payment response received. Available keys:', Object.keys(paymentResponse));
      
      // Generate track ID
      const trackId = `ORDER_${Date.now()}`;
      console.log('🍏 [ApplePay] Generated track ID:', trackId);

      // Process payment with backend
      console.log('🍏 [ApplePay] Preparing payload for backend processing');
      console.log('🔍 [ApplePay] Response structure summary:', JSON.stringify({
        network: paymentResponse.paymentNetwork || 'unknown',
        hasData: typeof paymentResponse === 'object' && !!paymentResponse,
        // Check known properties that might exist on the response
        keys: Object.keys(paymentResponse || {})
      }));
      
      const requestBody = {
        token: {
          paymentData: paymentResponse,
          paymentMethod: paymentResponse.paymentNetwork
        },
        amount: totalAmount.toString(),
        currencyCode: '414', // KWD currency code
        trackId: trackId, 
        trackid: trackId, 
        order_id: orderId
      };
      
      console.log('🍏 [ApplePay] Request body keys:', Object.keys(requestBody));
      console.log('🍏 [ApplePay] Sending payment to backend for processing');
      console.log(`🍏 [ApplePay] API endpoint: ${API_BASE_URL}/index.php?route=extension/opencart/payment/applepay_knet|processPaymentApp`);
      
      const processResponse = await fetch(`${API_BASE_URL}/index.php?route=extension/opencart/payment/applepay_knet|processPaymentApp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      // Check if the response is successful
      console.log('🍏 [ApplePay] API response status:', processResponse.status, processResponse.statusText, processResponse);
      console.log('🍏 [ApplePay] API response headers:', JSON.stringify(Object.fromEntries([...processResponse.headers.entries()])));
      
      if (!processResponse.ok) {
        console.error(`❌ [ApplePay] API responded with error status: ${processResponse.status} ${processResponse.statusText}`);
        throw new Error(`Server error: ${processResponse.status} ${processResponse.statusText}`);
      }
      
      // Check if the response is valid JSON
      let result;
      try {
        const responseText = await processResponse.text();
        
        // Log the raw response for debugging
        console.log('🔍 [ApplePay] Raw API response (first 200 chars):', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
        console.log('🔍 [ApplePay] Response length:', responseText.length);
        
        // Check if response starts with HTML (common error case)
        if (responseText.trim().startsWith('<')) {
          console.error('❌ [ApplePay] Server returned HTML instead of JSON:', responseText.substring(0, 300));
          throw new Error('Server returned HTML instead of JSON. Possible server error.');
        }
        
        // Parse JSON
        result = JSON.parse(responseText);
        console.log('🍏 [ApplePay] Backend processing result:', result);
      } catch (error) {
        const parseError = error as Error;
        console.error('❌ [ApplePay] Error parsing API response:', parseError);
        console.error('❌ [ApplePay] Parse error stack:', parseError.stack);
        throw new Error('Invalid response from server: ' + parseError.message);
      }

      if (result.status === 'success') {
        console.log('✅ [ApplePay] Payment successful, completing Apple Pay transaction');
        await ApplePay.complete(CompleteStatus.success);
        console.log('✅ [ApplePay] Apple Pay transaction marked as completed');
        
        // Clear cart
        console.log('🍏 [ApplePay] Clearing cart');
        await clearCart();
        console.log('✅ [ApplePay] Cart cleared successfully');
        
        // Navigate to success page
        console.log('🍏 [ApplePay] Navigating to success page with order data');
        router.replace({
          pathname: '/order-success',
          params: { 
            orderData: JSON.stringify({
              order_id: orderId, 
              payment_method: 'Apple Pay',
              status: 'success'
            })
          }
        });
        console.log('✅ [ApplePay] Successfully completed Apple Pay flow');
        return true;
      } else {
        console.error('❌ [ApplePay] Payment failed with status:', result.status);
        console.error('❌ [ApplePay] Payment failure message:', result.message || 'Unknown error');
        await ApplePay.complete(CompleteStatus.failure);
        console.log('❌ [ApplePay] Apple Pay transaction marked as failed');
        Alert.alert('Payment Failed', result.message || 'An error occurred during payment processing.');
        console.log('❌ [ApplePay] Navigating to failure page');
        router.replace('/order-failure');
        return false;
      }
    } catch (error: any) {
      console.error('❌ [ApplePay] Payment flow failed with error:', error);
      console.error('❌ [ApplePay] Error message:', error.message);
      console.error('❌ [ApplePay] Error stack:', error.stack);
      
      Alert.alert('Apple Pay Error', error.message || 'Apple Pay payment failed');
      
      // Ensure we complete the payment with failure if needed
      try {
        console.log('❌ [ApplePay] Attempting to complete Apple Pay with failure status');
        await ApplePay.complete(CompleteStatus.failure);
        console.log('✅ [ApplePay] Successfully completed Apple Pay with failure status');
      } catch (completeError: any) {
        console.error('❌ [ApplePay] Error completing failed payment:', completeError);
        console.error('❌ [ApplePay] Complete error message:', completeError.message);
        // Ignore errors when completing payment in error state
      }
      return false;
    } finally {
      setApplePayLoading(false);
      console.log('🍏 [ApplePay] Apple Pay loading state set to false');
    }
  };

  // Load addresses and cart on mount
  useEffect(() => {
    const initializeCheckout = async () => {
      console.log('🚀 [Checkout Init] Starting checkout initialization');
      console.log('🚀 [Checkout Init] Authentication status:', isAuthenticated);
      
      // Always fetch cart data
      console.log('🛒 [Checkout Init] Fetching cart data');
      await getCart();
      console.log('✅ [Checkout Init] Cart data fetched');
      
      if (isAuthenticated) {
        console.log('👤 [Checkout Init] User is authenticated, loading addresses');
        loadAddresses();
      } else {
        console.log('👤 [Checkout Init] User is not authenticated, loading local address');
        // Load local address for unauthenticated users
        loadLocalAddress();
      }
      
      console.log('🚀 [Checkout Init] Checkout initialization completed');
    };
    
    console.log('🚀 [Checkout Init] Triggering checkout initialization');
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
    console.log('🏠 [Addresses] Starting to load addresses for checkout');
    setAddressLoading(true);
    
    try {
      // Fetch addresses directly for checkout to get the original order
      console.log('🏠 [Addresses] Making API call to fetch addresses');
      console.log('🏠 [Addresses] API Endpoint:', API_ENDPOINTS.addresses);
      
      const response = await makeApiCall(API_ENDPOINTS.addresses, {
        method: 'GET'
      });
      
      console.log('🏠 [Addresses] Raw API response:', JSON.stringify(response, null, 2));
      console.log('🏠 [Addresses] Response success status:', response.success);
      console.log('🏠 [Addresses] Response data type:', typeof response.data);
      console.log('🏠 [Addresses] Response data is array:', Array.isArray(response.data));
      
      if (response.success === 1 && Array.isArray(response.data) && response.data.length > 0) {
        console.log('🏠 [Addresses] Processing addresses data');
        console.log('🏠 [Addresses] Total addresses received:', response.data.length);
        console.log('🏠 [Addresses] All addresses:', JSON.stringify(response.data, null, 2));
        
        // Get the LAST address from the original API response (most recent)
        // The API returns addresses in order of creation, so the last one is the newest
        const mostRecentAddress = response.data[response.data.length - 1];
        setSelectedAddress(mostRecentAddress);
        
        console.log('🏠 [Addresses] Selected most recent address:', JSON.stringify(mostRecentAddress, null, 2));
        console.log('🏠 [Addresses] Selected address ID:', mostRecentAddress.address_id);
        console.log('🏠 [Addresses] Selected address name:', `${mostRecentAddress.firstname} ${mostRecentAddress.lastname}`);
        console.log('🏠 [Addresses] Selected address city:', mostRecentAddress.city);
        console.log('🏠 [Addresses] Selected address custom fields:', JSON.stringify(mostRecentAddress.custom_field, null, 2));
      } else {
        setSelectedAddress(null);
        console.log('🏠 [Addresses] No addresses found for checkout');
        console.log('🏠 [Addresses] Response success:', response.success);
        console.log('🏠 [Addresses] Response data length:', response.data?.length || 'N/A');
      }
      
      // Also fetch for the address store (for the address modal)
      console.log('🏠 [Addresses] Fetching addresses for address store');
      await fetchAddresses();
      console.log('🏠 [Addresses] Address store fetch completed');
    } catch (error) {
      console.error('❌ [Addresses] Error loading addresses for checkout:', error);
      console.error('❌ [Addresses] Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ [Addresses] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      setSelectedAddress(null);
    }
    
    setAddressLoading(false);
    console.log('🏠 [Addresses] Address loading completed');
  };

  const loadLocalAddress = async () => {
    console.log('💾 [Local Address] Loading local address from AsyncStorage');
    
    try {
      console.log('💾 [Local Address] Retrieving saved address from key: @checkout_local_address');
      const savedAddress = await AsyncStorage.getItem('@checkout_local_address');
      
      console.log('💾 [Local Address] Raw saved address data:', savedAddress);
      console.log('💾 [Local Address] Saved address exists:', !!savedAddress);
      
      if (savedAddress) {
        console.log('💾 [Local Address] Parsing saved address JSON');
        const parsedAddress = JSON.parse(savedAddress);
        console.log('💾 [Local Address] Parsed address data:', JSON.stringify(parsedAddress, null, 2));
        console.log('💾 [Local Address] Address name:', `${parsedAddress.firstname} ${parsedAddress.lastname}`);
        console.log('💾 [Local Address] Address city:', parsedAddress.city);
        console.log('💾 [Local Address] Address custom fields:', JSON.stringify(parsedAddress.custom_field, null, 2));
        
        setLocalAddress(parsedAddress);
        console.log('✅ [Local Address] Local address set in state');
      } else {
        console.log('💾 [Local Address] No saved local address found');
      }
    } catch (error) {
      console.error('❌ [Local Address] Error loading local address:', error);
      console.error('❌ [Local Address] Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ [Local Address] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    }
    
    console.log('💾 [Local Address] Local address loading completed');
  };

  const saveLocalAddress = async (address: any) => {
    console.log('💾 [Save Local Address] Saving local address to AsyncStorage');
    console.log('💾 [Save Local Address] Address to save:', JSON.stringify(address, null, 2));
    console.log('💾 [Save Local Address] Storage key: @checkout_local_address');
    
    try {
      console.log('💾 [Save Local Address] Stringifying address data');
      const addressJson = JSON.stringify(address);
      console.log('💾 [Save Local Address] JSON string length:', addressJson.length);
      
      console.log('💾 [Save Local Address] Writing to AsyncStorage');
      await AsyncStorage.setItem('@checkout_local_address', addressJson);
      console.log('✅ [Save Local Address] Successfully saved to AsyncStorage');
      
      console.log('💾 [Save Local Address] Setting address in state');
      setLocalAddress(address);
      console.log('✅ [Save Local Address] Local address state updated');
    } catch (error) {
      console.error('❌ [Save Local Address] Error saving local address:', error);
      console.error('❌ [Save Local Address] Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ [Save Local Address] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    }
    
    console.log('💾 [Save Local Address] Save local address operation completed');
  };

  const setAddressInCheckoutAndFetchMethods = async () => {
    console.log('🔄 [Address Setup] Starting address setup and methods fetch');
    console.log('🔄 [Address Setup] Is authenticated:', isAuthenticated);
    console.log('🔄 [Address Setup] Selected address:', selectedAddress ? `${selectedAddress.firstname} ${selectedAddress.lastname}` : 'None');
    console.log('🔄 [Address Setup] Local address:', localAddress ? `${localAddress.firstname} ${localAddress.lastname}` : 'None');
    
    setMethodsLoading(true);
    
    try {
      const currentAddress = isAuthenticated ? selectedAddress : localAddress;
      
      console.log('🔄 [Address Setup] Current address to use:', currentAddress ? `${currentAddress.firstname} ${currentAddress.lastname}` : 'None');
      
      if (!currentAddress) {
        console.log('🔄 [Address Setup] No current address available, skipping setup');
        return;
      }

      // For both authenticated and unauthenticated users, send complete address data
      if (isAuthenticated && selectedAddress) {
        console.log('🔄 [Address Setup] Processing authenticated user address');
        
        // Get user's email and phone from auth store
        const { user } = useAuthStore.getState();
        console.log('🔄 [Address Setup] User from auth store:', user ? {
          email: user.email,
          telephone: user.telephone,
          firstname: user.firstname,
          lastname: user.lastname
        } : 'No user data');
        
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

        console.log('🔄 [Address Setup] Prepared address data for authenticated user:', JSON.stringify(addressData, null, 2));

        // Set payment address
        console.log('🔄 [Address Setup] Setting payment address for authenticated user');
        const paymentAddressResponse = await makeApiCall('/index.php?route=extension/mstore/payment_address|save', {
          method: 'POST',
          data: addressData
        });
        console.log('🔄 [Address Setup] Payment address response:', JSON.stringify(paymentAddressResponse, null, 2));

        // Set shipping address (same as payment)
        console.log('🔄 [Address Setup] Setting shipping address for authenticated user');
        const shippingAddressResponse = await makeApiCall('/index.php?route=extension/mstore/shipping_address|save', {
          method: 'POST',
          data: addressData
        });
        console.log('🔄 [Address Setup] Shipping address response:', JSON.stringify(shippingAddressResponse, null, 2));
      } else if (!isAuthenticated && localAddress) {
        console.log('🔄 [Address Setup] Processing unauthenticated user address');
        console.log('🔄 [Address Setup] Local address details:', JSON.stringify(localAddress, null, 2));
        
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

        console.log('🔄 [Address Setup] Prepared address data for unauthenticated user:', JSON.stringify(addressData, null, 2));

        // Set payment address
        console.log('🔄 [Address Setup] Setting payment address for unauthenticated user');
        const paymentAddressResponse = await makeApiCall('/index.php?route=extension/mstore/payment_address|save', {
          method: 'POST',
          data: addressData
        });
        console.log('🔄 [Address Setup] Payment address response:', JSON.stringify(paymentAddressResponse, null, 2));

        // Set shipping address (same as payment)
        console.log('🔄 [Address Setup] Setting shipping address for unauthenticated user');
        const shippingAddressResponse = await makeApiCall('/index.php?route=extension/mstore/shipping_address|save', {
          method: 'POST',
          data: addressData
        });
        console.log('🔄 [Address Setup] Shipping address response:', JSON.stringify(shippingAddressResponse, null, 2));
      }

      // Now fetch shipping and payment methods
      console.log('🔄 [Address Setup] Starting to fetch shipping and payment methods');
      await fetchShippingAndPaymentMethods();
      console.log('🔄 [Address Setup] Completed fetching shipping and payment methods');

    } catch (error) {
      console.error('❌ [Address Setup] Error setting address in checkout session:', error);
      console.error('❌ [Address Setup] Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ [Address Setup] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      setShippingMethods([]);
      setPaymentMethods([]);
      setSelectedShippingMethod(null);
      setSelectedPaymentMethod(null);
    } finally {
      setMethodsLoading(false);
      console.log('🔄 [Address Setup] Address setup and methods fetch completed');
    }
  };

  const fetchShippingAndPaymentMethods = async () => {
    console.log('🚚💳 [Methods] Starting to fetch shipping and payment methods');
    
    try {
      // Get current language for API calls
      const { useLanguageStore } = await import('@store/language-store');
      const { currentLanguage } = useLanguageStore.getState();
      console.log(`🌐 [Methods] Fetching shipping/payment methods with language: ${currentLanguage}`);
      
      // Fetch shipping methods with language parameter
      console.log('🚚 [Shipping] Fetching shipping methods');
      console.log('🚚 [Shipping] API endpoint: /index.php?route=extension/mstore/shipping_method');
      console.log('🚚 [Shipping] Language params:', currentLanguage === 'ar' ? { language: 'ar' } : 'None');
      
      const shippingResponse = await makeApiCall('/index.php?route=extension/mstore/shipping_method', {
        method: 'GET',
        params: currentLanguage === 'ar' ? { language: 'ar' } : undefined
      });
      
      console.log('🚚 [Shipping] Raw shipping methods response:', JSON.stringify(shippingResponse, null, 2));
      console.log('🚚 [Shipping] Response success status:', shippingResponse.success);
      console.log('🚚 [Shipping] Response data exists:', !!shippingResponse.data);
      console.log('🚚 [Shipping] Response data type:', typeof shippingResponse.data);
      
      if (shippingResponse.success === 1 && shippingResponse.data) {
        console.log('🚚 [Shipping] Processing shipping response data');
        console.log('🚚 [Shipping] Has shipping_methods:', !!shippingResponse.data.shipping_methods);
        console.log('🚚 [Shipping] Shipping_methods type:', typeof shippingResponse.data.shipping_methods);
        
        // Parse shipping methods from nested structure
        if (shippingResponse.data.shipping_methods && typeof shippingResponse.data.shipping_methods === 'object') {
          console.log('🚚 [Shipping] Raw shipping methods object:', JSON.stringify(shippingResponse.data.shipping_methods, null, 2));
          
          const parsedMethods = [];
          
          // Iterate through shipping methods (e.g., "flat")
          for (const methodKey in shippingResponse.data.shipping_methods) {
            console.log(`🚚 [Shipping] Processing method key: ${methodKey}`);
            const method = shippingResponse.data.shipping_methods[methodKey];
            console.log(`🚚 [Shipping] Method ${methodKey} data:`, JSON.stringify(method, null, 2));
            
            // Iterate through quotes within each method
            if (method.quote && typeof method.quote === 'object') {
              console.log(`🚚 [Shipping] Processing quotes for method ${methodKey}`);
              console.log(`🚚 [Shipping] Quotes data:`, JSON.stringify(method.quote, null, 2));
              
              for (const quoteKey in method.quote) {
                console.log(`🚚 [Shipping] Processing quote key: ${quoteKey}`);
                const quote = method.quote[quoteKey];
                console.log(`🚚 [Shipping] Quote ${quoteKey} data:`, JSON.stringify(quote, null, 2));
                
                const parsedMethod = {
                  ...quote,
                  title: quote.title || method.title,
                  sort_order: method.sort_order
                };
                console.log(`🚚 [Shipping] Parsed method:`, JSON.stringify(parsedMethod, null, 2));
                parsedMethods.push(parsedMethod);
              }
            } else {
              console.log(`🚚 [Shipping] No quotes found for method ${methodKey}`);
            }
          }
          
          console.log('🚚 [Shipping] Total parsed shipping methods:', parsedMethods.length);
          console.log('🚚 [Shipping] All parsed methods:', JSON.stringify(parsedMethods, null, 2));
          
          if (parsedMethods.length > 0) {
            setShippingMethods(parsedMethods);
            console.log('🚚 [Shipping] Set shipping methods in state');
          } else {
            console.log('🚚 [Shipping] No shipping method quotes available');
            setShippingMethods([]);
            setSelectedShippingMethod(null);
          }
        } else {
          // No shipping methods available - this is expected if address is not set properly
          console.log('🚚 [Shipping] No shipping methods available, address may not be set in checkout session');
          console.log('🚚 [Shipping] Response data structure:', Object.keys(shippingResponse.data || {}));
          setShippingMethods([]);
          setSelectedShippingMethod(null);
        }
      } else {
        console.log('🚚 [Shipping] Shipping response unsuccessful or no data');
        console.log('🚚 [Shipping] Success status:', shippingResponse.success);
        console.log('🚚 [Shipping] Error:', shippingResponse.error);
      }
      
      // Fetch payment methods with language parameter
      console.log('💳 [Payment] Fetching payment methods');
      console.log('💳 [Payment] API endpoint: /index.php?route=extension/mstore/payment_method');
      console.log('💳 [Payment] Language params:', currentLanguage === 'ar' ? { language: 'ar' } : 'None');
      
      const paymentResponse = await makeApiCall('/index.php?route=extension/mstore/payment_method', {
        method: 'GET',
        params: currentLanguage === 'ar' ? { language: 'ar' } : undefined
      });
      
      console.log('💳 [Payment] Raw payment methods response:', JSON.stringify(paymentResponse, null, 2));
      console.log('💳 [Payment] Response success status:', paymentResponse.success);
      console.log('💳 [Payment] Response data exists:', !!paymentResponse.data);
      console.log('💳 [Payment] Response data type:', typeof paymentResponse.data);
      
      if (paymentResponse.success === 1 && paymentResponse.data) {
        console.log('💳 [Payment] Processing payment response data');
        console.log('💳 [Payment] Has payment_methods:', !!paymentResponse.data.payment_methods);
        console.log('💳 [Payment] Payment_methods type:', typeof paymentResponse.data.payment_methods);
        
        // Parse payment methods from object structure
        if (paymentResponse.data.payment_methods && typeof paymentResponse.data.payment_methods === 'object') {
          console.log('💳 [Payment] Raw payment methods object:', JSON.stringify(paymentResponse.data.payment_methods, null, 2));
          
          const parsedMethods = [];
          
          // Iterate through payment methods (e.g., "custom", "knet", "cod")
          for (const methodKey in paymentResponse.data.payment_methods) {
            console.log(`💳 [Payment] Processing method key: ${methodKey}`);
            const method = paymentResponse.data.payment_methods[methodKey];
            console.log(`💳 [Payment] Method ${methodKey} data:`, JSON.stringify(method, null, 2));
            
            const parsedMethod = {
              ...method,
              sort_order: method.sort_order || "999" // Default sort order if not provided
            };
            console.log(`💳 [Payment] Parsed method:`, JSON.stringify(parsedMethod, null, 2));
            parsedMethods.push(parsedMethod);
          }
          
          console.log('💳 [Payment] Total parsed payment methods:', parsedMethods.length);
          console.log('💳 [Payment] All parsed methods:', JSON.stringify(parsedMethods, null, 2));
          
          if (parsedMethods.length > 0) {
            setPaymentMethods(parsedMethods);
            console.log('💳 [Payment] Set payment methods in state');
          } else {
            console.log('💳 [Payment] No payment method options available');
            setPaymentMethods([]);
            setSelectedPaymentMethod(null);
          }
        } else {
          // No payment methods available - this is expected if address is not set properly
          console.log('💳 [Payment] No payment methods available, address may not be set in checkout session');
          console.log('💳 [Payment] Response data structure:', Object.keys(paymentResponse.data || {}));
          setPaymentMethods([]);
          setSelectedPaymentMethod(null);
        }
      } else {
        console.log('💳 [Payment] Payment response unsuccessful or no data');
        console.log('💳 [Payment] Success status:', paymentResponse.success);
        console.log('💳 [Payment] Error:', paymentResponse.error);
      }
      
    } catch (error) {
      console.error('❌ [Methods] Error fetching shipping/payment methods:', error);
      console.error('❌ [Methods] Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ [Methods] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      setShippingMethods([]);
      setPaymentMethods([]);
      setSelectedShippingMethod(null);
      setSelectedPaymentMethod(null);
    }
    
    console.log('🚚💳 [Methods] Shipping and payment methods fetch completed');
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

  const handleShippingMethodSelection = async (method: any) => {
    console.log('🚚 [Shipping Selection] User selected shipping method');
    console.log('🚚 [Shipping Selection] Selected method:', JSON.stringify(method, null, 2));
    console.log('🚚 [Shipping Selection] Method code:', method?.code || 'No code');
    console.log('🚚 [Shipping Selection] Method title:', method?.title || 'No title');
    console.log('🚚 [Shipping Selection] Method cost:', method?.cost || method?.text || 'No cost info');
    
    setSelectedShippingMethod(method);
    console.log('🚚 [Shipping Selection] Updated selectedShippingMethod state');
    
    try {
      // Call set shipping method API immediately when user selects
      const methodCode = method?.code || "flat.flat";
      console.log('🚚 [Shipping Selection] Sending shipping method to backend:', methodCode);
      console.log('🚚 [Shipping Selection] API endpoint:', API_ENDPOINTS.setShippingMethod);
      
      const response = await makeApiCall(API_ENDPOINTS.setShippingMethod, {
        method: 'POST',
        data: {
          shipping_method: methodCode
        }
      });
      
      console.log('🚚 [Shipping Selection] Backend response:', JSON.stringify(response, null, 2));
      console.log('🚚 [Shipping Selection] Response success status:', response.success);
      
      if (response.success === 1) {
        console.log('✅ [Shipping Selection] Shipping method set successfully:', methodCode);
      } else {
        console.log('❌ [Shipping Selection] Failed to set shipping method:', response.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ [Shipping Selection] Error setting shipping method:', error);
      console.error('❌ [Shipping Selection] Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ [Shipping Selection] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    }
  };

  const handlePaymentMethodSelection = async (method: any) => {
    console.log('💳 [Payment Selection] User selected payment method');
    console.log('💳 [Payment Selection] Selected method:', JSON.stringify(method, null, 2));
    console.log('💳 [Payment Selection] Method code:', method?.code || 'No code');
    console.log('💳 [Payment Selection] Method title:', method?.title || 'No title');
    console.log('💳 [Payment Selection] Method sort order:', method?.sort_order || 'No sort order');
    
    // Check if Apple Pay KNET is selected
    if (method?.code === 'applepay_knet') {
      console.log('🍏 [Payment Selection] Apple Pay KNET payment method selected');
      console.log('🍏 [Payment Selection] Apple Pay method details:', JSON.stringify(method, null, 2));
    }
    
    setSelectedPaymentMethod(method);
    console.log('💳 [Payment Selection] Updated selectedPaymentMethod state');
    
    try {
      // Call set payment method API immediately when user selects
      const methodCode = method?.code || "cod";
      console.log('💳 [Payment Selection] Sending payment method to backend:', methodCode);
      console.log('💳 [Payment Selection] API endpoint:', API_ENDPOINTS.setPaymentMethod);
      console.log('💳 [Payment Selection] Request data:', { payment_method: methodCode });
      
      const response = await makeApiCall(API_ENDPOINTS.setPaymentMethod, {
        method: 'POST',
        data: {
          payment_method: methodCode
        }
      });
      
      console.log('💳 [Payment Selection] Backend response:', JSON.stringify(response, null, 2));
      console.log('💳 [Payment Selection] Response success status:', response.success);
      console.log('💳 [Payment Selection] Response data:', response.data);
      console.log('💳 [Payment Selection] Response error:', response.error);
      
      if (response.success === 1) {
        console.log('✅ [Payment Selection] Payment method set successfully:', methodCode);
      } else {
        console.log('❌ [Payment Selection] Failed to set payment method:', response.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ [Payment Selection] Error setting payment method:', error);
      console.error('❌ [Payment Selection] Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ [Payment Selection] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    }
  };

  const handlePlaceOrder = async () => {
    // Clear previous general errors
    setError(null);
    setIsLoading(true);
    console.log('🛒 [Order] Starting order placement process');

    try {
      // All required data should already be set:
      // - Addresses are set when user selects them or adds new ones
      // - Shipping method is set when user selects it
      // - Payment method is set when user selects it
      
      // Verify all required selections are made
      if (!selectedShippingMethod) {
        console.log('❌ [Order] Order validation failed: No shipping method selected');
        throw new Error('Shipping method not selected');
      }

      if (!selectedPaymentMethod) {
        console.log('❌ [Order] Order validation failed: No payment method selected');
        throw new Error('Payment method not selected');
      }

      console.log(`🛒 [Order] Selected payment method: ${selectedPaymentMethod?.code || 'unknown'}`);

      // For Apple Pay, ensure we set the correct payment method first
      if (selectedPaymentMethod?.code === 'applepay_knet' && Platform.OS === 'ios') {
        console.log('🍏 [ApplePay] Apple Pay payment method detected, setting applepay_knet as payment method');
        // Explicitly set payment method to Apple Pay KNET
        await makeApiCall(API_ENDPOINTS.setPaymentMethod, {
          method: 'POST',
          data: {
            payment_method: 'applepay_knet' 
          }
        });
        console.log('🍏 [ApplePay] Payment method set to applepay_knet');
      }
      
      // Confirm order for all payment methods (including Apple Pay)
      console.log('🛒 [Order] Confirming order with backend');
      console.log('🛒 [Order] API endpoint:', API_ENDPOINTS.confirmOrder);
      console.log('🛒 [Order] Request method: POST');
      console.log('🛒 [Order] Selected shipping method:', selectedShippingMethod ? {
        code: selectedShippingMethod.code,
        title: selectedShippingMethod.title,
        cost: selectedShippingMethod.cost || selectedShippingMethod.text
      } : 'None');
      console.log('🛒 [Order] Selected payment method:', selectedPaymentMethod ? {
        code: selectedPaymentMethod.code,
        title: selectedPaymentMethod.title
      } : 'None');
      
      const confirmResponse = await makeApiCall(API_ENDPOINTS.confirmOrder, {
        method: 'POST'
      });
      
      console.log('🛒 [Order] Raw backend order confirmation response:', JSON.stringify(confirmResponse, null, 2));
      console.log('🛒 [Order] Response success status:', confirmResponse.success);
      console.log('🛒 [Order] Response data exists:', !!confirmResponse.data);
      console.log('🛒 [Order] Response error:', confirmResponse.error);
      
      // If order creation failed, throw error
      if (confirmResponse.success !== 1) {
        console.log('❌ [Order] Order confirmation failed');
        console.log('❌ [Order] Failed response:', JSON.stringify(confirmResponse, null, 2));
        console.log('❌ [Order] Error details:', confirmResponse.error || 'No error details');
        throw new Error('Failed to create order.');
      }

      console.log('✅ [Order] Order created successfully');
      console.log('🛒 [Order] Order ID:', confirmResponse.data?.order_id || 'No order ID');
      console.log('🛒 [Order] Order data:', JSON.stringify(confirmResponse.data, null, 2));

      // Now handle payment method-specific flows
      if (selectedPaymentMethod?.code === 'applepay_knet' && Platform.OS === 'ios') {
        console.log('🍏 [ApplePay] Starting Apple Pay flow for order:', confirmResponse.data.order_id);
        // Trigger Apple Pay payment flow with the order ID
        const success = await onApplePayButtonClicked(confirmResponse.data.order_id);
        console.log(`🍏 [ApplePay] Apple Pay flow completed with success: ${success}`);
        setIsLoading(false);
        return;
      }

      // For other payment methods with redirect URL (KNet, Credit Card)
      if (confirmResponse.data.redirect_url) {
        console.log('💳 [Payment Redirect] Payment redirect URL detected');
        console.log('💳 [Payment Redirect] Raw redirect URL:', confirmResponse.data.redirect_url);
        console.log('💳 [Payment Redirect] URL length:', confirmResponse.data.redirect_url.length);
        
        // Decode HTML entities and fix URL format
        let processedUrl = confirmResponse.data.redirect_url.replace(/&amp;/g, '&');
        console.log('💳 [Payment Redirect] After HTML entity decode:', processedUrl);
        
        // Fix specific URL format: change "&order_id=" to "&amp&order_id="
        processedUrl = processedUrl.replace(/&order_id=/g, '&amp&order_id=');
        console.log('💳 [Payment Redirect] After order_id fix:', processedUrl);
        
        console.log('💳 [Payment Redirect] Final processed payment URL:', processedUrl);
        console.log('💳 [Payment Redirect] URL host:', new URL(processedUrl).host);
        console.log('💳 [Payment Redirect] URL pathname:', new URL(processedUrl).pathname);
        console.log('💳 [Payment Redirect] URL search params:', new URL(processedUrl).search);
        
        // Open payment gateway in WebView
        console.log('💳 [Payment Redirect] Setting payment URL and showing WebView');
        setPaymentUrl(processedUrl);
        setShowPaymentWebView(true);
        setIsLoading(false);
        console.log('💳 [Payment Redirect] WebView should now be visible');
        return;
      }
      
      // For COD or direct payments without redirect_url
      console.log('💰 [Payment] Direct payment completed without redirect');
      setOrderSuccess(true);
      
      // Clear cart
      await clearCart();
      console.log('🛒 [Order] Cart cleared');

      // Extract important order data for success page
      const orderData = {
        order_id: confirmResponse.data.order_id,
        firstname: confirmResponse.data.firstname,
        lastname: confirmResponse.data.lastname,
        email: confirmResponse.data.email,
        date_added: confirmResponse.data.date_added,
        total: confirmResponse.data.total,
        payment_method: confirmResponse.data.payment_method,
      };

      console.log('🛒 [Order] Navigating to success page with order data');
      // Redirect to success page with order data
      router.replace({
        pathname: '/order-success',
        params: { orderData: JSON.stringify(orderData) }
      });
    } catch (err) {
      console.error('❌ [Order] Error during order placement:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while placing the order');
    } finally {
      setIsLoading(false);
      console.log('🛒 [Order] Order placement process completed');
    }
  };

  // Handle payment WebView navigation changes
  const handlePaymentNavigation = async (navState: any) => {
    const currentUrl = navState.url;
    console.log('🌐 [WebView Navigation] Payment WebView navigation event');
    console.log('🌐 [WebView Navigation] Current URL:', currentUrl);
    console.log('🌐 [WebView Navigation] Navigation state:', JSON.stringify(navState, null, 2));
    console.log('🌐 [WebView Navigation] Loading:', navState.loading);
    console.log('🌐 [WebView Navigation] Can go back:', navState.canGoBack);
    console.log('🌐 [WebView Navigation] Can go forward:', navState.canGoForward);
    
    // Monitor for success URL
    if (currentUrl.includes('checkout/success')) {
      console.log('✅ [WebView Navigation] Payment successful URL detected');
      console.log('✅ [WebView Navigation] Success URL:', currentUrl);
      console.log('✅ [WebView Navigation] Closing WebView and navigating to success');
      
      // Close WebView
      setShowPaymentWebView(false);
      setPaymentUrl(null);
      console.log('✅ [WebView Navigation] WebView closed and payment URL cleared');
      
      // Clear cart
      console.log('✅ [WebView Navigation] Clearing cart');
      await clearCart();
      console.log('✅ [WebView Navigation] Cart cleared successfully');
      
      // Navigate to success page
      console.log('✅ [WebView Navigation] Navigating to order success page');
      router.replace('/order-success');
      return;
    }
    
    // Monitor for failure URL (cart page indicates failed payment)
    if (currentUrl.includes('checkout/cart')) {
      console.log('❌ [WebView Navigation] Payment failed URL detected');
      console.log('❌ [WebView Navigation] Failure URL:', currentUrl);
      console.log('❌ [WebView Navigation] Cart page indicates failed payment');
      console.log('❌ [WebView Navigation] Closing WebView and navigating to failure');
      
      // Close WebView
      setShowPaymentWebView(false);
      setPaymentUrl(null);
      console.log('❌ [WebView Navigation] WebView closed and payment URL cleared');
      
      // Navigate to failure page
      console.log('❌ [WebView Navigation] Navigating to order failure page');
      router.replace('/order-failure');
      return;
    }
    
    // Log other navigation patterns for debugging
    if (currentUrl.includes('knet') || currentUrl.includes('kpay')) {
      console.log('🏛️ [WebView Navigation] KNET payment gateway detected');
    }
    
    if (currentUrl.includes('cybersource')) {
      console.log('💳 [WebView Navigation] CyberSource payment gateway detected');
    }
    
    console.log('🌐 [WebView Navigation] Navigation event processed');
  };

  // Close payment WebView manually
  const closePaymentWebView = () => {
    setShowPaymentWebView(false);
    setPaymentUrl(null);
    setIsLoading(false);
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
    console.log('🏠 [Add Address] Starting to add payment address');
    console.log('🏠 [Add Address] Input address data:', JSON.stringify(addressData, null, 2));
    console.log('🏠 [Add Address] Is authenticated:', isAuthenticated);
    
    try {
      setIsLoading(true);
      console.log('🏠 [Add Address] Set loading state to true');
      
      if (isAuthenticated) {
        console.log('🏠 [Add Address] Processing authenticated user address');
        
        // Get user's email from auth store
        const { user } = useAuthStore.getState();
        console.log('🏠 [Add Address] User from auth store:', user ? {
          email: user.email,
          telephone: user.telephone,
          firstname: user.firstname,
          lastname: user.lastname
        } : 'No user data');
        
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

        console.log('🏠 [Add Address] Prepared request data for authenticated user:', JSON.stringify(requestData, null, 2));
        console.log('🏠 [Add Address] API endpoint: /index.php?route=extension/mstore/payment_address|save');

        const response = await makeApiCall('/index.php?route=extension/mstore/payment_address|save', {
          method: 'POST',
          data: requestData,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('🏠 [Add Address] Payment address API response:', JSON.stringify(response, null, 2));
        console.log('🏠 [Add Address] Response success status:', response.success);
        console.log('🏠 [Add Address] Response data:', response.data);
        console.log('🏠 [Add Address] Response error:', response.error);

        if (response.success === 1) {
          console.log('✅ [Add Address] Payment address added successfully');
          
          // Refresh addresses for authenticated users and get the most recent one
          console.log('🏠 [Add Address] Refreshing addresses');
          await loadAddresses(); // This will automatically select the most recent address
          console.log('🏠 [Add Address] Addresses refreshed');
          
          // Explicitly trigger method fetching after address is set
          console.log('🏠 [Add Address] Triggering methods fetch');
          await setAddressInCheckoutAndFetchMethods();
          console.log('🏠 [Add Address] Methods fetch completed');
          
          setIsLoading(false);
          console.log('🏠 [Add Address] Set loading state to false');
          return true;
        } else {
          console.log('❌ [Add Address] Failed to add payment address');
          console.log('❌ [Add Address] Error details:', response.error);
          throw new Error(response.error?.[0] || 'Failed to add address');
        }
      } else {
        console.log('🏠 [Add Address] Processing unauthenticated user address');
        
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

        console.log('🏠 [Add Address] Prepared local address data:', JSON.stringify(localAddressData, null, 2));
        console.log('🏠 [Add Address] Saving local address to AsyncStorage');
        await saveLocalAddress(localAddressData);
        console.log('🏠 [Add Address] Local address saved successfully');
        
        // Explicitly trigger method fetching after address is set
        console.log('🏠 [Add Address] Triggering methods fetch for unauthenticated user');
        await setAddressInCheckoutAndFetchMethods();
        console.log('🏠 [Add Address] Methods fetch completed for unauthenticated user');
        
        setIsLoading(false);
        console.log('🏠 [Add Address] Set loading state to false');
        return true;
      }
    } catch (error: any) {
      console.error('❌ [Add Address] Error adding payment address:', error);
      console.error('❌ [Add Address] Error message:', error.message);
      console.error('❌ [Add Address] Error stack:', error.stack);
      setIsLoading(false);
      console.log('🏠 [Add Address] Set loading state to false due to error');
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
          <Text style={styles.title}>{t('checkout.title')}</Text>
          <Text style={styles.subtitle}>{t('checkout.easyShoppingWithAzura')}</Text>
        </View>

        {/* Billing Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="location-outline" size={20} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{t('checkout.billingShippingAddress')}</Text>
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
                <Text style={styles.editAddressText}>{t('checkout.editAddress')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={handleAddAddress}
            >
              <View style={styles.addAddressContent}>
                <Ionicons name="add-circle-outline" size={24} color="#000" />
                <Text style={styles.addAddressText}>{t('checkout.addAddress')}</Text>
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
            <Text style={styles.shipToDifferentText}>{t('checkout.shipToDifferentAddress')}</Text>
          </TouchableOpacity>

          {shipToDifferentAddress && (
            <View style={[styles.section, styles.shippingAddressSection]}>
              <Text style={styles.shippingAddressTitle}>{t('checkout.shippingAddressTitle')}</Text>
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
                    <Text style={styles.editAddressText}>{t('checkout.editAddress')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addAddressButton}
                  onPress={handleAddShippingAddress}
                >
                  <View style={styles.addAddressContent}>
                    <Ionicons name="add-circle-outline" size={24} color="#000" />
                    <Text style={styles.addAddressText}>{t('checkout.addShippingAddressButton')}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {!isAuthenticated && !localAddress && (
            <Text style={styles.validationError}>{t('checkout.addBillingAddress')}</Text>
          )}
          
          {isAuthenticated && !selectedAddress && (
            <Text style={styles.validationError}>{t('checkout.addBillingAddress')}</Text>
          )}
          
          {shipToDifferentAddress && !shippingAddress && (
            <Text style={styles.validationError}>{t('checkout.addShippingAddress')}</Text>
          )}
        </View>

        {/* Shipping Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="car-outline" size={20} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{t('checkout.selectShipping')}</Text>
          </View>
          
          {methodsLoading ? (
            <View style={styles.methodsLoadingContainer}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.methodsLoadingText}>{t('checkout.loadingShippingMethods')}</Text>
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
                  onPress={() => handleShippingMethodSelection(method)}
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
                    {method.text && (
                      <Text style={styles.methodCost}>{method.text}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
                        <View style={styles.noMethodsContainer}>
              <Text style={styles.noMethodsText}>
                {(isAuthenticated && selectedAddress) || (!isAuthenticated && localAddress)
                  ? t('checkout.noShippingMethods')
                  : t('checkout.addAddressForShipping')
                }
              </Text>
            </View>
          )}
          
          {!selectedShippingMethod && ((isAuthenticated && selectedAddress) || (!isAuthenticated && localAddress)) && (
            <Text style={styles.validationError}>{t('checkout.selectShippingMethod')}</Text>
          )}
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="card-outline" size={20} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{t('checkout.selectPaymentTitle')}</Text>
          </View>
          
          {methodsLoading ? (
            <View style={styles.methodsLoadingContainer}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.methodsLoadingText}>{t('checkout.loadingPaymentMethods')}</Text>
            </View>
          ) : paymentMethods.length > 0 ? (
            <View style={styles.methodsList}>
              {paymentMethods.map((method: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.methodOption,
                    method.code === 'applepay_knet' ? styles.applePayMethodOption : null,
                    selectedPaymentMethod === method && styles.selectedMethodOption,
                    selectedPaymentMethod === method && method.code === 'applepay_knet' && styles.selectedApplePayMethodOption
                  ]}
                  onPress={() => {
                    handlePaymentMethodSelection(method);
                  }}
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
                    {method.code === 'applepay_knet' ? (
                      <View style={styles.applePayMethodContent}>
                        <View style={[
                          styles.applePayBadge,
                          selectedPaymentMethod === method ? styles.applePayBadgeSelected : null
                        ]}>
                    <Ionicons 
                      name="logo-apple" 
                            size={16} 
                            color={selectedPaymentMethod === method ? "#fff" : "#000"} 
                            style={styles.appleLogoIcon}
                    />
                  <Text style={[
                    styles.applePayText,
                            selectedPaymentMethod === method ? styles.applePayTextSelected : null
                  ]}>
                            Pay
                  </Text>
                    </View>
                        <Text style={styles.methodSubtext}>Apple Pay via KNET</Text>
                  </View>
                    ) : (
                      <>
                        <Text style={styles.methodTitle}>{method.title || method.name}</Text>
                        {method.terms && (
                          <Text style={styles.methodTerms}>{method.terms}</Text>
                        )}
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noMethodsContainer}>
              <Text style={styles.noMethodsText}>
                {(isAuthenticated && selectedAddress) || (!isAuthenticated && localAddress) 
                  ? t('checkout.noPaymentMethods')
                  : t('checkout.addAddressForPayment')
                }
              </Text>
            </View>
          )}
          
          {!selectedPaymentMethod && ((isAuthenticated && selectedAddress) || (!isAuthenticated && localAddress)) && (
            <Text style={styles.validationError}>{t('checkout.selectPaymentMethod')}</Text>
          )}
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="cube-outline" size={20} color="#000" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{t('checkout.orderSummaryTitle')}</Text>
          </View>
          
          {/* Product subheading and product list */}
          <Text style={styles.productSubheading}>{t('checkout.product')}</Text>
          
          <FlatList
            data={items}
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            keyExtractor={(item) => item.cart_id}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <Image
                  source={{ uri: item.thumb }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2} ellipsizeMode="tail">
                    {item.name.toUpperCase()}
                  </Text>
                  <Text style={styles.productQuantity}>x {item.quantity}</Text>
                  <Text style={styles.productPrice}>{item.total}</Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.productsContainer}
            ListEmptyComponent={
              <View style={styles.emptyProductsContainer}>
                <Text style={styles.emptyProductsText}>{t('checkout.noProducts')}</Text>
              </View>
            }
          />
          
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('checkout.itemSubtotal')}</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('checkout.shippingFee')}</Text>
              <Text style={styles.totalValue}>
                {selectedShippingMethod ? formatPrice(shippingCost) : formatPrice(0)}
              </Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>{t('checkout.grandTotal')}</Text>
              <Text style={styles.grandTotalValue}>{formatPrice(orderTotal)}</Text>
            </View>
          </View>
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (isLoading || 
             (!isAuthenticated && !localAddress) || 
             (isAuthenticated && !selectedAddress) ||
             (shipToDifferentAddress && !shippingAddress) ||
             !selectedPaymentMethod || 
             !selectedShippingMethod) && styles.disabledButton
          ]}
          onPress={handlePlaceOrder}
          disabled={isLoading || 
                   (!isAuthenticated && !localAddress) || 
                   (isAuthenticated && !selectedAddress) ||
                   (shipToDifferentAddress && !shippingAddress) ||
                   !selectedPaymentMethod || 
                   !selectedShippingMethod}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderText}>
              {isCheckoutComplete() ? t('checkout.placeOrder') : t('checkout.completeDetails')}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>By Proceeding, I've read and accept the terms & conditions.</Text>
          
          <View style={styles.paymentMethodsSection}>
            <Text style={styles.paymentMethodsTitle}>{t('checkout.paymentMethodsTitle')}</Text>
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
            // Refresh addresses and automatically select the most recent one
            if (isAuthenticated) {
              await loadAddresses(); // This will get the most recent address
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

      {/* Payment WebView Modal */}
      {showPaymentWebView && paymentUrl && (
        <Modal
          visible={showPaymentWebView}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closePaymentWebView}
        >
          <View style={styles.paymentWebViewContainer}>
            {/* Header with close button */}
            <View style={styles.paymentWebViewHeader}>
              <Text style={styles.paymentWebViewTitle}>Secure Payment</Text>
              <TouchableOpacity
                style={styles.paymentWebViewCloseButton}
                onPress={closePaymentWebView}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {/* WebView */}
            <WebView
              source={{ uri: paymentUrl }}
              style={styles.paymentWebView}
              onNavigationStateChange={handlePaymentNavigation}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.paymentWebViewLoading}>
                  <ActivityIndicator size="large" color="#000" />
                  <Text style={styles.paymentWebViewLoadingText}>Loading secure payment...</Text>
                </View>
              )}
              // Security settings
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={false}
              mediaPlaybackRequiresUserAction={true}
              // Additional security
              onShouldStartLoadWithRequest={(request) => {
                // Only allow navigation to trusted domains
                const url = request.url.toLowerCase();
                const trustedDomains = [
                  'new.azurakwt.com',
                  'kpaytest.com.kw',               // KNet test environment
                  'knet.com.kw',                   // KNet production environment  
                  'kpg.com.kw',                    // KNet payment gateway
                  'testsecureacceptance.cybersource.com',  // CyberSource test environment
                  'secureacceptance.cybersource.com',      // CyberSource production environment
                ];
                
                const isAllowed = trustedDomains.some(domain => url.includes(domain));
                if (!isAllowed) {
                  console.warn('Blocked navigation to untrusted domain:', request.url);
                }
                return isAllowed;
              }}
            />
          </View>
        </Modal>
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
    flexDirection: getFlexDirection('row'),
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    marginEnd: 8,
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
    flexDirection: getFlexDirection('row'),
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
    marginStart: 4,
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
    flexDirection: getFlexDirection('row'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAddressText: {
    marginStart: 8,
    fontSize: 14,
    color: '#000',
  },
  shipToDifferentRow: {
    flexDirection: getFlexDirection('row'),
    alignItems: 'center',
    marginVertical: 10,
    paddingStart: 3,
  },
  customCheckbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 8,
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
    flexDirection: getFlexDirection('row'),
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
    flexDirection: getFlexDirection('row'),
    alignItems: 'center',
  },
  paymentIcon: {
    marginEnd: 12,
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
    flexDirection: getFlexDirection('row'),
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
    width: 160,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 8,
    marginEnd: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginBottom: 8,
  },
  productInfo: {
    width: '100%',
    alignItems: 'center',
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
  productQuantity: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginTop: 4,
    textAlign: 'center',
  },
  productsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    color: '#666666',
    marginTop: 2,
  },
  methodsList: {
    padding: 8,
  },
  methodOption: {
    flexDirection: getFlexDirection('row'),
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
    marginEnd: 12,
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
    flexDirection: getFlexDirection('row'),
    alignItems: 'center',
    padding: 16,
    justifyContent: 'center',
  },
  methodsLoadingText: {
    fontSize: 14,
    color: '#666',
    marginStart: 8,
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
  validationError: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: 8,
    marginStart: 16,
    fontWeight: '500',
  },
  // Payment WebView styles
  paymentWebViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  paymentWebViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  paymentWebViewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  paymentWebViewCloseButton: {
    padding: 8,
  },
  paymentWebView: {
    flex: 1,
  },
  paymentWebViewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  paymentWebViewLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  // Apple Pay styles
  applePayButton: {
    flexDirection: getFlexDirection('row'),
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  selectedApplePayButton: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  applePayIcon: {
    marginEnd: 12,
  },
  applePayText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  selectedApplePayText: {
    color: '#ffffff',
  },
  applePayMethodOption: {
    backgroundColor: '#f2f2f2',
    borderColor: '#e0e0e0',
  },
  selectedApplePayMethodOption: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  applePayMethodContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  applePayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  applePayBadgeSelected: {
    backgroundColor: '#000000',
  },
  appleLogoIcon: {
    marginRight: 2,
  },
  applePayTextSelected: {
    color: '#ffffff',
  },
}); 