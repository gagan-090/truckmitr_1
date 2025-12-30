import { ActivityIndicator, Animated, FlatList, ScrollView, Text, TouchableOpacity, View, Modal, Linking } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MediaSwiper, Space } from '@truckmitr/src/app/components';
import { Image } from 'react-native';
import Svg, { Circle } from "react-native-svg";
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import { isIOS } from '@truckmitr/src/app/functions';
import Feather from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useDispatch, useSelector } from 'react-redux';
import { BASE_URL, END_POINTS } from '@truckmitr/src/utils/config';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { subscriptionDetailsAction, subscriptionModalAction, userAction } from '@truckmitr/src/redux/actions/user.action';
import moment from 'moment';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import { TourGuideZone, } from 'rn-tourguide';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeModal from '@truckmitr/src/app/components/welcome-modal';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

interface SubscriptionItem {
    payment_type: string;
    end_at: number;
    [key: string]: any;
}

const capitalizeFirst = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const Home = React.forwardRef((props, ref) => {
    const { t } = useTranslation();
    const dispatch = useDispatch()
    useStatusBarStyle('light-content')
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();

    const { shadow } = useShadow()
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const [showWelcome, setShowWelcome] = useState(false)

    const { user, isDriver, isTransporter, whatsapp_link, profileCompletion, subscriptionDetails, subscriptionModal, rank, star_rating } = useSelector((state: any) => { return state?.user }) || {};

    const IMAGES = [
        isDriver ? 'https://truckmitr.com/public/front/assets/images/BNR.jpg' : 'https://i.pinimg.com/736x/e7/bb/ea/e7bbea6ce9d1688158fde5d7160fcf5b.jpg'
        // 'https://i.pinimg.com/736x/af/81/c2/af81c27eee15cfa9de82f75611c8e1fb.jpg',
        // 'https://i.pinimg.com/736x/2f/0c/1f/2f0c1fd30f5a6d33e995b8acc21ecf68.jpg',
        // 'https://i.pinimg.com/736x/66/cd/dd/66cddd980a459f49ef5a88b4850fc24e.jpg'
    ]

    const progress = profileCompletion || 0; // Profile completion percentage
    const size = responsiveFontSize(11); // Size of the circle
    const strokeWidth = 7;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference - (progress / 100) * circumference;

    const scrollValue = useRef(new Animated.Value(0)).current;
    const translateX = scrollValue.interpolate({
        inputRange: [0, responsiveWidth(100)],
        outputRange: [0, 20],
    });

    const [expandedJobs, setExpandedJobs] = useState<{ [key: number]: boolean }>({});
    const [recommendedJobsList, setrecommendedJobsList] = useState([])

    const [loadingApplyJob, setloadingApplyJob] = useState(-1)
    const [showLottie, setshowLottie] = useState(false)
    const [checkBoxSelect, setCheckBoxSelect] = useState<{ [jobId: number]: boolean }>({});
    const [errorsJobs, setErrorsJobs] = useState<{ [jobId: number]: { checkBox?: string } }>({});

    // New state for popup message
    const [popupData, setPopupData] = useState<{
        id: any,
        title: string;
        message: string;
        user_type: string;
        start_date: string;
        end_date: string;
        status: boolean;
        image: null | string;
    }>({
        id: '',
        title: '',
        message: '',
        user_type: '',
        start_date: '',
        end_date: '',
        status: false,
        image: ''
    });

    const validateJobs = (jobId: number): boolean => {
        let valid = true;
        const newErrors: { [key: string]: string } = {};

        if (!checkBoxSelect[jobId]) {
            newErrors.checkBox = t(`youNeedToAcceptTruckMitr`);
            valid = false;
        }
        setErrorsJobs(prev => ({ ...prev, [jobId]: newErrors }));
        return valid;
    };

    const _onpressCheckBox = (jobId: number) => {
        setCheckBoxSelect(prev => ({ ...prev, [jobId]: !prev[jobId] }));
        setErrorsJobs(prev => ({ ...prev, [jobId]: { checkBox: undefined } }));
    };

    // API call for popup message
    const fetchPopupMessage = async () => {
        try {
            const response: any = await axiosInstance.get(
                END_POINTS.POPUP_MESSAGE
            );
            if (response?.data?.data) {
                const popup = response.data.data;
                // get closed count for this popupId
                let closedCount = await AsyncStorage.getItem(`welcome_popup_closed_count_${popup.id}`);
                const closedCountNum = closedCount ? parseInt(closedCount) : 0;
                if (closedCountNum >= 3) return;
                const now = new Date();
                let isWithinRange = true;
                if (popup.start_date && popup.end_date) {
                    const startDate = new Date(popup.start_date);
                    const endDate = new Date(popup.end_date);
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                    isWithinRange = today >= start && today <= end;
                }
                let shouldShowPopup = false;
                if (popup.user_type === 'both') {
                    shouldShowPopup = true;
                } else if (popup.user_type === 'driver' && isDriver) {
                    shouldShowPopup = true;
                } else if (popup.user_type === 'transporter' && isTransporter) {
                    shouldShowPopup = true;
                }
                setShowWelcome(popup.status && isWithinRange && shouldShowPopup);
                setPopupData({
                    id: popup.id,
                    title: popup.title,
                    message: popup.message,
                    user_type: popup.user_type,
                    start_date: popup.start_date,
                    end_date: popup.end_date,
                    status: popup.status,
                    image: popup.image
                });
            }
        } catch (error: any) {
            console.log('Error fetching popup message:', error);
        }
    };

    const _recommendedJobs = async () => {
        const recommendedJobs: any = await axiosInstance.get(END_POINTS?.RECOMMENDED_JOBS);
        if (recommendedJobs?.data?.status) {
            setrecommendedJobsList(recommendedJobs?.data?.data)
        }
    }

    useFocusEffect(
        useCallback(() => {
            const _fetchUser = async () => {
                const profile: any = await axiosInstance.get(END_POINTS?.GET_PROFILE);
                const res: any = await axiosInstance.get(END_POINTS.PAYMENT_DETAIL);
                if (profile?.data?.status) {
                    dispatch(userAction(profile?.data))
                    const subscriptionDetail: any = await axiosInstance.get(END_POINTS?.PAYMENT_SUBSCRIPTION_DETAILS);
                    if (subscriptionDetail?.data?.status) {
                        dispatch(subscriptionDetailsAction(subscriptionDetail?.data?.data))
                    }

                    // Check for active subscription using the correct logic
                    let subsClosedCount = await AsyncStorage.getItem('subscription_modal_closed_count');
                    if (subsClosedCount !== '1') {
                        const subscriptions = subscriptionDetail?.data?.data;
                        const hasActive = checkHasActiveSubscription(subscriptions);

                        if (!hasActive) {
                            dispatch(subscriptionModalAction(true))
                            await AsyncStorage.setItem('subscription_modal_closed_count', '1');
                        }
                    }
                }
            }
            _fetchUser()
            _recommendedJobs()
            fetchPopupMessage()
        }, [])
    );

    /**
     * Check if user has an active subscription
     * Uses the logic: subscription_id exists, payment_status is 'captured', and end_at is in the future
     */
    const checkHasActiveSubscription = (subscriptions: any): boolean => {
        if (!subscriptions) return false;

        const subscriptionArray = Array.isArray(subscriptions) ? subscriptions : [subscriptions];

        return subscriptionArray.some((data: any) => {
            if (!data) return false;

            const hasSubscriptionId = !!data.subscription_id;
            const isPaymentCaptured = data.payment_status === 'captured';
            const isNotExpired = Date.now() / 1000 < data.end_at;

            return hasSubscriptionId && isPaymentCaptured && isNotExpired;
        });
    };

    const isSubscriptionActive = (item: any) => {
        if (!item) return false;
        if (!item.end_at) return false;

        // Convert epoch seconds → milliseconds
        const endDate = new Date(item.end_at * 1000);
        const now = new Date();

        return endDate > now;
    };

    const toggleExpand = (id: number) => {
        setExpandedJobs((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };
    const _navigateSearch = () => {
        navigation.navigate(STACKS.SEARCH)
    }

    const _navigateDashboard = () => {
        navigation.navigate(STACKS.DASHBOARD)
    }
    const _navigateTraning = () => {
        navigation.navigate(STACKS.BOTTOM_TAB, { screen: STACKS.TRAINING })
    }
    const _navigateProfile = () => {
        navigation.navigate(STACKS.BOTTOM_TAB, { screen: STACKS.PROFILE })
    }
    const _navigateAvailableJobs = () => {
        navigation.navigate(STACKS.BOTTOM_TAB, { screen: STACKS.JOB })
    }
    const _navigateSuitsJobs = () => {
        if (subscriptionDetails?.showSubscriptionModel && isDriver) {
            dispatch(subscriptionModalAction(true))
        } else {
            navigation.navigate(STACKS.SUITS_JOB)
            // if (dashboard?.jobs_that_suit_you === 0) {
            //     showToast(t(`youNeedToUpdateYourProfileFirstToSeeJobs`))
            // } else {
            //     navigation.navigate(STACKS.SUITS_JOB)
            // }
        }
    }
    const _navigateAppliedJobs = () => {
        navigation.navigate(STACKS.APPLIED_JOB)
    }
    const _navigateHealthHygiene = () => {
        navigation.navigate(STACKS.HEALTH_HYGIENE)
    }
    const _navigateQuizResult = () => {
        navigation.navigate(STACKS.QUIZ_RESULT)
    }

    const _navigateTransporterInvitation = () => {
        navigation.navigate(STACKS.DRIVERINVITES)
    }

    const _navigateInviteDriver = () => {
        navigation.navigate(STACKS.ALLDRIVER_LIST_WITH_TABS)
    }

    const _navigateTransporterVerification = () => {
        navigation.navigate(STACKS.TRANSPORTER_VERIFICATION)
    }

    const _navigateVerifiedNow = () => {
        navigation.navigate(STACKS.VERIFICATION)
    }


    const _navigateReferral = () => {
        navigation.navigate(STACKS.REFERRAL)
    }

    const _navigateTranspoerterVerification = () => {
        navigation.navigate(STACKS.VERIFICATIONDRIVERSBYTRANSPORTER)
    }

    const _navigateAddJob = () => {
        navigation.navigate(STACKS.ADD_JOB)
    }
    const _navigateViewJobs = () => {
        navigation.navigate(STACKS.VIEW_JOBS)
    }
    const _navigateAddDriver = () => {
        navigation.navigate(STACKS.ADD_DRIVER)
    }
    const _navigateAppliedJobsTransporter = () => {
        if (subscriptionDetails?.showSubscriptionModel && isTransporter) {
            !subscriptionModal && dispatch(subscriptionModalAction(true))
        } else {
            navigation.navigate(STACKS.TRANSPORTER_APPLIED_JOB)
        }
    }
    const _navigateDriverList = () => {
        navigation.navigate(STACKS.DRIVER_LIST)
    }

    const closeWelcomePopup = async (Id: any) => {
        // get closed count for this popupId
        let closedCount = await AsyncStorage.getItem(`welcome_popup_closed_count_${Id}`);
        const closedCountNum = closedCount ? parseInt(closedCount) : 0;
        await AsyncStorage.setItem(
            `welcome_popup_closed_count_${Id}`,
            String(closedCountNum + 1)
        );
        setShowWelcome(false)
    }

    const _applyJob = async (id: any) => {
        if (!validateJobs(id)) return;
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
                _recommendedJobs()
            } catch (error) {
                console.error("Error searching jobs:", error);
            } finally {
                setloadingApplyJob(-1)
            }
        }
    }

    // Can start at mount 🎉
    // you need to wait until everything is registered 😁
    const scrollViewRef = useRef<any>('');

    React.useImperativeHandle(ref, () => ({
        scrollToTop: (): Promise<void> => {
            return new Promise(async (resolve) => {
                const value = await AsyncStorage.getItem('@stop_tour_guide');
                if (isDriver && value !== 'STOP') {
                    scrollViewRef.current?.scrollTo({ y: 200, animated: true });
                    setTimeout(() => resolve(), 200); // Wait for scroll animation
                } else {
                    resolve();
                }
            });
        }
    }));
    const hasMoreThanFive = recommendedJobsList.length > 5;
    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <View style={{ height: responsiveHeight(isIOS() ? 27 : isDriver ? 26 : 22), width: responsiveWidth(100), backgroundColor: colors.royalBlue, borderBottomLeftRadius: 50, borderBottomRightRadius: 0, zIndex: 100 }}>
                <Space height={safeAreaInsets.top} />
                <WelcomeModal
                    title={popupData.title}
                    visible={showWelcome}
                    onClose={() => closeWelcomePopup(popupData.id)}
                    welcomeMessage={popupData.message}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: responsiveWidth(5) }}>
                    <View style={{}}>
                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(2.6), fontWeight: '500' }}>{`${t(`hi`)}, \n${user?.name || ''}`}</Text>
                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.6), fontWeight: '400' }}>{`ID - ${user?.unique_id || ''}`}</Text>
                        <Text style={{ backgroundColor: colors?.blackOpacity(.3), alignSelf: 'flex-start', color: colors.white, fontSize: responsiveFontSize(1.7), fontWeight: '500', paddingVertical: responsiveFontSize(.2), paddingHorizontal: responsiveFontSize(2), borderRadius: 100 }}>{`${capitalizeFirst(user?.role)}`}</Text>
                        {isDriver && <View style={{ flexDirection: 'row', backgroundColor: colors.whiteOpacity(1), alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: responsiveFontSize(2), paddingVertical: responsiveFontSize(.2), marginTop: responsiveFontSize(1), borderRadius: 100 }}>
                            <Text style={{ color: '#7B610E', fontSize: responsiveFontSize(1.6), fontWeight: '500' }}>{rank}</Text>
                            <Image style={{ height: responsiveFontSize(2.6), width: responsiveFontSize(2.6) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/11881/11881945.png' }} />
                        </View>}
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity onPress={_navigateProfile} activeOpacity={1} style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Svg width={size} height={size} style={{ position: "absolute" }}>
                                {/* Background Circle */}
                                <Circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    stroke={colors.whiteOpacity(.1)}
                                    strokeWidth={strokeWidth}
                                    fill="none"
                                />
                                {/* Progress Circle */}
                                <Circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    stroke={colors.white}
                                    strokeWidth={strokeWidth}
                                    fill="none"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={progressOffset}
                                    strokeLinecap="round"
                                    rotation="90"
                                    origin={`${size / 2}, ${size / 2}`}
                                />
                            </Svg>
                            <Image style={{ height: size - strokeWidth, width: size - strokeWidth, borderRadius: 100, backgroundColor: colors.white }} source={{ uri: user?.images ? `${BASE_URL}public/${user?.images}` : `https://cdn-icons-png.flaticon.com/512/3177/3177440.png` }} />
                            <View style={{ backgroundColor: colors.whiteOpacity(1), paddingHorizontal: responsiveFontSize(1.8), paddingVertical: responsiveFontSize(.24), borderRadius: 100, position: 'absolute', bottom: -10, ...shadow }}>
                                <Text style={{ fontSize: responsiveFontSize(1.4), color: 'green', fontWeight: '700' }}>{`${profileCompletion}%`}</Text>
                            </View>
                        </TouchableOpacity>
                        {isDriver && <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(2.5) }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <FontAwesome
                                    key={i}
                                    name={'star'}
                                    size={14}
                                    color={i < star_rating ? colors.white : colors.whiteOpacity(.2)}
                                    style={{ marginEnd: responsiveFontSize(.5) }}
                                />
                            ))}
                        </View>}
                    </View>
                </View>
                {/*  */}
                {isDriver && <TouchableOpacity onPress={_navigateSearch} activeOpacity={1} style={{ width: responsiveWidth(95), flexDirection: 'row', height: responsiveHeight(6), alignSelf: 'center', backgroundColor: colors.white, alignItems: 'center', justifyContent: 'space-between', borderColor: colors.blackOpacity(.05), borderWidth: 1, borderRadius: 100, paddingHorizontal: responsiveWidth(4), ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.4), bottom: responsiveFontSize(.6) }}>
                    <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.blackOpacity(.9), fontWeight: '500' }}>{t(`searchJobs`)}</Text>
                    <Feather name={'search'} size={20} color={colors.royalBlueOpacity(1)} />
                </TouchableOpacity>}
            </View>
            {/*  */}
            <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
                {isDriver ?
                    <Space height={responsiveFontSize(isIOS() ? 7 : 4.5)} /> : <Space height={responsiveFontSize(isIOS() ? 5 : 0)} />}
                {/* <View style={{ width: responsiveWidth(100), alignSelf: 'center' }}> */}
                <MediaSwiper />


                {whatsapp_link && <TouchableOpacity
                    onPress={() => Linking.openURL(whatsapp_link)}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: 14,
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        backgroundColor: '#25D366',
                        borderRadius: 8,
                        gap: 10
                    }}>
                    <FontAwesome name="whatsapp" size={22} color="#fff" />
                    <Text style={{
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: responsiveFontSize(1.9),
                        textAlign: 'center'
                    }}>
                        {t('joinTruckMitrGroup')}
                    </Text>
                </TouchableOpacity>}
                {isDriver && <TouchableOpacity
                    onPress={_navigateReferral}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginHorizontal: 14,
                        paddingVertical: 8,
                        paddingHorizontal: 20,
                        backgroundColor: colors.royalBlue,
                        borderRadius: 8,
                        gap: 10
                    }}>
                    <Image style={{ height: responsiveFontSize(4), width: responsiveFontSize(4) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3437/3437346.png' }} />
                    <Text style={{
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: responsiveFontSize(1.9),
                        textAlign: 'center'
                    }}>
                        {t('referEarn')}
                    </Text>
                </TouchableOpacity>}
                {isDriver && <View>
                    <View style={{ flexDirection: 'row', padding: responsiveWidth(2.5) }}>
                        <TourGuideZone
                            zone={1}
                            text={t('hereYouCanSeeTheTotalNumberOfTrainingAndJobs')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateDashboard} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/610/610106.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(1) }}>{t(`dashboard`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                        <Space width={responsiveFontSize(2)} />
                        <TourGuideZone
                            zone={2}
                            text={t('hereYouCanWatchAllTheTrainingVideosAndAnswerTheQuiz')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateTraning} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/11825/11825158.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(1) }}>{t(`training`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                    </View>
                    <Space height={responsiveFontSize(.2)} />
                    <View style={{ flexDirection: 'row', padding: responsiveWidth(2.5) }}>
                        <TourGuideZone
                            zone={3}
                            text={t('hereYouCanSeeAllTheJobsAndApply')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateAvailableJobs} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3281/3281289.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(1) }}>{t(`availableJobs`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                        <Space width={responsiveFontSize(2)} />
                        <TourGuideZone
                            zone={4}
                            text={t('hereYouCanSeeJobsMatchingYourProfile')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateSuitsJobs} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2966/2966773.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', textAlign: "center", marginTop: responsiveFontSize(1) }}>{t(`jobsThatSuitsYou`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                    </View>
                    <Space height={responsiveFontSize(.2)} />
                    <View style={{ flexDirection: 'row', padding: responsiveWidth(2.5) }}>
                        <TourGuideZone
                            zone={5}
                            text={t('hereYouCanSeeTheListOfJobsYouHaveAppliedFor')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateAppliedJobs} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/11651/11651437.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(1) }}>{t(`appliedJobs`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                        <Space width={responsiveFontSize(2)} />
                        <TourGuideZone
                            zone={6}
                            text={t('hereYouCanWatchTrainingVideosRelatedToHealthAndHygiene')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateHealthHygiene} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2382/2382461.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(1) }}>{t(`healthHygiene`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                    </View>
                    <Space height={responsiveFontSize(.2)} />
                    <View style={{ flexDirection: 'row', padding: responsiveWidth(2.5) }}>
                        <TourGuideZone
                            zone={7}
                            text={t('hereYouCanSeeTheResultOfTheQuizYouAnswered')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateQuizResult} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/9913/9913576.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(1) }}>{t(`quizResult`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                        <Space width={responsiveFontSize(2)} />
                        <TourGuideZone
                            zone={8}
                            text={t('hereYouCanSeeTheInvitationOfTheTransporter')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateTransporterInvitation} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/6003/6003724.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), textAlign: 'center', fontWeight: '500', marginTop: responsiveFontSize(1) }}>{t(`transporterInvitations`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                    </View>
                    <Space height={responsiveFontSize(.2)} />
                    <View style={{ flexDirection: 'row', padding: responsiveWidth(2.5) }}>
                        <TourGuideZone
                            zone={9}
                            text={t('driverCanVerifyHere')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateVerifiedNow} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/837/837732.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(1) }}>{t(`getVerifiedNow`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                        <Space width={responsiveFontSize(2)} />
                        <View style={{ flex: 1 }} />
                    </View>
                </View>}
                {isTransporter && <View>
                    <View style={{ flexDirection: 'row', padding: responsiveWidth(2.5) }}>
                        <TourGuideZone
                            zone={1}
                            text={t('viewTotalJobPostsAndJobApplicationsHere')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateDashboard} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/610/610106.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(1) }}>{t(`dashboard`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                        <Space width={responsiveFontSize(2)} />
                        <TourGuideZone
                            zone={2}
                            text={t('hereYouCanPostDriverJobs')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateAddJob} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/11231/11231532.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(1) }}>{t(`addJobs`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                    </View>
                    <Space height={responsiveFontSize(.2)} />
                    <View style={{ flexDirection: 'row', padding: responsiveWidth(2.5) }}>
                        <TourGuideZone
                            zone={3}
                            text={t('hereYouCanSeeAllThePostedJobs')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateViewJobs} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2966/2966773.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(1) }}>{t(`viewJobs`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                        <Space width={responsiveFontSize(2)} />
                        <TourGuideZone
                            zone={4}
                            text={t('hereYouCanSeeTheListOfDriversWhoHaveAppliedForTheJobs')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateAppliedJobsTransporter} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/11651/11651437.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(1) }}>{t(`viewApplications`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                    </View>
                    <Space height={responsiveFontSize(.2)} />
                    <View style={{ flexDirection: 'row', padding: responsiveWidth(2.5) }}>
                        <TourGuideZone
                            zone={5}
                            text={t('hereYouCanAddTheDriversYouWantTrainingFor')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateAddDriver} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2), aspectRatio: 1.2 }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/6008/6008817.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(1) }}>{t(`addDriver`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                        <Space width={responsiveFontSize(2)} />
                        <TourGuideZone
                            zone={6}
                            text={t('hereYouCanSeeTheListOfDriversAddedForTraining')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateDriverList} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/6012/6012282.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(1) }}>{t(`driverList`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                    </View>
                    <Space height={responsiveFontSize(.2)} />
                    <View style={{ flexDirection: 'row', padding: responsiveWidth(2.5) }}>
                        <TourGuideZone
                            zone={7}
                            text={t('hereYouCanVerifyYourDrivers')}
                            borderRadius={16}
                            style={{ flex: 1 }}>
                            <TouchableOpacity onPress={_navigateTranspoerterVerification} activeOpacity={.7} style={{ flex: 1, backgroundColor: colors.white, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.16) : colors.blackOpacity(.3), borderRadius: 10 }}>
                                <View style={{ flex: 1, width: '100%', backgroundColor: colors.white, alignItems: 'center', padding: responsiveFontSize(2), borderRadius: 10, borderColor: colors.blackOpacity(.1), borderWidth: 1 }}>
                                    <Image style={{ height: responsiveFontSize(5.2), width: responsiveFontSize(5.2) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/837/837732.png' }} />
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(1), textAlign: "center" }}>{t(`getYourDriverVerified`)}</Text>
                                </View>
                            </TouchableOpacity>
                        </TourGuideZone>
                        <Space width={responsiveFontSize(2)} />
                        <View style={{ flex: 1 }} />
                    </View>
                </View>}
                {(isDriver && recommendedJobsList?.length) ? <View>
                    <View style={{ flex: 1 }}>
                        <FlatList
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            data={recommendedJobsList.length ? recommendedJobsList.slice(0, 5) : []}
                            scrollEnabled={false}
                            ListHeaderComponent={() => {
                                return (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: responsiveFontSize(2) }}>
                                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.2), fontWeight: '500', textDecorationLine: 'underline' }}>{t(`recommendedJobsYou`)}</Text>
                                    </View>
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
                                    <View style={{ width: responsiveWidth(95), backgroundColor: colors.white, padding: responsiveFontSize(1.5), borderRadius: 10, marginBottom: responsiveFontSize(4), ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.4) }}>
                                        <Text style={{ fontSize: responsiveFontSize(2.2), color: colors.black, fontWeight: '500' }}>{item.job_title}</Text>
                                        <Space height={responsiveHeight(1)} />
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
                                        {errorsJobs[item.id]?.checkBox && (
                                            <View style={{ flexDirection: 'row', marginTop: responsiveHeight(1) }}>
                                                <Text style={{ color: colors.error, fontSize: responsiveFontSize(1.7), marginLeft: responsiveFontSize(0.5) }}>
                                                    {errorsJobs[item.id]?.checkBox}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: responsiveFontSize(1.5), borderTopColor: colors?.blackOpacity(.05), borderTopWidth: 1, paddingTop: responsiveFontSize(1.5) }}>
                                            <View style={{ flex: 1.5 }}>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <TouchableOpacity onPress={() => _applyJob(item?.id)} activeOpacity={.7} style={{ height: responsiveHeight(5), flex: 1, flexDirection: 'row', backgroundColor: colors.royalBlue, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
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
                                        <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.blackOpacity(.7), fontWeight: '400', marginTop: responsiveFontSize(1) }}>
                                            {isExpanded ? item.Job_Description : shortDescription}
                                        </Text>
                                        <TouchableOpacity onPress={() => toggleExpand(item.id)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveFontSize(1) }}>
                                            <Text style={{ fontSize: responsiveFontSize(2), color: colors.royalBlue, fontWeight: '600' }}>
                                                {isExpanded ? t("showLess") : t("showMore")}
                                            </Text>
                                            <FontAwesome6 name={!isExpanded ? 'chevron-down' : 'chevron-up'} size={14} color={colors.royalBlue} style={{ marginHorizontal: responsiveFontSize(.7), marginTop: responsiveFontSize(.2) }} />
                                        </TouchableOpacity>
                                        <Space height={responsiveHeight(1)} />
                                    </View>
                                );
                            }}
                            contentContainerStyle={{ paddingHorizontal: responsiveWidth(2.5), paddingBottom: responsiveHeight(5), paddingTop: responsiveHeight(2) }}
                            keyExtractor={(item: any) => item?.id.toString()}
                            ListFooterComponent={() => {
                                return (
                                    <View style={{ alignItems: 'center' }}>
                                        {recommendedJobsList.length > 5 && <>
                                            <Space height={responsiveHeight(2)} />
                                            <TouchableOpacity onPress={() => navigation.navigate(STACKS.SUITS_JOB)} activeOpacity={.7} style={{ height: responsiveHeight(5), width: responsiveWidth(32), flex: 1, flexDirection: 'row', backgroundColor: colors.royalBlue, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
                                                <>
                                                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t(`viewAll`)}</Text>
                                                    <Feather name='chevron-up' size={20} color={colors.white} style={{ marginLeft: responsiveFontSize(1), top: 2 }} />
                                                </>
                                            </TouchableOpacity>
                                        </>}
                                        <Space height={responsiveHeight(10)} />
                                    </View>
                                )
                            }} />
                    </View>
                </View> : null}
                {showLottie && <View style={{ height: responsiveHeight(100), width: responsiveWidth(100), alignItems: 'center', justifyContent: 'center', position: 'absolute', pointerEvents: 'none' }}>
                    <LottieView style={{ height: responsiveHeight(50), width: responsiveWidth(70) }} source={require('@truckmitr/res/lotties/boom.json')} autoPlay loop />
                </View>}
                {isTransporter && <>
                    <Space height={responsiveHeight(2)} />
                    <View style={{ backgroundColor: colors.royalBlueOpacity(.9), padding: responsiveWidth(5) }}>
                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(2.4), fontWeight: 'bold' }}>{t(`elevatingTheIndianTitle`)}</Text>
                        <Text style={{ color: colors.whiteOpacity(.8), fontSize: responsiveFontSize(1.6), fontWeight: '400' }}>{t(`elevatingTheIndianSubTitle`)}</Text>
                    </View>
                    <View style={{ width: responsiveWidth(100), backgroundColor: colors.royalBlueOpacity(.02) }}>
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.6), textAlign: 'center', fontWeight: '500', margin: responsiveFontSize(1.5) }}>{`© 2025 TruckMitr Corporate Services Private Limited. \nAll Rights Reserved.`}</Text>
                    </View>
                </>}
            </ScrollView>
        </View>
    )
})

export default Home