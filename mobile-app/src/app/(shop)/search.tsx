import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';
import { PRODUCTS } from '../../../assets/products';
import { Product } from '../../../assets/types/product';
import { ProductListItem } from '../../components/product-list-item';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length > 0) {
      const filtered = PRODUCTS.filter((product: Product) =>
        product.title.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SEARCH</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      <ScrollView style={styles.results}>
        {filteredProducts.map(product => (
          <ProductListItem key={product.id} product={product} />
        ))}
      </ScrollView>
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
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  results: {
    flex: 1,
  },
}); 