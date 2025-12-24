import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import { userEditAction } from '@truckmitr/src/redux/actions/user.action';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import Feather from 'react-native-vector-icons/Feather'
import moment from 'moment';
import DatePicker from 'react-native-date-picker';
import { useTranslation } from 'react-i18next';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;
// Define the route type to receive params (if any) from the previous screen.
type DrivingDetailsRouteProp = RouteProp<NavigatorParams, typeof STACKS.DRIVING_DETAILS>;

const operationalSegment = [
  'E-commerce', 'White Goods', 'Livestock',
  'Perishable', 'Oversized', 'Fuel Tanker',
  'Automobile Carrier', 'Construction Industry',
  'Refrigerator Vehicle', 'Others'
];

export default function DrivingDetailsTransporter() {
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const colors = useColor();
  const safeAreaInsets = useSafeAreaInsets();
  const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
  const navigation = useNavigation<NavigatorProp>();
  const { userEdit } = useSelector((state: any) => { return state?.user })

  const [errors, setErrors] = useState<{
    transportName?: string
    validYearOfEstablishment?: string
  }>({});

  const _goback = () => {
    navigation.goBack();
  };

  function areYearsValid(years: number[] | string[] | number | string | undefined): boolean {
    if (!years) return false;
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 150;
    let yearArray: number[] = [];
    if (Array.isArray(years)) {
      yearArray = years.map(y => Number(y));
    } else {
      yearArray = [Number(years)];
    }
    return yearArray.every(year =>
      !isNaN(year) && year >= minYear && year <= currentYear
    );
  }

  const validate = (): boolean => {
    let valid = true;
    const newErrors: { [key: string]: string } = {};
    if (!userEdit?.Transport_Name) {
      newErrors.transportName = t('transportNameRequired');
      valid = false;
    }
    const year = userEdit?.Year_of_Establishment;
    if (userEdit?.Year_of_Establishment && !areYearsValid(year)) {
      newErrors.validYearOfEstablishment = t('enterValidYearOfEstablishment');
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const _navigateDrivingDetails = () => {
    if (!validate()) return;
    navigation.navigate(STACKS.UPLOAD_DOCUMENTS_TRANSPORTER);
  };

  // Helper to style selectable buttons.
  const getSelectableStyle = (selected: boolean): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center', // <- This is valid, but TS needs to know it's a ViewStyle
    backgroundColor: selected ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
    paddingHorizontal: responsiveFontSize(2),
    paddingVertical: responsiveFontSize(1),
    borderRadius: 100,
  });


  const toggleCategory = (item: any) => {
    if (userEdit?.Operational_Segment?.includes(item)) {
      dispatch(userEditAction({ ...userEdit, Operational_Segment: userEdit?.Operational_Segment?.filter((a: any) => a !== item) }));
    } else {
      dispatch(userEditAction({ ...userEdit, Operational_Segment: userEdit?.Operational_Segment ? [...userEdit?.Operational_Segment, item] : [item] }));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white, alignItems: 'center' }}>
      <Space height={safeAreaInsets.top} />
      <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
        <TouchableOpacity
          hitSlop={hitSlop(10)}
          onPress={_goback}
          style={{
            height: responsiveFontSize(4),
            width: responsiveFontSize(4),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.white,
            borderRadius: 100,
            zIndex: 100,
          }}>
          <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
        </TouchableOpacity>
        <Text
          style={{
            width: responsiveWidth(100),
            fontSize: responsiveFontSize(2.2),
            color: colors.royalBlue,
            fontWeight: 'bold',
            textAlign: 'center',
            position: 'absolute',
            zIndex: 1,
          }}>
          {t('profileEdit')}
        </Text>
      </View>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.white, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={responsiveHeight(30)}>
        <Space height={responsiveFontSize(2)} />
        <View style={{ height: responsiveHeight(5.5), flexDirection: 'row', paddingHorizontal: responsiveWidth(2.5) }}>
          <View style={{ flex: 1, backgroundColor: colors.blackOpacity(0.05), alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
            <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.6), fontWeight: '500', textAlign: 'center' }}>
              {t('personalDetails')}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.blueOpacity(0.2), alignItems: 'center', justifyContent: 'center', borderRadius: 10, marginHorizontal: responsiveWidth(3) }}>
            <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.6), fontWeight: '600', textAlign: 'center' }}>
              {t('drivingDetails')}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.blackOpacity(0.05), alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
            <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.6), fontWeight: '500', textAlign: 'center' }}>
              {t('uploadDocuments')}
            </Text>
          </View>
        </View>
        <Space height={responsiveFontSize(4)} />
        <View style={{ flex: 1, width: responsiveWidth(100), paddingHorizontal: responsiveWidth(5) }}>
          {/* Transport Name */}
          <View>
            <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`transportName`)} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text></Text>
            <TextInput
              value={userEdit?.Transport_Name || ''}
              onChangeText={(text) => {
                dispatch(userEditAction({ ...userEdit, Transport_Name: text }));
                setErrors((prevData) => ({
                  ...prevData,
                  transportName: undefined,
                }));
              }}
              placeholder={t(`enterTransportName`)}
              style={{
                color: colors.black,
                fontSize: responsiveFontSize(2),
                fontWeight: '500',
                height: responsiveHeight(5.5),
                borderColor: colors.blackOpacity(0.2),
                borderWidth: 1,
                borderRadius: 10,
                marginTop: responsiveFontSize(0.5),
                paddingHorizontal: responsiveFontSize(2),
              }}
            />
            {errors?.transportName && (
              <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.transportName}</Text>
            )}
          </View>
          <Space height={responsiveFontSize(2.5)} />

          {/* DOB */}
          <View>
            <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`yearOfEstablishment`)}</Text>
            <TextInput
              value={userEdit?.Year_of_Establishment || ''}
              keyboardType={'numeric'}
              onChangeText={(text) => {
                dispatch(userEditAction({ ...userEdit, Year_of_Establishment: text }));
                setErrors((prevData) => ({
                  ...prevData,
                  validYearOfEstablishment: undefined
                }))
              }}
              placeholder={t('enterYearOfEstablishment')}
              maxLength={4}
              style={{
                color: colors.black,
                fontSize: responsiveFontSize(2),
                fontWeight: '500',
                height: responsiveHeight(5.5),
                borderColor: colors.blackOpacity(0.2),
                borderWidth: 1,
                borderRadius: 10,
                marginTop: responsiveFontSize(0.5),
                paddingHorizontal: responsiveFontSize(2),
              }}
            />
            {errors?.validYearOfEstablishment && (
              <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.validYearOfEstablishment}</Text>
            )}
          </View>

          <Space height={responsiveFontSize(2.5)} />
          {/* Current Monthly Income */}
          <View>
            <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`fleetSize`)}</Text>
            <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(0.5) }}>
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Fleet_Size: '10-50' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Fleet_Size === '10-50')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Fleet_Size === '10-50' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  10-50
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(1.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Fleet_Size: '51-100' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Fleet_Size === '51-100')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Fleet_Size === '51-100' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  51-100
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(1.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Fleet_Size: '101-250' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Fleet_Size === '101-250')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Fleet_Size === '101-250' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  101-250
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(1) }}>
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Fleet_Size: '251-500' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Fleet_Size === '251-500')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Fleet_Size === '251-500' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  251-500
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(1.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Fleet_Size: '501-1000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Fleet_Size === '501-1000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Fleet_Size === '501-1000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  501-1000
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(1.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Fleet_Size: 'Above 1000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Fleet_Size === 'Above 1000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Fleet_Size === 'Above 1000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  Above 1000
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Space height={responsiveFontSize(2.5)} />
          <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`operationalSegment`)}</Text>
          <ScrollView
            horizontal
            style={{
              width: responsiveWidth(100),
              alignSelf: 'center',
              flexGrow: 0,
              padding: responsiveFontSize(0.5),
              paddingHorizontal: responsiveWidth(5),
            }}
            showsHorizontalScrollIndicator={false}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                rowGap: responsiveFontSize(1),
                width: responsiveWidth(120), // Enough to force multiple rows
              }}
            >
              {operationalSegment.map((item: any, index) => {
                const isSelected = userEdit?.Operational_Segment?.includes(item);
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => toggleCategory(item)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isSelected ? colors.blueOpacity(.2) : colors.blackOpacity(.05),
                      paddingHorizontal: responsiveFontSize(2),
                      paddingVertical: responsiveFontSize(1),
                      borderRadius: 100,
                      marginRight: responsiveFontSize(1.5),
                    }}
                  >
                    <Text
                      style={{
                        color: colors.black,
                        fontWeight: isSelected ? '500' : '400',
                        fontSize: responsiveFontSize(1.7),
                        marginStart: responsiveFontSize(.5),
                      }}
                    >
                      {item}
                    </Text>
                    <Feather
                      name={isSelected ? 'check' : 'plus'}
                      size={12}
                      color={isSelected ? colors.royalBlue : colors.black}
                      style={{ marginStart: responsiveFontSize(.5) }}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <Space height={responsiveFontSize(2.5)} />
          <View>
            <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`averageKmRunOfFleet`)}</Text>
            <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(0.5) }}>
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Average_KM: '<5000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Average_KM === '<5000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Average_KM === '<5000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  {`<5000`}
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(1.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Average_KM: '5001-8000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Average_KM === '5001-8000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Average_KM === '5001-8000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  5001-8000
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(1.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Average_KM: '8001-12000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Average_KM === '8001-12000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Average_KM === '8001-12000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  8001-12000
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(1) }}>
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Average_KM: '12001-16000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Average_KM === '12001-16000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Average_KM === '12001-16000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  12001-16000
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(1.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Average_KM: 'More than 16000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Average_KM === 'More than 16000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Average_KM === 'More than 16000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>More than 16000</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Space height={responsiveFontSize(5)} />
          <TouchableOpacity
            onPress={_navigateDrivingDetails}
            activeOpacity={0.7}
            style={{
              height: responsiveHeight(5.8),
              width: responsiveWidth(90),
              backgroundColor: colors.royalBlue,
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              borderRadius: 8,
            }}>
            <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t('next')}</Text>
          </TouchableOpacity>
          <Space height={responsiveFontSize(10)} />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
