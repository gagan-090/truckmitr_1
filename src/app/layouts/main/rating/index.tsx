import { FlatList, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop, isIOS } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { useSelector } from 'react-redux';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { useTranslation } from 'react-i18next';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function Rating() {
  const { t } = useTranslation();
  const colors = useColor();
  const safeAreaInsets = useSafeAreaInsets();
  const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
  const navigation = useNavigation<NavigatorProp>();
  const { shadow } = useShadow();
  const { user } = useSelector((state: any) => { return state?.user })

  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setloading] = useState(false)

  const [selectedRating, setSelectedRating] = useState(5);

  const _goback = () => {
    navigation.goBack()
  }

  const submitFeedback = async () => {
    if (!selectedRating || feedback === '') {
      showToast('Please provide a rating and feedback.');
      return;
    }
    setloading(true)
    const tagsString = selectedTags.join(', ');
    const formData = new FormData();
    formData.append('rating', selectedRating.toString());
    formData.append('tags', tagsString);
    formData.append('feedback', feedback);
    formData.append('user_id', user?.id);

    try {
      const response = await axiosInstance.post(END_POINTS.REATE_US, formData);
      if (response?.data?.status) {
        showToast(response?.data?.message)
        _goback()
      }
    } catch (error) {
      console.error(error);
    } finally {
      setloading(false)
    }
  };


  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <Space height={safeAreaInsets.top} />
      <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
        <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
          <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
        </TouchableOpacity>
        <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{t('rateUs')}</Text>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
          <Space height={responsiveFontSize(2)} />
          <View style={{ width: responsiveWidth(90), backgroundColor: colors.white, alignItems: 'center', alignSelf: 'center', borderRadius: 10, padding: responsiveFontSize(2), ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.4) }}>
            <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.4), fontWeight: '500' }}>{t('overallExperience')}</Text>
            <View style={{ flexDirection: 'row', marginVertical: responsiveFontSize(2) }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setSelectedRating(star)} style={{ padding: responsiveFontSize(2) }}>
                  <AntDesign name={selectedRating >= star ? 'star' : 'staro'} size={32} color={selectedRating >= star ? colors.yellow : colors.blackOpacity(.5)} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
              <Text style={{ color: colors.blackOpacity(.7), fontSize: responsiveFontSize(1.8) }}>{t('dissatisfied')}</Text>
              <Text style={{ color: colors.blackOpacity(.7), fontSize: responsiveFontSize(1.8) }}>{t('verySatisfied')}</Text>
            </View>
          </View>
          <Space height={responsiveFontSize(5)} />
          <FlatList
            numColumns={3}
            inverted
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            data={['Enjoyable', 'Intuitive', 'Easy to use', 'Good performance', 'Vivid Colours']}
            renderItem={({ item }) => {
              const isSelected = selectedTags.includes(item);
              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedTags(prev =>
                      prev.includes(item) ? prev.filter(tag => tag !== item) : [...prev, item]
                    );
                  }}
                  style={{
                    backgroundColor: isSelected ? colors.royalBlue : colors.blackOpacity(.05),
                    margin: responsiveFontSize(.5),
                    paddingVertical: responsiveFontSize(.8),
                    paddingHorizontal: responsiveFontSize(2),
                    borderRadius: 100,
                  }}>
                  <Text style={{ color: isSelected ? colors.white : colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}

            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: responsiveWidth(2.5) }}
            keyExtractor={(item, index) => index.toString()}
          />
          <Space height={responsiveFontSize(5)} />
          <TextInput
            multiline
            value={feedback}
            onChangeText={setFeedback}
            placeholder={t("writeUourFeedback")}
            placeholderTextColor={colors.blackOpacity(0.5)}
            style={{
              width: responsiveWidth(90),
              alignSelf: 'center',
              minHeight: responsiveHeight(14),
              textAlignVertical: 'top',
              color: colors.black,
              fontSize: responsiveFontSize(1.8),
              borderColor: colors.blackOpacity(.2),
              borderWidth: 1,
              borderRadius: 10,
              padding: responsiveFontSize(2)
            }}
          />

          <Space height={responsiveFontSize(4)} />
          <TouchableOpacity onPress={submitFeedback} activeOpacity={.7} style={{ height: responsiveHeight(6), width: responsiveWidth(90), backgroundColor: colors.royalBlue, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', borderRadius: 8 }}>
            {loading ?
              <ActivityIndicator color={colors.white} size="small" />
              : <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t('send')}</Text>}
          </TouchableOpacity>
          <Space style={{ flex: 1 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={{ width: responsiveWidth(100), backgroundColor: colors.royalBlue }}>
        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.6), textAlign: 'center', margin: responsiveFontSize(1.5) }}>{`© 2026 TruckMitr Corporate Services Private Limited. \nAll Rights Reserved.`}</Text>
        <Space height={safeAreaInsets.bottom} />
      </View>
    </View>
  )
}
