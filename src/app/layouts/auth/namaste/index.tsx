import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { useColor, useImage, useResponsiveScale } from '@truckmitr/src/app/hooks'
import { Space } from '@truckmitr/src/app/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useStatusBarStyle from '@truckmitr/src/app/hooks/statusBarStyle';
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function Namaste() {
  const { t } = useTranslation();
  const { responsiveFontSize, responsiveHeight } = useResponsiveScale()
  const safeAreaInsets = useSafeAreaInsets()
  const navigation = useNavigation<NavigatorProp>();
  useStatusBarStyle('dark-content')
  const colors = useColor();
  const images = useImage()

  useEffect(() => {
    setTimeout(() => {
      // navigation.replace(STACKS.INTRO_VIDEO)
      navigation.replace(STACKS.LANGUAGE)
    }, 3000);
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
      <Space height={safeAreaInsets.top} />
      <Image style={{ height: responsiveHeight(34), resizeMode: 'contain' }} source={images.NAMASTE} />
      <Space height={responsiveHeight(5)} />
      <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(4.6), fontWeight: '800', letterSpacing: 7 }}>{t(`namaste`)}</Text>
      <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2.6), fontWeight: '800' }}>{t(`welcomeToTruckMitr`)}</Text>
    </View>
  )
}