import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
    Image,
    Dimensions,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { ProductListItem } from '../../components/product-list-item';
import { CATEGORIES } from '../../../assets/categories';
import { PRODUCTS } from '../../../assets/products';

const { width } = Dimensions.get('window');

const Category = () => {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const category = CATEGORIES.find(category => category.slug === slug);
    const products = PRODUCTS.filter(product => product.category.slug === slug);

    const ListHeader = () => (
        <>
            <View style={styles.heroSection}>
                <Image 
                    source={require('../../../assets/images/nail-care-hero.png')}
                    style={styles.heroImage}
                />
            </View>

            <View style={styles.content}>
                <Text style={styles.description}>
                    OUR AZURA {category?.name?.toUpperCase()} The New Collection Of{' '}
                    {category?.name}. A Sensation Of Freshness. A Journey In Every{' '}
                    Spray. OUR AZURA {category?.name?.toUpperCase()} The New Collection Of{' '}
                    {category?.name}. A Sensation Of Freshness. A Journey In Every{' '}
                    Spray. OUR AZURA {category?.name?.toUpperCase()} The New Collection Of{' '}
                    {category?.name}.
                </Text>
                
                <View style={styles.productCountContainer}>
                    <Text style={styles.productCount}>
                        {products.length} PRODUCTS
                    </Text>
                </View>
            </View>
        </>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen 
                options={{ 
                    headerTitle: '',
                    headerTransparent: true,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: 'transparent' },
                    headerTintColor: '#fff',
                }} 
            />
            
            <FlatList
                ListHeaderComponent={ListHeader}
                data={products}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => <ProductListItem product={item} />}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                showsVerticalScrollIndicator={false}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
            />
        </View>
    );
};

export default Category;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    heroSection: {
        width: width,
        height: 400,
        marginHorizontal: -16,
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    content: {
        marginTop: 20,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 20,
        color: '#000',
        textAlign: 'center',
    },
    productCountContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    productCount: {
        fontSize: 12,
        fontWeight: '500',
        color: '#4A4A4A',
    },
    productRow: {
        justifyContent: 'space-between',
        marginBottom: 24,
    },
});