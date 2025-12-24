import { Platform, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';

/**
 * Request camera permission
 * @returns Promise<boolean> - true if granted, false otherwise
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;

    const result = await check(permission);

    if (result === RESULTS.GRANTED) {
      return true;
    }

    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }

    if (result === RESULTS.BLOCKED) {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera permission in your device settings to take photos.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }

    return false;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

/**
 * Request photo library permission for Android 13+
 * @returns Promise<boolean> - true if granted, false otherwise
 */
export const requestPhotoLibraryPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
      const result = await check(permission);

      if (result === RESULTS.GRANTED) {
        return true;
      }

      if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        return requestResult === RESULTS.GRANTED;
      }

      if (result === RESULTS.BLOCKED) {
        Alert.alert(
          'Photo Library Permission Required',
          'Please enable photo library access in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }

      return false;
    }

    // Android
    const androidVersion = Platform.Version as number;

    // Android 13+ (API 33+)
    if (androidVersion >= 33) {
      // On Android 13+, if using the Photo Picker (which react-native-image-crop-picker supports),
      // we do NOT need READ_MEDIA_IMAGES permission.
      // We return true to allow the picker to open.
      return true;
    }

    // Android 10-12 (API 29-32)
    const permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    const result = await check(permission);

    if (result === RESULTS.GRANTED) {
      return true;
    }

    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }

    if (result === RESULTS.BLOCKED) {
      Alert.alert(
        'Storage Permission Required',
        'Please enable storage access in your device settings to select images.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }

    return false;
  } catch (error) {
    console.error('Error requesting photo library permission:', error);
    return false;
  }
};

/**
 * Check if we have necessary permissions for image picker
 * @returns Promise<boolean>
 */
export const hasImagePickerPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      return result === RESULTS.GRANTED;
    }

    const androidVersion = Platform.Version as number;

    if (androidVersion >= 33) {
      // No explicit permission needed for Photo Picker on Android 13+
      return true;
    }

    const result = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error('Error checking image picker permissions:', error);
    return false;
  }
};
