import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { Link } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} bounces={true}>
      <View style={styles.header}>
        <Text style={styles.logoText}>A Z U R A</Text>
      </View>

      {/* Main Section (Fragrances-1)*/}
      <View style={styles.section}>
        <Image
          source={require("../../../assets/images/nail-care-hero.png")}
          style={styles.sectionImage}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>THIS SEASON'S ESSENTIALS</Text>
            <Text style={styles.subtitle}>
              THE NEW COLLECTION OF{"\n"}
              FRAGRANCES. A SENSATION OF FRESHNESS.{"\n"}
              A JOURNEY IN EVERY SPRAY.
            </Text>
            <Link href="/categories/fragrances" asChild>
              <TouchableOpacity style={styles.exploreButton}>
                <Text style={styles.exploreButtonText}>EXPLORE</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>

      {/* Makeup Section */}
      <View style={styles.section}>
        <Image
          source={require("../../../assets/images/makeup-1.png")}
          style={styles.sectionImage}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>MAKEUP COLLECTION</Text>
            <Text style={styles.subtitle}>
              DISCOVER OUR RANGE OF{"\n"}
              PREMIUM MAKEUP PRODUCTS.{"\n"}
              ENHANCE YOUR NATURAL BEAUTY.
            </Text>
            <Link href="/categories/makeup" asChild>
              <TouchableOpacity style={styles.exploreButton}>
                <Text style={styles.exploreButtonText}>EXPLORE</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>

      {/* Nail Care Section */}
      <View style={styles.section}>
        <Image
          source={require("../../../assets/images/nail-care-1.png")}
          style={styles.sectionImage}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>NAIL CARE ESSENTIALS</Text>
            <Text style={styles.subtitle}>
              PROFESSIONAL NAIL CARE{"\n"}
              PRODUCTS FOR THE PERFECT{"\n"}
              MANICURE AT HOME.
            </Text>
            <Link href="/categories/nail-care" asChild>
              <TouchableOpacity style={styles.exploreButton}>
                <Text style={styles.exploreButtonText}>EXPLORE</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>

      {/* Fragrances-2*/}
      <View style={styles.section}>
        <Image
          source={require("../../../assets/images/nail-care-hero.png")}
          style={styles.sectionImage}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>LOVE IS IN THE AIR</Text>
            <Text style={styles.subtitle}>
              THE NEW COLLECTION OF{"\n"}
              FRAGRANCES. A SENSATION OF FRESHNESS.{"\n"}
              A JOURNEY IN EVERY SPRAY.
            </Text>
            <Link href="/categories/fragrances" asChild>
              <TouchableOpacity style={styles.exploreButton}>
                <Text style={styles.exploreButtonText}>EXPLORE</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>

      {/* Azura Services Section*/}
      <View style={[styles.section, styles.servicesSection]}>
        <View style={styles.contentContainer}>
          <Text style={[styles.title, styles.servicesTitle]}>THE AZURA SERVICES</Text>
          
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>📦</Text>
            <Text style={[styles.title, styles.serviceItemTitle]}>STANDARD SHIPPING</Text>
            <Text style={[styles.subtitle, styles.serviceItemText]}>
              ENJOY COMPLIMENTARY{"\n"}
              STANDARD SHIPPING
            </Text>
          </View>

          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>🎁</Text>
            <Text style={[styles.title, styles.serviceItemTitle]}>RIGHT GIFTING</Text>
            <Text style={[styles.subtitle, styles.serviceItemText]}>
              YOUR GIFT ORDERS WILL BE{"\n"}
              PRESENTED IN AN AZURA{"\n"}
              GIFT BOX
            </Text>
          </View>
        </View>
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Follow Us On
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingTop: 53,
    paddingBottom: 30,
    alignItems: "center",
    backgroundColor: "#000",
  },
  logoText: {
    color: "white",
    fontSize: 28,
    fontWeight: "500",
    letterSpacing: 8,
  },
  section: {
    height: height - 180, // Adjust for header and tab bar
    position: "relative",
  },
  sectionImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  exploreButton: {
    borderWidth: 1,
    borderColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  exploreButtonText: {
    color: "white",
    fontSize: 16,
    letterSpacing: 1,
  },
  footer: {
    padding: 40,
    backgroundColor: "#000",
  },
  footerText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  servicesSection: {
    backgroundColor: '#000',
  },
  servicesTitle: {
    fontSize: 28,
    marginBottom: 40,
  },
  serviceItem: {
    alignItems: 'center',
    marginBottom: 40,
  },
  serviceIcon: {
    fontSize: 40,
    marginBottom: 20,
  },
  serviceItemTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  serviceItemText: {
    marginBottom: 0,
    fontSize: 14,
  },
});