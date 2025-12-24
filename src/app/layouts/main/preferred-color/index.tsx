import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useColor, useResponsiveScale } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Space } from '@truckmitr/src/app/components';
import { FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { hitSlop } from '@truckmitr/src/app/functions';
import { useTranslation } from 'react-i18next';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

const LANGUAGES = [
  { name: 'Voilet' },
  { name: 'Green' },
  { name: 'Blue' },
  { name: 'Yellow' },
  { name: 'Orange' },
]

export default function PreferredColor() {
  const { t } = useTranslation();
  const colors = useColor();
  const safeAreaInsets = useSafeAreaInsets();
  const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
  const navigation = useNavigation<NavigatorProp>();

  const [selectedLanguage, setselectedLanguage] = useState(null);
  const _selectlanguage = (item: any) => () => {
    setselectedLanguage(item.name)
    setTimeout(() => {
      navigation.navigate(STACKS.MAIN)
    }, 200);
  }

  const _goback = () => {
    navigation.goBack()
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <Space height={safeAreaInsets.top} />
      <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
        <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
          <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
        </TouchableOpacity>
        <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{t(`preferredColour`)}</Text>
      </View>
      <Space height={responsiveHeight(2)} />
      <View style={{ width: '100%', padding: responsiveWidth(5), alignItems: 'center' }}>
        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2.6), fontWeight: '600' }}>{t(`selectYourPreferredColour`)}</Text>
        <Text style={{ width: responsiveWidth(85), color: colors.blackOpacity(.7), textAlign: 'center', marginTop: responsiveFontSize(.5) }}>{t(`selectYourPreferredColourSubtitle`)}</Text>
        <Space height={responsiveHeight(5)} />
        <FlatList
          data={LANGUAGES}
          renderItem={({ item, index }: any) => {
            const isSelected = selectedLanguage === item.name;
            return (
              <TouchableOpacity onPress={_selectlanguage(item)} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: isSelected ? colors.royalBlue : colors.royalBlueOpacity(.05), padding: responsiveFontSize(2), borderRadius: 10, marginBottom: responsiveFontSize(2) }}>
                <Ionicons name={isSelected ? 'radio-button-on' : 'radio-button-off'} size={20} color={isSelected ? colors.white : colors.royalBlue} />
                <Text style={{ marginLeft: 10, fontSize: responsiveFontSize(2), color: isSelected ? colors.white : colors.royalBlue, fontWeight: '500' }}>{item.name}</Text>
              </TouchableOpacity>
            )
          }}
          style={{ width: '100%', }}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      <Space style={{ flex: 1 }} />
      <View style={{ backgroundColor: colors.royalBlue }}>
        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.6), textAlign: 'center', margin: responsiveFontSize(1.5) }}>{`© 2025 TruckMitr Corporate Services Private Limited. \nAll Rights Reserved.`}</Text>
        <Space height={safeAreaInsets.bottom} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({})