module.exports = function(api) {
    api.cache(true);
    
    return {
      presets: [
        'babel-preset-expo',
        '@babel/preset-typescript'
      ],
      plugins: [
        '@babel/plugin-transform-flow-strip-types',
        'react-native-reanimated/plugin'
      ],
      env: {
        test: {
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
            '@babel/preset-typescript',
            'babel-preset-expo',
          ],
          plugins: [
            '@babel/plugin-transform-modules-commonjs',
            'dynamic-import-node',
            ['@babel/plugin-transform-runtime', {
              helpers: true,
              regenerator: true
            }]
          ]
        }
      }
    };
  };