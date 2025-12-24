module.exports = {
  presets: [
    'module:@react-native/babel-preset'
  ],
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
  plugins: [
    [
      'module-resolver',
      {
        extensions: [
          '.ios.js',
          '.android.js',
          '.ios.jsx',
          '.android.jsx',
          '.js',
          '.jsx',
          '.json',
          '.ts',
          '.tsx',
        ],
        root: ['.'],
        alias: {
          '@truckmitr/src': './src',
          '@truckmitr/layouts': './src/app/layouts',
          '@truckmitr/modals': './src/app/modals',
          '@truckmitr/stacks': './src/stacks',
          '@truckmitr/routes': './src/routes',
          '@truckmitr/res': './src/res',
          '@truckmitr/redux': './src/redux',
          '@truckmitr/functions': './src/app/functions',
          '@truckmitr/hooks': './src/app/hooks',
          '@truckmitr/components': './src/app/components',
          '@truckmitr/permissions': './src/app/permissions',
          '@truckmitr/location': './src/app/location',
          '@truckmitr/assets': './src/assets',
          '@truckmitr/lib': './src/lib',
          '@truckmitr/utils': './src/utils',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
