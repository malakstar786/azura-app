import { View, Text, StyleSheet, TextInput, ScrollView, Dimensions, Image, Pressable } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { PRODUCTS } from '../../../assets/products';
import { Product } from '../../../assets/types/product';

const { width } = Dimensions.get('window');

const SearchResultItem = ({ product }: { product: Product }) => (
  <Link href={`/product/${product.slug}`} asChild>
    <Pressable style={styles.resultItem}>
      <Image source={product.heroImage} style={styles.productImage} />
      <Text style={styles.productTitle}>{product.title.toUpperCase()}</Text>
    </Pressable>
  </Link>
);

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
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#4A4A4A" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="SEARCH PRODUCTS"
            placeholderTextColor="#4A4A4A"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>
      <ScrollView 
        style={styles.results}
        contentContainerStyle={styles.resultsContent}
      >
        <View style={styles.resultsList}>
          {filteredProducts.map(product => (
            <SearchResultItem key={product.id} product={product} />
          ))}
        </View>
      </ScrollView>
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
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 72,
    borderWidth: 1,
    borderColor: '#000',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    height: '100%',
  },
  results: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: 16,
  },
  resultsList: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  productImage: {
    width: 60,
    height: 60,
    marginRight: 16,
    resizeMode: 'contain',
  },
  productTitle: {
    fontSize: 14,
    color: '#4A4A4A',
    flex: 1,
  },
}); 