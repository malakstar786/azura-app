import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.header}>
        <Text style={styles.logo}>AZURA</Text>
      </View>

      <View style={styles.heroSection}>
        <Image
          source={require('../../../assets/images/nail-care-hero.png')}
          style={styles.heroImage}
        />
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
          <Text style={styles.heroTitle}>THIS SEASON'S ESSENTIALS</Text>
          <Text style={styles.heroSubtitle}>
            THE NEW COLLECTION OF{'\n'}
            FRAGRANCES. A SENSATION OF FRESHNESS.{'\n'}
            A JOURNEY IN EVERY SPRAY.
          </Text>
          <Link href="/categories/fragrance" asChild>
            <Pressable style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>EXPLORE</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={styles.categorySection}>
        <Image
          source={require('../../../assets/images/makeup-1.png')}
          style={styles.categoryImage}
        />
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
          <Text style={styles.categoryTitle}>MAKEUP COLLECTION</Text>
          <Link href="/categories/makeup" asChild>
            <Pressable style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>EXPLORE</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={styles.categorySection}>
        <Image
          source={require('../../../assets/images/nail-care-1.png')}
          style={styles.categoryImage}
        />
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
          <Text style={styles.categoryTitle}>NAIL CARE ESSENTIALS</Text>
          <Link href="/categories/nail-care" asChild>
            <Pressable style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>EXPLORE</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Discover our curated collection of beauty essentials
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  heroSection: {
    height: 600,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  heroSubtitle: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  exploreButton: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignSelf: 'flex-start',
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  categorySection: {
    height: 400,
    position: 'relative',
    marginTop: 20,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  footer: {
    padding: 40,
    backgroundColor: '#000',
  },
  footerText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});