module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        [
          'module-resolver',
          {
            root: ['./src'],
            alias: {
              '@': './src',
              '@assets': './assets',
              '@components': './src/components',
              '@utils': './src/utils',
              '@types': './src/types',
              '@store': './src/store',
            }
          }
        ]
      ]
    };
  };
  