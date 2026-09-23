const {getDefaultConfig} = require('@react-native/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  return config;
})();

//v1.1
// const {getDefaultConfig} = require('@react-native/metro-config');

// module.exports = (async () => {
//   const config = await getDefaultConfig(__dirname);
  
//   return {
//     ...config,
//     resolver: {
//       ...config.resolver,
//       extraNodeModules: {
//         'events': require.resolve('events')
//       },
//       assetExts: [...config.resolver.assetExts, 'png', 'jpg', 'jpeg']
//     },
//   };
// })();

//v1.0

// module.exports = (async () => {
//   const config = await getDefaultConfig(__dirname);
  
//   return {
//     ...config,
//     resolver: {
//       ...config.resolver,
//       extraNodeModules: {
//         'events': require.resolve('events')
//       },
//       fallback: {
//         "events": require.resolve("events/")
//       },
//       assetExts: [...config.resolver.assetExts, 'png', 'jpg', 'jpeg'],
//       assets: ['./src/assets']
//     },
//   };
// })();
//const config = {};

//module.exports = mergeConfig(getDefaultConfig(__dirname), config);