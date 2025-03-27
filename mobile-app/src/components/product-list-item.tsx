import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types/api';
import { useCartStore } from '../store/cart-store';

export const ProductListItem = ({
  product,
}: {
  product: Product;
}) => {
  const toast = useToast();
  const { addItem, items, incrementItem, decrementItem } = useCartStore();
  const cartItem = items.find(item => item.product_id === product.product_id);

  const handleAddToCart = () => {
    addItem({
      product_id: product.product_id,
      name: product.name,
      price: parseFloat(product.price.replace(' KD', '')),
      image: product.image,
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
      incrementItem(product.product_id);
      toast.show('Quantity increased', {
        type: 'success',
        placement: 'top',
        duration: 1500,
      });
    }
  };

  const handleDecrement = () => {
    if (cartItem && cartItem.quantity > 1) {
      decrementItem(product.product_id);
      toast.show('Quantity decreased', {
        type: 'success',
        placement: 'top',
        duration: 1500,
      });
    }
  };

  return (
    <View style={styles.item}>
      <Link asChild href={`/product/${product.product_id}`}>
        <Pressable style={styles.imageContainer}>
          <Image 
            source={{ uri: product.image.startsWith('http') 
              ? product.image 
              : `https://new.azurakwt.com/image/${product.image}`
            }} 
            style={styles.image} 
          />
          {product.special && (
            <View style={styles.specialBadge}>
              <Ionicons name="pricetag" size={12} color="white" />
              <Text style={styles.specialBadgeText}>SPECIAL</Text>
            </View>
          )}
        </Pressable>
      </Link>

      <View style={styles.details}>
        <Link asChild href={`/product/${product.product_id}`}>
          <Pressable>
            <Text style={styles.title}>{product.name}</Text>
          </Pressable>
        </Link>
        <Text style={styles.price}>{product.price}</Text>

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
  specialBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#E31837',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specialBadgeText: {
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
  buyNowButton: {
    backgroundColor: '#E31837',
    paddingVertical: 10,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
});