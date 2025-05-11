import { useLanguageStore } from '../store/language-store';

interface TranslationMap {
  [key: string]: {
    en: string;
    ar: string;
  };
}

// Common UI translations
const translations: TranslationMap = {
  // Language Selection
  'language.select': {
    en: 'SELECT LANGUAGE',
    ar: 'اختر اللغة',
  },
  'language.subtitle': {
    en: 'THIS HELPS US SERVE YOU BETTER.',
    ar: 'هذا يساعدنا على خدمتك بشكل أفضل.',
  },
  'language.english': {
    en: 'ENGLISH',
    ar: 'ENGLISH',
  },
  'language.arabic': {
    en: 'العربية',
    ar: 'العربية',
  },
  
  // Common
  'app.name': {
    en: 'AZURA',
    ar: 'أزورا',
  },
  
  // Navigation
  'nav.home': {
    en: 'Home',
    ar: 'الرئيسية',
  },
  'nav.search': {
    en: 'Search',
    ar: 'بحث',
  },
  'nav.cart': {
    en: 'Cart',
    ar: 'سلة التسوق',
  },
  'nav.account': {
    en: 'Account',
    ar: 'الحساب',
  },
  
  // Home
  'home.explore': {
    en: 'Explore',
    ar: 'استكشف',
  },
  
  // Account
  'account.title': {
    en: 'MY ACCOUNT',
    ar: 'حسابي',
  },
  'account.subtitle': {
    en: 'Easy shopping with Azura',
    ar: 'تسوق سهل مع أزورا',
  },
  'account.country': {
    en: 'COUNTRY / REGION',
    ar: 'البلد / المنطقة',
  },
  'account.language': {
    en: 'LANGUAGE',
    ar: 'اللغة',
  },
  'account.details': {
    en: 'MY DETAILS',
    ar: 'بياناتي',
  },
  'account.address': {
    en: 'MY ADDRESS',
    ar: 'عنواني',
  },
  'account.orders': {
    en: 'MY ORDERS',
    ar: 'طلباتي',
  },
  'account.login': {
    en: 'LOGIN / REGISTER',
    ar: 'تسجيل الدخول / التسجيل',
  },
  'account.logout': {
    en: 'LOGOUT',
    ar: 'تسجيل الخروج',
  },
  
  // Cart
  'cart.title': {
    en: 'MY CART',
    ar: 'سلة التسوق',
  },
  'cart.empty': {
    en: 'YOUR CART IS EMPTY',
    ar: 'سلة التسوق فارغة',
  },
  'cart.startShopping': {
    en: 'START SHOPPING',
    ar: 'ابدأ التسوق',
  },
  'cart.checkout': {
    en: 'CHECKOUT',
    ar: 'الدفع',
  },
  'cart.remove': {
    en: 'Remove from Cart?',
    ar: 'إزالة من سلة التسوق؟',
  },
  'cart.cancel': {
    en: 'CANCEL',
    ar: 'إلغاء',
  },
  'cart.confirmRemove': {
    en: 'YES, REMOVE',
    ar: 'نعم، أزل',
  },
  
  // Product
  'product.addToCart': {
    en: 'Add to Cart',
    ar: 'أضف إلى السلة',
  },
  'product.buyNow': {
    en: 'Buy Now',
    ar: 'اشتر الآن',
  },
  
  // Search
  'search.title': {
    en: 'SEARCH',
    ar: 'بحث',
  },
  'search.placeholder': {
    en: 'Search for products...',
    ar: 'ابحث عن المنتجات...',
  },
  'search.notFound': {
    en: 'Product Not Found',
    ar: 'المنتج غير موجود',
  },
};

// Get translation function
export const useTranslation = () => {
  const { currentLanguage } = useLanguageStore();
  
  const t = (key: string) => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    
    return translation[currentLanguage] || translation.en;
  };
  
  return { t };
};

// Get translation directly (for non-component contexts)
export const getTranslation = (key: string) => {
  const { currentLanguage } = useLanguageStore.getState();
  
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  
  return translation[currentLanguage] || translation.en;
}; 