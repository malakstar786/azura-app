import { makeApiCall, API_ENDPOINTS } from './api-config';
import type { Product } from '../types/api';
import { useLanguageStore } from '@store/language-store';

// Get current language from store
const getCurrentLanguage = () => {
  const { currentLanguage } = useLanguageStore.getState();
  console.log(`API Service: Current language is ${currentLanguage}`);
  return currentLanguage;
};

// Public endpoints
export const publicApi = {
  getHomeServiceBlock: () => {
    const language = getCurrentLanguage();
    console.log(`Making serviceBlock API call with language: ${language}`);
    return makeApiCall<any>(API_ENDPOINTS.homeServiceBlock, {
      params: language === 'ar' ? { language: 'ar' } : undefined,
    });
  },
  
  getHomeSliderBlock: () => {
    const language = getCurrentLanguage();
    console.log(`Making sliderBlock API call with language: ${language}`);
    return makeApiCall<any>(API_ENDPOINTS.homeSliderBlock, {
      params: language === 'ar' ? { language: 'ar' } : undefined,
    });
  },
  
  getFeaturesBlock: (blockNumber: number) => {
    const language = getCurrentLanguage();
    // Use specific endpoints based on block number
    let endpoint;
    switch (blockNumber) {
      case 1:
        endpoint = API_ENDPOINTS.homeFeaturesBlock1;
        break;
      case 2:
        endpoint = API_ENDPOINTS.homeFeaturesBlock2;
        break;
      case 3:
        endpoint = API_ENDPOINTS.homeFeaturesBlock3;
        break;
      case 4:
        endpoint = API_ENDPOINTS.homeFeaturesBlock4;
        break;
      case 5:
        endpoint = API_ENDPOINTS.homeFeaturesBlock5;
        break;
      case 6:
        endpoint = API_ENDPOINTS.homeFeaturesBlock6;
        break;
      default:
        throw new Error(`Invalid features block number: ${blockNumber}`);
    }
    
    console.log(`Making featuresBlock ${blockNumber} API call with language: ${language}`);
    return makeApiCall<any>(endpoint, {
      params: { language }, // Always include language parameter
    });
  },
  
  getMainMenu: () => {
    const language = getCurrentLanguage();
    console.log(`Making mainMenu API call with language: ${language}`);
    return makeApiCall<any>(API_ENDPOINTS.menu, {
      params: { language }, // Always include language parameter
    });
  },
  
  getAllProducts: () => {
    const language = getCurrentLanguage();
    console.log(`Making allProducts API call with language: ${language}`);
    return makeApiCall<any>(API_ENDPOINTS.products, {
      params: { language }, // Always include language parameter
    });
  },
  
  getProductsByCategory: (categoryId: string) => {
    const language = getCurrentLanguage();
    console.log(`Making productsByCategory API call for category ${categoryId} with language: ${language}`);
    
    return makeApiCall<any>(API_ENDPOINTS.products, {
      params: {
        category: categoryId,
        language, // Always include language parameter
      },
    }).then(response => {
      console.log(`Response for category ${categoryId}:`, response);
      
      // Check if the response is successful
      if (response.success === 1 && response.data) {
        // Handle both response formats (direct array or nested within object)
        if (response.data.products && Array.isArray(response.data.products)) {
          return {
            ...response,
            data: response.data
          };
        } else if (Array.isArray(response.data)) {
          return {
            ...response,
            data: { products: response.data, product_total: response.data.length }
          };
        }
      }
      
      // Return original response if no products found
      return response;
    });
  },
  
  getProductDetail: (productId: string) => {
    const language = getCurrentLanguage();
    console.log(`Making productDetail API call for product ${productId} with language: ${language}`);
    return makeApiCall<any>(API_ENDPOINTS.productDetail, {
      params: { 
        productId,
        language, // Always include language parameter
      },
    });
  },
};