import { PermissionsAndroid, Platform } from 'react-native';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import Geolocation from '@react-native-community/geolocation';
import { showToast } from '@truckmitr/src/app/hooks/toast';

export const locationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
        try {
            const enableResult = await promptForEnableLocationIfNeeded();
            if (enableResult === 'enabled' || enableResult === 'already-enabled') {
                if (Platform.Version < 23) return true;
                const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                if (hasPermission) return true;

                const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                if (status === PermissionsAndroid.RESULTS.GRANTED) return true;

                if (status === PermissionsAndroid.RESULTS.DENIED) {
                    showToast('Location permission denied.');
                } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                    showToast('Please enable your location for a better experience');
                }
                return false;
            }
        } catch (err: any) {
            if (err.code === 'ERR00') {
                showToast('Please enable your location for a better experience.');
            } else if (err.code === 'ERR01') {
                showToast('Please enable your location manually from settings.');
            } else {
                showToast(`Error: ${err.message}`);
            }
            return false;
        }
    } else {
        try {
            const locationPermission = (): Promise<boolean> => {
                return new Promise((resolve, reject) => {
                    Geolocation.requestAuthorization(
                        () => {
                            resolve(true); // Permission granted
                        },
                        (error) => {
                            showToast('Please enable your location for a better experience');
                            console.log(error)
                            reject(false); // Permission denied or error
                        }
                    );
                })
            }
            return locationPermission()
        } catch (err: any) {
            showToast(`Error: ${err.message}`);
            return false;
        }
    }
    return false;
};