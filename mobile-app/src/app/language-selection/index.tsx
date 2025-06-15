import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguageStore } from '@store/language-store';
import { useTranslation } from '@utils/translations';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@theme';
import { getFlexDirection } from '@utils/rtlStyles';

const LanguageSelection = () => {
  const router = useRouter();
  const { setLanguage, setIsFirstTimeUser, currentLanguage } = useLanguageStore();
  const { t } = useTranslation();

  const handleLanguageSelection = async (language: 'en' | 'ar') => {
    console.log(`Selected language: ${language}`);
    
    // Update language and mark as not first-time user
    await setLanguage(language);
    setIsFirstTimeUser(false);
    
    // Navigate to the shop screen
    console.log("Navigating to shop screen");
    router.replace('/(shop)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('app.name')}</Text>
        </View>
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
                  <Ionicons name="checkmark" size={16} color={theme.colors.white} />
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
                  <Ionicons name="checkmark" size={16} color={theme.colors.black} />
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
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xxl,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: theme.typography.weights.bold as any,
    letterSpacing: 8,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  selectionContainer: {
    width: '100%',
    marginStart: -20,
    paddingHorizontal: theme.spacing.lg,
    marginTop: 'auto',
    marginBottom: 75,
  },
  selectText: {
    fontSize: 28,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  helpText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xs,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.black,
    width: '100%',
    marginVertical: theme.spacing.lg,
  },
  buttonsContainer: {
    flexDirection: getFlexDirection('row'),
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  languageButton: {
    width: '48%',
    height: 140,
    borderWidth: 1,
    borderColor: theme.colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedButton: {
    backgroundColor: theme.colors.buttonPrimary,
  },
  languageText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  englishText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold as any,
  },
  arabicText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  checkIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 