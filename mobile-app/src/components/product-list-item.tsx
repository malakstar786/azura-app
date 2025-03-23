import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../assets/types/product';
import { useCartStore } from '../store/cart-store';

export const ProductListItem = ({
  product,
}: {
  product: Product;
}) => {
  const toast = useToast();
  const { addItem, items, incrementItem, decrementItem } = useCartStore();
  const cartItem = items.find(item => item.id === product.id);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      heroImage: product.heroImage,
      quantity: 1,
    });
    toast.show('Added to cart', {
      type: 'success',
      placement: 'top',
      duration: 1500,
    });
  };

  const handleBuyNow = () => {
    if (!cartItem) {
      handleAddToCart();
    }
    router.push('/checkout');
  };

  const handleIncrement = () => {
    if (cartItem) {
      incrementItem(product.id);
      toast.show('Quantity increased', {
        type: 'success',
        placement: 'top',
        duration: 1500,
      });
    }
  };

  const handleDecrement = () => {
    if (cartItem && cartItem.quantity > 1) {
      decrementItem(product.id);
      toast.show('Quantity decreased', {
        type: 'success',
        placement: 'top',
        duration: 1500,
      });
    }
  };

  return (
    <View style={styles.item}>
      <Link asChild href={`/product/${product.slug}`}>
        <Pressable style={styles.imageContainer}>
          <Image source={product.heroImage} style={styles.image} />
          {product.isNewArrival && (
            <View style={styles.newBadge}>
              <Ionicons name="star" size={12} color="white" />
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </Pressable>
      </Link>

      <View style={styles.details}>
        <Link asChild href={`/product/${product.slug}`}>
          <Pressable>
            <Text style={styles.title}>{product.title}</Text>
          </Pressable>
        </Link>
        <Text style={styles.price}>KD {product.price.toFixed(2)}</Text>

        <View style={styles.buttonContainer}>
          {cartItem ? (
            <View style={styles.quantityControls}>
              <TouchableOpacity
                onPress={handleDecrement}
                style={[styles.quantityButton, styles.minusButton]}
                disabled={cartItem.quantity === 1}
              >
                <Ionicons 
                  name="remove" 
                  size={20} 
                  color={cartItem.quantity === 1 ? '#ccc' : '#000'} 
                />
              </TouchableOpacity>
              <View style={styles.quantityTextContainer}>
                <Text style={styles.quantityText}>{cartItem.quantity}</Text>
              </View>
              <TouchableOpacity 
                onPress={handleIncrement} 
                style={[styles.quantityButton, styles.plusButton]}
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleAddToCart} style={styles.addToCartButton}>
              <Ionicons name="cart-outline" size={16} color="white" />
              <Text style={styles.buttonText}>ADD TO CART</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleBuyNow} style={styles.buyNowButton}>
            <Ionicons name="flash-outline" size={16} color="white" />
            <Text style={styles.buttonText}>BUY NOW</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    maxWidth: '47%',
  },
  imageContainer: {
    aspectRatio: 1,
    width: '100%',
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  details: {
    padding: 8,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  buttonContainer: {
    gap: 8,
    marginTop: 8,
  },
  addToCartButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quantityControls: {
    flexDirection: 'row',
    height: 36,
  },
  quantityButton: {
    width: 36,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  plusButton: {
    backgroundColor: '#000',
  },
  minusButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
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
    fontSize: 14,
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  buyNowButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});