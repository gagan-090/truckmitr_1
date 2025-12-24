import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';
import { AppEventsLogger } from 'react-native-fbsdk-next';

export const initAnalyticsWithDeviceInfo = async () => {
  const hasLogged = await AsyncStorage.getItem('@analytics_device_logged');
  if (hasLogged === 'true') return;

  const info = {
    appBundleId: await DeviceInfo.getBundleId(),
    platform: Platform.OS,
    platformVersion: Platform.Version.toString(),
    deviceName: await DeviceInfo.getDeviceName(),
    model: await DeviceInfo.getModel(),
    brand: await DeviceInfo.getBrand(),
    uniqueId: await DeviceInfo.getUniqueId(),
    appVersion: await DeviceInfo.getVersion(),
    buildNumber: await DeviceInfo.getBuildNumber(),
    manufacturer: await DeviceInfo.getManufacturer(),
    systemVersion: await DeviceInfo.getSystemVersion(),
    isEmulator: (await DeviceInfo.isEmulator()).toString(),
    isTablet: (await DeviceInfo.isTablet()).toString(),
    carrier: (await DeviceInfo.getCarrier()) || 'unknown',
  };

  console.log(info, '==>> DeviceInfo');

  // Firebase Analytics
  await analytics().setUserId(info.uniqueId);
  await analytics().setUserProperties({
    brand: info.brand,
    model: info.model,
    device_name: info.deviceName,
    os: info.platform,
    os_version: info.systemVersion,
    carrier: info.carrier,
    is_emulator: info.isEmulator,
    is_tablet: info.isTablet,
    app_version: info.appVersion,
  });
  await analytics().logEvent('app_first_open_info', info);

  // Facebook Analytics
  AppEventsLogger.logEvent('app_first_open_info', info);

  await AsyncStorage.setItem('@analytics_device_logged', 'true');
};
