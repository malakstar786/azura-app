import React, { useState, useEffect } from 'react';
import { Redirect, Stack, useLocalSearchParams, router } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useCartStore } from '../../store/cart-store';

const { width } = Dimensions.get('window');

interface Product {
  product_id: string;
  name: string;
  description: string;
  meta_title: string;
  price: string;
  image: string;
  images: string[];
  category_id: string;
  category_name: string;
  stock_status: string;
  sku: string;
  quantity: number;
  date_added: string;
}

interface ApiResponse {
  success: number;
  error: string | undefined;
  data: Product;
}

const ProductDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const toast = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { items, addItem, incrementQuantity, decrementQuantity } = useCartStore();
  const cartItem = items.find(item => item.product_id === slug);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`https://new.azurakwt.com/index.php?route=extension/mstore/product|detail&productId=${slug}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json() as ApiResponse;
        
        if (data.success === 1 && data.data) {
          setProduct(data.data);
          
          // If this product is in the cart, set the initial quantity
          if (cartItem) {
            setQuantity(cartItem.quantity);
          }
        } else {
          throw new Error(data.error || 'Failed to load product');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Could not load product details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [slug, cartItem]);

  const handleIncrement = () => {
    if (quantity < 10) {
      setQuantity(prev => prev + 1);
      if (cartItem) {
        incrementQuantity(product?.product_id || '');
      }
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
      if (cartItem) {
        decrementQuantity(product?.product_id || '');
      }
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.quantity <= 0) {
      toast.show('This product is currently out of stock.', {
        type: 'error',
        placement: 'bottom',
      });
      return;
    }

    if (quantity > product.quantity) {
      toast.show(`Only ${product.quantity} items available.`, {
        type: 'error',
        placement: 'bottom',
      });
      return;
    }

    addItem({
      cart_id: product.product_id,
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    });

    toast.show('Product has been added to your cart.', {
      type: 'success',
      placement: 'bottom',
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const isInStock = product?.stock_status === "2-3 Days";
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isNewArrival = () => {
    const addedDate = new Date(product.date_added || '');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return isInStock && addedDate >= thirtyDaysAgo;
  };

  return (
    <ScrollView style={styles.container} bounces={false}>
      <Stack.Screen 
        options={{ 
          headerTitle: '',
          headerShadowVisible: false,
        }} 
      />

      {isNewArrival() && (
        <View style={styles.newArrivalContainer}>
          <Text style={styles.newArrivalText}>NEW ARRIVAL</Text>
        </View>
      )}

      <Image 
        source={{ uri: `https://new.azurakwt.com/image/${product.image}` }} 
        style={styles.productImage} 
      />

      <View style={styles.content}>
        <Text style={styles.categoryAndSku}>
          {product.category_name} | SKU: {product.sku}
        </Text>

        <Text style={styles.title}>{product.name}</Text>

        {product.description ? (
          <>
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>
                {product.description.replace(/<\/?[^>]+(>|$)/g, "")}
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.readMore}>READ MORE</Text>
            </TouchableOpacity>
          </>
        ) : null}

        <Text style={styles.price}>{product.price}</Text>
        <Text style={styles.stockStatus}>
          {isInStock ? "In Stock" : "Out of Stock"}
        </Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={[styles.quantityButton, styles.minusButton]} 
            onPress={handleDecrement}
            disabled={!isInStock}
          >
            <Text style={[styles.quantityButtonText, styles.minusButtonText]}>−</Text>
          </TouchableOpacity>
          <View style={styles.quantityTextContainer}>
            <Text style={styles.quantityText}>{quantity}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.quantityButton, styles.plusButton]} 
            onPress={handleIncrement}
            disabled={!isInStock}
          >
            <Text style={[styles.quantityButtonText, styles.plusButtonText]}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.addToCartButton, !isInStock && styles.disabledButton]} 
            onPress={handleAddToCart}
            disabled={!isInStock}
          >
            <Text style={styles.buttonText}>ADD TO CART</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.buyNowButton, !isInStock && styles.disabledButton]} 
            onPress={handleBuyNow}
            disabled={!isInStock}
          >
            <Text style={styles.buttonText}>BUY NOW</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  newArrivalContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 1,
  },
  newArrivalText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  productImage: {
    width: width,
    height: width,
    resizeMode: 'contain',
  },
  content: {
    padding: 16,
  },
  categoryAndSku: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  descriptionContainer: {
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginBottom: 24,
  },
  price: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  stockStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    height: 44,
    marginBottom: 16,
  },
  quantityButton: {
    width: 44,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButton: {
    backgroundColor: '#000',
  },
  minusButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '500',
  },
  plusButtonText: {
    color: '#fff',
  },
  minusButtonText: {
    color: '#000',
  },
  quantityTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  quantityText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 8,
  },
  addToCartButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
  },
  buyNowButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});