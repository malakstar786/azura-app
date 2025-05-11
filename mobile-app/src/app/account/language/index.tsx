import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore, Language } from '../../../store/language-store';

export default function LanguageScreen() {
  const { currentLanguage, setLanguage, isLoading } = useLanguageStore();

  const handleLanguageChange = async (language: Language) => {
    await setLanguage(language);
    
    // Navigate back to the account screen
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>LANGUAGE</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.languagesContainer}>
        <TouchableOpacity
          style={[
            styles.languageOption,
            currentLanguage === 'en' && styles.selectedLanguage,
          ]}
          onPress={() => handleLanguageChange('en')}
        >
          <Text
            style={[
              styles.languageText,
              currentLanguage === 'en' && styles.selectedLanguageText,
            ]}
          >
            English
          </Text>
          {currentLanguage === 'en' && (
            <Ionicons name="checkmark" size={24} color="black" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.languageOption,
            currentLanguage === 'ar' && styles.selectedLanguage,
          ]}
          onPress={() => handleLanguageChange('ar')}
        >
          <Text
            style={[
              styles.languageText,
              currentLanguage === 'ar' && styles.selectedLanguageText,
            ]}
          >
            العربية
          </Text>
          {currentLanguage === 'ar' && (
            <Ionicons name="checkmark" size={24} color="black" />
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  languagesContainer: {
    padding: 20,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 15,
  },
  selectedLanguage: {
    borderColor: '#000',
    backgroundColor: '#f5f5f5',
  },
  languageText: {
    fontSize: 18,
  },
  selectedLanguageText: {
    fontWeight: '600',
  },
}); 