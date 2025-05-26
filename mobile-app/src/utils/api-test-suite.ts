import { makeApiCall, API_ENDPOINTS, getOrCreateOCSESSID } from './api-config';

// Test data for account creation
const TEST_USER = {
  firstname: 'TestUser',
  lastname: 'ApiTest',
  email: `test.user.${Date.now()}@azuratest.com`,
  telephone: '99887766',
  password: 'TestPass123!'
};

// Test data for address
const TEST_ADDRESS = {
  firstname: 'TestUser',
  lastname: 'ApiTest',
  company: '',
  address_1: 'Block 5, Street 10',
  address_2: 'Additional info',
  city: 'Kuwait City',
  postcode: '',
  country_id: '114', // Kuwait
  zone_id: '1785', // Kuwait City
  'custom_field[30]': '5', // Block
  'custom_field[31]': '10', // Street
  'custom_field[32]': '15', // House/Building
  'custom_field[33]': '2', // Apartment
  default: '1'
};

interface TestResult {
  endpoint: string;
  method: string;
  success: boolean;
  response: any;
  error?: string;
  timestamp: string;
}

class ApiTestSuite {
  private results: TestResult[] = [];
  private authToken: string | null = null;
  private userId: string | null = null;
  private addressId: string | null = null;
  private productId: string | null = null;
  private cartId: string | null = null;

  private logResult(endpoint: string, method: string, success: boolean, response: any, error?: string) {
    const result: TestResult = {
      endpoint,
      method,
      success,
      response,
      error,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);
    
    console.log(`\n=== ${method} ${endpoint} ===`);
    console.log(`Status: ${success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Response:`, JSON.stringify(response, null, 2));
    if (error) console.log(`Error:`, error);
    console.log('='.repeat(50));
  }

  async testEndpoint(endpoint: string, method: string, data?: any, params?: any): Promise<any> {
    try {
      const response = await makeApiCall(endpoint, {
        method,
        data,
        params
      });
      
      this.logResult(endpoint, method, true, response);
      return response;
    } catch (error: any) {
      this.logResult(endpoint, method, false, null, error.message);
      throw error;
    }
  }

  // 1. Test Home Content Endpoints
  async testHomeEndpoints() {
    console.log('\n🏠 TESTING HOME CONTENT ENDPOINTS');
    
    try {
      // Test Service Block
      await this.testEndpoint(API_ENDPOINTS.homeServiceBlock, 'GET');
      
      // Test Slider Block
      await this.testEndpoint(API_ENDPOINTS.homeSliderBlock, 'GET');
      
      // Test Features Blocks 1-6
      await this.testEndpoint(API_ENDPOINTS.homeFeaturesBlock1, 'GET');
      await this.testEndpoint(API_ENDPOINTS.homeFeaturesBlock2, 'GET');
      await this.testEndpoint(API_ENDPOINTS.homeFeaturesBlock3, 'GET');
      await this.testEndpoint(API_ENDPOINTS.homeFeaturesBlock4, 'GET');
      await this.testEndpoint(API_ENDPOINTS.homeFeaturesBlock5, 'GET');
      await this.testEndpoint(API_ENDPOINTS.homeFeaturesBlock6, 'GET');
      
      // Test Main Menu
      await this.testEndpoint(API_ENDPOINTS.menu, 'GET');
      
    } catch (error) {
      console.error('Home endpoints test failed:', error);
    }
  }

  // 2. Test Product Endpoints
  async testProductEndpoints() {
    console.log('\n🛍️ TESTING PRODUCT ENDPOINTS');
    
    try {
      // Test Get All Products
      const allProductsResponse = await this.testEndpoint(API_ENDPOINTS.products, 'GET');
      
      // Extract a product ID for further testing
      if (allProductsResponse.success === 1 && allProductsResponse.data?.products?.length > 0) {
        this.productId = allProductsResponse.data.products[0].product_id;
        console.log(`Using product ID for testing: ${this.productId}`);
      }
      
      // Test Products by Category (Nail Care - ID: 20)
      await this.testEndpoint(API_ENDPOINTS.products, 'GET', null, { category: '20' });
      
      // Test Products by Category (Makeup - ID: 18)
      await this.testEndpoint(API_ENDPOINTS.products, 'GET', null, { category: '18' });
      
      // Test Products by Category (Fragrance - ID: 57)
      await this.testEndpoint(API_ENDPOINTS.products, 'GET', null, { category: '57' });
      
      // Test Product Detail
      if (this.productId) {
        await this.testEndpoint(API_ENDPOINTS.productDetail, 'GET', null, { productId: this.productId });
      }
      
      // Test with Arabic language
      await this.testEndpoint(API_ENDPOINTS.products, 'GET', null, { language: 'ar' });
      
    } catch (error) {
      console.error('Product endpoints test failed:', error);
    }
  }

  // 3. Test Authentication Endpoints
  async testAuthEndpoints() {
    console.log('\n🔐 TESTING AUTHENTICATION ENDPOINTS');
    
    try {
      // Test User Registration
      console.log(`Registering user with email: ${TEST_USER.email}`);
      const registerResponse = await this.testEndpoint(API_ENDPOINTS.register, 'POST', {
        firstname: TEST_USER.firstname,
        lastname: TEST_USER.lastname,
        telephone: TEST_USER.telephone,
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      
      if (registerResponse.success === 1) {
        this.userId = registerResponse.data?.customer_id;
        console.log(`User registered with ID: ${this.userId}`);
      }
      
      // Test Login with created credentials
      const loginResponse = await this.testEndpoint(API_ENDPOINTS.login, 'POST', {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      
      if (loginResponse.success === 1) {
        this.authToken = loginResponse.data?.token || 'authenticated';
        console.log('Login successful');
      }
      
      // Test Login with wrong credentials
      try {
        await this.testEndpoint(API_ENDPOINTS.login, 'POST', {
          email: TEST_USER.email,
          password: 'wrongpassword'
        });
      } catch (error) {
        console.log('Expected login failure with wrong password');
      }
      
      // Test Forgot Password
      await this.testEndpoint(API_ENDPOINTS.forgotPassword, 'POST', {
        email: TEST_USER.email
      });
      
      // Test Update Profile (requires authentication)
      if (this.authToken) {
        await this.testEndpoint(API_ENDPOINTS.updateProfile, 'POST', {
          firstname: 'UpdatedFirst',
          lastname: 'UpdatedLast',
          email: TEST_USER.email,
          telephone: '99887755'
        });
      }
      
    } catch (error) {
      console.error('Auth endpoints test failed:', error);
    }
  }

  // 4. Test Address Endpoints
  async testAddressEndpoints() {
    console.log('\n📍 TESTING ADDRESS ENDPOINTS');
    
    if (!this.authToken) {
      console.log('Skipping address tests - not authenticated');
      return;
    }
    
    try {
      // Test Get Addresses (should be empty initially)
      await this.testEndpoint(API_ENDPOINTS.addresses, 'GET');
      
      // Test Add Address
      const formData = new FormData();
      Object.entries(TEST_ADDRESS).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      const addAddressResponse = await this.testEndpoint(API_ENDPOINTS.editAddress, 'POST', formData);
      
      if (addAddressResponse.success === 1) {
        this.addressId = addAddressResponse.data?.address_id;
        console.log(`Address created with ID: ${this.addressId}`);
      }
      
      // Test Get Addresses (should now have one address)
      await this.testEndpoint(API_ENDPOINTS.addresses, 'GET');
      
      // Test Edit Address
      if (this.addressId) {
        const editFormData = new FormData();
        Object.entries({
          ...TEST_ADDRESS,
          address_id: this.addressId,
          firstname: 'EditedFirst',
          'custom_field[30]': '6' // Changed block number
        }).forEach(([key, value]) => {
          editFormData.append(key, value);
        });
        
        await this.testEndpoint(API_ENDPOINTS.editAddress, 'POST', editFormData);
      }
      
    } catch (error) {
      console.error('Address endpoints test failed:', error);
    }
  }

  // 5. Test Cart Endpoints
  async testCartEndpoints() {
    console.log('\n🛒 TESTING CART ENDPOINTS');
    
    try {
      // Test Get Cart (should be empty initially)
      await this.testEndpoint(API_ENDPOINTS.cart, 'GET');
      
      // Test Add to Cart
      if (this.productId) {
        const addToCartResponse = await this.testEndpoint(API_ENDPOINTS.addToCart, 'POST', [{
          product_id: this.productId,
          quantity: '2'
        }]);
        
        // Test Get Cart (should now have items)
        const cartResponse = await this.testEndpoint(API_ENDPOINTS.cart, 'GET');
        
        // Extract cart_id for further testing
        if (cartResponse.success === 1 && cartResponse.data?.products?.length > 0) {
          this.cartId = cartResponse.data.products[0].cart_id;
        }
        
        // Test Update Cart Quantity
        if (this.cartId) {
          await this.testEndpoint(API_ENDPOINTS.updateCart, 'GET', null, {
            cart_id: this.cartId,
            quantity: '3'
          });
        }
        
        // Test Remove Item from Cart
        if (this.cartId) {
          await this.testEndpoint(API_ENDPOINTS.removeFromCart, 'POST', {
            cart_id: this.cartId
          });
        }
        
        // Add item back for empty cart test
        await this.testEndpoint(API_ENDPOINTS.addToCart, 'POST', [{
          product_id: this.productId,
          quantity: '1'
        }]);
        
        // Test Empty Cart
        await this.testEndpoint(API_ENDPOINTS.emptyCart, 'DELETE');
      }
      
    } catch (error) {
      console.error('Cart endpoints test failed:', error);
    }
  }

  // 6. Test Order Endpoints
  async testOrderEndpoints() {
    console.log('\n📦 TESTING ORDER ENDPOINTS');
    
    if (!this.authToken) {
      console.log('Skipping order tests - not authenticated');
      return;
    }
    
    try {
      // Test Get Order History
      await this.testEndpoint(API_ENDPOINTS.orderHistory, 'GET');
      
    } catch (error) {
      console.error('Order endpoints test failed:', error);
    }
  }

  // 7. Test Checkout Endpoints
  async testCheckoutEndpoints() {
    console.log('\n💳 TESTING CHECKOUT ENDPOINTS');
    
    if (!this.authToken || !this.addressId) {
      console.log('Skipping checkout tests - not authenticated or no address');
      return;
    }
    
    try {
      // Add item to cart first
      if (this.productId) {
        await this.testEndpoint(API_ENDPOINTS.addToCart, 'POST', [{
          product_id: this.productId,
          quantity: '1'
        }]);
      }
      
      // Test Checkout - Set billing address
      await this.testEndpoint(API_ENDPOINTS.checkout, 'POST', {
        payment_address: 'existing',
        address_id: this.addressId
      });
      
      // Test Shipping Methods
      await this.testEndpoint(API_ENDPOINTS.shippingMethods, 'POST', {
        shipping_method: 'flat.flat'
      });
      
      // Test Payment Methods
      await this.testEndpoint(API_ENDPOINTS.paymentMethods, 'POST', {
        payment_method: 'cod'
      });
      
      // Test Confirm Order
      await this.testEndpoint(API_ENDPOINTS.confirmOrder, 'POST');
      
    } catch (error) {
      console.error('Checkout endpoints test failed:', error);
    }
  }

  // 8. Test Currency and Location Endpoints
  async testCurrencyAndLocationEndpoints() {
    console.log('\n🌍 TESTING CURRENCY AND LOCATION ENDPOINTS');
    
    try {
      // Test Get Currencies List
      await this.testEndpoint(API_ENDPOINTS.currencies, 'GET');
      
      // Test Change Currency - Success case
      const formData = new FormData();
      formData.append('code', 'KWD');
      await this.testEndpoint(API_ENDPOINTS.changeCurrency, 'POST', formData);
      
      // Test Change Currency - Invalid case
      const invalidFormData = new FormData();
      invalidFormData.append('code', 'INVALID');
      await this.testEndpoint(API_ENDPOINTS.changeCurrency, 'POST', invalidFormData);
      
      // Test Get Countries
      await this.testEndpoint(API_ENDPOINTS.countries, 'POST');
      
      // Test Get Governorates and Areas - Kuwait with Ahmadi governorate
      await this.testEndpoint(API_ENDPOINTS.governoratesAndAreas, 'POST', null, {
        language: 'en-gb',
        country_id: '114',
        governorate_id: '1'
      });
      
      // Test Get Governorates and Areas - Kuwait with Farwaniya governorate
      await this.testEndpoint(API_ENDPOINTS.governoratesAndAreas, 'POST', null, {
        language: 'en-gb',
        country_id: '114',
        governorate_id: '2'
      });
      
      // Test Get Governorates and Areas - Invalid country
      await this.testEndpoint(API_ENDPOINTS.governoratesAndAreas, 'POST', null, {
        language: 'en-gb',
        country_id: '999',
        governorate_id: '1'
      });
      
    } catch (error) {
      console.error('Currency and location endpoints test failed:', error);
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 STARTING COMPREHENSIVE API TEST SUITE');
    console.log(`Test User Email: ${TEST_USER.email}`);
    console.log(`OCSESSID: ${await getOrCreateOCSESSID()}`);
    
    await this.testHomeEndpoints();
    await this.testProductEndpoints();
    await this.testAuthEndpoints();
    await this.testAddressEndpoints();
    await this.testCartEndpoints();
    await this.testOrderEndpoints();
    await this.testCheckoutEndpoints();
    await this.testCurrencyAndLocationEndpoints();
    
    this.generateReport();
  }

  // Generate test report
  generateReport() {
    console.log('\n📊 TEST REPORT SUMMARY');
    console.log('='.repeat(50));
    
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(2)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`- ${result.method} ${result.endpoint}: ${result.error}`);
      });
    }
    
    console.log('\n✅ Test suite completed!');
    return this.results;
  }
}

// Export for use
export const apiTestSuite = new ApiTestSuite();
export default apiTestSuite; 