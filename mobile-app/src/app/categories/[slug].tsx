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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cart-store';
import { useToast } from 'react-native-toast-notifications';

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

interface Product {
  product_id: string;
  name: string;
  price: string;
  image: string;
  stock_status: string;
  date_added: string;
  category_id: string;
  quantity: number;
}

interface ApiResponse {
  success: number;
  error: string | undefined;
  data: {
    product_total: number;
    products: Product[];
  };
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
  const { addItem } = useCartStore();
  const toast = useToast();

  const getCategoryDescription = (categorySlug: string) => {
    switch(categorySlug) {
      case 'fragrance':
      case 'perfumes':
        return 'Our new collection of fragrances offers a unique experience of freshness, where each spray takes you on a special journey.';
      case 'nail-care':
        return 'Azura provides premium nail care products designed to promote the growth of long, strong, and healthy nails';
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
        const featureBlockEndpoint = slug === 'nail-care' ? 'featuresblock2' :
                                   slug === 'makeup' ? 'featuresblock5' : 'featuresblock1';
        
        const featureResponse = await fetch(`https://new.azurakwt.com/index.php?route=extension/mstore/home|${featureBlockEndpoint}`);
        if (featureResponse.ok) {
          const featureData = await featureResponse.json() as FeaturesResponse;
          if (featureData.success === 1 && featureData.data) {
            setCategoryImage(featureData.data.image);
          }
        }

        // Fetch products
        const response = await fetch('https://new.azurakwt.com/index.php?route=extension/mstore/product');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as ApiResponse;
        if (data.success === 1 && Array.isArray(data.data.products)) {
          const categoryProducts = data.data.products.filter(
            product => product.category_id === categoryId
          );
          setProducts(categoryProducts);
        } else {
          throw new Error(data.error || 'Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

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
    useCartStore.getState().addItem({
      cart_id: product.product_id,
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
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
            <Text style={styles.buttonText}>ADD TO CART</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.buyNowButton]}
            onPress={() => handleBuyNow(item)}
            disabled={item.stock_status !== "2-3 Days"}
          >
            <Text style={[styles.buttonText, styles.buyNowButtonText]}>BUY NOW</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.stockStatus}>
          {item.stock_status === "2-3 Days" ? "In Stock" : "Out of Stock"}
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
          <Text style={styles.productCount}>{products.length} PRODUCTS</Text>
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