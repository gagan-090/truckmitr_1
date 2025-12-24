import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
import { useColor, useImage, useResponsiveScale } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStatusBarStyle } from '@truckmitr/src/app/hooks/index';
import { Space } from '@truckmitr/src/app/components';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;
import LinearGradient from 'react-native-linear-gradient'
import { useTranslation } from 'react-i18next';
import { setupFirebaseNotifications } from '@truckmitr/src/utils/notification';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { currentLocationDetails } from '@truckmitr/src/utils/maps/location/location.detail';

export default function Welcome() {
    const { t } = useTranslation();
    const { responsiveFontSize, responsiveHeight, responsiveWidth } = useResponsiveScale()
    const safeAreaInsets = useSafeAreaInsets()
    const navigation = useNavigation<NavigatorProp>();
    useStatusBarStyle('dark-content')
    const colors = useColor();
    const images = useImage()
    const imageColorGradient = ['#3D5EE1', '#18A9B3']

    const _currentLocationDetails = async () => {
        const locationData = await currentLocationDetails();
        console.log(locationData, '------------- locationData')
    };

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                await _currentLocationDetails();
                const token = await setupFirebaseNotifications();
                if (!isMounted) return;
                if (token) {
                    const formData = new FormData();
                    formData.append('fcm_token', token);
                    formData.append('device_type', Platform.OS);
                    await axiosInstance.post(END_POINTS.PUBLIC_SAVE_FCM_TOKEN, formData);
                }
            } catch (err) {
                console.log('[FCM] token fetch/save failed:', err);
            }
        })();
        return () => { isMounted = false; }
    }, []);



    const _navigateLogin = () => {
        navigation.navigate(STACKS.LOGIN)
    }
    const _navigateSignup = () => {
        navigation.navigate(STACKS.SIGNUP)
    }
    return (
        <View style={{ flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
            <Space height={safeAreaInsets.top} />
            <Image style={{ height: responsiveHeight(25), width: responsiveWidth(60), resizeMode: 'contain' }} source={images.TRUCKMITR_HORIZONTAL} />
            <TouchableOpacity onPress={_navigateLogin} activeOpacity={.7} style={{ height: responsiveHeight(6), width: responsiveWidth(90), borderRadius: 100, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <LinearGradient start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }} style={{ height: '100%', width: '100%', position: 'absolute' }} colors={imageColorGradient} />
                <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t(`login`)}</Text>
            </TouchableOpacity>
            <Space height={responsiveHeight(1.5)} />
            <TouchableOpacity onPress={_navigateSignup} activeOpacity={.7} style={{ height: responsiveHeight(6), width: responsiveWidth(90), borderRadius: 100, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <LinearGradient start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }} style={{ height: '100%', width: '100%', position: 'absolute' }} colors={imageColorGradient} />
                <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t(`registerNow`)}</Text>
            </TouchableOpacity>
            <Space height={responsiveHeight(20)} />
        </View>
    )
}
