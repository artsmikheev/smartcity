const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  // NativeWind virtual-file events use the pre-SDK57 Metro change signature.
  // Official disk-backed mode avoids undefined.addedFiles; JS HMR stays native.
  forceWriteFileSystem: true,
});
