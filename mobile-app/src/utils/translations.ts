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
  'home.services': {
    en: 'Our Services',
    ar: 'خدماتنا',
  },
  'home.features': {
    en: 'Features',
    ar: 'المميزات',
  },
  'home.fragrance': {
    en: 'OUR NEW FRAGRANCE',
    ar: 'عطرنا الجديد',
  },
  'home.nailcare': {
    en: 'Nail Polish Remover',
    ar: 'مزيل طلاء الأظافر',
  },
  'home.perfumes': {
    en: 'PERFUMES',
    ar: 'العطور',
  },
  'home.cologne': {
    en: 'COLOGNE',
    ar: 'كولونيا',
  },
  
  // Categories
  'categories.fragrance_description': {
    en: 'Our new collection of fragrances offers a unique experience of freshness, where each spray takes you on a special journey.',
    ar: 'تقدم مجموعتنا الجديدة من العطور تجربة فريدة من الانتعاش، حيث تأخذك كل رشة في رحلة خاصة.',
  },
  'categories.nailcare_description': {
    en: 'Azura provides premium nail care products designed to promote the growth of long, strong, and healthy nails',
    ar: 'توفر أزورا منتجات عناية بالأظافر متميزة مصممة لتعزيز نمو أظافر طويلة وقوية وصحية',
  },
  'categories.makeup_description': {
    en: 'Premium makeup for every occasion',
    ar: 'مكياج فاخر لكل مناسبة',
  },
  'categories.products': {
    en: 'PRODUCTS',
    ar: 'منتجات',
  },
  
  // Product Details
  'product.newArrival': {
    en: 'NEW ARRIVAL',
    ar: 'وصل حديثًا',
  },
  'product.readMore': {
    en: 'READ MORE',
    ar: 'قراءة المزيد',
  },
  'product.outOfStock': {
    en: 'Out of Stock',
    ar: 'نفذ من المخزون',
  },
  'product.inStock': {
    en: 'In Stock',
    ar: 'متوفر',
  },
  'product.limitedStock': {
    en: 'Only {0} items available.',
    ar: 'متوفر {0} قطع فقط.',
  },
  'product.addedToCart': {
    en: 'Product has been added to your cart.',
    ar: 'تمت إضافة المنتج إلى سلة التسوق الخاصة بك.',
  },
  'product.quantity': {
    en: 'Quantity',
    ar: 'الكمية',
  },
  'product.goBack': {
    en: 'Go Back',
    ar: 'الرجوع',
  },
  'product.productNotFound': {
    en: 'Product not found',
    ar: 'المنتج غير موجود',
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
    en: 'ADD TO CART',
    ar: 'أضف إلى السلة',
  },
  'product.buyNow': {
    en: 'BUY NOW',
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