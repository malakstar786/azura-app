import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cart-store';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={24} {...props} style={{ color: props.color }} />;
}

const TabsLayout = () => {
  const cartItems = useCartStore(state => state.items);
  
  // Calculate total items, properly handling string and number quantities
  const cartItemsCount = cartItems.reduce((sum, item) => {
    const itemQuantity = typeof item.quantity === 'string' 
      ? parseInt(item.quantity, 10) 
      : (typeof item.quantity === 'number' ? item.quantity : 0);
    
    return sum + itemQuantity;
  }, 0);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: 'gray',
          tabBarLabelStyle: { 
            fontSize: 12,
            marginBottom: 8,
          },
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            height: 85,
            paddingTop: 10,
            paddingBottom: 25,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon(props) {
              return <TabBarIcon {...props} name="home-outline" />;
            },
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon(props) {
              return <TabBarIcon {...props} name="search-outline" />;
            },
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon(props) {
              return (
                <>
                  <TabBarIcon {...props} name="cart-outline" />
                  {cartItemsCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{cartItemsCount}</Text>
                    </View>
                  )}
                </>
              );
            },
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon(props) {
              return <TabBarIcon {...props} name="person-outline" />;
            },
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: '#000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
