const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const libraryRoot = path.resolve(__dirname, '..');

const config = getDefaultConfig(projectRoot);

// Watch the library source one level up (linked via "file:..").
config.watchFolders = [libraryRoot];

// Resolve every dependency (react, react-native, skia, reanimated, ...)
// from the example's node_modules only, so the library's own node_modules
// can't introduce a duplicate React instance.
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [path.join(projectRoot, 'node_modules')];

module.exports = config;
