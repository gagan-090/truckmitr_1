import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useColor, useResponsiveScale } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Space } from '@truckmitr/src/app/components';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { hitSlop } from '@truckmitr/src/app/functions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useTranslation } from 'react-i18next';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function Settings() {
  const { t } = useTranslation();
  const colors = useColor();
  const safeAreaInsets = useSafeAreaInsets();
  const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
  const navigation = useNavigation<NavigatorProp>();

  const _goback = () => {
    navigation.goBack()
  }
  const _navigateLanguage = () => {
    navigation.navigate(STACKS.LANGUAGE_MAIN)
  }
  const _navigatePreferredColour = () => {
    navigation.navigate(STACKS.PREFERRED_COLOR)
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <Space height={safeAreaInsets.top} />
      <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
        <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
          <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
        </TouchableOpacity>
        <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{t(`settings`)}</Text>
      </View>
      <Space height={responsiveHeight(1)} />

      <TouchableOpacity onPress={_navigateLanguage} style={{ width: responsiveWidth(100), flexDirection: 'row', alignItems: 'center', paddingHorizontal: responsiveWidth(5), paddingVertical: responsiveFontSize(2) }}>
        <Ionicons name={'language'} size={22} color={colors.black} />
        <Text style={{ flex: 1, color: colors.black, fontSize: responsiveFontSize(2), fontWeight: '400', marginHorizontal: responsiveFontSize(2.5) }}>{t('language')}</Text>
        <MaterialIcons name={'keyboard-arrow-right'} size={24} color={colors.blackOpacity(.3)} />
      </TouchableOpacity>
      {/* <TouchableOpacity onPress={_navigatePreferredColour} style={{ width: responsiveWidth(100), flexDirection: 'row', alignItems: 'center', paddingHorizontal: responsiveWidth(5), paddingVertical: responsiveFontSize(2) }}>
        <Ionicons name={'color-palette-outline'} size={22} color={colors.black} />
        <Text style={{ flex: 1, color: colors.black, fontSize: responsiveFontSize(2), fontWeight: '400', marginHorizontal: responsiveFontSize(2.5) }}>{t('preferredColour')}</Text>
        <MaterialIcons name={'keyboard-arrow-right'} size={24} color={colors.blackOpacity(.3)} />
      </TouchableOpacity> */}

      <Space style={{ flex: 1 }} />
      <View style={{ backgroundColor: colors.royalBlue }}>
        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.6), textAlign: 'center', margin: responsiveFontSize(1.5) }}>{`© 2025 TruckMitr Corporate Services Private Limited. \nAll Rights Reserved.`}</Text>
        <Space height={safeAreaInsets.bottom} />
      </View>
    </View>
  )
}