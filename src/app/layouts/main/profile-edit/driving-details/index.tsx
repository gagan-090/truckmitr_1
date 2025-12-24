import { Image, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
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
import { Dropdown } from 'react-native-element-dropdown';
import { useDispatch, useSelector } from 'react-redux';
import { userEditAction } from '@truckmitr/src/redux/actions/user.action';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { useTranslation } from 'react-i18next';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;
// Define the route type to receive params (if any) from the previous screen.
type DrivingDetailsRouteProp = RouteProp<NavigatorParams, typeof STACKS.DRIVING_DETAILS>;

const drivingExperienceArray = [
  { label: 'Less than 1 year', value: 'less_than_1' },
  { label: '1 year', value: '1' },
  { label: '2 years', value: '2' },
  { label: '3 years', value: '3' },
  { label: '4 years', value: '4' },
  { label: '5 years', value: '5' },
  { label: '6 years', value: '6' },
  { label: '7 years', value: '7' },
  { label: '8 years', value: '8' },
  { label: '9 years', value: '9' },
  { label: '10 years', value: '10' },
  { label: '11 years', value: '11' },
  { label: '12 years', value: '12' },
  { label: '13 years', value: '13' },
  { label: '14 years', value: '14' },
  { label: '15 years', value: '15' },
  { label: '16 years', value: '16' },
  { label: '17 years', value: '17' },
  { label: '18 years', value: '18' },
  { label: '19 years', value: '19' },
  { label: '20 years', value: '20' },
  { label: '21 years', value: '21' },
  { label: '22 years', value: '22' },
  { label: '23 years', value: '23' },
  { label: '24 years', value: '24' },
  { label: '25 years', value: '25' },
  { label: '26 years', value: '26' },
  { label: '27 years', value: '27' },
  { label: '28 years', value: '28' },
  { label: '29 years', value: '29' },
  { label: '30 years', value: '30' },
  { label: '31 years', value: '31' },
  { label: '32 years', value: '32' },
  { label: '33 years', value: '33' },
  { label: '34 years', value: '34' },
  { label: '35 years', value: '35' },
  { label: '36 years', value: '36' },
  { label: '37 years', value: '37' },
  { label: '38 years', value: '38' },
  { label: '39 years', value: '39' },
  { label: '40 years', value: '40' },
  { label: '41 years', value: '41' },
  { label: '42 years', value: '42' },
  { label: '43 years', value: '43' },
  { label: '44 years', value: '44' },
  { label: '45 years', value: '45' },
  { label: '46 years', value: '46' },
  { label: '47 years', value: '47' },
  { label: '48 years', value: '48' },
  { label: '49 years', value: '49' },
  { label: '50 years', value: '50' },
];


export default function DrivingDetails() {
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const colors = useColor();
  const safeAreaInsets = useSafeAreaInsets();
  const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
  const navigation = useNavigation<NavigatorProp>();
  const route = useRoute<DrivingDetailsRouteProp>();
  const { shadow } = useShadow();
  const { userEdit } = useSelector((state: any) => { return state?.user })

  const [vehicleTypeList, setvehicleTypeList] = useState<any[]>([])
  const [locationsList, setlocationsList] = useState<any[]>([]);

  const getVehicleTypes = async () => {
    try {
      const response = await axiosInstance.get(END_POINTS.VEHICLE_TYPES);
      if (response?.data?.status) {
        setvehicleTypeList(response?.data?.data)
      }
      console.log('Fetched locations:', JSON.stringify(response));
    } catch (error: any) {
      console.log('Error fetching locations:', error);
    }
  };

  const getLocationList = async () => {
    try {
      const response = await axiosInstance.get(END_POINTS.GETSTATES);
      if (response?.data?.status) {
        setlocationsList(response?.data?.data);
      }
      console.log('Fetched locations:', JSON.stringify(response));
    } catch (error: any) {
      console.log('Error fetching locations:', error);
    }
  };

  useEffect(() => {
    getVehicleTypes()
    getLocationList()
  }, [])

  const [errors, setErrors] = useState<{
    vehicleType?: string;
    drivingExperience?: string;
    currentMonthlyIncome?: string;
    expectedMonthlyIncome?: string;
    licenseType?: string;
  }>({});

  const _goback = () => {
    navigation.goBack();
  };

  const validate = (): boolean => {
    let valid = true;
    const newErrors: { [key: string]: string } = {};
    if (!userEdit?.vehicle_type) {
      newErrors.vehicleType = t('vehicleTypeRequired');
      valid = false;
    }
    if (!userEdit?.Driving_Experience) {
      newErrors.drivingExperience = t('drivingExperienceRequired');
      valid = false;
    }
    if (!userEdit?.Current_Monthly_Income) {
      newErrors.currentMonthlyIncome = t('currentMonthlyIncomeRequired');
      valid = false;
    }
    if (!userEdit?.Expected_Monthly_Income) {
      newErrors.expectedMonthlyIncome = t('expectedMonthlyIncomeRequired');
      valid = false;
    }
    if (!userEdit?.Type_of_License) {
      newErrors.licenseType = t('licenseTypeRequired');
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const _navigateDrivingDetails = () => {
    if (!validate()) return;
    // Combine data from profile and driving details
    const combinedData = {
      ...route?.params,
      vehicleType: userEdit?.vehicle_type,
      drivingExperience: userEdit?.Driving_Experience,
      preferredLocation: userEdit?.Preferred_Location,
      currentMonthlyIncome: userEdit?.Current_Monthly_Income,
      expectedMonthlyIncome: userEdit?.Expected_Monthly_Income,
      licenseType: userEdit?.Type_of_License,
      interestedInAbroad: userEdit?.job_placement,
      referenceCheck: userEdit?.previous_employer,
    };
    navigation.navigate(STACKS.UPLOAD_DOCUMENTS, combinedData);
  };

  // Helper to style selectable buttons.
  const getSelectableStyle = (selected: boolean): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center', // <- This is valid, but TS needs to know it's a ViewStyle
    backgroundColor: selected ? colors.blueOpacity(0.2) : colors.blackOpacity(0.05),
    paddingHorizontal: responsiveFontSize(1.2),
    paddingVertical: responsiveFontSize(1),
    borderRadius: 100,
  });

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
          {/* Vehicle Type */}
          <View>
            <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('vehicleType')} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
            </Text>
            <Dropdown
              style={{
                height: responsiveHeight(6),
                paddingHorizontal: responsiveFontSize(1.5),
                borderRadius: 10,
                borderColor: colors.blackOpacity(0.5),
                borderWidth: 1,
                marginTop: responsiveFontSize(0.5),
              }}
              containerStyle={{ borderRadius: 10, backgroundColor: colors.white, ...shadow }}
              itemTextStyle={{ color: colors.blackOpacity(0.8) }}
              placeholderStyle={{
                fontSize: responsiveFontSize(1.9),
                color: colors.blackOpacity(0.7),
                fontWeight: '500',
              }}
              selectedTextStyle={{
                color: colors.blackOpacity(1),
                fontSize: responsiveFontSize(2),
                fontWeight: '500',
              }}
              iconStyle={{ height: responsiveFontSize(2.8), width: responsiveFontSize(2.8) }}
              // data={truckTypes}
              data={vehicleTypeList.length ? vehicleTypeList.map(item => ({ label: item.vehicle_name, value: item.id.toString() })) : []}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={t('selectVehicleType')}
              value={userEdit?.vehicle_type}
              onChange={item => {
                dispatch(userEditAction({ ...userEdit, vehicle_type: item.value }));
                setErrors((prevData) => ({
                  ...prevData,
                  vehicleType: undefined,
                }));
              }}
            />
            {errors?.vehicleType && (
              <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.vehicleType}</Text>
            )}
          </View>
          <Space height={responsiveFontSize(2.5)} />

          {/* Driving Experience */}
          <View>
            <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`drivingExperienceYears`)} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text></Text>
            <Dropdown
              style={{
                height: responsiveHeight(6),
                paddingHorizontal: responsiveFontSize(1.5),
                borderRadius: 10,
                borderColor: colors.blackOpacity(0.5),
                borderWidth: 1,
                marginTop: responsiveFontSize(0.5),
              }}
              containerStyle={{ borderRadius: 10, backgroundColor: colors.white, ...shadow }}
              itemTextStyle={{ color: colors.blackOpacity(0.8) }}
              placeholderStyle={{
                fontSize: responsiveFontSize(1.9),
                color: colors.blackOpacity(0.7),
                fontWeight: '500',
              }}
              selectedTextStyle={{
                color: colors.blackOpacity(1),
                fontSize: responsiveFontSize(2),
                fontWeight: '500',
              }}
              iconStyle={{ height: responsiveFontSize(2.8), width: responsiveFontSize(2.8) }}
              data={drivingExperienceArray}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={t('selectExperience')}
              value={userEdit?.Driving_Experience}
              onChange={item => {
                dispatch(userEditAction({ ...userEdit, Driving_Experience: item.value }));
                setErrors((prevData) => ({
                  ...prevData,
                  drivingExperience: undefined,
                }));
              }}
            />
            {errors?.drivingExperience && (
              <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.drivingExperience}</Text>
            )}
          </View>
          <Space height={responsiveFontSize(2.5)} />

          {/* Preferred Location */}
          <View>
            <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('preferredLocation')}</Text>
            <Dropdown
              style={{
                height: responsiveHeight(6),
                paddingHorizontal: responsiveFontSize(1.5),
                borderRadius: 10,
                borderColor: colors.blackOpacity(0.5),
                borderWidth: 1,
                marginTop: responsiveFontSize(0.5),
              }}
              containerStyle={{ borderRadius: 10, backgroundColor: colors.white, ...shadow }}
              itemTextStyle={{ color: colors.blackOpacity(0.8) }}
              placeholderStyle={{
                fontSize: responsiveFontSize(1.9),
                color: colors.blackOpacity(0.7),
                fontWeight: '500',
              }}
              selectedTextStyle={{
                color: colors.blackOpacity(1),
                fontSize: responsiveFontSize(2),
                fontWeight: '500',
              }}
              iconStyle={{ height: responsiveFontSize(2.8), width: responsiveFontSize(2.8) }}
              data={locationsList.length ? locationsList.map(item => ({ label: item.name, value: item.id.toString() })) : []}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={t('selectPreferredLocation')}
              value={userEdit?.Preferred_Location}
              onChange={item => {
                dispatch(userEditAction({ ...userEdit, Preferred_Location: item.value }));
                setErrors((prevData) => ({
                  ...prevData,
                  vehicleType: undefined,
                }));
              }}
            />
            {errors?.vehicleType && (
              <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.vehicleType}</Text>
            )}
          </View>
          <Space height={responsiveFontSize(2.5)} />

          {/* Current Monthly Income */}
          <View>
            <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('currentMonthlyIncome')} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text></Text>
            <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(0.5) }}>
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Current_Monthly_Income: '15000-20000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Current_Monthly_Income === '15000-20000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Current_Monthly_Income === '15000-20000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  15000-20000
                </Text>
              </TouchableOpacity>
                <Space width={responsiveFontSize(0.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Current_Monthly_Income: '20000-25000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Current_Monthly_Income === '20000-25000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Current_Monthly_Income === '20000-25000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  20000-25000
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(0.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Current_Monthly_Income: '25000-30000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Current_Monthly_Income === '25000-30000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Current_Monthly_Income === '25000-30000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  25000-30000
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(1) }}>
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Current_Monthly_Income: '30000-35000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Current_Monthly_Income === '30000-35000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Current_Monthly_Income === '30000-35000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  30000-35000
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(0.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Current_Monthly_Income: '35000-40000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Current_Monthly_Income === '35000-40000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Current_Monthly_Income === '35000-40000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  35000-40000
                </Text>
              </TouchableOpacity> 
              <Space width={responsiveFontSize(0.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Current_Monthly_Income: '40000-45000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Current_Monthly_Income === '40000-45000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Current_Monthly_Income === '40000-45000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  40000-45000
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(1) }}>
              <Space width={responsiveFontSize(0.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Current_Monthly_Income: '45000-50000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Current_Monthly_Income === '45000-50000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Current_Monthly_Income === '45000-50000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  45000-50000
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(0.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Current_Monthly_Income: '50000-55000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    currentMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Current_Monthly_Income === '50000-55000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Current_Monthly_Income === '50000-55000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  50000-55000
                </Text>
              </TouchableOpacity>
            </View>
            {errors?.currentMonthlyIncome && (
              <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.currentMonthlyIncome}</Text>
            )}
          </View>
          <Space height={responsiveFontSize(2.5)} />

          {/* Expected Monthly Income */}
          <View>
            <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`expectedMonthlyIncome`)} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text></Text>
            <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(0.5) }}>
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Expected_Monthly_Income: '20000-25000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    expectedMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Expected_Monthly_Income === '20000-25000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Expected_Monthly_Income === '20000-25000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  20000-25000
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(0.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Expected_Monthly_Income: '25000-30000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    expectedMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Expected_Monthly_Income === '25000-30000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Expected_Monthly_Income === '25000-30000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  25000-30000
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(0.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Expected_Monthly_Income: '30000-35000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    expectedMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Expected_Monthly_Income === '30000-35000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Expected_Monthly_Income === '30000-35000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  30000-35000
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(1) }}>
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Expected_Monthly_Income: '35000-40000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    expectedMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Expected_Monthly_Income === '35000-40000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Expected_Monthly_Income === '35000-40000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  35000-40000
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(0.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Expected_Monthly_Income: '40000-45000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    expectedMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Expected_Monthly_Income === '40000-45000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Expected_Monthly_Income === '40000-45000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  40000-45000
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(0.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Expected_Monthly_Income: '40000-45000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    expectedMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Expected_Monthly_Income === '40000-45000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Expected_Monthly_Income === '40000-45000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  45000-50000
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(1) }}>
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Expected_Monthly_Income: '50000-55000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    expectedMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Expected_Monthly_Income === '50000-55000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Expected_Monthly_Income === '50000-55000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  50000-55000
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(0.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Expected_Monthly_Income: '55000-60000' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    expectedMonthlyIncome: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Expected_Monthly_Income === '55000-60000')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Expected_Monthly_Income === '55000-60000' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  55000-60000
                </Text>
              </TouchableOpacity>
            </View>
            {errors?.expectedMonthlyIncome && (
              <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.expectedMonthlyIncome}</Text>
            )}
          </View>
          <Space height={responsiveFontSize(2.5)} />

          {/* Type of License */}
          <View>
            <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`typeOfLicense`)} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text></Text>
            <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(0.5) }}>
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Type_of_License: 'LMV' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    licenseType: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Type_of_License === 'LMV')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Type_of_License === 'LMV' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  LMV
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(1.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Type_of_License: 'HMV' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    licenseType: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Type_of_License === 'HMV')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Type_of_License === 'HMV' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  HMV
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(1.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Type_of_License: 'HGMV' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    licenseType: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Type_of_License === 'HGMV')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Type_of_License === 'HGMV' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>
                  HGMV
                </Text>
              </TouchableOpacity>
              <Space width={responsiveFontSize(1.5)} />
              <TouchableOpacity
                onPress={() => {
                  dispatch(userEditAction({ ...userEdit, Type_of_License: 'HPMV/HTV' }));
                  setErrors((prevData) => ({
                    ...prevData,
                    licenseType: undefined,
                  }));
                }}
                style={getSelectableStyle(userEdit?.Type_of_License === 'HPMV/HTV')}>
                <Text style={{ color: colors.black, fontWeight: userEdit?.Type_of_License === 'HPMV/HTV' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>HPMV/HTV</Text>
              </TouchableOpacity>
            </View>
            {errors?.licenseType && (
              <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.licenseType}</Text>
            )}
          </View>
          <Space height={responsiveFontSize(2.5)} />

          {/* Interested in Abroad Job Placements */}
          <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`jobPlacementsTitle`)}</Text>
          <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(0.5) }}>
            <TouchableOpacity
              onPress={() => {
                dispatch(userEditAction({ ...userEdit, job_placement: 'yes' }));
              }}
              style={getSelectableStyle(userEdit?.job_placement === 'yes')}>
              <Text style={{ color: colors.black, fontWeight: userEdit?.job_placement === 'yes' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>Yes</Text>
            </TouchableOpacity>
            <Space width={responsiveFontSize(1.5)} />
            <TouchableOpacity
              onPress={() => {
                dispatch(userEditAction({ ...userEdit, job_placement: 'no' }));
              }}
              style={getSelectableStyle(userEdit?.job_placement === 'no')}>
              <Text style={{ color: colors.black, fontWeight: userEdit?.job_placement === 'no' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>No</Text>
            </TouchableOpacity>
          </View>
          <Space height={responsiveFontSize(2.5)} />

          {/* Reference Check */}
          <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`previousEmployerTitle`)}</Text>
          <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(0.5) }}>
            <TouchableOpacity
              onPress={() => {
                dispatch(userEditAction({ ...userEdit, previous_employer: 'yes' }));
              }}
              style={getSelectableStyle(userEdit?.previous_employer === 'yes')}>
              <Text style={{ color: colors.black, fontWeight: userEdit?.previous_employer === 'yes' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>Yes</Text>
            </TouchableOpacity>
            <Space width={responsiveFontSize(1.5)} />
            <TouchableOpacity
              onPress={() => {
                dispatch(userEditAction({ ...userEdit, previous_employer: 'no' }));
              }}
              style={getSelectableStyle(userEdit?.previous_employer === 'no')}>
              <Text style={{ color: colors.black, fontWeight: userEdit?.previous_employer === 'no' ? '500' : '400', fontSize: responsiveFontSize(1.7) }}>No</Text>
            </TouchableOpacity>
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
