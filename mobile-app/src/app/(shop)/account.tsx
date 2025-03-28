import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/auth-store';
import { makeApiCall, API_ENDPOINTS } from '../../utils/api-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AccountScreen() {
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<any>(null);

  // Fetch user profile data
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
    }
  }, [isAuthenticated, user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Use the account|edit endpoint with POST method as documented in instructions.md
      const response = await makeApiCall(API_ENDPOINTS.updateProfile, {
        method: 'POST',
        data: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          telephone: user.telephone || '',
        }
      });
      
      if (response.success === 1 && response.data) {
        setUserProfile(response.data);
      } else {
        throw new Error(Array.isArray(response.error) ? response.error[0] : 'Failed to fetch profile');
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to fetch user profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            setIsLoading(true);
            try {
              // Since there's no logout API endpoint in instructions.md,
              // we'll just clear the local user data
              await clearUser();
              await AsyncStorage.removeItem('@azura_user');
              router.replace('/');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>MY ACCOUNT</Text>
          <Text style={styles.subtitle}>Easy shopping with Azura</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.option}
            onPress={() => router.push('/account/country')}
          >
            <View style={styles.optionRow}>
              <Ionicons name="globe-outline" size={20} color="black" />
              <Text style={styles.optionText}>COUNTRY / REGION</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={() => router.push('/account/language')}
          >
            <View style={styles.optionRow}>
              <Ionicons name="language-outline" size={20} color="black" />
              <Text style={styles.optionText}>LANGUAGE</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/auth')}
        >
          <Text style={styles.loginButtonText}>LOGIN / REGISTER</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayName = userProfile ? 
    `${userProfile.firstname} ${userProfile.lastname}` : 
    user ? `${user.firstname} ${user.lastname}` : 'User';

  const email = userProfile ? userProfile.email : user?.email || '';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MY ACCOUNT</Text>
        <Text style={styles.subtitle}>Easy shopping with Azura</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.option}
          onPress={() => router.push('/account/country')}
        >
          <View style={styles.optionRow}>
            <Ionicons name="globe-outline" size={20} color="black" />
            <Text style={styles.optionText}>COUNTRY / REGION</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => router.push('/account/language')}
        >
          <View style={styles.optionRow}>
            <Ionicons name="language-outline" size={20} color="black" />
            <Text style={styles.optionText}>LANGUAGE</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => router.push('/account/details')}
        >
          <View style={styles.optionRow}>
            <Ionicons name="person-outline" size={20} color="black" />
            <Text style={styles.optionText}>MY DETAILS</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => router.push('/account/address')}
        >
          <View style={styles.optionRow}>
            <Ionicons name="location-outline" size={20} color="black" />
            <Text style={styles.optionText}>MY ADDRESS</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => router.push('/orders')}
        >
          <View style={styles.optionRow}>
            <Ionicons name="receipt-outline" size={20} color="black" />
            <Text style={styles.optionText}>MY ORDERS</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>LOGOUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#000',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 10,
  },
  optionsContainer: {
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  loginButton: {
    backgroundColor: '#000',
    marginHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 32,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#F05454',
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 32,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 