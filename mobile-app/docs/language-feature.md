# Language Functionality

## Overview

The language functionality allows users to choose between English and Arabic for the app interface and content. The implementation handles both UI text translations and retrieves localized content from the API.

## Key Features

1. **First-time Language Selection**: When users first open the app, they are prompted to choose their preferred language (English or Arabic) after the splash screen.

2. **Language Settings in Account**: Users can change their language preference anytime from the Account tab.

3. **API Integration**: The app passes the appropriate language parameter to the API to retrieve content in the selected language.

4. **UI Translations**: The app includes a translation system for UI elements that aren't directly from the API.

## Implementation Details

### Language Store

The language functionality is implemented using Zustand for state management. The store (`language-store.ts`) handles:

- Storing the current language preference (English or Arabic)
- Tracking if it's the user's first time using the app
- Saving language preferences to AsyncStorage for persistence
- Initializing the language state on app startup

### Language Selection UI

- **First-time Selection**: `language-selection.tsx` component shown after the splash screen for new users
- **Language Settings**: `/app/account/language/index.tsx` screen accessible from the Account tab

### API Integration

The API service has been updated to include the language parameter (`language=ar`) for Arabic content. All product-related API calls consider the current language preference.

### UI Translations

The translations utility (`translations.ts`) provides:

- A mapping of UI text keys to their English and Arabic translations
- A React hook (`useTranslation`) for use in components
- A direct function (`getTranslation`) for use outside of React components

## How to Use

### In Components

```jsx
import { useTranslation } from '../utils/translations';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('account.title')}</Text>
      <Button title={t('cart.checkout')} />
    </View>
  );
}
```

### In API Calls

The API service automatically includes the language parameter based on the current language preference. No additional code is needed when making API calls.

## Adding New Translations

To add new translations:

1. Open `src/utils/translations.ts`
2. Add new key-value pairs to the translations object:

```typescript
'your.new.key': {
  en: 'English text',
  ar: 'Arabic text',
},
```

## Testing

You can test the language functionality by:

1. Clearing the app data to trigger the first-time user experience
2. Changing the language from the Account tab
3. Verifying that both UI elements and API content change based on the selected language

## Design Considerations

- RTL (Right-to-Left) support for Arabic is handled by React Native's built-in RTL support
- The language selection affects both the UI language and the API content language
- The implementation separates concerns: language state management, UI translations, and API integration 