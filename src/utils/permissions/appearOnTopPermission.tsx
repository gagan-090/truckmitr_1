import { Platform, Linking } from 'react-native';

export const openOverlayPermission = async () => {
  if (Platform.OS !== 'android') return;

  const packageName = 'com.truckmitr';

  try {
    // ✅ Correct URI
    console.log(` trying ----------------android.settings.action.MANAGE_OVERLAY_PERMISSION:package=${packageName}`);
    
    await Linking.openURL(
      `android.settings.action.MANAGE_OVERLAY_PERMISSION:package=${packageName}`
    );
  } catch (e) {
     console.log(` error------------`);
    // fallback → app details page
    await Linking.openSettings();
  }
};
