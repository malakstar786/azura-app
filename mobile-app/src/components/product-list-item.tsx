import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Link } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import { Product } from '../assets/types/product';
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
    addItem(product);
    toast.show('Added to cart', {
      type: 'success',
      placement: 'top',
      duration: 1500,
    });
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
        <Pressable>
          <View style={styles.itemImageContainer}>
            {product.isNewArrival && (
              <View style={styles.newArrivalBadge}>
                <Text style={styles.newArrivalText}>NEW ARRIVAL</Text>
              </View>
            )}
            <Image source={product.heroImage} style={styles.itemImage} />
          </View>
          <View style={styles.itemTextContainer}>
            <Text style={styles.categoryName}>{product.category.name}</Text>
            <Text style={styles.itemTitle}>{product.title}</Text>
            <Text style={styles.itemPrice}>{product.price.toFixed(3)} KD</Text>
          </View>
        </Pressable>
      </Link>
      
      <View style={styles.buttonContainer}>
        {!cartItem ? (
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.buttonText}>ADD TO CART</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={[styles.quantityButton, styles.minusButton]} 
              onPress={handleDecrement}
            >
              <Text style={[styles.quantityButtonText, styles.minusButtonText]}>−</Text>
            </TouchableOpacity>
            <View style={styles.quantityTextContainer}>
              <Text style={styles.quantityText}>{cartItem.quantity}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.quantityButton, styles.plusButton]} 
              onPress={handleIncrement}
            >
              <Text style={[styles.quantityButtonText, styles.plusButtonText]}>+</Text>
            </TouchableOpacity>
          </View>
        )}
        <Link href={`/checkout?productId=${product.id}`} asChild>
          <TouchableOpacity style={styles.buyNowButton}>
            <Text style={[styles.buttonText, styles.buyNowButtonText]}>BUY NOW</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    width: '48%',
    backgroundColor: 'white',
    marginVertical: 8,
  },
  itemImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  newArrivalBadge: {
    position: 'absolute',
    top: 10,
    left: 0,
    backgroundColor: '#4A4A4A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  newArrivalText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemTextContainer: {
    paddingVertical: 8,
    gap: 4,
  },
  categoryName: {
    fontSize: 12,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  itemTitle: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  buttonContainer: {
    gap: 8,
    marginTop: 4,
  },
  addToCartButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    height: 44,
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
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  buyNowButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  buyNowButtonText: {
    color: '#fff',
  },
});