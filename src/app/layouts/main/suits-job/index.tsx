import { ActivityIndicator, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop, isIOS } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { FlatList } from 'react-native';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import moment from 'moment';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import LottieView from 'lottie-react-native';
// import Tts from 'react-native-tts';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import FullScreenLoader from '@truckmitr/components/fullScreenLoader';
import { playVoiceOnce, stopVoice } from '@truckmitr/src/utils/audio';


type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;


export default function SuitsJob() {
    const { t } = useTranslation();
    const hasPlayedVoiceRef = React.useRef(false);
    useStatusBarStyle('dark-content')
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { shadow } = useShadow()
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const { profileCompletion } = useSelector((state: any) => { return state?.user }) || { profileCompletion: 0 };
    const navigation = useNavigation<NavigatorProp>();
    const dispatch = useDispatch();
    const [recommendedJobsList, setrecommendedJobsList] = useState([])
    const [checkBoxSelect, setCheckBoxSelect] = useState<{ [jobId: number]: boolean }>({});
    const [errors, setErrors] = useState<{ [jobId: number]: { checkBox?: string } }>({});
    const [loadingApplyJob, setloadingApplyJob] = useState(-1)
    const [showLottie, setshowLottie] = useState(false)
    const [isLoading, setIsLoading] = useState(true);
    // profileCompletion = 90
    const _goback = () => {
        navigation.goBack()
    }

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

    const _recommendedJobs = async () => {
        try {
            setIsLoading(true); // 👈 show loader
            const recommendedJobs: any = await axiosInstance.get(
                END_POINTS?.JOB_THAT_SUITS_YOU
            );
            console.log('recommendedJobs:', recommendedJobs?.data?.data);

            if (recommendedJobs?.data?.success) {
                setrecommendedJobsList(recommendedJobs?.data?.data || []);

                // setrecommendedJobsList(recommendedJobs?.data?.data || []);
            }
        } catch (error) {
            console.error('Jobs API error:', error);
            showToast('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (profileCompletion < 90 && !hasPlayedVoiceRef.current) {
            hasPlayedVoiceRef.current = true;

            console.log('🔊 Playing profile incomplete voice (MP3)');
            playVoiceOnce('profile_update_voice.mp3');
        }

        return () => {
            stopVoice(); // safety cleanup
        };
    }, [profileCompletion]);

    useFocusEffect(
        React.useCallback(() => {
            if (profileCompletion >= 90) {
                console.log('🔥 Fetching jobs');
                _recommendedJobs();
            } else {
                console.log('⛔ Profile incomplete, skipping API');
                setIsLoading(false);
                setrecommendedJobsList([]);
            }
        }, [profileCompletion])
    );

    const [expandedJobs, setExpandedJobs] = useState<{ [key: number]: boolean }>({});

    const toggleExpand = (id: number) => {
        setExpandedJobs((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };
    const _applyJob = async (id: any) => {
        if (!validate(id)) return;
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
                if (response?.data?.message === "You have reached your cumulative job application limit for your subscriptions.") {
                    dispatch(subscriptionModalAction(true));
                }
                showToast(response?.data?.message)
            }
        } catch (error: any) {
            console.error("Error searching jobs:", error);
            if (error?.response?.status === 403 || error?.response?.data?.message === "You have reached your cumulative job application limit for your subscriptions.") {
                dispatch(subscriptionModalAction(true));
            }
        } finally {
            setloadingApplyJob(-1)
        }
    }

    const _navigateProfileEdit = () => {
        navigation.navigate(STACKS.PROFILE_EDIT);
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{t(`jobsThatSuitsYou`)}</Text>
            </View>

            {/* ================= PROFILE NOT COMPLETED ================= */}
            {profileCompletion < 90 && (
                <View style={{ flex: 1 }}>

                    {/* 🔹 Profile Incomplete Card */}
                    <View
                        style={{
                            width: responsiveWidth(90),
                            alignSelf: 'center',
                            borderRadius: 10,
                            overflow: 'hidden',
                            marginTop: responsiveHeight(2),
                        }}
                    >
                        <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            colors={['rgba(166,205,249,0.3)', 'rgba(12,120,240,0.3)']}
                            style={StyleSheet.absoluteFillObject}
                        />
                        <View style={{ padding: responsiveFontSize(2) }}>
                            <Text
                                style={{
                                    color: colors.black,
                                    fontSize: responsiveFontSize(2),
                                    fontWeight: '500',
                                }}
                            >
                                {t('yourProfileIncomplete')}
                            </Text>

                            <View style={{ flexDirection: 'row', marginTop: 6 }}>
                                <Feather name="info" size={16} color={colors.black} />
                                <Text
                                    style={{
                                        marginLeft: 8,
                                        color: colors.blackOpacity(0.5),
                                        flex: 1,
                                    }}
                                >
                                    {t('profileIncompleteTitle')}
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={_navigateProfileEdit}
                                activeOpacity={0.8}
                                style={{
                                    backgroundColor: colors.royalBlue,
                                    padding: responsiveFontSize(1),
                                    marginTop: responsiveFontSize(2),
                                    borderRadius: 6,
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        color: colors.white,
                                        fontSize: responsiveFontSize(1.8),
                                        fontWeight: '500',
                                    }}
                                >
                                    {t('completeProfile')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 🔹 Illustration + Message */}
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Space height={responsiveHeight(12)} />
                        <Image
                            source={{ uri: 'https://truckmitr.com/public/images/preview.png' }}
                            style={{
                                height: responsiveHeight(15),
                                width: responsiveWidth(80),
                                tintColor: colors.blackOpacity(0.1),
                            }}
                        />
                        <Text
                            style={{
                                width: responsiveWidth(80),
                                color: colors.blackOpacity(0.9),
                                fontSize: responsiveFontSize(1.8),
                                textAlign: 'center',
                                fontWeight: '500',
                                marginTop: responsiveHeight(2),
                            }}
                        >
                            {t('youNeedToUpdateYourProfileFirstToSeeJobs')}
                        </Text>
                    </View>
                </View>
            )}


            {profileCompletion >= 90 && isLoading && (
                <FullScreenLoader message={t('fetchingJobsForYou')} />
            )}

            {profileCompletion >= 90 && !isLoading && recommendedJobsList.length > 0 && (
                <View style={{ flex: 1 }}>
                    <FlatList
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        data={recommendedJobsList}
                        renderItem={({ item }: any) => {
                            const isExpanded = expandedJobs[item.id] || false;
                            const shortDescription = item.Job_Description.slice(0, 200) + "...";
                            let skills: string[] = [];
                            try {
                                const parsed = JSON.parse(item?.Preferred_Skills);
                                skills = Array.isArray(parsed) ? parsed : [parsed];
                            } catch (e) {
                                skills = [item?.Preferred_Skills];
                            }
                            return (
                                <View style={{ width: responsiveWidth(90), backgroundColor: colors.white, padding: responsiveFontSize(1.5), borderRadius: 10, marginBottom: responsiveFontSize(4), ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.4) }}>
                                    <Text style={{ fontSize: responsiveFontSize(2.2), color: colors.black, fontWeight: '500' }}>{item.job_title}</Text>
                                    <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.blackOpacity(.7), fontWeight: '400', marginTop: responsiveFontSize(1) }}>
                                        {isExpanded ? item.Job_Description : shortDescription}
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
                                                <MaterialCommunityIcons name='license' size={14} color={colors.royalBlue} />
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
                                        <Text style={{ color: colors.blackOpacity(0.7), marginStart: responsiveFontSize(1), flexShrink: 1, flexWrap: 'wrap' }}>
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
                        keyExtractor={(item: any) => item.id.toString()}
                        ListFooterComponent={() => {
                            return (
                                <Space height={responsiveHeight(10)} />
                            )
                        }} />
                </View>
            )}

            {profileCompletion >= 90 && !isLoading && recommendedJobsList.length === 0 && (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                        source={{ uri: 'https://truckmitr.com/public/images/preview.png' }}
                        style={{
                            height: responsiveHeight(15),
                            width: responsiveWidth(80),
                            opacity: 0.2,
                        }}
                    />
                    <Text style={{ marginTop: 12, opacity: 0.7 }}>
                        {t('jobsThatSuitYouNotAvailable')}
                    </Text>
                </View>
            )}

            {/* {isLoading ? (<FullScreenLoader message="Fetching jobs for you..." />) : recommendedJobsList?.length ?
                <View style={{ flex: 1 }}>
                    <FlatList
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        data={recommendedJobsList}
                        renderItem={({ item }: any) => {
                            const isExpanded = expandedJobs[item.id] || false;
                            const shortDescription = item.Job_Description.slice(0, 200) + "...";
                            let skills: string[] = [];
                            try {
                                const parsed = JSON.parse(item?.Preferred_Skills);
                                skills = Array.isArray(parsed) ? parsed : [parsed];
                            } catch (e) {
                                skills = [item?.Preferred_Skills];
                            }
                            return (
                                <View style={{ width: responsiveWidth(90), backgroundColor: colors.white, padding: responsiveFontSize(1.5), borderRadius: 10, marginBottom: responsiveFontSize(4), ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.4) }}>
                                    <Text style={{ fontSize: responsiveFontSize(2.2), color: colors.black, fontWeight: '500' }}>{item.job_title}</Text>
                                    <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.blackOpacity(.7), fontWeight: '400', marginTop: responsiveFontSize(1) }}>
                                        {isExpanded ? item.Job_Description : shortDescription}
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
                                                <MaterialCommunityIcons name='license' size={14} color={colors.royalBlue} />
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
                                        <Text style={{ color: colors.blackOpacity(0.7), marginStart: responsiveFontSize(1), flexShrink: 1, flexWrap: 'wrap' }}>
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
                        keyExtractor={(item: any) => item.id.toString()}
                        ListFooterComponent={() => {
                            return (
                                <Space height={responsiveHeight(10)} />
                            )
                        }} />
                </View> :
                 <View style={{ flex: 1, alignItems: 'center' }}>

                    <Space height={responsiveHeight(15)} />
                    <Image style={{ height: responsiveHeight(15), width: responsiveWidth(80), tintColor: colors.blackOpacity(.1) }} source={{ uri: 'https://truckmitr.com/public/images/preview.png' }} />
                    <Text style={{ width: responsiveWidth(80), color: colors.blackOpacity(.9), fontSize: responsiveFontSize(1.8), textAlign: 'center', fontWeight: '500', }}>{profileCompletion <= 90 ? t(`youNeedToUpdateYourProfileFirstToSeeJobs`) : t(`jobsThatSuitYouNotAvailable`)}</Text>
                </View>
                } */}
            {showLottie && <View style={{ height: responsiveHeight(100), width: responsiveWidth(100), alignItems: 'center', justifyContent: 'center', position: 'absolute', pointerEvents: 'none' }}>
                <LottieView style={{ height: responsiveHeight(50), width: responsiveWidth(70) }} source={require('@truckmitr/res/lotties/boom.json')} autoPlay loop />
            </View>}
        </View>
    )
}
