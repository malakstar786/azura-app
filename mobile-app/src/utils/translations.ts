import { useLanguageStore } from '@store/language-store';

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
    en: 'MY CART',
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
  'account.subtitleUpper': {
    en: 'EASY SHOPPING WITH AZURA',
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
  'account.policies': {
    en: 'POLICIES',
    ar: 'السياسات',
  },
  'account.login': {
    en: 'LOGIN / REGISTER',
    ar: 'تسجيل الدخول / التسجيل',
  },
  'account.logout': {
    en: 'LOGOUT',
    ar: 'تسجيل الخروج',
  },
  'account.followUs': {
    en: 'FOLLOW US',
    ar: 'تابعنا',
  },
  'account.loading': {
    en: 'Loading...',
    ar: 'جاري التحميل...',
  },
  
  // Orders
  'orders.title': {
    en: 'My Orders',
    ar: 'طلباتي',
  },
  'orders.searchPlaceholder': {
    en: 'Search by Order ID...',
    ar: 'البحث برقم الطلب...',
  },
  'orders.loading': {
    en: 'Loading orders...',
    ar: 'جاري تحميل الطلبات...',
  },
  'orders.noOrders': {
    en: 'No orders yet',
    ar: 'لا توجد طلبات بعد',
  },
  'orders.noOrdersDescription': {
    en: 'Your orders will appear here once you make a purchase',
    ar: 'ستظهر طلباتك هنا بمجرد إجراء عملية شراء',
  },
  'orders.noOrdersFound': {
    en: 'No orders found',
    ar: 'لم يتم العثور على طلبات',
  },
  'orders.noOrdersFoundDescription': {
    en: 'No orders match "{0}"',
    ar: 'لا توجد طلبات تطابق "{0}"',
  },
  'orders.clearSearch': {
    en: 'Clear Search',
    ar: 'مسح البحث',
  },
  'orders.ordersCount': {
    en: '{0} {1} found',
    ar: 'تم العثور على {0} {1}',
  },
  'orders.order': {
    en: 'order',
    ar: 'طلب',
  },
  'orders.orders': {
    en: 'orders',
    ar: 'طلبات',
  },
  'orders.orderId': {
    en: 'Order ID',
    ar: 'رقم الطلب',
  },
  'orders.customer': {
    en: 'Customer:',
    ar: 'العميل:',
  },
  'orders.date': {
    en: 'Date:',
    ar: 'التاريخ:',
  },
  'orders.total': {
    en: 'Total:',
    ar: 'المجموع:',
  },
  'orders.status.pending': {
    en: 'Pending',
    ar: 'قيد الانتظار',
  },
  'orders.status.processing': {
    en: 'Processing',
    ar: 'قيد المعالجة',
  },
  'orders.status.shipped': {
    en: 'Shipped',
    ar: 'تم الشحن',
  },
  'orders.status.delivered': {
    en: 'Delivered',
    ar: 'تم التسليم',
  },
  'orders.status.cancelled': {
    en: 'Cancelled',
    ar: 'ملغي',
  },
  'orders.status.failed': {
    en: 'Failed',
    ar: 'فشل',
  },

  // Addresses
  'addresses.title': {
    en: 'My Addresses',
    ar: 'عناويني',
  },
  'addresses.addNew': {
    en: 'Add New Address',
    ar: 'إضافة عنوان جديد',
  },
  'addresses.edit': {
    en: 'Edit',
    ar: 'تعديل',
  },
  'addresses.delete': {
    en: 'Delete',
    ar: 'حذف',
  },
  'addresses.noAddresses': {
    en: 'No addresses yet',
    ar: 'لا توجد عناوين بعد',
  },
  'addresses.noAddressesDescription': {
    en: 'Add your first address to get started',
    ar: 'أضف عنوانك الأول للبدء',
  },
  'addresses.loading': {
    en: 'Loading addresses...',
    ar: 'جاري تحميل العناوين...',
  },
  'addresses.name': {
    en: 'Name',
    ar: 'الاسم',
  },
  'addresses.phone': {
    en: 'Phone',
    ar: 'الهاتف',
  },
  'addresses.country': {
    en: 'Country',
    ar: 'البلد',
  },
  'addresses.city': {
    en: 'City',
    ar: 'المدينة',
  },
  'addresses.area': {
    en: 'Area',
    ar: 'المنطقة',
  },
  'addresses.block': {
    en: 'Block',
    ar: 'القطعة',
  },
  'addresses.street': {
    en: 'Street',
    ar: 'الشارع',
  },
  'addresses.building': {
    en: 'Building',
    ar: 'المبنى',
  },
  'addresses.apartment': {
    en: 'Apartment',
    ar: 'الشقة',
  },
  'addresses.additionalInfo': {
    en: 'Additional Information',
    ar: 'معلومات إضافية',
  },
  'addresses.save': {
    en: 'Save',
    ar: 'حفظ',
  },
  'addresses.cancel': {
    en: 'Cancel',
    ar: 'إلغاء',
  },
  'addresses.required': {
    en: 'This field is required',
    ar: 'هذا الحقل مطلوب',
  },
  'addresses.selectCountry': {
    en: 'Select Country',
    ar: 'اختر البلد',
  },
  'addresses.selectCity': {
    en: 'Select City',
    ar: 'اختر المدينة',
  },
  'addresses.selectArea': {
    en: 'Select Area',
    ar: 'اختر المنطقة',
  },

  // My Details
  'details.title': {
    en: 'MY DETAILS',
    ar: 'بياناتي',
  },
  'details.fullName': {
    en: 'FULL NAME',
    ar: 'الاسم الكامل',
  },
  'details.email': {
    en: 'EMAIL',
    ar: 'البريد الإلكتروني',
  },
  'details.mobile': {
    en: 'MOBILE NUMBER',
    ar: 'رقم الجوال',
  },
  'details.password': {
    en: 'PASSWORD',
    ar: 'كلمة المرور',
  },
  'details.editButton': {
    en: 'EDIT DETAILS',
    ar: 'تعديل البيانات',
  },
  
  // Policies
  'policies.title': {
    en: 'POLICIES',
    ar: 'السياسات',
  },
  'policies.aboutUs': {
    en: 'ABOUT US',
    ar: 'من نحن',
  },
  'policies.contactUs': {
    en: 'CONTACT US',
    ar: 'اتصل بنا',
  },
  'policies.terms': {
    en: 'TERMS & CONDITIONS',
    ar: 'الشروط والأحكام',
  },
  'policies.privacy': {
    en: 'PRIVACY & RETURN POLICY',
    ar: 'سياسة الخصوصية والإرجاع',
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
  'cart.removeFromCart': {
    en: 'Remove from Cart?',
    ar: 'إزالة من سلة التسوق؟',
  },
  'cart.yesRemove': {
    en: 'YES, REMOVE',
    ar: 'نعم، أزل',
  },
  'cart.quantity': {
    en: 'QTY',
    ar: 'الكمية',
  },
  'cart.total': {
    en: 'TOTAL',
    ar: 'المجموع',
  },
  'cart.loginRequired': {
    en: 'Login Required',
    ar: 'تسجيل الدخول مطلوب',
  },
  'cart.loginRequiredMessage': {
    en: 'Please login to proceed with checkout',
    ar: 'يرجى تسجيل الدخول للمتابعة إلى الدفع',
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

  // Authentication
  'auth.login': {
    en: 'LOGIN',
    ar: 'تسجيل الدخول',
  },
  'auth.register': {
    en: 'REGISTER',
    ar: 'التسجيل',
  },
  'auth.email': {
    en: 'EMAIL',
    ar: 'البريد الإلكتروني',
  },
  'auth.password': {
    en: 'PASSWORD',
    ar: 'كلمة المرور',
  },
  'auth.confirmPassword': {
    en: 'CONFIRM PASSWORD',
    ar: 'تأكيد كلمة المرور',
  },
  'auth.firstName': {
    en: 'FIRST NAME',
    ar: 'الاسم الأول',
  },
  'auth.lastName': {
    en: 'LAST NAME',
    ar: 'اسم العائلة',
  },
  'auth.mobile': {
    en: 'MOBILE NUMBER',
    ar: 'رقم الجوال',
  },
  'auth.forgotPassword': {
    en: 'FORGOT PASSWORD?',
    ar: 'نسيت كلمة المرور؟',
  },
  'auth.dontHaveAccount': {
    en: "Don't have an account?",
    ar: 'ليس لديك حساب؟',
  },
  'auth.alreadyHaveAccount': {
    en: 'Already have an account?',
    ar: 'لديك حساب بالفعل؟',
  },
  'auth.signUp': {
    en: 'Sign Up',
    ar: 'إنشاء حساب',
  },
  'auth.signIn': {
    en: 'Sign In',
    ar: 'تسجيل الدخول',
  },
  'auth.resetPassword': {
    en: 'RESET PASSWORD',
    ar: 'إعادة تعيين كلمة المرور',
  },
  'auth.enterEmail': {
    en: 'Enter your email address to reset your password',
    ar: 'أدخل عنوان بريدك الإلكتروني لإعادة تعيين كلمة المرور',
  },
  'auth.sendResetLink': {
    en: 'SEND RESET LINK',
    ar: 'إرسال رابط الإعادة',
  },
  'auth.backToLogin': {
    en: 'Back to Login',
    ar: 'العودة لتسجيل الدخول',
  },

  // Validation Messages
  'validation.required': {
    en: 'This field is required',
    ar: 'هذا الحقل مطلوب',
  },
  'validation.emailInvalid': {
    en: 'Please enter a valid email address',
    ar: 'يرجى إدخال عنوان بريد إلكتروني صحيح',
  },
  'validation.passwordTooShort': {
    en: 'Password must be at least 6 characters',
    ar: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  },
  'validation.passwordsNotMatch': {
    en: 'Passwords do not match',
    ar: 'كلمات المرور غير متطابقة',
  },
  'validation.phoneInvalid': {
    en: 'Please enter a valid phone number',
    ar: 'يرجى إدخال رقم هاتف صحيح',
  },

  // Checkout
  'checkout.title': {
    en: 'CHECKOUT',
    ar: 'الدفع',
  },
  'checkout.shippingAddress': {
    en: 'SHIPPING ADDRESS',
    ar: 'عنوان الشحن',
  },
  'checkout.paymentMethod': {
    en: 'PAYMENT METHOD',
    ar: 'طريقة الدفع',
  },
  'checkout.orderSummary': {
    en: 'ORDER SUMMARY',
    ar: 'ملخص الطلب',
  },
  'checkout.subtotal': {
    en: 'Subtotal',
    ar: 'المجموع الفرعي',
  },
  'checkout.shipping': {
    en: 'Shipping',
    ar: 'الشحن',
  },
  'checkout.total': {
    en: 'Total',
    ar: 'المجموع',
  },
  'checkout.placeOrder': {
    en: 'PLACE ORDER',
    ar: 'تأكيد الطلب',
  },
  'checkout.cashOnDelivery': {
    en: 'Cash on Delivery',
    ar: 'الدفع عند الاستلام',
  },
  'checkout.creditCard': {
    en: 'Credit Card',
    ar: 'بطاقة ائتمان',
  },
  'checkout.selectAddress': {
    en: 'Select Address',
    ar: 'اختر العنوان',
  },
  'checkout.addNewAddress': {
    en: 'Add New Address',
    ar: 'إضافة عنوان جديد',
  },
  'checkout.orderPlaced': {
    en: 'Order Placed Successfully!',
    ar: 'تم تأكيد الطلب بنجاح!',
  },
  'checkout.orderFailed': {
    en: 'Order Failed',
    ar: 'فشل في تأكيد الطلب',
  },

  // Product Categories
  'categories.nailCare': {
    en: 'Nail Care',
    ar: 'العناية بالأظافر',
  },
  'categories.makeup': {
    en: 'Makeup',
    ar: 'المكياج',
  },
  'categories.fragrance': {
    en: 'Fragrance',
    ar: 'العطور',
  },
  'categories.all': {
    en: 'All Products',
    ar: 'جميع المنتجات',
  },

  // Common Actions
  'common.save': {
    en: 'SAVE',
    ar: 'حفظ',
  },
  'common.cancel': {
    en: 'CANCEL',
    ar: 'إلغاء',
  },
  'common.edit': {
    en: 'EDIT',
    ar: 'تعديل',
  },
  'common.delete': {
    en: 'DELETE',
    ar: 'حذف',
  },
  'common.add': {
    en: 'ADD',
    ar: 'إضافة',
  },
  'common.remove': {
    en: 'REMOVE',
    ar: 'إزالة',
  },
  'common.update': {
    en: 'UPDATE',
    ar: 'تحديث',
  },
  'common.confirm': {
    en: 'CONFIRM',
    ar: 'تأكيد',
  },
  'common.back': {
    en: 'BACK',
    ar: 'رجوع',
  },
  'common.next': {
    en: 'NEXT',
    ar: 'التالي',
  },
  'common.done': {
    en: 'DONE',
    ar: 'تم',
  },
  'common.close': {
    en: 'CLOSE',
    ar: 'إغلاق',
  },
  'common.select': {
    en: 'SELECT',
    ar: 'اختيار',
  },
  'common.search': {
    en: 'SEARCH',
    ar: 'بحث',
  },
  'common.filter': {
    en: 'FILTER',
    ar: 'تصفية',
  },
  'common.sort': {
    en: 'SORT',
    ar: 'ترتيب',
  },
  'common.clear': {
    en: 'CLEAR',
    ar: 'مسح',
  },
  'common.apply': {
    en: 'APPLY',
    ar: 'تطبيق',
  },
  'common.yes': {
    en: 'YES',
    ar: 'نعم',
  },
  'common.no': {
    en: 'NO',
    ar: 'لا',
  },
  'common.ok': {
    en: 'OK',
    ar: 'موافق',
  },
  'common.error': {
    en: 'Error',
    ar: 'خطأ',
  },
  'common.success': {
    en: 'Success',
    ar: 'نجح',
  },
  'common.warning': {
    en: 'Warning',
    ar: 'تحذير',
  },
  'common.info': {
    en: 'Info',
    ar: 'معلومات',
  },
  'common.loading': {
    en: 'Loading...',
    ar: 'جاري التحميل...',
  },
  'common.retry': {
    en: 'RETRY',
    ar: 'إعادة المحاولة',
  },
  'common.refresh': {
    en: 'REFRESH',
    ar: 'تحديث',
  },

  // Error Messages
  'error.networkError': {
    en: 'Network error. Please check your connection.',
    ar: 'خطأ في الشبكة. يرجى التحقق من اتصالك.',
  },
  'error.serverError': {
    en: 'Server error. Please try again later.',
    ar: 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
  },
  'error.unknownError': {
    en: 'An unknown error occurred.',
    ar: 'حدث خطأ غير معروف.',
  },
  'error.sessionExpired': {
    en: 'Session expired. Please login again.',
    ar: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
  },
  'error.invalidCredentials': {
    en: 'Invalid email or password.',
    ar: 'بريد إلكتروني أو كلمة مرور غير صحيحة.',
  },
  'error.emailAlreadyExists': {
    en: 'Email address already exists.',
    ar: 'عنوان البريد الإلكتروني موجود بالفعل.',
  },

  // Success Messages
  'success.loginSuccess': {
    en: 'Login successful!',
    ar: 'تم تسجيل الدخول بنجاح!',
  },
  'success.registerSuccess': {
    en: 'Registration successful!',
    ar: 'تم التسجيل بنجاح!',
  },
  'success.passwordResetSent': {
    en: 'Password reset link sent to your email.',
    ar: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
  },
  'success.profileUpdated': {
    en: 'Profile updated successfully!',
    ar: 'تم تحديث الملف الشخصي بنجاح!',
  },
  'success.addressAdded': {
    en: 'Address added successfully!',
    ar: 'تم إضافة العنوان بنجاح!',
  },
  'success.addressUpdated': {
    en: 'Address updated successfully!',
    ar: 'تم تحديث العنوان بنجاح!',
  },
  'success.addressDeleted': {
    en: 'Address deleted successfully!',
    ar: 'تم حذف العنوان بنجاح!',
  },

  // Empty States
  'empty.noProducts': {
    en: 'No products found',
    ar: 'لم يتم العثور على منتجات',
  },
  'empty.noProductsDescription': {
    en: 'Try adjusting your search or browse our categories',
    ar: 'جرب تعديل البحث أو تصفح فئاتنا',
  },
  'empty.cartEmpty': {
    en: 'Your cart is empty',
    ar: 'سلة التسوق فارغة',
  },
  'empty.cartEmptyDescription': {
    en: 'Add some products to get started',
    ar: 'أضف بعض المنتجات للبدء',
  },

  // Order Success/Failure
  'order.thankYou': {
    en: 'THANK YOU! ✓',
    ar: 'شكراً لك! ✓',
  },
  'order.successMessage': {
    en: 'YOUR ORDER HAS BEEN PLACED SUCCESSFULLY',
    ar: 'تم تأكيد طلبك بنجاح',
  },
  'order.continueShopping': {
    en: 'CONTINUE SHOPPING',
    ar: 'متابعة التسوق',
  },
  'order.errorTitle': {
    en: 'OOPS! SOMETHING WENT WRONG',
    ar: 'عذراً! حدث خطأ ما',
  },
  'order.errorMessage': {
    en: 'YOUR ORDER WAS NOT PLACED',
    ar: 'لم يتم تأكيد طلبك',
  },
  'order.errorSubMessage': {
    en: 'PLEASE TRY AGAIN',
    ar: 'يرجى المحاولة مرة أخرى',
  },
  'order.tryAgain': {
    en: 'TRY AGAIN?',
    ar: 'حاول مرة أخرى؟',
  },
  'order.orderId': {
    en: 'ORDER ID:',
    ar: 'رقم الطلب:',
  },
  'order.date': {
    en: 'DATE:',
    ar: 'التاريخ:',
  },
  'order.email': {
    en: 'EMAIL:',
    ar: 'البريد الإلكتروني:',
  },
  'order.transId': {
    en: 'TRANS ID:',
    ar: 'رقم المعاملة:',
  },
  'order.paymentMethod': {
    en: 'PAYMENT METHOD:',
    ar: 'طريقة الدفع:',
  },
  'order.sku': {
    en: 'SKU:',
    ar: 'رقم المنتج:',
  },
  'order.qty': {
    en: 'QTY:',
    ar: 'الكمية:',
  },

  // Checkout 
  'checkout.completeDetails': {
    en: 'Complete checkout details',
    ar: 'أكمل تفاصيل الطلب',
  },
  'checkout.billingAddress': {
    en: 'BILLING ADDRESS',
    ar: 'عنوان الفوترة',
  },
  'checkout.selectShippingMethod': {
    en: 'Please select a shipping method to continue.',
    ar: 'يرجى اختيار طريقة الشحن للمتابعة.',
  },
  'checkout.selectPaymentMethod': {
    en: 'Please select a payment method to continue.',
    ar: 'يرجى اختيار طريقة الدفع للمتابعة.',
  },
  'checkout.addBillingAddress': {
    en: 'Please add a billing address to continue.',
    ar: 'يرجى إضافة عنوان الفوترة للمتابعة.',
  },
  'checkout.addShippingAddress': {
    en: 'Please add a shipping address to continue.',
    ar: 'يرجى إضافة عنوان الشحن للمتابعة.',
  },
  'checkout.easyShoppingWithAzura': {
    en: 'EASY SHOPPING WITH AZURA',
    ar: 'تسوق سهل مع أزورا',
  },
  'checkout.billingShippingAddress': {
    en: 'BILLING & SHIPPING ADDRESS',
    ar: 'عنوان الفوترة والشحن',
  },
  'checkout.editAddress': {
    en: 'Edit Address',
    ar: 'تعديل العنوان',
  },
  'checkout.addAddress': {
    en: 'ADD ADDRESS',
    ar: 'إضافة عنوان',
  },
  'checkout.shipToDifferentAddress': {
    en: 'Ship to Different Address?',
    ar: 'الشحن إلى عنوان مختلف؟',
  },
  'checkout.shippingAddressTitle': {
    en: 'SHIPPING ADDRESS',
    ar: 'عنوان الشحن',
  },
  'checkout.addShippingAddressButton': {
    en: 'ADD SHIPPING ADDRESS',
    ar: 'إضافة عنوان الشحن',
  },
  'checkout.orderSummaryTitle': {
    en: 'Order Summary',
    ar: 'ملخص الطلب',
  },
  'checkout.product': {
    en: 'Product',
    ar: 'المنتج',
  },
  'checkout.noProducts': {
    en: 'No products in cart',
    ar: 'لا توجد منتجات في السلة',
  },
  'checkout.itemSubtotal': {
    en: 'Item Sub total',
    ar: 'مجموع المنتجات',
  },
  'checkout.shippingFee': {
    en: 'Shipping Fee',
    ar: 'رسوم الشحن',
  },
  'checkout.grandTotal': {
    en: 'Grand Total',
    ar: 'المجموع الكلي',
  },
  'checkout.selectShipping': {
    en: 'Select Shipping Method',
    ar: 'اختر طريقة الشحن',
  },
  'checkout.loadingShippingMethods': {
    en: 'Loading shipping methods...',
    ar: 'جاري تحميل طرق الشحن...',
  },
  'checkout.selectPaymentTitle': {
    en: 'Select Payment Method',
    ar: 'اختر طريقة الدفع',
  },
  'checkout.loadingPaymentMethods': {
    en: 'Loading payment methods...',
    ar: 'جاري تحميل طرق الدفع...',
  },
  'checkout.noShippingMethods': {
    en: 'No shipping methods available for your address',
    ar: 'لا توجد طرق شحن متاحة لعنوانك',
  },
  'checkout.addAddressForShipping': {
    en: 'Please add an address to see shipping methods',
    ar: 'يرجى إضافة عنوان لرؤية طرق الشحن',
  },
  'checkout.noPaymentMethods': {
    en: 'No payment methods available for your address',
    ar: 'لا توجد طرق دفع متاحة لعنوانك',
  },
  'checkout.addAddressForPayment': {
    en: 'Please add an address to see payment methods',
    ar: 'يرجى إضافة عنوان لرؤية طرق الدفع',
  },
  'checkout.paymentMethodsTitle': {
    en: 'PAYMENT METHODS',
    ar: 'طرق الدفع',
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