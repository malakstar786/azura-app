const https = require('https');

const BASE_URL = 'new.azurakwt.com';

// Helper function to make HTTPS requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Handle mixed HTML/JSON responses
          if (data.includes('<b>Warning</b>') || data.includes('<b>Error</b>')) {
            const jsonStart = data.indexOf('{');
            if (jsonStart >= 0) {
              data = data.substring(jsonStart);
            }
          }
          
          const result = JSON.parse(data);
          resolve({
            data: result,
            headers: res.headers,
            statusCode: res.statusCode
          });
        } catch (parseError) {
          console.log('Raw response:', data.substring(0, 500));
          reject(new Error(`Failed to parse JSON: ${parseError.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function testNewAddressEndpoints() {
  console.log('=== Testing New Address Endpoints ===\n');
  
  let sessionId = null;
  
  try {
    // Step 1: Login to get a valid session
    console.log('1. Logging in...');
    const loginOptions = {
      hostname: BASE_URL,
      path: '/index.php?route=extension/mstore/account|login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Azura-Mobile-App/1.0'
      }
    };
    
    const loginData = JSON.stringify({
      email: 'hussain.b@test.com',
      password: '87654321'
    });
    
    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    // Extract session ID from Set-Cookie header
    if (loginResponse.headers['set-cookie']) {
      const cookies = loginResponse.headers['set-cookie'];
      for (const cookie of cookies) {
        if (cookie.includes('OCSESSID=')) {
          sessionId = cookie.split('OCSESSID=')[1].split(';')[0];
          break;
        }
      }
    }
    
    if (!sessionId) {
      throw new Error('Failed to get session ID from login');
    }
    
    console.log('Session ID:', sessionId);
    console.log('✅ Login successful\n');
    
    // Step 2: Test shipping address save endpoint
    console.log('2. Testing shipping address save endpoint...');
    const shippingAddressOptions = {
      hostname: BASE_URL,
      path: '/index.php?route=extension/mstore/shipping_address|save',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `OCSESSID=${sessionId}`,
        'User-Agent': 'Azura-Mobile-App/1.0'
      }
    };
    
    const shippingAddressData = JSON.stringify({
      firstname: "Test",
      lastname: "User",
      email: "hussain.b@test.com",
      telephone: "99887766",
      country_id: "114",
      city: "1",
      zone_id: "4868",
      address_1: "Test address line 2",
      custom_field: {
        "32": "Building 123",
        "30": "Block 5",
        "31": "Street 10",
        "33": "Apartment 2"
      }
    });
    
    try {
      const shippingResponse = await makeRequest(shippingAddressOptions, shippingAddressData);
      console.log('Shipping address response:', JSON.stringify(shippingResponse.data, null, 2));
      console.log('✅ Shipping address endpoint tested\n');
    } catch (error) {
      console.log('❌ Shipping address endpoint error:', error.message);
      console.log('');
    }
    
    // Step 3: Test payment address save endpoint
    console.log('3. Testing payment address save endpoint...');
    const paymentAddressOptions = {
      hostname: BASE_URL,
      path: '/index.php?route=extension/mstore/payment_address|save',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `OCSESSID=${sessionId}`,
        'User-Agent': 'Azura-Mobile-App/1.0'
      }
    };
    
    const paymentAddressData = JSON.stringify({
      firstname: "Test",
      lastname: "User",
      email: "hussain.b@test.com",
      telephone: "99887766",
      country_id: "114",
      city: "1",
      zone_id: "4868",
      address_1: "Test address line 2",
      custom_field: {
        "32": "Building 123",
        "30": "Block 5",
        "31": "Street 10",
        "33": "Apartment 2"
      }
    });
    
    try {
      const paymentResponse = await makeRequest(paymentAddressOptions, paymentAddressData);
      console.log('Payment address response:', JSON.stringify(paymentResponse.data, null, 2));
      console.log('✅ Payment address endpoint tested\n');
    } catch (error) {
      console.log('❌ Payment address endpoint error:', error.message);
      console.log('');
    }
    
    // Step 4: Test get customer addresses to see current format
    console.log('4. Testing get customer addresses...');
    const getAddressesOptions = {
      hostname: BASE_URL,
      path: '/index.php?route=extension/mstore/account|addresses',
      method: 'GET',
      headers: {
        'Cookie': `OCSESSID=${sessionId}`,
        'User-Agent': 'Azura-Mobile-App/1.0'
      }
    };
    
    try {
      const addressesResponse = await makeRequest(getAddressesOptions);
      console.log('Get addresses response:', JSON.stringify(addressesResponse.data, null, 2));
      console.log('✅ Get addresses endpoint tested\n');
    } catch (error) {
      console.log('❌ Get addresses endpoint error:', error.message);
      console.log('');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testNewAddressEndpoints(); 