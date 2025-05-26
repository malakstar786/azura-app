import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
    Image,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cart-store';
import { useLanguageStore } from '../../store/language-store';
import { useTranslation } from '../../utils/translations';
import { useToast } from 'react-native-toast-notifications';
import { publicApi } from '../../utils/api-service';
import { Product as ApiProduct } from '../../types/api';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 15;
const NUM_COLUMNS = 2;
const ITEM_WIDTH = (width - (COLUMN_GAP * (NUM_COLUMNS + 1))) / NUM_COLUMNS;

// Category IDs from API documentation
const CATEGORY_MAP: { [key: string]: string } = {
  'nail-care': '20',
  'fragrance': '57',
  'perfumes': '57',
  'makeup': '18'
};

interface Product extends ApiProduct {
  stock_status: string;
  date_added: string;
  quantity: number;
  sku: string;
  meta_title: string;
  meta_description: string;
  meta_keyword: string;
  tag: string;
  model: string;
  upc: string;
  ean: string;
  jan: string;
  isbn: string;
  mpn: string;
  location: string;
  manufacturer_id: string | null;
  manufacturer: string | null;
  reward: string | null;
  points: string;
  tax_class_id: string;
  date_available: string;
  weight: string;
  weight_class_id: string;
  length: string;
  width: string;
  height: string;
  length_class_id: string;
  subtract: string;
  rating: number;
  reviews: number;
  minimum: string;
  sort_order: string;
  status: string;
  date_modified: string;
  options: any[];
}

interface ProductResponse {
  product_total: number;
  products: Product[];
}

interface ApiResponse {
  success: number;
  error: string[] | undefined;
  data: ProductResponse | Product[];
}

interface FeaturesBlock {
  image: string;
  heading: string;
  desc: string;
}

interface FeaturesResponse {
  success: number;
  error: string[];
  data: FeaturesBlock;
}

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryImage, setCategoryImage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const { t } = useTranslation();
  const { currentLanguage, lastUpdated } = useLanguageStore();

  const getCategoryDescription = (categorySlug: string) => {
    switch(categorySlug) {
      case 'fragrance':
      case 'perfumes':
        return t('categories.fragrance_description') || 'Our new collection of fragrances offers a unique experience of freshness, where each spray takes you on a special journey.';
      case 'nail-care':
        return t('categories.nailcare_description') || 'Azura provides premium nail care products designed to promote the growth of long, strong, and healthy nails';
      case 'makeup':
        return t('categories.makeup_description') || 'Premium makeup for every occasion';
      default:
        return '';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const categoryId = CATEGORY_MAP[slug as string];
        if (!categoryId) {
          throw new Error('Category not found');
        }

        // Fetch feature block based on category
        const featureBlockNumber = slug === 'nail-care' ? 2 :
                                   slug === 'makeup' ? 5 : 1;
        
        const featureResponse = await publicApi.getFeaturesBlock(featureBlockNumber);
        if (featureResponse.success === 1 && featureResponse.data) {
          setCategoryImage(featureResponse.data.image);
        }

        // Fetch products by category
        const response = await publicApi.getProductsByCategory(categoryId);
        console.log('Category products response:', response);
        
        if (response.success === 1 && response.data) {
          // The API service now always returns data in the format { products: Product[], product_total: number }
          if (response.data.products && Array.isArray(response.data.products)) {
            setProducts(response.data.products as Product[]);
          } else {
            setProducts([]);
          }
        } else {
          throw new Error(Array.isArray(response.error) ? response.error[0] : 'Invalid response format');
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug, currentLanguage, lastUpdated]);

  const isNewArrival = (product: Product) => {
    const isInStock = product.stock_status === "2-3 Days";
    const addedDate = new Date(product.date_added);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return isInStock && addedDate >= thirtyDaysAgo;
  };

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      toast.show('This product is currently out of stock.', {
        type: 'error',
        placement: 'bottom',
      });
      return;
    }
    useCartStore.getState().addToCart(product.product_id, 1);
    toast.show('Product has been added to your cart.', {
      type: 'success',
      placement: 'bottom',
    });
  };

  const handleBuyNow = (product: Product) => {
    addToCart(product);
    router.push('/checkout');
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <TouchableOpacity 
        style={styles.productImageContainer}
        onPress={() => router.push(`/product/${item.product_id}`)}
      >
        <Image
          source={{ uri: `https://new.azurakwt.com/image/${item.image}` }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {isNewArrival(item) && (
          <View style={styles.newArrivalBadge}>
            <Text style={styles.newArrivalText}>NEW ARRIVAL</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>{slug === 'nail-care' ? 'NAIL CARE' : slug === 'makeup' ? 'MAKEUP' : 'FRAGRANCE'}</Text>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.addToCartButton]}
            onPress={() => addToCart(item)}
            disabled={item.stock_status !== "2-3 Days"}
          >
            <Text style={styles.buttonText}>{t('product.addToCart')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.buyNowButton]}
            onPress={() => handleBuyNow(item)}
            disabled={item.stock_status !== "2-3 Days"}
          >
            <Text style={[styles.buttonText, styles.buyNowButtonText]}>{t('product.buyNow')}</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.stockStatus}>
          {item.stock_status === "2-3 Days" ? t('product.inStock') : t('product.outOfStock')}
        </Text>
      </View>
    </View>
  );

  const renderProducts = () => {
    return (
      <View style={styles.productsGrid}>
        {products.map((item) => (
          <View key={item.product_id} style={styles.productWrapper}>
            {renderProduct({ item })}
          </View>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: categoryImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Category Info Section */}
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryDescription}>
            {getCategoryDescription(slug as string)}
          </Text>
          <Text style={styles.productCount}>
            {products.length} {t('categories.products')}
          </Text>
        </View>

        {/* Products Grid */}
        {renderProducts()}
      </ScrollView>

      {/* Back button outside ScrollView to keep it fixed */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  heroSection: {
    height: 300,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  categoryInfo: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryDescription: {
    flex: 1,
    color: '#000',
    fontSize: 14,
    lineHeight: 20,
    marginRight: 20,
  },
  productCount: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  productsGrid: {
    padding: COLUMN_GAP,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: ITEM_WIDTH,
    marginBottom: COLUMN_GAP,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 0,
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    height: ITEM_WIDTH * 1.2,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  newArrivalBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  newArrivalText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#000',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
  },
  buttonContainer: {
    gap: 8,
  },
  button: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButton: {
    backgroundColor: '#000',
  },
  buyNowButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  buyNowButtonText: {
    color: '#000',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  productCategory: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  stockStatus: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'right',
  },
});