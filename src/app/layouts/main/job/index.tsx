import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useColor, useImage, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop, isIOS } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { FlatList } from 'react-native';
import moment from 'moment';
import Feather from 'react-native-vector-icons/Feather'
import Foundation from 'react-native-vector-icons/Foundation'
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { useDispatch, useSelector } from 'react-redux';
import { Image } from 'react-native';
import { AnimatedFAB } from 'react-native-paper';
import JobFilter from './filter';
import LottieView from 'lottie-react-native';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { useTranslation } from 'react-i18next';
import Subscription from '../subscription';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function AvailableJob() {
  const { t } = useTranslation();
  useStatusBarStyle('dark-content')
  const dispatch = useDispatch()
  const colors = useColor();
  const images = useImage()
  const route = useRoute<any>();
  const safeAreaInsets = useSafeAreaInsets();
  const { shadow } = useShadow()
  const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
  const navigation = useNavigation<NavigatorProp>();

  const { isDriver, subscriptionDetails, subscriptionModal } = useSelector((state: any) => { return state?.user })

  const [availableJobsList, setavailableJobsList] = useState<any>()
  const [filterModel, setfilterModel] = useState(false)
  const [loading, setloading] = useState(true)
  const [loadingApplyJob, setloadingApplyJob] = useState(-1)
  const [showLottie, setshowLottie] = useState(false)
  const [isExtended, setIsExtended] = useState(false);
  const [checkBoxSelect, setCheckBoxSelect] = useState<{ [jobId: number]: boolean }>({});
  const [errors, setErrors] = useState<{ [jobId: number]: { checkBox?: string } }>({});

  useEffect(() => {
    setTimeout(() => {
      setIsExtended(true)
    }, 500);
  }, [])

  const validate = (jobId: number): boolean => {
    let valid = true;
    const newErrors: { [key: string]: string } = {};

    if (!checkBoxSelect[jobId]) {
      newErrors.checkBox = t(`youNeedToAcceptTruckMitr`);
      valid = false;
    }
    setErrors(prev => ({ ...prev, [jobId]: newErrors }));
    return valid;
  };

  const _onpressCheckBox = (jobId: number) => {
    setCheckBoxSelect(prev => ({ ...prev, [jobId]: !prev[jobId] }));
    setErrors(prev => ({ ...prev, [jobId]: { checkBox: undefined } }));
  };

  const _fetchAllAvailableJobs = async () => {
    try {
      const allAvailableJobs: any = await axiosInstance.get(END_POINTS?.ALL_JOBS_AND_SEARCH(''));
      if (allAvailableJobs?.data?.status) {
        setavailableJobsList(allAvailableJobs?.data?.data);
      }
    } catch (error) {
      console.error("Error fetching available jobs:", error);
    } finally {
      setloading(false)
    }
  };
  useFocusEffect(
    useCallback(() => {
      _fetchAllAvailableJobs();
    }, [])
  );

  const [expandedJobs, setExpandedJobs] = useState<{ [key: number]: boolean }>({});

  const toggleExpand = (id: number) => {
    setExpandedJobs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const _navigateSearch = () => {
    navigation.navigate(STACKS.SEARCH)
  }

  const _navigateAppliedJob = () => {
    navigation.navigate(STACKS.APPLIED_JOB)
  }

  const _applyJob = async (id: any) => {
    if (!validate(id)) return;
    if (subscriptionDetails?.showSubscriptionModel && isDriver) {
      !subscriptionModal && dispatch(subscriptionModalAction(true))
    } else {
      try {
        setloadingApplyJob(id)
        const FormData = require('form-data');
        let data = new FormData();
        // Set consent_visible_transporter to 1 if checked, 0 if unchecked
        data.append('consent_visible_transporter', checkBoxSelect[id] ? 1 : 0);

        const response: any = await axiosInstance.post(END_POINTS?.APPLY_JOB(id), data);
        if (response?.data?.status) {
          setshowLottie(true)
          setTimeout(() => {
            setshowLottie(false)
          }, 1200);
        } else {
          showToast(response?.data?.message)
        }
        _fetchAllAvailableJobs()
      } catch (error) {
        console.error("Error searching jobs:", error);
      } finally {
        setloadingApplyJob(-1)
      }
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <Space height={safeAreaInsets.top} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: responsiveWidth(5) }}>
        <Image source={images.TRUCKMITR_HORIZONTAL} style={{ height: responsiveHeight(8), width: responsiveWidth(32), resizeMode: 'contain' }} />
        <TouchableOpacity onPress={() => setfilterModel(true)} hitSlop={hitSlop(20)} style={{ flexDirection: 'row', }}>
          <Foundation name={'filter'} size={24} color={colors.royalBlueOpacity(1)} />
          <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginStart: responsiveFontSize(.5), textDecorationLine: 'underline', textTransform: 'uppercase' }}>{t('filter')}</Text>
        </TouchableOpacity>
      </View>
      {loading ?
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Image style={{ height: responsiveHeight(22), width: responsiveWidth(50), borderTopLeftRadius: 10, borderTopRightRadius: 10, tintColor: colors.blackOpacity(.1) }} source={{ uri: 'https://truckmitr.com/public/images/preview.png' }} />
        </View>
        :
        availableJobsList?.length ? <View style={{ flex: 1 }}>
          <FlatList
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            data={availableJobsList}
            ListHeaderComponent={() => {
              return (
                <TouchableOpacity onPress={_navigateSearch} activeOpacity={1} style={{ width: responsiveWidth(95), flexDirection: 'row', height: responsiveHeight(6), alignSelf: 'center', backgroundColor: colors.white, alignItems: 'center', justifyContent: 'space-between', borderColor: colors.blackOpacity(.05), borderWidth: 1, borderRadius: 100, paddingHorizontal: responsiveWidth(4), ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.4), marginBottom: responsiveHeight(2) }}>
                  <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.blackOpacity(.9), fontWeight: '500' }}>{t(`searchJobs`)}</Text>
                  <Feather name={'search'} size={20} color={colors.royalBlueOpacity(1)} />
                </TouchableOpacity>
              )
            }}
            renderItem={({ item }: any) => {
              const isExpanded = expandedJobs[item.id] || false;
              const shortDescription = item?.Job_Description.slice(0, 200) + "...";

              let skills: string[] = [];
              try {
                const parsed = JSON.parse(item?.Preferred_Skills);
                skills = Array.isArray(parsed) ? parsed : [parsed];
              } catch (e) {
                skills = [item?.Preferred_Skills];
              }
              return (
                <View style={{ width: responsiveWidth(90), backgroundColor: colors.white, padding: responsiveFontSize(1.5), borderRadius: 10, marginBottom: responsiveFontSize(4), ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.4) }}>
                  <Text style={{ fontSize: responsiveFontSize(2.2), color: colors.black, fontWeight: '500' }}>{item?.job_title}</Text>
                  <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.blackOpacity(.7), fontWeight: '400', marginTop: responsiveFontSize(1) }}>
                    {isExpanded ? item?.Job_Description : shortDescription}
                  </Text>
                  <TouchableOpacity onPress={() => toggleExpand(item.id)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveFontSize(1) }}>
                    <Text style={{ fontSize: responsiveFontSize(2), color: colors.royalBlue, fontWeight: '600' }}>
                      {isExpanded ? t("showLess") : t("showMore")}
                    </Text>
                    <FontAwesome6 name={!isExpanded ? 'chevron-down' : 'chevron-up'} size={14} color={colors.royalBlue} style={{ marginHorizontal: responsiveFontSize(.7), marginTop: responsiveFontSize(.2) }} />
                  </TouchableOpacity>
                  <Space height={responsiveHeight(2)} />
                  <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1.5 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome name='rupee' size={14} color={colors.royalBlue} />
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`salary`)}</Text>
                      </View>
                      <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{item?.Salary_Range}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name='license' size={14} color={colors.royalBlue} />
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`typeOfLicense`)}</Text>
                      </View>
                      <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{item?.Type_of_License}</Text>
                    </View>
                  </View>
                  <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveFontSize(1) }}>
                    <View style={{ flex: 1.5 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome6 name='location-dot' size={14} color={colors.royalBlue} />
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`location`)}</Text>
                      </View>
                      <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{item?.job_location}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome6 name='business-time' size={14} color={colors.royalBlue} />
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`noOfJobs`)}</Text>
                      </View>
                      <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{item?.Job_Management}</Text>
                    </View>
                  </View>
                  <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveFontSize(1) }}>
                    <View style={{ flex: 1.5 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome name='trophy' size={14} color={colors.royalBlue} />
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`experience`)}</Text>
                      </View>
                      <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{item?.Required_Experience}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome name='id-card-o' size={14} color={colors.royalBlue} />
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`jobId`)}</Text>
                      </View>
                      <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{item?.job_id}</Text>
                    </View>
                  </View>
                  <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveFontSize(1) }}>
                    <View style={{ flex: 1.5 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome name='calendar-o' size={14} color={colors.royalBlue} />
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`postDate`)}</Text>
                      </View>
                      <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{moment(item?.Created_at).format("DD-MM-YYYY")}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome name='calendar-minus-o' size={14} color={colors.royalBlue} />
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`lastDate`)}</Text>
                      </View>
                      <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{item?.Application_Deadline}</Text>
                    </View>
                  </View>
                  <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveFontSize(1) }}>
                    <View style={{ flex: 1.5 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome6 name='car-rear' size={14} color={colors.royalBlue} />
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`vehicleType`)}</Text>
                      </View>
                      <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{item?.vehicle_type}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome6 name='child-reaching' size={14} color={colors.royalBlue} />
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '500', marginStart: responsiveFontSize(.5) }}>{t(`preferredSkills`)}</Text>
                      </View>
                      <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{skills.join(", ")}</Text>
                    </View>
                  </View>
                  <Space height={responsiveHeight(2)} />
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity activeOpacity={1} onPress={() => _onpressCheckBox(item.id)}>
                      <MaterialCommunityIcons
                        name={checkBoxSelect[item.id] ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={24}
                        color={colors.royalBlue}
                      />
                    </TouchableOpacity>
                       <Text style={{ color: colors.blackOpacity(0.7), marginStart: responsiveFontSize(1), flexShrink: 1, flexWrap: 'wrap'}}>
                                                                  {t(`iAgreeToTruckMitr`)}
                                                                  <Text onPress={() => navigation.navigate(STACKS?.DRIVER_CONSENT)} style={{ color: colors.royalBlue, fontWeight: '500' }}> {t(`driverConsent`)}</Text>
                                                                  {t(`applyJobPolicy`)}
                      </Text>
                  </View>
                  {errors[item.id]?.checkBox && (
                    <View style={{ flexDirection: 'row', marginTop: responsiveHeight(1) }}>
                      <Text style={{ color: colors.error, fontSize: responsiveFontSize(1.7), marginLeft: responsiveFontSize(0.5) }}>
                        {errors[item.id]?.checkBox}
                      </Text>
                    </View>
                  )}
                  <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveFontSize(1.5), borderTopColor: colors?.blackOpacity(.05), borderTopWidth: 1, paddingTop: responsiveFontSize(1.5) }}>
                    <View style={{ flex: 1.5 }} />
                    <View style={{ flex: 1 }}>
                      <TouchableOpacity onPress={() => _applyJob(item?.id)} activeOpacity={.7} style={{ flex: 1, height: responsiveHeight(5), flexDirection: 'row', backgroundColor: colors.royalBlue, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
                        {loadingApplyJob === item?.id ?
                          <ActivityIndicator color={colors.white} size="small" />
                          : <>
                            <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t(`apply`)}</Text>
                            <Ionicons name='send' size={14} color={colors.white} style={{ marginLeft: responsiveFontSize(1), top: 2 }} />
                          </>}
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Space height={responsiveHeight(1)} />
                </View>
              );
            }}
            contentContainerStyle={{ paddingHorizontal: responsiveWidth(5), paddingBottom: responsiveHeight(5), paddingTop: responsiveHeight(2) }}
            keyExtractor={(item) => item.id.toString()}
            ListFooterComponent={() => {
              return (
                <Space height={responsiveHeight(10)} />
              )
            }} />
        </View> :
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Space height={responsiveHeight(20)} />
            <Image style={{ height: responsiveHeight(15), width: responsiveWidth(80), tintColor: colors.blackOpacity(.1) }} source={{ uri: 'https://truckmitr.com/public/images/preview.png' }} />
            <Text style={{ color: colors.blackOpacity(.9), fontSize: responsiveFontSize(1.8), fontWeight: '500', }}>{t(`currentlyThereAreNoJobsAvailable`)}</Text>
          </View>}
      {showLottie && <View style={{ height: responsiveHeight(100), width: responsiveWidth(100), alignItems: 'center', justifyContent: 'center', position: 'absolute', pointerEvents: 'none' }}>
        <LottieView style={{ height: responsiveHeight(50), width: responsiveWidth(70) }} source={require('@truckmitr/res/lotties/boom.json')} autoPlay loop />
      </View>}
      <AnimatedFAB
        icon={() => <Image style={{ height: responsiveFontSize(2.5), width: responsiveFontSize(2.5), tintColor: colors.white }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4121/4121106.png' }} />}
        label={t('appliedJobs')}
        color={colors.white}
        extended={isExtended}
        onPress={_navigateAppliedJob}
        visible={true}
        iconMode={'dynamic'}
        style={{
          position: 'absolute',
          bottom: responsiveWidth(5),
          right: responsiveWidth(5),
          backgroundColor: colors.royalBlue
        }}
      />

      {/* Model License Exipre */}
      <Modal
        animationType={'slide'}
        transparent={true}
        visible={filterModel}
        statusBarTranslucent
        navigationBarTranslucent>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blackOpacity(.7), }}>
          <View style={{ position: 'absolute', bottom: 0, }}>
            <TouchableOpacity
              onPress={() => {
                setfilterModel(false)
              }}
              activeOpacity={0.7}
              hitSlop={hitSlop(20)}
              style={{
                height: responsiveHeight(5),
                width: responsiveHeight(5),
                backgroundColor: colors.blackOpacity(.2),
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                borderColor: colors.blackOpacity(.1), borderWidth: 1,
                borderRadius: 100,
                ...shadow,
                shadowColor: isIOS() ? colors.blackOpacity(0.2) : colors.blackOpacity(0.4),
                marginBottom: responsiveHeight(1)
              }}>
              <Ionicons name={'close'} size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={{ backgroundColor: colors.white, alignItems: 'center', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' }}>
              <JobFilter setfilterModel={setfilterModel} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}