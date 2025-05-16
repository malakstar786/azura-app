import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cart-store';
import { useAuthStore } from '../../store/auth-store';
import { StatusBar } from 'expo-status-bar';
import { CartItem } from '../../utils/api-config';
import { useState } from 'react';

const { width } = Dimensions.get('window');

type DeleteModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: CartItem;
};

const DeleteConfirmationModal = ({ visible, onClose, onConfirm, item }: DeleteModalProps) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.deleteModalOverlay}>
      <View style={styles.deleteModalContent}>
        <Text style={styles.deleteModalTitle}>Remove from Cart?</Text>
        
        <View style={styles.deleteModalItem}>
          <Image 
            source={{ uri: `https://new.azurakwt.com/image/${item.image}` }} 
            style={styles.deleteModalImage} 
          />
          <View style={styles.deleteModalItemDetails}>
            <Text style={styles.deleteModalSku}>SKU: {item.product_id}</Text>
            <Text style={styles.deleteModalItemTitle}>{item.name.toUpperCase()}</Text>
            <Text style={styles.deleteModalQuantity}>QTY: {item.quantity}</Text>
            <Text style={styles.deleteModalPrice}>
              {(parseFloat(item.price) * Number(item.quantity)).toFixed(3)} KD
            </Text>
          </View>
        </View>

        <View style={styles.deleteModalButtons}>
          <TouchableOpacity 
            style={[styles.deleteModalButton, styles.cancelButton]} 
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.deleteModalButton, styles.confirmButton]}
            onPress={onConfirm}
          >
            <Text style={styles.confirmButtonText}>YES, REMOVE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const CartItemRow = ({
  item,
  onRemove,
  onUpdateQuantity,
  onIncrement,
  onDecrement,
}: {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => Promise<void>;
  onIncrement: (id: string) => Promise<void>;
  onDecrement: (id: string) => void;
}) => {
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const quantities = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleIncrement = async () => {
    if (item.maximum) return;
    setIsUpdating(true);
    try {
      await onIncrement(item.cart_id);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = () => {
    if (item.minimum) return;
    onDecrement(item.cart_id);
  };

  const handleQuantitySelect = async (qty: number) => {
    if (!item.stock) return;
    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.cart_id, qty);
    } finally {
      setIsUpdating(false);
      setShowQuantityModal(false);
    }
  };

  return (
    <View style={styles.cartItemRow}>
      <Image 
        source={{ uri: `https://new.azurakwt.com/image/${item.thumb || item.image}` }} 
        style={styles.itemImage} 
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemSku}>SKU: {item.sku || item.product_id}</Text>
        <Text style={styles.itemTitle}>{item.name.toUpperCase()}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            onPress={handleDecrement}
            style={[styles.quantityButton, (isUpdating || item.minimum) && styles.disabledButton]}
            disabled={isUpdating || item.minimum}
          >
            <Text style={[styles.quantityButtonText, (isUpdating || item.minimum) && styles.disabledText]}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quantitySelector, isUpdating && styles.disabledButton]}
            onPress={() => !isUpdating && setShowQuantityModal(true)}
            disabled={isUpdating || !item.stock}
          >
            <Text style={[styles.itemQuantity, isUpdating && styles.disabledText]}>QTY: {item.quantity}</Text>
            <Ionicons name="chevron-down" size={16} color={isUpdating ? "#999" : "#000"} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleIncrement}
            style={[styles.quantityButton, (isUpdating || item.maximum) && styles.disabledButton]}
            disabled={isUpdating || item.maximum}
          >
            <Text style={[styles.quantityButtonText, (isUpdating || item.maximum) && styles.disabledText]}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.itemPrice}>
          {item.total || (parseFloat(item.price) * Number(item.quantity)).toFixed(3)} KD
        </Text>
      </View>
      <TouchableOpacity 
        onPress={() => setShowDeleteModal(true)} 
        style={styles.removeButton}
      >
        <Ionicons name="trash-outline" size={24} color="#FF3B30" />
      </TouchableOpacity>

      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          onRemove(item.cart_id);
          setShowDeleteModal(false);
        }}
        item={item}
      />

      <Modal
        visible={showQuantityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuantityModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowQuantityModal(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              {quantities.map((qty) => (
                <TouchableOpacity
                  key={qty}
                  style={[
                    styles.quantityOption,
                    qty === item.quantity && styles.selectedQuantity,
                  ]}
                  onPress={() => handleQuantitySelect(qty)}
                >
                  <Text style={[
                    styles.quantityOptionText,
                    qty === item.quantity && styles.selectedQuantityText,
                  ]}>
                    {qty}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default function CartScreen() {
  const {
    items,
    removeItem,
    incrementQuantity,
    decrementQuantity,
    getTotalPrice,
    updateQuantity,
    clearCart,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    await updateQuantity(productId, quantity);
  };

  const handleCheckout = async () => {
    // First check if user is authenticated
    if (!isAuthenticated) {
      // If not authenticated, redirect to sign in page with redirect parameter
      router.push({
        pathname: '/auth',
        params: { redirect: 'checkout' }
      });
      return;
    }
    
    // If authenticated, proceed directly to checkout
    router.push('/checkout');
  };

  const SHIPPING_COST = 5.000;
  const cartTotal = getTotalPrice();
  const total = cartTotal + SHIPPING_COST;

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View>
          <Text style={styles.title}>MY{'\n'}CART</Text>
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.cartIconContainer}>
            <Text style={styles.cartIcon}>🛒</Text>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>0</Text>
            </View>
          </View>
          <Text style={styles.emptyText}>YOUR CART IS EMPTY</Text>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.startShoppingButton}>
              <Text style={styles.startShoppingText}>START SHOPPING</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

      <View>
        <Text style={styles.title}>{'MY\nCART'}</Text>
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.cart_id}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            onRemove={removeItem}
            onUpdateQuantity={handleUpdateQuantity}
            onIncrement={incrementQuantity}
            onDecrement={decrementQuantity}
          />
        )}
        contentContainerStyle={styles.cartItemsList}
      />

      {/* Empty Cart Button */}
      <TouchableOpacity
        style={styles.emptyCartButton}
        onPress={() => setShowClearCartModal(true)}
      >
        <Text style={styles.emptyCartButtonText}>EMPTY CART</Text>
      </TouchableOpacity>

      {/* Empty Cart Confirmation Modal */}
      <Modal
        visible={showClearCartModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowClearCartModal(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Remove all items from cart?</Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.cancelButton]}
                onPress={() => setShowClearCartModal(false)}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.confirmButton]}
                onPress={async () => {
                  await clearCart();
                  setShowClearCartModal(false);
                }}
              >
                <Text style={styles.confirmButtonText}>YES, REMOVE ALL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>CART TOTAL</Text>
          <Text style={styles.summaryValue}>{cartTotal.toFixed(3)} KD</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>SHIPPING</Text>
          <Text style={styles.summaryValue}>{SHIPPING_COST.toFixed(3)} KD</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[styles.summaryLabel, styles.totalLabel]}>TOTAL</Text>
          <Text style={[styles.summaryValue, styles.totalValue]}>{total.toFixed(3)} KD</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>CHECKOUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 40,
  },
  dividerContainer: {
    paddingVertical: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 80,
  },
  cartIconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  cartIcon: {
    fontSize: 64,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 32,
  },
  startShoppingButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '80%',
  },
  startShoppingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cartItemsList: {
    flexGrow: 1,
  },
  cartItemRow: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemSku: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  itemQuantity: {
    fontSize: 14,
    marginRight: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 200,
    maxHeight: 300,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedQuantity: {
    backgroundColor: '#F0F0F0',
  },
  quantityOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedQuantityText: {
    fontWeight: '600',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  deleteModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  deleteModalItem: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  deleteModalImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 16,
  },
  deleteModalItemDetails: {
    flex: 1,
  },
  deleteModalSku: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  deleteModalItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  deleteModalQuantity: {
    fontSize: 14,
    marginBottom: 4,
  },
  deleteModalPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#000',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#000',
  },
  confirmButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    marginBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#555',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  checkoutButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  emptyCartButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  emptyCartButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
}); 