module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        [
          'module-resolver',
          {
            root: ['./'],
            alias: {
              '@': './src',
              '@app': './src/app',
              '@assets': './src/assets',
              '@components': './src/components',
              '@store': './src/store',
              '@utils': './src/utils',
              '@types': './src/types',
              '@theme': './src/theme',
            }
          }
        ]
      ]
    };
  };
  