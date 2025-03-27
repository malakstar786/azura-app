import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
export const API_BASE_URL = 'https://new.azurakwt.com/index.php?route=extension/mstore';

// OCSESSID Management
const OCSESSID_STORAGE_KEY = '@azura_ocsessid';
let ocsessid: string | null = null;

// Function to get stored OCSESSID or generate a new one
export const getOrCreateOCSESSID = async (): Promise<string> => {
  try {
    // Try to get existing OCSESSID from storage
    const storedOCSESSID = await AsyncStorage.getItem(OCSESSID_STORAGE_KEY);
    
    if (storedOCSESSID) {
      ocsessid = storedOCSESSID;
      return storedOCSESSID;
    }

    // If no stored OCSESSID, generate a new one
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    const newOCSESSID = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Store the new OCSESSID
    await AsyncStorage.setItem(OCSESSID_STORAGE_KEY, newOCSESSID);
    ocsessid = newOCSESSID;
    
    return newOCSESSID;
  } catch (error) {
    console.error('Error managing OCSESSID:', error);
    // If there's any error, generate a new OCSESSID without storing it
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    const newOCSESSID = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    ocsessid = newOCSESSID;
    return newOCSESSID;
  }
};

// Function to get current OCSESSID without generating a new one
export const getCurrentOCSESSID = async (): Promise<string | null> => {
  try {
    if (ocsessid) return ocsessid;
    return await AsyncStorage.getItem(OCSESSID_STORAGE_KEY);
  } catch (error) {
    console.error('Error getting OCSESSID:', error);
    return null;
  }
};

// Function to set a new OCSESSID
export const setOCSESSID = async (newOcsessid: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(OCSESSID_STORAGE_KEY, newOcsessid);
    ocsessid = newOcsessid;
  } catch (error) {
    console.error('Error setting OCSESSID:', error);
  }
};

// API Headers
export const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (ocsessid) {
    headers['OCSESSID'] = ocsessid;
  }

  return headers;
};

// API Request Configuration
export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, any>;
  data?: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: number;
  data?: T;
  error?: string;
}

// API Error Type
export interface ApiError {
  message: string;
  code?: string;
  response?: {
    status: number;
    data: any;
  };
}

// Network error codes
export const NetworkErrorCodes = {
  NO_CONNECTION: 'NO_CONNECTION',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

// API Service
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const TIMEOUT_DURATION = 10000; // 10 seconds

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isNetworkError = (error: any): boolean => {
  return (
    !error.response || 
    error.message?.includes('Network') || 
    error.message?.includes('Failed to fetch') ||
    error.name === 'TypeError'
  );
};

// Create a cacheable version of API calls for endpoints that rarely change
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const makeApiCall = async <T = any>(
  endpoint: string,
  config: ApiRequestConfig = { method: 'GET' },
  retryCount = 0,
  useCache = false
): Promise<ApiResponse<T>> => {
  try {
    const { method = 'GET', params, data } = config;
    
    // Construct the full URL with the correct format
    let url = `${API_BASE_URL}${endpoint}`;
    
    // Replace | with / in the endpoint if present
    url = url.replace(/\|/g, '/');

    // Create a cache key if caching is enabled
    const cacheKey = useCache ? `${url}:${JSON.stringify(params)}:${JSON.stringify(data)}` : null;
    
    // Check cache if it's a GET request and caching is enabled
    if (cacheKey && method === 'GET') {
      const cachedData = apiCache.get(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
        return cachedData.data;
      }
    }

    // Ensure we have a valid OCSESSID
    const currentOcsessid = await getOrCreateOCSESSID();
    
    // Prepare headers with proper format
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': `OCSESSID=${currentOcsessid}`,
      'OCSESSID': currentOcsessid
    };

    // Set up timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    try {
      console.log('Making API call:', {
        url,
        method,
        headers,
        body: data,
      });

      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Log response status and headers for debugging
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw {
          message: errorData.error?.[0] || errorData.message || `HTTP error! status: ${response.status}`,
          code: 'SERVER_ERROR',
          response: {
            status: response.status,
            data: errorData,
          },
        };
      }

      const responseData = await response.json();
      
      // Store in cache if it's a GET request and caching is enabled
      if (cacheKey && method === 'GET') {
        apiCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
      }
      
      return responseData;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error: any) {
    console.error('API call error:', error);

    // Enhanced error logging
    if (error.response) {
      console.log('Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    }

    // Handle timeout
    if (error.name === 'AbortError') {
      throw {
        message: 'Request timeout',
        code: NetworkErrorCodes.TIMEOUT,
      };
    }

    // Handle network errors with retry
    if (isNetworkError(error) && retryCount < MAX_RETRIES) {
      console.log(`Retrying API call (${retryCount + 1}/${MAX_RETRIES})...`);
      await wait(RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
      return makeApiCall(endpoint, config, retryCount + 1, useCache);
    }

    throw {
      message: error.message || 'Network request failed',
      code: isNetworkError(error) ? NetworkErrorCodes.NO_CONNECTION : NetworkErrorCodes.SERVER_ERROR,
      response: error.response,
    };
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  // Public Endpoints
  homeServiceBlock: '/home|serviceBlock',
  featuresBlock: (blockNumber: number) => `/home|featuresblock${blockNumber}`,
  productDetail: '/product|detail',
  categoryProducts: '/product|category',
  searchProducts: '/product|search',

  // Authentication Endpoints
  login: '/account/login',
  register: '/account/register',
  logout: '/account/logout',
  forgotPassword: '/account/forgotten',
  resetPassword: '/account/reset',

  // User Account Endpoints
  profile: '/account/profile',
  updateProfile: '/account/edit',
  addresses: '/account/address',
  addAddress: '/account/address/add',
  editAddress: '/account/edit_address',
  deleteAddress: '/account/address/delete',
  orders: '/account|orders',
  orderDetail: '/account|order',
  wishlist: '/account|wishlist',
  addToWishlist: '/account|wishlist',
  removeFromWishlist: '/account|wishlist',

  // Cart Endpoints
  cart: '/cart/getCart',
  addToCart: '/cart/add',
  updateCart: '/cart/update',
  removeFromCart: '/cart/remove',
  clearCart: '/cart/clear',

  // Checkout Endpoints
  checkout: '/checkout|checkout',
  confirmOrder: '/checkout|confirm',
  paymentMethods: '/checkout|paymentMethods',
  shippingMethods: '/checkout|shippingMethods',
  applyCoupon: '/checkout|applyCoupon',
  removeCoupon: '/checkout|removeCoupon',
} as const;

// API Response Types
export interface Product {
  product_id: string;
  name: string;
  description: string;
  price: string;
  special: string;
  tax: string;
  rating: number;
  reviews: number;
  href: string;
  thumb: string;
  image: string;
  images: string[];
  options: any[];
  variants: any[];
}

export interface Category {
  category_id: string;
  name: string;
  image: string;
  href: string;
}

export interface ServiceBlock {
  heading_text: string;
  description: string;
  image: string;
  href: string;
}

export interface FeaturesBlock {
  subtitle: string;
  heading: string;
  description: string;
  image: string;
  href: string;
  products: Product[];
}

export interface CartItem {
  cart_id: string;
  product_id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

export interface Order {
  order_id: string;
  order_number: string;
  date_added: string;
  status: string;
  total: string;
  href: string;
}

export interface Address {
  address_id: string;
  firstname: string;
  lastname: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  postcode: string;
  country: string;
  country_id: string;
  zone: string;
  zone_id: string;
  custom_field: any[];
}

export interface UserProfile {
  customer_id: string;
  firstname: string;
  lastname: string;
  email: string;
  telephone: string;
  fax: string;
  newsletter: boolean;
  customer_group_id: string;
  address_id: string;
  custom_field: any[];
} 