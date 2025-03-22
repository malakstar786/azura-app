import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/auth-store';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
  const { isAuthenticated, signOut } = useAuthStore();

  const handleLogout = () => {
    signOut();
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>MY{'\n'}ACCOUNT</Text>
          <Text style={styles.subtitle}>EASY SHOPPING WITH AZURA</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.optionsContainer}>
          <Pressable 
            style={styles.option}
            onPress={() => router.push('/account/country')}
          >
            <View style={styles.optionRow}>
              <Ionicons name="globe-outline" size={20} color="black" />
              <Text style={styles.optionText}>COUNTRY / REGION</Text>
            </View>
          </Pressable>

          <Pressable 
            style={styles.option}
            onPress={() => router.push('/account/language')}
          >
            <View style={styles.optionRow}>
              <Ionicons name="language-outline" size={20} color="black" />
              <Text style={styles.optionText}>LANGUAGE</Text>
            </View>
          </Pressable>
        </View>

        <Pressable 
          style={styles.loginButton}
          onPress={() => router.push('/auth')}
        >
          <Text style={styles.loginButtonText}>LOGIN / REGISTER</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>FOLLOW US</Text>
          <View style={styles.socialIcons}>
            <Ionicons name="logo-facebook" size={24} color="black" />
            <Ionicons name="logo-twitter" size={24} color="black" />
            <Ionicons name="logo-instagram" size={24} color="black" />
            <Ionicons name="logo-linkedin" size={24} color="black" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MY{'\n'}ACCOUNT</Text>
        <Text style={styles.subtitle}>EASY SHOPPING WITH AZURA</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.optionsContainer}>
        <Pressable 
          style={styles.option}
          onPress={() => router.push('/account/country')}
        >
          <View style={styles.optionRow}>
            <Ionicons name="globe-outline" size={20} color="black" />
            <Text style={styles.optionText}>COUNTRY / REGION</Text>
          </View>
        </Pressable>

        <Pressable 
          style={styles.option}
          onPress={() => router.push('/account/language')}
        >
          <View style={styles.optionRow}>
            <Ionicons name="language-outline" size={20} color="black" />
            <Text style={styles.optionText}>LANGUAGE</Text>
          </View>
        </Pressable>

        <Pressable 
          style={styles.option}
          onPress={() => router.push('/account/details')}
        >
          <View style={styles.optionRow}>
            <Ionicons name="person-outline" size={20} color="black" />
            <Text style={styles.optionText}>MY DETAILS</Text>
          </View>
        </Pressable>

        <Pressable 
          style={styles.option}
          onPress={() => router.push('/account/address')}
        >
          <View style={styles.optionRow}>
            <Ionicons name="location-outline" size={20} color="black" />
            <Text style={styles.optionText}>MY ADDRESS</Text>
          </View>
        </Pressable>

        <Pressable 
          style={styles.option}
          onPress={() => router.push('/orders')}
        >
          <View style={styles.optionRow}>
            <Ionicons name="receipt-outline" size={20} color="black" />
            <Text style={styles.optionText}>MY ORDERS</Text>
          </View>
        </Pressable>
      </View>

      <Pressable 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>LOGOUT</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>FOLLOW US</Text>
        <View style={styles.socialIcons}>
          <Ionicons name="logo-facebook" size={24} color="black" />
          <Ionicons name="logo-twitter" size={24} color="black" />
          <Ionicons name="logo-instagram" size={24} color="black" />
          <Ionicons name="logo-linkedin" size={24} color="black" />
        </View>
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
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#000',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#000',
    width: '100%',
  },
  optionsContainer: {
    gap: 24,
  },
  option: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: '#F05454',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 32,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    fontWeight: '500',
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 32,
  },
}); 