import { View, Text, StyleSheet, TextInput, ScrollView, Dimensions, Image, Pressable, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { makeApiCall, API_ENDPOINTS, ApiResponse } from '../../utils/api-config';

const { width } = Dimensions.get('window');

interface Product {
  product_id: string;
  name: string;
  price: string;
  image: string;
  stock_status: string;
  date_added: string;
  category_id: string;
}

interface ProductsResponse {
  product_total: number;
  products: Product[];
}

const SearchResultItem = ({ product }: { product: Product }) => (
  <Pressable 
    style={styles.resultItem}
    onPress={() => router.push(`/product/${product.product_id}`)}
  >
    <Image 
      source={{ uri: `https://new.azurakwt.com/image/${product.image}` }} 
      style={styles.productImage} 
    />
    <View style={styles.productInfo}>
      <Text style={styles.productTitle}>{product.name.toUpperCase()}</Text>
      <Text style={styles.productPrice}>{product.price}</Text>
      <Text style={styles.productStock}>
        {product.stock_status === "2-3 Days" ? "In Stock" : "Out of Stock"}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#888" />
  </Pressable>
);

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  // Fetch all products once on initial load
  useEffect(() => {
    const fetchAllProducts = async () => {
      if (productsLoaded) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const response = await makeApiCall<ProductsResponse>(
          '/product', 
          { method: 'GET' }
        );

        if (response.success === 1 && response.data) {
          setAllProducts(response.data.products || []);
          setProductsLoaded(true);
        } else {
          console.error('API error:', response.error);
          setError(response.error || 'Failed to fetch products');
        }
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError('Error loading products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProducts();
  }, [productsLoaded]);

  // Filter products when search query changes
  useEffect(() => {
    if (!productsLoaded) return;
    
    if (debouncedQuery.length < 2) {
      setFilteredProducts([]);
      return;
    }

    const searchLower = debouncedQuery.toLowerCase();
    const filtered = allProducts.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.product_id.toLowerCase().includes(searchLower)
    );
    
    setFilteredProducts(filtered);
  }, [debouncedQuery, allProducts, productsLoaded]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
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
            editable={productsLoaded || !isLoading}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#4A4A4A" />
            </Pressable>
          )}
        </View>
      </View>
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      )}
      
      {error && !isLoading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable 
            style={styles.retryButton}
            onPress={() => setProductsLoaded(false)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      )}
      
      {!isLoading && !error && productsLoaded && searchQuery.length > 0 && filteredProducts.length === 0 && (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={60} color="#888" style={styles.noResultsIcon} />
          <Text style={styles.noResultsText}>No products found</Text>
          <Text style={styles.noResultsSubtext}>Try a different search term</Text>
        </View>
      )}

      {!isLoading && !error && productsLoaded && searchQuery.length === 0 && (
        <View style={styles.emptySearchContainer}>
          <Ionicons name="search" size={60} color="#888" style={styles.emptySearchIcon} />
          <Text style={styles.emptySearchText}>Search for products</Text>
          <Text style={styles.emptySearchSubtext}>Type at least 2 characters to search</Text>
        </View>
      )}

      {!isLoading && productsLoaded && filteredProducts.length > 0 && (
        <ScrollView 
          style={styles.results}
          contentContainerStyle={styles.resultsContent}
        >
          <View style={styles.resultsList}>
            {filteredProducts.map(product => (
              <SearchResultItem key={product.product_id} product={product} />
            ))}
          </View>
        </ScrollView>
      )}
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
    paddingBottom: 20,
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#888',
  },
  noResultsIcon: {
    marginBottom: 16,
  },
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptySearchIcon: {
    marginBottom: 16,
  },
  emptySearchText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  emptySearchSubtext: {
    fontSize: 14,
    color: '#888',
  },
}); 