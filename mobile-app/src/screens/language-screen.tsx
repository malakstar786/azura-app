import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguageStore, Language } from '../store/language-store';
import { useTranslation } from '../utils/translations';
import { Ionicons } from '@expo/vector-icons';

export default function LanguageScreen() {
  const { setLanguage, currentLanguage } = useLanguageStore();
  const { t } = useTranslation();

  const handleLanguageSelect = async (language: Language) => {
    await setLanguage(language);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>{t('app.name')}</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('language.select')}</Text>
          <Text style={styles.subtitle}>{t('language.subtitle')}</Text>
        </View>

        <View style={styles.languagesContainer}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              styles.englishButton,
              currentLanguage === 'en' && styles.selectedEnglishButton,
            ]}
            onPress={() => handleLanguageSelect('en')}
          >
            <Text style={styles.englishText}>{t('language.english')}</Text>
            {currentLanguage === 'en' && (
              <View style={styles.checkmarkContainer}>
                <Ionicons name="checkmark" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageButton,
              styles.arabicButton,
              currentLanguage === 'ar' && styles.selectedArabicButton,
            ]}
            onPress={() => handleLanguageSelect('ar')}
          >
            <Text style={styles.arabicText}>{t('language.arabic')}</Text>
            {currentLanguage === 'ar' && (
              <View style={styles.checkmarkContainer}>
                <Ionicons name="checkmark" size={20} color="black" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: 2,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
  },
  languagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  languageButton: {
    width: '48%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    position: 'relative',
  },
  englishButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  arabicButton: {
    backgroundColor: '#fff',
    borderColor: '#000',
  },
  selectedEnglishButton: {
    backgroundColor: '#000',
  },
  selectedArabicButton: {
    backgroundColor: '#fff',
  },
  englishText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  arabicText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '500',
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
}); 