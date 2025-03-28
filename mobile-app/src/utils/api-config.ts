import axios from 'axios';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Core API configuration
export const API_BASE_URL = 'https://new.azurakwt.com';

// API Endpoints
export const API_ENDPOINTS = {
  login: '/index.php?route=extension/mstore/account|login',
  register: '/index.php?route=extension/mstore/account|register',
  updateProfile: '/index.php?route=extension/mstore/account|edit',
  editAddress: '/index.php?route=extension/mstore/account|edit_address',
  homeServiceBlock: '/index.php?route=extension/mstore/home|serviceBlock',
  homeSliderBlock: '/index.php?route=extension/mstore/home|sliderblock',
  homeFeaturesBlock1: '/index.php?route=extension/mstore/home|featuresblock1',
  homeFeaturesBlock2: '/index.php?route=extension/mstore/home|featuresblock2',
  homeFeaturesBlock3: '/index.php?route=extension/mstore/home|featuresBlock3',
  homeFeaturesBlock4: '/index.php?route=extension/mstore/home|featuresBlock4',
  homeFeaturesBlock5: '/index.php?route=extension/mstore/home|featuresBlock5',
  homeFeaturesBlock6: '/index.php?route=extension/mstore/home|featuresBlock6',
  mainMenu: '/index.php?route=extension/mstore/menu',
  allProducts: '/index.php?route=extension/mstore/product',
  productDetail: '/index.php?route=extension/mstore/product|detail',
};

// Network error codes
export enum NetworkErrorCodes {
  TIMEOUT = 'TIMEOUT',
  NO_CONNECTION = 'NO_CONNECTION',
  SERVER_ERROR = 'SERVER_ERROR'
}

// OCSESSID Management
const OCSESSID_STORAGE_KEY = '@azura_ocsessid';

// Generate a random OCSESSID
export const generateRandomOCSESSID = async (): Promise<string> => {
  try {
    // Generate a random UUID using expo-crypto
    const randomId = await Crypto.randomUUID();
    return randomId.replace(/-/g, '');
  } catch (error) {
    // Fallback to a simpler method if expo-crypto fails
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
};

// Store OCSESSID in AsyncStorage
export const setOCSESSID = async (ocsessid: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(OCSESSID_STORAGE_KEY, ocsessid);
    console.log(`Stored OCSESSID: ${ocsessid}`);
  } catch (error) {
    console.error('Failed to store OCSESSID:', error);
  }
};

// Get current OCSESSID from AsyncStorage
export const getCurrentOCSESSID = async (): Promise<string | null> => {
  try {
    const storedOcsessid = await AsyncStorage.getItem(OCSESSID_STORAGE_KEY);
    return storedOcsessid;
  } catch (error) {
    console.error('Failed to get OCSESSID:', error);
    return null;
  }
};

// Get existing OCSESSID or generate a new one
export const getOrCreateOCSESSID = async (): Promise<string> => {
  const existingOCSESSID = await getCurrentOCSESSID();
  
  if (existingOCSESSID) {
    return existingOCSESSID;
  }
  
  const newOCSESSID = await generateRandomOCSESSID();
  await setOCSESSID(newOCSESSID);
  return newOCSESSID;
};

// Function to check if an error is a network error
export const isNetworkError = (error: any): boolean => {
  return error && (
    error.code === NetworkErrorCodes.NO_CONNECTION ||
    error.code === NetworkErrorCodes.TIMEOUT ||
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNABORTED'
  );
};

// Function to make API calls
export const makeApiCall = async <T = any>(
  endpoint: string,
  options: { 
    method?: string; 
    data?: any; 
    headers?: Record<string, string>; 
    params?: Record<string, string> 
  } = {}
): Promise<ApiResponse<T>> => {
  try {
    // Ensure we have a valid OCSESSID
    const currentOcsessid = await getOrCreateOCSESSID();
    
    // Set default method to GET if not provided
    const method = options.method || 'GET';
    
    // Prepare URL with query params if needed
    let url = `${API_BASE_URL}${endpoint}`;
    if (options.params && Object.keys(options.params).length > 0) {
      const queryParams = new URLSearchParams(options.params).toString();
      url = `${url}${url.includes('?') ? '&' : '?'}${queryParams}`;
    }
    
    // Set up headers with OCSESSID cookie
    const headers = {
      ...(options.headers || {}),
      Cookie: `OCSESSID=${currentOcsessid}`
    };
    
    // Log request details
    console.log(`Making ${method} request to ${url}`);
    if (options.data) {
      console.log('Request data:', 
        options.data instanceof FormData 
          ? 'FormData (not printable)' 
          : options.data
      );
    }
    
    // Make the request
    let response;
    if (method.toUpperCase() === 'GET') {
      response = await axios.get(url, { headers });
    } else {
      response = await axios.post(url, options.data, { headers });
    }
    
    // Check if response is HTML instead of JSON
    if (typeof response.data === 'string' && 
        (response.data.includes('<html>') || response.data.includes('<b>Warning</b>'))) {
      console.error('Server returned HTML instead of JSON:', response.data);
      throw new Error('Server returned an error. Please try again later.');
    }
    
    // Log response details
    console.log(`Response from ${url}:`, response.data);
    
    // Handle response
    return response.data;
  } catch (error: any) {
    console.error(`API call error:`, error);
    
    // Check if the error is an Axios error with a response
    if (error.response) {
      // Log the response for debugging
      console.error('Error response:', error.response.data);
      
      // If the server sent back HTML instead of JSON, provide a clearer error
      if (typeof error.response.data === 'string' && 
          (error.response.data.includes('<html>') || error.response.data.includes('<b>Warning</b>'))) {
        console.error('Server returned HTML instead of JSON:', error.response.data);
        throw new Error('Server returned an error. Please try again later.');
      }
      
      // If the server provided an error message
      if (error.response.data && error.response.data.error) {
        if (Array.isArray(error.response.data.error)) {
          throw new Error(error.response.data.error[0] || 'Unknown error');
        } else {
          throw new Error(error.response.data.error || 'Unknown error');
        }
      }
    }
    
    // Network errors
    if (error.code === 'ECONNABORTED') {
      error.code = NetworkErrorCodes.TIMEOUT;
      throw error;
    }
    
    if (error.code === 'ERR_NETWORK') {
      error.code = NetworkErrorCodes.NO_CONNECTION;
      throw error;
    }
    
    // Re-throw the error
    throw error;
  }
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
  error?: string | string[];
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