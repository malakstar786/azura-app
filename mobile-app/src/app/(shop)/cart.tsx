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
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cart-store';
import { StatusBar } from 'expo-status-bar';
import { CartItemType } from '../../store/cart-store';
import { useState } from 'react';

const { width } = Dimensions.get('window');

type DeleteModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: CartItemType;
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
          <Image source={item.heroImage} style={styles.deleteModalImage} />
          <View style={styles.deleteModalItemDetails}>
            <Text style={styles.deleteModalSku}>SKU:{item.id}</Text>
            <Text style={styles.deleteModalItemTitle}>{item.title.toUpperCase()}</Text>
            <Text style={styles.deleteModalQuantity}>QTY: {item.quantity}</Text>
            <Text style={styles.deleteModalPrice}>{(item.price * item.quantity).toFixed(3)} KD</Text>
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

const CartItem = ({
  item,
  onRemove,
  onUpdateQuantity,
  onIncrement,
  onDecrement,
}: {
  item: CartItemType;
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
}) => {
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const quantities = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <View style={styles.cartItem}>
      <Image source={item.heroImage} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemSku}>SKU:{item.id}</Text>
        <Text style={styles.itemTitle}>{item.title.toUpperCase()}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            onPress={() => onDecrement(item.id)}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quantitySelector}
            onPress={() => setShowQuantityModal(true)}
          >
            <Text style={styles.itemQuantity}>QTY: {item.quantity}</Text>
            <Ionicons name="chevron-down" size={16} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => onIncrement(item.id)}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(3)} KD</Text>
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
          onRemove(item.id);
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
                  onPress={() => {
                    onUpdateQuantity(item.id, qty);
                    setShowQuantityModal(false);
                  }}
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
    updateQuantity,
    incrementItem,
    decrementItem,
    getTotalPrice,
  } = useCartStore();

  const SHIPPING_COST = 50.000;
  const cartTotal = parseFloat(getTotalPrice());
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
          <Text style={styles.emptyText}>Your Cart is Empty</Text>
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
        <Text style={styles.title}>MY{'\n'}CART</Text>
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onRemove={removeItem}
            onUpdateQuantity={updateQuantity}
            onIncrement={incrementItem}
            onDecrement={decrementItem}
          />
        )}
        contentContainerStyle={styles.cartList}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>CART TOTAL :</Text>
          <Text style={styles.totalValue}>{cartTotal.toFixed(3)} KD</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>SHIPPING :</Text>
          <Text style={styles.totalValue}>{SHIPPING_COST.toFixed(3)} KD</Text>
        </View>
        <View style={[styles.totalRow, styles.finalTotal]}>
          <Text style={styles.totalLabel}>TOTAL :</Text>
          <Text style={styles.totalValue}>{total.toFixed(3)} KD</Text>
        </View>

        <Link href="/checkout" asChild>
          <TouchableOpacity style={styles.checkoutButton}>
            <Text style={styles.checkoutButtonText}>CHECKOUT</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.checkoutIcon} />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 53,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  dividerContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  divider: {
    height: 2,
    backgroundColor: '#000',
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  itemImage: {
    width: 80,
    height: 100,
    resizeMode: 'contain',
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemSku: {
    fontSize: 12,
    color: '#4A4A4A',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#4A4A4A',
    marginRight: 4,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: width * 0.4,
    maxHeight: width * 0.8,
  },
  quantityOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  selectedQuantity: {
    backgroundColor: '#000',
  },
  quantityOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedQuantityText: {
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  finalTotal: {
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 12,
    color: '#000',
    marginRight: 8,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  checkoutButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  checkoutIcon: {
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  cartIconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  cartIcon: {
    fontSize: 48,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#000',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 32,
  },
  startShoppingButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    width: width - 32,
    alignItems: 'center',
  },
  startShoppingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  deleteModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  deleteModalItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 24,
  },
  deleteModalImage: {
    width: 80,
    height: 100,
    resizeMode: 'contain',
    marginRight: 16,
  },
  deleteModalItemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  deleteModalSku: {
    fontSize: 12,
    color: '#4A4A4A',
    marginBottom: 4,
  },
  deleteModalItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  deleteModalQuantity: {
    fontSize: 12,
    color: '#4A4A4A',
    marginBottom: 4,
  },
  deleteModalPrice: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#000',
  },
  confirmButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
}); 