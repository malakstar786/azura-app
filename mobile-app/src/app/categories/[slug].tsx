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
import { Category as CategoryType } from '../../../assets/types/category';
import { Product } from '../../../assets/types/product';

const { width } = Dimensions.get('window');

const ListHeader = ({ category }: { category: CategoryType }) => (
    <View style={styles.header}>
        <Image source={category.heroImage} style={styles.heroImage} />
        <View style={styles.headerContent}>
            <Text style={styles.title}>{category.name}</Text>
            <Text style={styles.description}>{category.description}</Text>
        </View>
    </View>
);

const Category = () => {
    const { slug } = useLocalSearchParams();
    const category = CATEGORIES.find((c: CategoryType) => c.slug === slug);
    const categoryProducts = PRODUCTS.filter((p: Product) => p.category.slug === slug);

    if (!category) {
        return null;
    }

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
                data={categoryProducts}
                renderItem={({ item }) => <ProductListItem product={item} />}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={<ListHeader category={category} />}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.content}
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
    content: {
        padding: 16,
    },
    row: {
        justifyContent: 'space-between',
    },
    header: {
        marginBottom: 24,
    },
    heroImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    headerContent: {
        paddingTop: 16,
        gap: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000',
    },
    description: {
        fontSize: 14,
        color: '#4A4A4A',
        lineHeight: 20,
    },
});