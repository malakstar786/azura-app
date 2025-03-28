import { makeApiCall, API_ENDPOINTS } from './api-config';
import { Product } from '../types/api';

// Public endpoints
export const publicApi = {
  getHomeServiceBlock: () => 
    makeApiCall<any>(API_ENDPOINTS.homeServiceBlock),
  
  getHomeSliderBlock: () => 
    makeApiCall<any>(API_ENDPOINTS.homeSliderBlock),
  
  getFeaturesBlock: (blockNumber: number) => {
    // Use specific endpoints based on block number
    switch (blockNumber) {
      case 1:
        return makeApiCall<any>(API_ENDPOINTS.featuresBlock1);
      case 2:
        return makeApiCall<any>(API_ENDPOINTS.featuresBlock2);
      case 3:
        return makeApiCall<any>(API_ENDPOINTS.featuresBlock3);
      case 4:
        return makeApiCall<any>(API_ENDPOINTS.featuresBlock4);
      case 5:
        return makeApiCall<any>(API_ENDPOINTS.featuresBlock5);
      case 6:
        return makeApiCall<any>(API_ENDPOINTS.featuresBlock6);
      default:
        throw new Error(`Invalid features block number: ${blockNumber}`);
    }
  },
  
  getMainMenu: () => 
    makeApiCall<any>(API_ENDPOINTS.menu),
  
  getAllProducts: () => 
    makeApiCall<any>(API_ENDPOINTS.allProducts),
  
  getProductsByCategory: (categoryId: string, language?: string) => 
    makeApiCall<Product[]>(API_ENDPOINTS.allProducts, {
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
    makeApiCall<any>(API_ENDPOINTS.productDetail, {
      params: { productId },
    }),
};