const { withEntitlementsPlist } = require("expo/config-plugins");

/**
 * Config plugin to add Apple Pay entitlements
 * @param config - Expo config
 * @param {Object} props - Plugin properties
 * @param {string} props.merchantId - Apple Merchant ID
 * @returns {Object} Updated Expo config
 */
const withApplePayEntitlement = (config, { merchantId }) => {
  return withEntitlementsPlist(config, (config) => {
    // Ensure the 'com.apple.developer.in-app-payments' key exists and is an array
    if (!config.modResults['com.apple.developer.in-app-payments']) {
      config.modResults['com.apple.developer.in-app-payments'] = [];
    }
    
    // Add the merchant ID if it's not already present
    const merchantIds = config.modResults['com.apple.developer.in-app-payments'];
    if (!merchantIds.includes(merchantId)) {
      merchantIds.push(merchantId);
    }
    return config;
  });
};

module.exports = withApplePayEntitlement; 