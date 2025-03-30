import React, { useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOrderStore, Order } from '../../store/order-store';

const OrderItem = ({ item }: { item: Order }) => {
  // Format date from ISO string to "NOVEMBER 26, 2024" format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).toUpperCase();
  };

  // Format currency with the correct code
  const formatCurrency = (amount: string, currencyCode: string) => {
    return `${parseFloat(amount).toFixed(3)} ${currencyCode}`;
  };

  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFA500'; // Orange
      case 'shipped':
        return '#4CAF50'; // Green
      case 'cancelled':
        return '#FF0000'; // Red
      default:
        return '#000000'; // Black
    }
  };

  return (
    <View style={styles.orderContainer}>
      <View style={styles.orderContent}>
        <View style={styles.orderDetails}>
          {/* Order ID and Total */}
          <View style={styles.headerRow}>
            <Text style={styles.orderId}>#{item.order_id}</Text>
            <Text style={styles.total}>{formatCurrency(item.total, item.currency_code)}</Text>
          </View>

          {/* Order metadata */}
          <View style={styles.orderMeta}>
            <Text style={styles.label}>DATE:</Text>
            <Text style={styles.value}>{formatDate(item.date_added)}</Text>
            
            <Text style={styles.label}>CUSTOMER:</Text>
            <Text style={styles.value}>{`${item.firstname} ${item.lastname}`}</Text>

            <Text style={styles.label}>STATUS:</Text>
            <Text style={[styles.value, styles.status, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function OrdersScreen() {
  const { orders, isLoading, error, fetchOrders } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You have no orders yet.</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.replace('/(shop)')}
          >
            <Text style={styles.shopButtonText}>START SHOPPING</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.order_id}
          renderItem={({ item }) => <OrderItem item={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#000',
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  shopButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#000',
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  orderContainer: {
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
  },
  orderContent: {
    flex: 1,
  },
  orderDetails: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  orderMeta: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
  },
  status: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
}); 