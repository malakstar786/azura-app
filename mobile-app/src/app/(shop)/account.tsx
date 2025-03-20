import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function AccountScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MY ACCOUNT</Text>
      <Text style={styles.subtitle}>Easy shopping with Azura</Text>

      <View style={styles.optionsContainer}>
        <Link href="/account/country" asChild>
          <Pressable style={styles.option}>
            <Text style={styles.optionText}>Country/Region</Text>
            <FontAwesome name="chevron-right" size={16} color="#000" />
          </Pressable>
        </Link>

        <Link href="/account/language" asChild>
          <Pressable style={styles.option}>
            <Text style={styles.optionText}>Language</Text>
            <FontAwesome name="chevron-right" size={16} color="#000" />
          </Pressable>
        </Link>

        <Link href="/orders" asChild>
          <Pressable style={styles.option}>
            <Text style={styles.optionText}>My Orders</Text>
            <FontAwesome name="chevron-right" size={16} color="#000" />
          </Pressable>
        </Link>

        <Link href="/auth" asChild>
          <Pressable style={styles.option}>
            <Text style={styles.optionText}>Login/Register</Text>
            <FontAwesome name="chevron-right" size={16} color="#000" />
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
  },
}); 