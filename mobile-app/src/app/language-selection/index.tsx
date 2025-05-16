import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguageStore } from '../../store/language-store';
import { useTranslation } from '../../utils/translations';
import { Ionicons } from '@expo/vector-icons';

const LanguageSelection = () => {
  const router = useRouter();
  const { setLanguage, setIsFirstTimeUser, currentLanguage } = useLanguageStore();
  const { t } = useTranslation();

  const handleLanguageSelection = (language: 'en' | 'ar') => {
    console.log(`Selected language: ${language}`);
    
    // Update language and mark as not first-time user
    setLanguage(language);
    setIsFirstTimeUser(false);
    
    // Navigate to the shop screen
    console.log("Navigating to shop screen");
    router.replace('/(shop)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('app.name')}</Text>
        <View style={styles.selectionContainer}>
          <Text style={styles.selectText}>{t('language.select')}</Text>
          <Text style={styles.helpText}>{t('language.subtitle')}</Text>
          <View style={styles.divider} />
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[
                styles.languageButton, 
                currentLanguage === 'en' ? styles.selectedButton : {}
              ]} 
              onPress={() => handleLanguageSelection('en')}
            >
              <Text style={currentLanguage === 'en' ? styles.englishText : styles.languageText}>
                {t('language.english')}
              </Text>
              {currentLanguage === 'en' && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.languageButton,
                currentLanguage === 'ar' ? styles.selectedButton : {}
              ]} 
              onPress={() => handleLanguageSelection('ar')}
            >
              <Text style={currentLanguage === 'ar' ? styles.arabicText : styles.languageText}>
                {t('language.arabic')}
              </Text>
              {currentLanguage === 'ar' && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={16} color="black" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LanguageSelection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 5,
    marginTop: 40,
  },
  selectionContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 'auto',
  },
  selectText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  helpText: {
    fontSize: 14,
    color: '#000',
    marginTop: 5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    marginVertical: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
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
    backgroundColor: '#000',
  },
  languageText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  englishText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  arabicText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 