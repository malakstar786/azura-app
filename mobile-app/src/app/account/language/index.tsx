import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from '@store/language-store';
import { useTranslation } from '@utils/translations';
import { getFlexDirection } from '@utils/rtlStyles';

export default function LanguageScreen() {
  const { currentLanguage, setLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>(currentLanguage);

  // Track when language is actually changed
  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  const handleLanguageChange = async (language: 'en' | 'ar') => {
    // Only update if actually changing
    if (language !== currentLanguage) {
      setSelectedLanguage(language);
      await setLanguage(language);
      
      // Show confirmation and navigate back
      Alert.alert(
        language === 'en' ? 'Language Updated' : 'تم تحديث اللغة',
        language === 'en' 
          ? 'The app language has been changed to English.'
          : 'تم تغيير لغة التطبيق إلى العربية.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Navigate home first to refresh content with new language
              router.push('/(shop)');
            }
          }
        ]
      );
    } else {
      // If same language selected, just go back
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: t('account.language'),
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }} 
      />

      <View style={styles.content}>
        <Text style={styles.title}>{t('language.select')}</Text>
        <Text style={styles.subtitle}>{t('language.subtitle')}</Text>
        
        <View style={styles.divider} />
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[
              styles.languageButton, 
              selectedLanguage === 'en' && styles.selectedButton
            ]} 
            onPress={() => handleLanguageChange('en')}
          >
            <Text style={selectedLanguage === 'en' ? styles.selectedText : styles.languageText}>
              {t('language.english')}
            </Text>
            {selectedLanguage === 'en' && (
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={16} color="black" />
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.languageButton,
              selectedLanguage === 'ar' && styles.selectedButton
            ]} 
            onPress={() => handleLanguageChange('ar')}
          >
            <Text style={selectedLanguage === 'ar' ? styles.selectedText : styles.languageText}>
              {t('language.arabic')}
            </Text>
            {selectedLanguage === 'ar' && (
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={16} color="black" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
    marginVertical: 20,
  },
  buttonsContainer: {
    flexDirection: getFlexDirection('row'),
    justifyContent: 'space-between',
    marginTop: 20,
  },
  languageButton: {
    width: '48%',
    height: 140,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
  },
  languageText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  checkIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 