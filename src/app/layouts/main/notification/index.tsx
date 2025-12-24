import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Space } from '@truckmitr/src/app/components';
import { FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { hitSlop, isIOS } from '@truckmitr/src/app/functions';
import { useTranslation } from 'react-i18next';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

const NOTIFICATIONS = [
  { title: 'New Message', subtitle: 'You have received a new message from support.', time: 'Just now' },
  { title: 'App Update', subtitle: 'A new version of the app is available for download.', time: '5 mins ago' },
  { title: 'Payment Received', subtitle: 'Your recent transaction has been successfully processed.', time: '10 mins ago' },
  { title: 'Reminder', subtitle: 'Don’t forget to complete your pending tasks.', time: '30 mins ago' },
  { title: 'Offer Alert', subtitle: 'Exclusive discount available for a limited time!', time: '1 hour ago' },
  { title: 'Security Alert', subtitle: 'Your password was changed successfully.', time: '2 hours ago' },
  { title: 'New Connection', subtitle: 'John Doe has sent you a friend request.', time: '3 hours ago' },
  { title: 'System Maintenance', subtitle: 'Scheduled maintenance will take place at midnight.', time: '5 hours ago' },
  { title: 'Feedback Request', subtitle: 'We would love to hear your feedback on our service.', time: 'Yesterday' },
  { title: 'Subscription Expiry', subtitle: 'Your subscription is about to expire in 3 days.', time: '2 days ago' },
  { title: 'New Feature', subtitle: 'Check out our brand new dark mode feature!', time: '3 days ago' },
  { title: 'Event Reminder', subtitle: 'Your upcoming event starts in an hour.', time: '4 days ago' },
  { title: 'Referral Bonus', subtitle: 'You earned $10 for referring a friend!', time: '1 week ago' },
];



export default function Notification() {
  const { t } = useTranslation();
  const colors = useColor();
  const safeAreaInsets = useSafeAreaInsets();
  const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
  const navigation = useNavigation<NavigatorProp>();
  const { shadow } = useShadow()

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
        <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{t(`notifications`)}</Text>
      </View>
      <FlatList
        data={NOTIFICATIONS}
        renderItem={({ item, index }: any) => {
          return (
            <TouchableOpacity activeOpacity={.9} onPress={_selectlanguage(item)} style={{ width: '100%', backgroundColor: colors.white, padding: responsiveFontSize(2), borderRadius: 10, marginBottom: responsiveFontSize(2), ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.4), }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: responsiveFontSize(2), color: colors.black, fontWeight: '500' }}>{item.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name={'clock-time-eight-outline'} size={14} color={colors.blackOpacity(.4)} />
                  <Text style={{ fontSize: responsiveFontSize(1.6), color: colors.blackOpacity(.4), fontWeight: '500', marginStart: responsiveFontSize(.2) }}>{item.time}</Text>
                </View>
              </View>
              <Text style={{ fontSize: responsiveFontSize(1.9), color: colors.blackOpacity(.8), fontWeight: '400', marginTop: responsiveFontSize(.5) }}>{item.subtitle}</Text>
            </TouchableOpacity>
          )
        }}
        style={{}}
        contentContainerStyle={{ paddingHorizontal: responsiveWidth(2.5), paddingVertical: responsiveWidth(5) }}
        keyExtractor={(item, index) => index.toString()}
      />
      <Space style={{ flex: 1 }} />
      <View style={{ backgroundColor: colors.royalBlue }}>
        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.6), textAlign: 'center', margin: responsiveFontSize(1.5) }}>{`© 2025 TruckMitr Corporate Services Private Limited. \nAll Rights Reserved.`}</Text>
        <Space height={safeAreaInsets.bottom} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({})