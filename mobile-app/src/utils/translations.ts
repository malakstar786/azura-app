import { useLanguageStore } from '../store/language-store';

// Define translations structure by language first, then keys
const translations = {
  en: {
    // Language Selection
    'language.select': 'SELECT LANGUAGE',
    'language.subtitle': 'THIS HELPS US SERVE YOU BETTER.',
    'language.english': 'ENGLISH',
    'language.arabic': 'العربية',
    
    // Common
    'app.name': 'AZURA',
    
    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.cart': 'MY CART',
    'nav.account': 'Account',
    
    // Drawer Menu
    'drawer.browse': 'BROWSE',
    
    // Home
    'home.explore': 'Explore',
    'home.services': 'Our Services',
    'home.features': 'Features',
    'home.fragrance': 'OUR NEW FRAGRANCE',
    'home.nailcare': 'Nail Polish Remover',
    'home.perfumes': 'PERFUMES',
    'home.cologne': 'COLOGNE',
    
    // Categories
    'categories.fragrance_description': 'Our new collection of fragrances offers a unique experience of freshness, where each spray takes you on a special journey.',
    'categories.nailcare_description': 'Azura provides premium nail care products designed to promote the growth of long, strong, and healthy nails',
    'categories.makeup_description': 'Premium makeup for every occasion',
    'categories.products': 'PRODUCTS',
    
    // Product Details
    'product.newArrival': 'NEW ARRIVAL',
    'product.readMore': 'READ MORE',
    'product.outOfStock': 'Out of Stock',
    'product.inStock': 'In Stock',
    'product.limitedStock': 'Only {0} items available.',
    'product.addedToCart': 'Product has been added to your cart.',
    'product.quantity': 'Quantity',
    'product.goBack': 'Go Back',
    'product.productNotFound': 'Product not found',
    
    // Account
    'account.title': 'MY ACCOUNT',
    'account.subtitle': 'Easy shopping with Azura',
    'account.subtitleUpper': 'EASY SHOPPING WITH AZURA',
    'account.country': 'COUNTRY / REGION',
    'account.language': 'LANGUAGE',
    'account.details': 'MY DETAILS',
    'account.address': 'MY ADDRESS',
    'account.orders': 'MY ORDERS',
    'account.policies': 'POLICIES',
    'account.login': 'LOGIN / REGISTER',
    'account.logout': 'LOGOUT',
    'account.followUs': 'FOLLOW US',
    'account.loading': 'Loading...',
    
    // Orders
    'orders.title': 'My Orders',
    'orders.searchPlaceholder': 'Search by Order ID...',
    'orders.status.pending': 'Pending',
    'orders.status.processing': 'Processing',
    'orders.status.shipped': 'Shipped',
    'orders.status.delivered': 'Delivered',
    'orders.status.cancelled': 'Cancelled',
    'orders.status.failed': 'Failed',
    'orders.total': 'Total',
    'orders.noOrders': 'No orders found',
    'orders.loading': 'Loading orders...',
    'orders.orderNumber': 'Order #',
    'orders.date': 'Date',
    'orders.status': 'Status',
    'orders.viewDetails': 'View Details',
    
    // Empty states
    'empty.noProducts': 'No products found',
    'empty.noProductsDescription': 'Try searching with different keywords',
    'empty.cart': 'Your cart is empty',
    'empty.cartDescription': 'Add some products to your cart',
    'empty.startShopping': 'START SHOPPING',
    
    // Common UI
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Try Again',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.done': 'Done',
    'common.ok': 'OK',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Cart
    'cart.title': 'MY CART',
    'cart.empty': 'Your cart is empty',
    'cart.emptyDescription': 'Add some products to your cart to get started',
    'cart.startShopping': 'START SHOPPING',
    'cart.remove': 'Remove',
    'cart.quantity': 'QTY',
    'cart.total': 'CART TOTAL',
    'cart.checkout': 'CHECKOUT',
    'cart.emptyCart': 'Empty Cart',
    'cart.removeItem': 'Remove Item',
    'cart.confirmRemove': 'YES, REMOVE',
    'cart.removeFromCart': 'Remove from Cart?',
    'cart.yesRemove': 'YES, REMOVE',
    'cart.loginRequired': 'Login Required',
    'cart.loginRequiredMessage': 'Please login to proceed with checkout',
    
    // Product
    'product.addToCart': 'ADD TO CART',
    'product.buyNow': 'BUY NOW',
    
    // Search
    'search.title': 'SEARCH',
    'search.placeholder': 'Search for products...',
    'search.notFound': 'Product Not Found',

    // Authentication
    'auth.login': 'LOGIN',
    'auth.register': 'REGISTER',
    'auth.email': 'EMAIL',
    'auth.password': 'PASSWORD',
    'auth.confirmPassword': 'CONFIRM PASSWORD',
    'auth.firstName': 'FIRST NAME',
    'auth.lastName': 'LAST NAME',
    'auth.mobile': 'MOBILE NUMBER',
    'auth.forgotPassword': 'FORGOT PASSWORD?',
    'auth.signIn': 'SIGN IN',
    'auth.signUp': 'SIGN UP',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.terms': 'By creating an account, you agree to our Terms & Conditions',
    'auth.loginSuccess': 'Login successful',
    'auth.registrationSuccess': 'Registration successful',
    'auth.loginError': 'Login failed. Please check your credentials.',
    'auth.registrationError': 'Registration failed. Please try again.',
    'auth.userDetails': 'USER DETAILS',
    'auth.loginTitle': 'LOGIN',
    'auth.signUpTitle': 'SIGN UP',
    'auth.createAccount': 'CREATE ACCOUNT',
    'auth.welcome': 'Welcome',
    'auth.welcomeBack': 'Welcome back',
    'auth.enterDetails': 'Enter your details to continue',
    'auth.enterLoginDetails': 'Enter your login details',
    
    // Signup specific
    'signup.title': 'CREATE ACCOUNT',
    'signup.subtitle': 'EASY SHOPPING WITH AZURA',
    'signup.instruction': 'CREATE AN ACCOUNT AND BENEFIT FROM A MORE PERSONAL SHOPPING EXPERIENCE, AND QUICKER ONLINE CHECKOUT.',
    'signup.fullName': 'FULL NAME',
    'signup.email': 'EMAIL',
    'signup.mobile': 'MOBILE',
    'signup.password': 'PASSWORD',
    'signup.signUp': 'SIGN UP',
    'signup.alreadyHaveAccount': 'ALREADY HAVE ACCOUNT LOGIN?',
    'signup.success': 'Account created successfully!',
    'signup.failed': 'Sign up failed. Please try again.',
    
    // Validation messages
    'validation.fullNameRequired': 'Full name is required',
    'validation.invalidEmail': 'Invalid email address',
    'validation.invalidMobile': 'Invalid mobile number',
    'validation.passwordTooShort': 'Password must be at least 6 characters long',
    
    // Cart confirmation modal
    'cart.emptyCartConfirm': 'Empty Cart',
    'cart.emptyCartMessage': 'Are you sure you want to empty your cart?',
    'cart.emptyCartConfirmButton': 'YES, EMPTY CART',
    
    // Address
    'address.title': 'MY ADDRESS',
    'address.addNew': 'ADD NEW ADDRESS',
    'address.edit': 'EDIT ADDRESS',
    'address.delete': 'DELETE',
    'address.setDefault': 'SET AS DEFAULT',
    'address.default': 'DEFAULT',
    'address.firstName': 'FIRST NAME',
    'address.lastName': 'LAST NAME',
    'address.mobile': 'MOBILE NUMBER',
    'address.governorate': 'GOVERNORATE',
    'address.area': 'AREA',
    'address.block': 'BLOCK',
    'address.street': 'STREET',
    'address.building': 'HOUSE/BUILDING',
    'address.apartment': 'APARTMENT',
    'address.additionalInfo': 'ADDITIONAL INFO (OPTIONAL)',
    'address.selectGovernorate': 'Select Governorate',
    'address.selectArea': 'Select Area',
    'address.save': 'SAVE ADDRESS',
    'address.update': 'UPDATE ADDRESS',
    'address.deleteConfirm': 'Are you sure you want to delete this address?',
    'address.saved': 'Address saved successfully',
    'address.updated': 'Address updated successfully',
    'address.deleted': 'Address deleted successfully',
    'address.noAddresses': 'No addresses found',
    'address.addFirstAddress': 'Add your first address',
    
    // User Details
    'userDetails.title': 'USER DETAILS',
    'userDetails.firstName': 'FIRST NAME',
    'userDetails.lastName': 'LAST NAME',
    'userDetails.email': 'EMAIL',
    'userDetails.mobile': 'MOBILE NUMBER',
    'userDetails.save': 'SAVE CHANGES',
    'userDetails.saved': 'Profile updated successfully',
    'userDetails.error': 'Failed to update profile',
    
    // Details (Account Details)
    'details.title': 'MY DETAILS',
    'details.fullName': 'FULL NAME',
    'details.email': 'EMAIL',
    'details.mobile': 'MOBILE NUMBER',
    'details.password': 'PASSWORD',
    'details.editButton': 'EDIT DETAILS',
    
    // Addresses
    'addresses.title': 'MY ADDRESS',
    'addresses.edit': 'Edit',
    'addresses.noAddresses': 'No addresses found',
    'addresses.noAddressesDescription': 'Add your first address to get started',
    'addresses.addNew': 'ADD NEW ADDRESS',
    
    // Orders (extended)
    'orders.orderId': 'Order ID',
    'orders.customer': 'Customer',
    'orders.noOrdersFound': 'No orders found',
    'orders.noOrdersFoundDescription': 'No orders found for "{0}"',
    'orders.noOrdersDescription': 'You have no orders yet',
    'orders.clearSearch': 'Clear search',
    'orders.ordersCount': 'Showing {0} {1}',
    'orders.order': 'order',
    'orders.orders': 'orders',
    
    // Checkout (extended)
    'checkout.title': 'CHECKOUT',
    'checkout.placeOrder': 'PLACE ORDER',
    'checkout.completeDetails': 'Complete Details',
    

    
    // Error messages
    'error.serverError': 'Server error occurred',
    'error.networkError': 'Network error occurred',
    'error.serverUnavailable': 'The registration service is currently unavailable. Please try again later or contact support.',
    
    // Policies
    'policies.title': 'POLICIES',
    'policies.aboutUs': 'About Us',
    'policies.contactUs': 'Contact Us',
    'policies.terms': 'Terms & Conditions',
    'policies.privacy': 'Privacy Policy',
    
    // Order Success/Failure
    'order.success': 'THANK YOU! ✓',
    'order.successMessage': 'YOUR ORDER HAS BEEN PLACED SUCCESSFULLY',
    'order.continueShopping': 'CONTINUE SHOPPING',
    'order.errorTitle': 'OOPS! SOMETHING WENT WRONG',
    'order.errorMessage': 'YOUR ORDER WAS NOT PLACED',
    'order.errorSubMessage': 'PLEASE TRY AGAIN',
    'order.tryAgain': 'TRY AGAIN?',
    'order.orderId': 'ORDER ID:',
    'order.date': 'DATE:',
    'order.email': 'EMAIL:',
    'order.transId': 'TRANS ID:',
    'order.paymentMethod': 'PAYMENT METHOD:',
    'order.sku': 'SKU:',
    'order.qty': 'QTY:',

    // Checkout 
    'checkout.billingAddress': 'BILLING ADDRESS',
    'checkout.selectShippingMethod': 'Please select a shipping method to continue.',
    'checkout.selectPaymentMethod': 'Please select a payment method to continue.',
    'checkout.addBillingAddress': 'Please add a billing address to continue.',
    'checkout.addShippingAddress': 'Please add a shipping address to continue.',
    'checkout.easyShoppingWithAzura': 'EASY SHOPPING WITH AZURA',
    'checkout.billingShippingAddress': 'BILLING & SHIPPING ADDRESS',
    'checkout.editAddress': 'Edit Address',
    'checkout.addAddress': 'ADD ADDRESS',
    'checkout.shipToDifferentAddress': 'Ship to Different Address?',
    'checkout.shippingAddressTitle': 'SHIPPING ADDRESS',
    'checkout.addShippingAddressButton': 'ADD SHIPPING ADDRESS',
    'checkout.orderSummaryTitle': 'Order Summary',
    'checkout.product': 'Product',
    'checkout.noProducts': 'No products in cart',
    'checkout.itemSubtotal': 'Item Sub total',
    'checkout.shippingFee': 'Shipping Fee',
    'checkout.grandTotal': 'Grand Total',
    'checkout.selectShipping': 'Select Shipping Method',
    'checkout.loadingShippingMethods': 'Loading shipping methods...',
    'checkout.selectPaymentTitle': 'Select Payment Method',
    'checkout.loadingPaymentMethods': 'Loading payment methods...',
    'checkout.noShippingMethods': 'No shipping methods available for your address',
    'checkout.addAddressForShipping': 'Please add an address to see shipping methods',
    'checkout.noPaymentMethods': 'No payment methods available for your address',
    'checkout.addAddressForPayment': 'Please add an address to see payment methods',
    'checkout.paymentMethodsTitle': 'PAYMENT METHODS',
  },
  ar: {
    // Language Selection
    'language.select': 'اختر اللغة',
    'language.subtitle': 'هذا يساعدنا على خدمتك بشكل أفضل.',
    'language.english': 'ENGLISH',
    'language.arabic': 'العربية',
    
    // Common
    'app.name': 'أزورا',
    
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.search': 'بحث',
    'nav.cart': 'سلة التسوق',
    'nav.account': 'الحساب',
    
    // Drawer Menu
    'drawer.browse': 'تصفح',
    
    // Home
    'home.explore': 'استكشف',
    'home.services': 'خدماتنا',
    'home.features': 'المميزات',
    'home.fragrance': 'عطرنا الجديد',
    'home.nailcare': 'مزيل طلاء الأظافر',
    'home.perfumes': 'العطور',
    'home.cologne': 'كولونيا',
    
    // Categories
    'categories.fragrance_description': 'تقدم مجموعتنا الجديدة من العطور تجربة فريدة من الانتعاش، حيث تأخذك كل رشة في رحلة خاصة.',
    'categories.nailcare_description': 'توفر أزورا منتجات عناية بالأظافر متميزة مصممة لتعزيز نمو أظافر طويلة وقوية وصحية',
    'categories.makeup_description': 'مكياج فاخر لكل مناسبة',
    'categories.products': 'منتجات',
    
    // Product Details
    'product.newArrival': 'وصل حديثًا',
    'product.readMore': 'قراءة المزيد',
    'product.outOfStock': 'نفذ من المخزون',
    'product.inStock': 'متوفر',
    'product.limitedStock': 'متوفر {0} قطع فقط.',
    'product.addedToCart': 'تمت إضافة المنتج إلى سلة التسوق الخاصة بك.',
    'product.quantity': 'الكمية',
    'product.goBack': 'الرجوع',
    'product.productNotFound': 'المنتج غير موجود',
    
    // Account
    'account.title': 'حسابي',
    'account.subtitle': 'تسوق سهل مع أزورا',
    'account.subtitleUpper': 'تسوق سهل مع أزورا',
    'account.country': 'البلد / المنطقة',
    'account.language': 'اللغة',
    'account.details': 'بياناتي',
    'account.address': 'عنواني',
    'account.orders': 'طلباتي',
    'account.policies': 'السياسات',
    'account.login': 'تسجيل الدخول / التسجيل',
    'account.logout': 'تسجيل الخروج',
    'account.followUs': 'تابعنا',
    'account.loading': 'جاري التحميل...',
    
    // Orders
    'orders.title': 'طلباتي',
    'orders.searchPlaceholder': 'البحث برقم الطلب...',
    'orders.status.pending': 'قيد الانتظار',
    'orders.status.processing': 'قيد المعالجة',
    'orders.status.shipped': 'تم الشحن',
    'orders.status.delivered': 'تم التوصيل',
    'orders.status.cancelled': 'ملغي',
    'orders.status.failed': 'فشل',
    'orders.total': 'المجموع',
    'orders.noOrders': 'لا توجد طلبات',
    'orders.loading': 'جاري تحميل الطلبات...',
    'orders.orderNumber': 'طلب رقم',
    'orders.date': 'التاريخ',
    'orders.status': 'الحالة',
    'orders.viewDetails': 'عرض التفاصيل',
    
    // Empty states
    'empty.noProducts': 'لا توجد منتجات',
    'empty.noProductsDescription': 'جرب البحث بكلمات مختلفة',
    'empty.cart': 'سلة التسوق فارغة',
    'empty.cartDescription': 'أضف بعض المنتجات إلى سلة التسوق',
    'empty.startShopping': 'ابدأ التسوق',
    
    // Common UI
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.retry': 'حاول مرة أخرى',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.remove': 'إزالة',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.done': 'تم',
    'common.ok': 'حسناً',
    'common.yes': 'نعم',
    'common.no': 'لا',
    
    // Cart
    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلة التسوق فارغة',
    'cart.emptyDescription': 'أضف بعض المنتجات إلى سلة التسوق للبدء',
    'cart.startShopping': 'ابدأ التسوق',
    'cart.remove': 'إزالة',
    'cart.quantity': 'الكمية',
    'cart.total': 'مجموع السلة',
    'cart.checkout': 'الدفع',
    'cart.emptyCart': 'إفراغ السلة',
    'cart.removeItem': 'إزالة المنتج',
    'cart.confirmRemove': 'نعم، أزل',
    'cart.removeFromCart': 'إزالة من سلة التسوق؟',
    'cart.yesRemove': 'نعم، أزل',
    'cart.loginRequired': 'تسجيل الدخول مطلوب',
    'cart.loginRequiredMessage': 'يرجى تسجيل الدخول للمتابعة إلى الدفع',
    
    // Product
    'product.addToCart': 'أضف إلى السلة',
    'product.buyNow': 'اشتر الآن',
    
    // Search
    'search.title': 'بحث',
    'search.placeholder': 'ابحث عن المنتجات...',
    'search.notFound': 'المنتج غير موجود',

    // Authentication
    'auth.login': 'تسجيل الدخول',
    'auth.register': 'التسجيل',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.firstName': 'الاسم الأول',
    'auth.lastName': 'اسم العائلة',
    'auth.mobile': 'رقم الجوال',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.signIn': 'تسجيل الدخول',
    'auth.signUp': 'التسجيل',
    'auth.alreadyHaveAccount': 'لديك حساب بالفعل؟',
    'auth.dontHaveAccount': 'ليس لديك حساب؟',
    'auth.terms': 'بإنشاء حساب، فإنك توافق على الشروط والأحكام',
    'auth.loginSuccess': 'تم تسجيل الدخول بنجاح',
    'auth.registrationSuccess': 'تم التسجيل بنجاح',
    'auth.loginError': 'فشل تسجيل الدخول. يرجى التحقق من البيانات.',
    'auth.registrationError': 'فشل التسجيل. يرجى المحاولة مرة أخرى.',
    'auth.userDetails': 'بيانات المستخدم',
    'auth.loginTitle': 'تسجيل الدخول',
    'auth.signUpTitle': 'التسجيل',
    'auth.createAccount': 'إنشاء حساب',
    'auth.welcome': 'مرحباً',
    'auth.welcomeBack': 'مرحباً بعودتك',
    'auth.enterDetails': 'أدخل بياناتك للمتابعة',
    'auth.enterLoginDetails': 'أدخل بيانات تسجيل الدخول',
    
    // Signup specific
    'signup.title': 'إنشاء حساب',
    'signup.subtitle': 'تسوق سهل مع أزورا',
    'signup.instruction': 'إنشاء حساب والاستفادة من تجربة تسوق أكثر شخصية وأسرع عبور الطلب عبر الإنترنت.',
    'signup.fullName': 'الاسم الكامل',
    'signup.email': 'البريد الإلكتروني',
    'signup.mobile': 'رقم الجوال',
    'signup.password': 'كلمة المرور',
    'signup.signUp': 'التسجيل',
    'signup.alreadyHaveAccount': 'هل لديك حساب بالفعل؟',
    'signup.success': 'تم إنشاء الحساب بنجاح!',
    'signup.failed': 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.',
    
    // Validation messages
    'validation.fullNameRequired': 'يجب إدخال الاسم الكامل',
    'validation.invalidEmail': 'عنوان بريد إلكتروني غير صالح',
    'validation.invalidMobile': 'رقم جوال غير صالح',
    'validation.passwordTooShort': 'يجب أن تكون كلمة المرور على الأقل 6 أحرف طويلة',
    
    // Cart confirmation modal
    'cart.emptyCartConfirm': 'إفراغ السلة',
    'cart.emptyCartMessage': 'هل أنت متأكد من إفراغ سلة التسوق؟',
    'cart.emptyCartConfirmButton': 'نعم، إفراغ السلة',
    
    // Address
    'address.title': 'عنواني',
    'address.addNew': 'إضافة عنوان جديد',
    'address.edit': 'تعديل العنوان',
    'address.delete': 'حذف',
    'address.setDefault': 'تعيين كافتراضي',
    'address.default': 'افتراضي',
    'address.firstName': 'الاسم الأول',
    'address.lastName': 'اسم العائلة',
    'address.mobile': 'رقم الجوال',
    'address.governorate': 'المحافظة',
    'address.area': 'المنطقة',
    'address.block': 'القطعة',
    'address.street': 'الشارع',
    'address.building': 'المنزل/المبنى',
    'address.apartment': 'الشقة',
    'address.additionalInfo': 'معلومات إضافية (اختياري)',
    'address.selectGovernorate': 'اختر المحافظة',
    'address.selectArea': 'اختر المنطقة',
    'address.save': 'حفظ العنوان',
    'address.update': 'تحديث العنوان',
    'address.deleteConfirm': 'هل أنت متأكد من حذف هذا العنوان؟',
    'address.saved': 'تم حفظ العنوان بنجاح',
    'address.updated': 'تم تحديث العنوان بنجاح',
    'address.deleted': 'تم حذف العنوان بنجاح',
    'address.noAddresses': 'لا توجد عناوين',
    'address.addFirstAddress': 'أضف عنوانك الأول',
    
    // User Details
    'userDetails.title': 'بيانات المستخدم',
    'userDetails.firstName': 'الاسم الأول',
    'userDetails.lastName': 'اسم العائلة',
    'userDetails.email': 'البريد الإلكتروني',
    'userDetails.mobile': 'رقم الجوال',
    'userDetails.save': 'حفظ التغييرات',
    'userDetails.saved': 'تم تحديث الملف الشخصي بنجاح',
    'userDetails.error': 'فشل في تحديث الملف الشخصي',
    
    // Details (Account Details)
    'details.title': 'بياناتي',
    'details.fullName': 'الاسم الكامل',
    'details.email': 'البريد الإلكتروني',
    'details.mobile': 'رقم الجوال',
    'details.password': 'كلمة المرور',
    'details.editButton': 'تعديل البيانات',
    
    // Addresses
    'addresses.title': 'عنواني',
    'addresses.edit': 'تعديل',
    'addresses.noAddresses': 'لا توجد عناوين',
    'addresses.noAddressesDescription': 'أضف عنوانك الأول للبدء',
    'addresses.addNew': 'إضافة عنوان جديد',
    
    // Orders (extended)
    'orders.orderId': 'رقم الطلب',
    'orders.customer': 'العميل',
    'orders.noOrdersFound': 'لا توجد طلبات',
    'orders.noOrdersFoundDescription': 'لا توجد طلبات لـ "{0}"',
    'orders.noOrdersDescription': 'ليس لديك طلبات بعد',
    'orders.clearSearch': 'مسح البحث',
    'orders.ordersCount': 'عرض {0} {1}',
    'orders.order': 'طلب',
    'orders.orders': 'طلبات',
    
    // Checkout (extended)
    'checkout.title': 'الدفع',
    'checkout.placeOrder': 'تأكيد الطلب',
    'checkout.completeDetails': 'أكمل البيانات',
    

    
    // Error messages
    'error.serverError': 'حدث خطأ في الخادم',
    'error.networkError': 'حدث خطأ في الشبكة',
    'error.serverUnavailable': 'The registration service is currently unavailable. Please try again later or contact support.',
    
    // Policies
    'policies.title': 'السياسات',
    'policies.aboutUs': 'من نحن',
    'policies.contactUs': 'اتصل بنا',
    'policies.terms': 'الشروط والأحكام',
    'policies.privacy': 'سياسة الخصوصية',
    
    // Order Success/Failure
    'order.success': 'شكراً لك! ✓',
    'order.successMessage': 'تم تأكيد طلبك بنجاح',
    'order.continueShopping': 'متابعة التسوق',
    'order.errorTitle': 'عذراً! حدث خطأ ما',
    'order.errorMessage': 'لم يتم تأكيد طلبك',
    'order.errorSubMessage': 'يرجى المحاولة مرة أخرى',
    'order.tryAgain': 'حاول مرة أخرى؟',
    'order.orderId': 'رقم الطلب:',
    'order.date': 'التاريخ:',
    'order.email': 'البريد الإلكتروني:',
    'order.transId': 'رقم المعاملة:',
    'order.paymentMethod': 'طريقة الدفع:',
    'order.sku': 'رقم المنتج:',
    'order.qty': 'الكمية:',

    // Checkout 
    'checkout.billingAddress': 'عنوان الفوترة',
    'checkout.selectShippingMethod': 'يرجى اختيار طريقة الشحن للمتابعة.',
    'checkout.selectPaymentMethod': 'يرجى اختيار طريقة الدفع للمتابعة.',
    'checkout.addBillingAddress': 'يرجى إضافة عنوان الفوترة للمتابعة.',
    'checkout.addShippingAddress': 'يرجى إضافة عنوان الشحن للمتابعة.',
    'checkout.easyShoppingWithAzura': 'تسوق سهل مع أزورا',
    'checkout.billingShippingAddress': 'عنوان الفوترة والشحن',
    'checkout.editAddress': 'تعديل العنوان',
    'checkout.addAddress': 'إضافة عنوان',
    'checkout.shipToDifferentAddress': 'الشحن إلى عنوان مختلف؟',
    'checkout.shippingAddressTitle': 'عنوان الشحن',
    'checkout.addShippingAddressButton': 'إضافة عنوان الشحن',
    'checkout.orderSummaryTitle': 'ملخص الطلب',
    'checkout.product': 'المنتج',
    'checkout.noProducts': 'لا توجد منتجات في السلة',
    'checkout.itemSubtotal': 'مجموع المنتجات',
    'checkout.shippingFee': 'رسوم الشحن',
    'checkout.grandTotal': 'المجموع الكلي',
    'checkout.selectShipping': 'اختر طريقة الشحن',
    'checkout.loadingShippingMethods': 'جاري تحميل طرق الشحن...',
    'checkout.selectPaymentTitle': 'اختر طريقة الدفع',
    'checkout.loadingPaymentMethods': 'جاري تحميل طرق الدفع...',
    'checkout.noShippingMethods': 'لا توجد طرق شحن متاحة لعنوانك',
    'checkout.addAddressForShipping': 'يرجى إضافة عنوان لرؤية طرق الشحن',
    'checkout.noPaymentMethods': 'لا توجد طرق دفع متاحة لعنوانك',
    'checkout.addAddressForPayment': 'يرجى إضافة عنوان لرؤية طرق الدفع',
    'checkout.paymentMethodsTitle': 'طرق الدفع',
  }
} as const;

type TranslationKeys = keyof typeof translations['en']; // Infer keys from English translations

export const useTranslation = () => {
  const language = useLanguageStore((state) => state.currentLanguage);

  const t = (key: TranslationKeys) => {
    // Fallback to English if translation for current language is missing
    const translatedText = translations[language][key];
    if (translatedText === undefined) {
      console.warn(`Translation key "${key}" not found for language "${language}". Falling back to English.`);
      return translations.en[key] || `MISSING_TRANSLATION:${key}`;
    }
    return translatedText;
  };

  return { t, language };
};

// Get translation directly (for non-component contexts)
export const getTranslation = (key: TranslationKeys) => {
  const { currentLanguage } = useLanguageStore.getState();
  
  const translatedText = translations[currentLanguage][key];
  if (translatedText === undefined) {
    console.warn(`Translation key "${key}" not found for language "${currentLanguage}". Falling back to English.`);
    return translations.en[key] || `MISSING_TRANSLATION:${key}`;
  }
  return translatedText;
}; 