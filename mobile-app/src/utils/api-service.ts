import { API_BASE_URL, getHeaders, ApiRequestConfig, ApiResponse, ApiError, NetworkErrorCodes } from './api-config';
import { Product } from '../types/api';

// Generic API call function
export const makeApiCall = async <T>(
  endpoint: string,
  config: ApiRequestConfig = {}
): Promise<ApiResponse<T>> => {
  const { method = 'GET', params, data } = config;
  let url = `${API_BASE_URL}${endpoint}`;

  // Add query parameters if present
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
    url += `&${queryParams.toString()}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      method,
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.error || `HTTP error! status: ${response.status}`,
        code: NetworkErrorCodes.SERVER_ERROR,
        response: {
          status: response.status,
          data: errorData,
        },
      };
    }

    const responseData = await response.json();
    return responseData;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw {
        message: 'Request timeout',
        code: NetworkErrorCodes.TIMEOUT,
      };
    }

    throw {
      message: error.message || 'Network request failed',
      code: error.code || NetworkErrorCodes.NO_CONNECTION,
      response: error.response,
    };
  }
};

// Public endpoints
export const publicApi = {
  getHomeServiceBlock: () => 
    makeApiCall<any>('/home|serviceBlock'),
  
  getHomeSliderBlock: () => 
    makeApiCall<any>('/home|sliderblock'),
  
  getFeaturesBlock: (blockNumber: number) => 
    makeApiCall<any>(`/home|featuresblock${blockNumber}`),
  
  getMainMenu: () => 
    makeApiCall<any>('/menu'),
  
  getAllProducts: () => 
    makeApiCall<any>('/product'),
  
  getProductsByCategory: (categoryId: string, language?: string) => 
    makeApiCall<Product[]>('/product', {
      params: {
        category: categoryId,
        ...(language && { language }),
      },
    }).then(response => {
      // Ensure we have a valid response with products array
      if (response.success === 1 && Array.isArray(response.data)) {
        return response;
      }
      // If data is not an array, wrap it in an array or return empty array
      return {
        ...response,
        data: Array.isArray(response.data) ? response.data : []
      };
    }),
  
  getProductDetail: (productId: string) => 
    makeApiCall<any>('/product|detail', {
      params: { productId },
    }),
};