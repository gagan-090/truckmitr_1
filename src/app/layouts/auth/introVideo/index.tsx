import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import Video from 'react-native-video'
import { VIDEO } from '@truckmitr/src/res/video'
import { useTranslation } from 'react-i18next';
import { useColor, useImage, useResponsiveScale, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigatorParams, STACKS } from '@truckmitr/src/stacks/stacks';
import { Space } from '@truckmitr/src/app/components';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function IntroVideo() {
    const { t } = useTranslation();
    const { responsiveFontSize, responsiveHeight, responsiveWidth, responsiveScreenHeight, responsiveScreenWidth } = useResponsiveScale()
    const safeAreaInsets = useSafeAreaInsets()
    const navigation = useNavigation<NavigatorProp>();
    useStatusBarStyle('dark-content')
    const colors = useColor();
    const images = useImage()

    const [videoEnded, setVideoEnded] = useState(false);
    const [paused, setPaused] = useState(false);

    // Pause video when screen is not focused
    useFocusEffect(
        useCallback(() => {
            setPaused(false); // Resume when screen is focused
            return () => {
                setPaused(true); // Pause when screen is unfocused
            };
        }, [])
    );

    const handleSkip = () => {
        setPaused(true); // Stop video before navigating
        navigation.navigate(STACKS.LANGUAGE)
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.white }}>
            <Space height={safeAreaInsets.top} />
            <Space height={responsiveHeight(2)} />
            <Image style={{ height: responsiveHeight(7), width: responsiveWidth(60), resizeMode: 'contain' }} source={images.TRUCKMITR_HORIZONTAL} />
            <Space height={responsiveHeight(2)} />
            <View style={{ height: responsiveHeight(60), width: responsiveWidth(60), alignItems: 'center', justifyContent: 'center', borderRadius: 20, overflow: 'hidden' }}>
                {!videoEnded && <Video
                    source={VIDEO.INTRO_VIDEO}
                    style={{ height: responsiveHeight(50), width: responsiveWidth(50), position: 'absolute', backgroundColor: colors.white }}
                    resizeMode="cover"
                    controls={false}
                    repeat={false}
                    muted={false}
                    paused={paused}
                    playInBackground={false}
                    ignoreSilentSwitch="obey"
                    onEnd={() => {
                        setVideoEnded(true)
                        navigation.navigate(STACKS.LANGUAGE)
                    }}
                />}
                <Image
                    style={{ height: responsiveHeight(60), width: responsiveWidth(60), resizeMode: 'contain' }}
                    source={{ uri: `https://storage.googleapis.com/brandbird/mockups/iphone-16/iPhone%2016%20-%20Black%20-%20Portrait.png` }} />
            </View>
            <Space height={responsiveHeight(4)} />
            <Text style={{ width: responsiveWidth(90), color: colors.blackOpacity(1), fontSize: responsiveFontSize(2), fontWeight: '800', textAlign: 'center' }}>{`TruckMitr ऐप पर कैसे रजिस्टर करें, आइए जानें।`}</Text>
            <Text style={{ width: responsiveWidth(90), color: colors.blackOpacity(1), fontSize: responsiveFontSize(2), fontWeight: '800', textAlign: 'center' }}>{`How to register on TruckMitr App. Let's learn.`}</Text>
            <Space style={{ flex: 1 }} />
            <TouchableOpacity onPress={handleSkip} style={{ width: responsiveWidth(90), height: responsiveHeight(6), backgroundColor: colors.royalBlueOpacity(1), alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
                <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '500', color: colors.white }}>{'Skip'}</Text>
            </TouchableOpacity>
            <Space height={safeAreaInsets.bottom + responsiveHeight(7)} />
        </View>
    )
}
