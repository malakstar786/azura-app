import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useState } from 'react';
import { Link } from 'expo-router';

import { useCartStore } from '../../store/cart-store';
import { PRODUCTS } from '../../../assets/products';

const { width } = Dimensions.get('window');

const ProductDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const toast = useToast();

  const product = PRODUCTS.find(product => product.slug === slug);
  const { items, addItem, incrementItem, decrementItem } = useCartStore();
  const cartItem = items.find(item => item.id === product?.id);
  const initialQuantity = cartItem ? cartItem.quantity : 1;
  const [quantity, setQuantity] = useState(initialQuantity);

  if (!product) return <Redirect href='/404' />;

  const handleIncrement = () => {
    if (quantity < (product.maxQuantity || 10)) {
      setQuantity(prev => prev + 1);
      if (cartItem) {
        incrementItem(product.id);
      }
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
      if (cartItem) {
        decrementItem(product.id);
      }
    }
  };

  const handleAddToCart = () => {
    addItem({
      ...product,
      quantity,
      maxQuantity: product.maxQuantity || 10,
    });
    toast.show('Added to cart', {
      type: 'success',
      placement: 'top',
      duration: 1500,
    });
  };

  return (
    <ScrollView style={styles.container} bounces={false}>
      <Stack.Screen 
        options={{ 
          headerTitle: '',
          headerShadowVisible: false,
        }} 
      />

      {product.isNewArrival && (
        <View style={styles.newArrivalContainer}>
          <Text style={styles.newArrivalText}>NEW ARRIVAL</Text>
        </View>
      )}

      <Image source={product.heroImage} style={styles.productImage} />

      <View style={styles.content}>
        <Text style={styles.categoryAndSku}>
          {product.category.name} | SKU:{product.id}
        </Text>

        <Text style={styles.title}>{product.title}</Text>

        <Text style={styles.description}>
          BY USING THE HARDENER, NAILS BECOME STRONG.{'\n'}
          BEAUTIFULLY LONG NAILS ARE POSSIBLE FOR{'\n'}
          EVERYONE.
        </Text>

        <TouchableOpacity>
          <Text style={styles.readMore}>READ MORE</Text>
        </TouchableOpacity>

        <Text style={styles.price}>{product.price.toFixed(3)} KD</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={[styles.quantityButton, styles.minusButton]} 
            onPress={handleDecrement}
          >
            <Text style={[styles.quantityButtonText, styles.minusButtonText]}>−</Text>
          </TouchableOpacity>
          <View style={styles.quantityTextContainer}>
            <Text style={styles.quantityText}>{quantity}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.quantityButton, styles.plusButton]} 
            onPress={handleIncrement}
          >
            <Text style={[styles.quantityButtonText, styles.plusButtonText]}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.buttonText}>ADD TO CART</Text>
          </TouchableOpacity>

          <Link href={`/checkout?productId=${product.id}`} asChild>
            <TouchableOpacity style={styles.buyNowButton}>
              <Text style={styles.buttonText}>BUY NOW</Text>
            </TouchableOpacity>
          </Link>
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
  newArrivalContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    backgroundColor: '#4A4A4A',
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
    color: '#4A4A4A',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
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
    marginBottom: 24,
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
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});