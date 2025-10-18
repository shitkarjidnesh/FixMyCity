module.exports = {
  presets: ["babel-preset-expo"],
  plugins: [
    "react-native-reanimated/plugin", // Only this, no worklets/plugin
  ],
};
