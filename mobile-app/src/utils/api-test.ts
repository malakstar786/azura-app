import axios from 'axios';
import FormData from 'form-data';
import crypto from 'crypto';
import { publicApi } from './api-service';
import { API_ENDPOINTS } from './api-config';
import { makeApiCall as apiCall } from './api-config';

const BASE_URL = 'https://new.azurakwt.com/index.php?route=extension/mstore';
const OCSESSID = crypto.randomBytes(16).toString('hex');

// Create a random OCSESSID
console.log('Generated OCSESSID:', OCSESSID);

// Generic makeApiCall function
const makeApiCall = async (endpoint: string, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  // Add params to URL
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  console.log('Making API call to:', url.toString());
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': `OCSESSID=${OCSESSID}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
};

async function testLogin() {
  try {
    console.log('\nTesting Login API...');
    const loginResult = await makeApiCall('/account|login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login Response:', loginResult);
  } catch (error) {
    console.error('Login test failed:', error);
  }
}

async function testApi() {
    try {
        console.log('Testing Features Blocks...');
        // Test features blocks 1-6 using the specific endpoints
        console.log('\nFetching Features Block 1:');
        const response1 = await apiCall(API_ENDPOINTS.featuresBlock1);
        console.log(JSON.stringify(response1, null, 2));
        
        console.log('\nFetching Features Block 2:');
        const response2 = await apiCall(API_ENDPOINTS.featuresBlock2);
        console.log(JSON.stringify(response2, null, 2));
        
        console.log('\nFetching Features Block 3:');
        const response3 = await apiCall(API_ENDPOINTS.featuresBlock3);
        console.log(JSON.stringify(response3, null, 2));
        
        console.log('\nFetching Features Block 4:');
        const response4 = await apiCall(API_ENDPOINTS.featuresBlock4);
        console.log(JSON.stringify(response4, null, 2));
        
        console.log('\nFetching Features Block 5:');
        const response5 = await apiCall(API_ENDPOINTS.featuresBlock5);
        console.log(JSON.stringify(response5, null, 2));
        
        console.log('\nFetching Features Block 6:');
        const response6 = await apiCall(API_ENDPOINTS.featuresBlock6);
        console.log(JSON.stringify(response6, null, 2));

        console.log('\nTesting Category Products...');
        const categories = [
            { id: '20', name: 'Nail Care' },
            { id: '18', name: 'Fragrances' },
            { id: '19', name: 'Makeup' }
        ];

        for (const category of categories) {
            console.log(`\nFetching products for ${category.name} (ID: ${category.id}):`);
            const response = await apiCall(API_ENDPOINTS.allProducts, {
                params: { category: category.id }
            });
            console.log(JSON.stringify(response, null, 2));
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Test cart APIs
async function testCartApi() {
  try {
    // 1. Add product to cart
    console.log('\nTesting Add to Cart API...');
    const addToCartResult = await makeApiCall('/cart|add', {
      product_id: '51', // You might need to change this to a valid product ID
      quantity: '1'
    });
    console.log('Add to Cart Response:', addToCartResult);
    
    // 2. Get cart
    console.log('\nTesting Get Cart API...');
    const getCartResult = await makeApiCall('/cart|getCart');
    console.log('Get Cart Response:', getCartResult);
    
    // 3. Update cart
    console.log('\nTesting Update Cart API...');
    const updateCartResult = await makeApiCall('/cart|update', {
      key: '1', // You might need to change this based on the cart response
      quantity: '2'
    });
    console.log('Update Cart Response:', updateCartResult);
    
    // 4. Remove from cart
    console.log('\nTesting Remove from Cart API...');
    const removeFromCartResult = await makeApiCall('/cart|remove', {
      key: '1' // You might need to change this based on the cart response
    });
    console.log('Remove from Cart Response:', removeFromCartResult);
    
    // 5. Clear cart
    console.log('\nTesting Clear Cart API...');
    const clearCartResult = await makeApiCall('/cart|clear');
    console.log('Clear Cart Response:', clearCartResult);
  } catch (error) {
    console.error('Cart API test failed:', error);
  }
}

export { testApi, testLogin, testCartApi }; 