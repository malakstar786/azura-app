import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Order, OrderStatus } from '../../../assets/types/order';
import { ORDERS } from '../../../assets/orders';
import { Ionicons } from '@expo/vector-icons';

const statusDisplayText: Record<OrderStatus, string> = {
  Pending: 'Pending',
  Completed: 'Completed',
  Shipped: 'Shipped',
  InTransit: 'In Transit',
};

const OrderItem = ({ item }: { item: Order }) => (
  <Pressable 
    style={styles.orderContainer}
    onPress={() => router.push(`/product/${item.items[0].slug}`)}
  >
    <View style={styles.orderContent}>
      <Image 
        source={item.items[0].heroImage} 
        style={styles.productImage}
        resizeMode="contain"
      />
      <View style={styles.orderDetails}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.productName}>{item.items[0].title.toUpperCase()}</Text>
            <Text style={styles.sku}>SKU: {item.items[0].id.toString().padStart(8, '0')}</Text>
          </View>
          <View style={[styles.statusBadge, styles[`statusBadge_${item.status}`]]}>
            <Text style={styles.statusText}>{statusDisplayText[item.status]}</Text>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>ORDER ID</Text>
            <Text style={styles.value}>#{item.id.padStart(7, '0')}</Text>
            
            <Text style={[styles.label, styles.labelSpacing]}>DATE</Text>
            <Text style={styles.value}>
              {new Date(item.date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }).toUpperCase()}
            </Text>
          </View>

          <View style={styles.infoColumn}>
            <Text style={styles.label}>PAYMENT</Text>
            <Text style={styles.value}>K-NET</Text>

            <Text style={[styles.label, styles.labelSpacing]}>QTY</Text>
            <Text style={styles.value}>1</Text>
          </View>
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.label}>TRANS ID</Text>
          <Text style={styles.transactionId}>TT#{item.id.padStart(23, '2')}</Text>
        </View>
      </View>
    </View>
  </Pressable>
);

export default function OrdersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerTitle: 'MY ORDERS',
          headerTitleStyle: styles.headerTitle,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
        }} 
      />
      <FlatList
        data={ORDERS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <OrderItem item={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  orderContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
  },
  orderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
  },
  orderDetails: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  sku: {
    fontSize: 12,
    color: '#666',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoColumn: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  labelSpacing: {
    marginTop: 12,
  },
  value: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  transactionInfo: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  transactionId: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
    marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge_Pending: {
    backgroundColor: '#F5B100',
  },
  statusBadge_Completed: {
    backgroundColor: '#4CAF50',
  },
  statusBadge_Shipped: {
    backgroundColor: '#2196F3',
  },
  statusBadge_InTransit: {
    backgroundColor: '#FF9800',
  },
}); 