import { makeApiCall, API_ENDPOINTS } from './api-config';
import { Product } from '../types/api';
import { useLanguageStore } from '../store/language-store';

// Get current language from store
const getCurrentLanguage = () => {
  const { currentLanguage } = useLanguageStore.getState();
  return currentLanguage;
};

// Public endpoints
export const publicApi = {
  getHomeServiceBlock: () => {
    const language = getCurrentLanguage();
    return makeApiCall<any>(API_ENDPOINTS.homeServiceBlock, {
      params: language === 'ar' ? { language: 'ar' } : undefined,
    });
  },
  
  getHomeSliderBlock: () => {
    const language = getCurrentLanguage();
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
    
    return makeApiCall<any>(endpoint, {
      params: language === 'ar' ? { language: 'ar' } : undefined,
    });
  },
  
  getMainMenu: () => {
    const language = getCurrentLanguage();
    return makeApiCall<any>(API_ENDPOINTS.mainMenu, {
      params: language === 'ar' ? { language: 'ar' } : undefined,
    });
  },
  
  getAllProducts: () => {
    const language = getCurrentLanguage();
    return makeApiCall<any>(API_ENDPOINTS.allProducts, {
      params: language === 'ar' ? { language: 'ar' } : undefined,
    });
  },
  
  getProductsByCategory: (categoryId: string) => {
    const language = getCurrentLanguage();
    
    return makeApiCall<Product[]>(API_ENDPOINTS.allProducts, {
      params: {
        category: categoryId,
        ...(language === 'ar' ? { language: 'ar' } : {}),
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
    });
  },
  
  getProductDetail: (productId: string) => {
    const language = getCurrentLanguage();
    return makeApiCall<any>(API_ENDPOINTS.productDetail, {
      params: { 
        productId,
        ...(language === 'ar' ? { language: 'ar' } : {}),
      },
    });
  },
};