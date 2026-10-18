/** Public native configuration. Never put privileged server keys in this file. */
module.exports = ({config}) => {
  const androidMapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  return {
    ...config,
    android: {...config.android, package: 'com.buchanzsteam.fairway'},
    plugins: [...(config.plugins || []), ...(androidMapsKey ? [['react-native-maps', {androidGoogleMapsApiKey: androidMapsKey}]] : [])],
  };
};
