import axios from 'axios';
import FormData from 'form-data';
import crypto from 'crypto';
import { publicApi } from './api-service';
import { makeApiCall } from './api-config';

const BASE_URL = 'https://new.azurakwt.com/index.php?route=extension/mstore';

// Add these types at the top of the file
interface ApiRequestConfig {
  method?: 'GET' | 'POST';
  params?: Record<string, string>;
  data?: Record<string, any>;
}

interface ApiError {
  message: string;
  response?: {
    status: number;
    data: any;
  };
}

// Generate a random OCSESSID
const generateOCSESSID = () => crypto.randomBytes(16).toString('hex');

// Store OCSESSID globally for reuse across requests
let globalOCSESSID = generateOCSESSID();

// Update makeApiCall function
async function makeApiCall(endpoint: string, config: ApiRequestConfig = { method: 'GET' }) {
  const { method = 'GET', params, data } = config;
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'OCSESSID': globalOCSESSID,
    'Content-Type': 'application/json'
  };

  console.log(`\nMaking ${method} request to: ${url}`);
  if (params) console.log('Params:', params);
  if (data) console.log('Data:', data);
  console.log('Headers:', headers);

  try {
    const response = await axios({
      method,
      url,
      headers,
      params,
      data
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Response Data:', response.data);

    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    throw apiError;
  }
}

// Test public endpoints that don't require authentication
async function testPublicEndpoints() {
  // 1. Home Service Block
  console.log('\n--- Testing Home Service Block ---');
  try {
    const homeService = await makeApiCall('/home|serviceBlock');
    if (homeService.success === 1) {
      console.log('✅ Home Service Block test passed');
    } else {
      console.log('❌ Home Service Block test failed');
    }
  } catch (error) {
    console.error('❌ Home Service Block test error');
  }

  // 2. Product Detail
  console.log('\n--- Testing Product Detail ---');
  try {
    const productDetail = await makeApiCall('/product|detail', {
      method: 'GET',
      params: {
        productId: '51'
      }
    });
    
    if (productDetail.success === 1) {
      console.log('✅ Product Detail test passed');
      console.log('Product data:', JSON.stringify(productDetail.data, null, 2));
    } else {
      console.log('❌ Product Detail test failed');
      if (productDetail.error) {
        console.log('Error:', productDetail.error);
      }
    }
  } catch (error) {
    const apiError = error as ApiError;
    console.error('❌ Product Detail test error:', apiError.message);
    if (apiError.response) {
      console.log('Response status:', apiError.response.status);
      console.log('Response data:', apiError.response.data);
    }
  }

  // 3. Features Block 1-6
  for (let i = 1; i <= 6; i++) {
    console.log(`\n--- Testing Features Block ${i} ---`);
    try {
      const featuresBlock = await makeApiCall(`/home|featuresblock${i}`);
      if (featuresBlock.success === 1) {
        console.log(`✅ Features Block ${i} test passed`);
      } else {
        console.log(`❌ Features Block ${i} test failed`);
      }
    } catch (error) {
      console.error(`❌ Features Block ${i} test error`);
    }
  }
}

// Test authenticated endpoints that require login
async function testAuthenticatedEndpoints() {
  console.log('\n=== Testing Authenticated Endpoints ===');

  // 1. Login
  console.log('\n--- Testing Login ---');
  try {
    const loginData = {
      email: 'bbohra052@gmail.com',
      password: '123456'
    };

    const login = await makeApiCall('/account|login', {
      method: 'POST',
      data: loginData
    });

    if (login.success === 1) {
      console.log('✅ Login test passed');
      globalOCSESSID = login.data.OCSESSID || globalOCSESSID;
    } else {
      console.log('❌ Login test failed');
      if (login.error) {
        console.log('Error:', login.error);
      }
    }
  } catch (error) {
    console.error('❌ Login test error');
  }
}

async function testApi() {
    try {
        console.log('Testing Features Blocks...');
        for (let i = 1; i <= 6; i++) {
            console.log(`\nFetching Features Block ${i}:`);
            const response = await makeApiCall(`/home|featuresblock${i}`);
            console.log(JSON.stringify(response, null, 2));
        }

        console.log('\nTesting Category Products...');
        const categories = [
            { id: '20', name: 'Nail Care' },
            { id: '18', name: 'Fragrances' },
            { id: '19', name: 'Makeup' }
        ];

        for (const category of categories) {
            console.log(`\nFetching products for ${category.name} (ID: ${category.id}):`);
            const response = await makeApiCall('/product', {
                params: { category: category.id }
            });
            console.log(JSON.stringify(response, null, 2));
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run all tests
const runAllTests = async () => {
  console.log('Starting API tests...\n');
  console.log('Using OCSESSID:', globalOCSESSID);

  // Test public endpoints first
  await testPublicEndpoints();

  // Then test authenticated endpoints
  await testAuthenticatedEndpoints();

  // Then test additional API tests
  await testApi();
};

// Run tests
runAllTests();

export const runApiTests = testApi; 