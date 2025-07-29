const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure JS and TS files are properly handled
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

// Add better error handling for modules
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config; 