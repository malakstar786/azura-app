import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ORDERS } from '../../../assets/orders';

export default function OrderDetails() {
  const { slug } = useLocalSearchParams();
  const order = ORDERS.find(o => o.slug === slug);

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.orderTitle}>Order #{order.slug}</Text>
      <Text style={styles.orderDetails}>{order.details}</Text>
      <View style={[styles.statusBadge, styles[`statusBadge_${order.status}`]]}>
        <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
      </View>
      <Text style={styles.orderDate}>
        Ordered on: {new Date(order.date).toLocaleDateString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
    textAlign: 'center',
  },
  orderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  orderDetails: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  orderDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 16,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge_Pending: {
    backgroundColor: '#ffcc00',
  },
  statusBadge_Completed: {
    backgroundColor: '#4caf50',
  },
  statusBadge_Shipped: {
    backgroundColor: '#2196f3',
  },
  statusBadge_InTransit: {
    backgroundColor: '#ff9800',
  },
}); 