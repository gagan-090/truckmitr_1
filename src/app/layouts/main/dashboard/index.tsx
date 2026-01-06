

import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, Animated, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import Svg, { Circle } from "react-native-svg";
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Foundation from 'react-native-vector-icons/Foundation'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { hitSlop, isIOS } from '@truckmitr/src/app/functions';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { BASE_URL, END_POINTS } from '@truckmitr/src/utils/config';
import { useTranslation } from 'react-i18next';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { getUserBadgeText } from '@truckmitr/src/utils/global';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

type TierType = 'TRUSTED' | 'VERIFIED' | 'JOB READY' | 'Standard' | 'LEGACY' | 'TRANSPORTER PRO';

// Helper function to get tier from payment_type
const getTierFromPaymentType = (paymentType: string, amount?: number, role?: string): TierType => {
    // Legacy driver detection: Rs 49 or Rs 100 payment for DRIVERS
    if (role === 'driver' && (amount === 49 || amount === 49.00 || amount === 100 || amount === 100.00)) {
        return 'LEGACY';
    }

    // Legacy transporter detection: Rs 100/99 payment for TRANSPORTERS
    if (role === 'transporter' && (amount === 99 || amount === 99.00 || amount === 100 || amount === 100.00)) {
        return 'LEGACY';
    }

    const normalizedType = paymentType?.toUpperCase().replace(/\s+/g, ' ').trim();
    if (normalizedType === 'TRUSTED') return 'TRUSTED';
    if (normalizedType === 'VERIFIED') return 'VERIFIED';
    if (normalizedType === 'JOB READY' || normalizedType === 'JOBREADY') return 'JOB READY';
    if (normalizedType === 'STANDARD') return 'Standard';
    if (normalizedType === 'LEGACY') return 'LEGACY';
    if (normalizedType === 'TRANSPORTER PRO') return 'TRANSPORTER PRO';
    return 'JOB READY';
};

// Get the actual paid amount from subscription
const getPaidAmount = (subscriptionDetails: any, isDriver: boolean): number => {
    // Amount is stored directly on subscription object as string (e.g., "99.00")
    if (subscriptionDetails?.amount) {
        return parseFloat(subscriptionDetails.amount);
    }
    // Fallback to payment_details.amount (in paise, needs /100)
    if (subscriptionDetails?.payment_details?.amount) {
        return subscriptionDetails.payment_details.amount / 100;
    }
    // Default fallback
    return isDriver ? 199 : 499;
};

const capitalizeFirst = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Helper Component for Dashboard Cards
interface DashboardCardProps {
    title: string;
    subtitle: string;
    count: any;
    icon: string;
    onPress: () => void;
    badge?: string;
    badgeColor?: string;
    colors: any;
    shadow: any;
    responsiveFontSize: (f: number) => number;
}

const DashboardCard = ({ title, count, icon, onPress, badge, badgeColor, colors, shadow, responsiveFontSize }: DashboardCardProps) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
                <Animated.View style={{
                    flex: 1,
                    backgroundColor: colors.white,
                    borderRadius: 14,
                    paddingVertical: responsiveFontSize(1.5),
                    paddingHorizontal: responsiveFontSize(0.5),
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: responsiveFontSize(14),
                    ...shadow,
                    shadowColor: colors.blackOpacity(.08),
                    elevation: 2,
                    borderWidth: 1,
                    borderColor: colors.blackOpacity(0.1),
                    transform: [{ scale: scaleAnim }]
                }}>
                    <View style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderRadius: 12, marginBottom: 5 }}>
                        <Image style={{ height: responsiveFontSize(3.5), width: responsiveFontSize(3.5) }} source={{ uri: icon }} />
                    </View>

                    {count !== undefined && count !== null && (
                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(2), fontWeight: '700', marginBottom: 2 }}>{`${count}`}</Text>
                    )}

                    {badge && (
                        <View style={{ position: 'absolute', top: 5, right: 5, backgroundColor: badgeColor || 'red', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 }}>
                            <Text style={{ color: 'white', fontSize: 8, fontWeight: '700' }}>{badge}</Text>
                        </View>
                    )}

                    <Text style={{ color: '#001F3F', fontSize: responsiveFontSize(1.3), fontWeight: '600', textAlign: 'center' }} numberOfLines={2}>{title}</Text>
                </Animated.View>
            </TouchableWithoutFeedback>
        </View>
    );
};

export default function Dashboard() {
    const { t } = useTranslation();
    const dispatch = useDispatch()
    useStatusBarStyle('dark-content')
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { shadow } = useShadow()
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const [suitsJobCount, setSuitsJobCount] = React.useState<number | null>(null);

    const { user, isDriver, isTransporter, profileCompletion, dashboard, rank, star_rating, subscriptionDetails, subscriptionModal, } = useSelector((state: any) => { return state?.user }) || {};

    const progress = profileCompletion || 0; // Profile completion percentage
    const size = responsiveFontSize(8); // Size of the circle
    const strokeWidth = 7;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference - (progress / 100) * circumference;

    const _goback = () => {
        navigation.goBack()
    }

    const _navigateBottomScreen = (sreen: any, params?: object) => {
        if (subscriptionDetails?.showSubscriptionModel && isTransporter && sreen === "transporterAppliedJob") {
            !subscriptionModal && dispatch(subscriptionModalAction(true))
        } else {
            // Go back to home screen first
            navigation.goBack();
            // Then navigate to the target tab after a short delay
            setTimeout(() => {
                navigation.navigate(STACKS.BOTTOM_TAB, {
                    screen: sreen,
                    params: params,
                });
            }, 100);
        }
    };

    console.log('-------------------subscriptionDetails-----------------', subscriptionDetails);


    const _navigateToQuizTrainingScreen = () => {
        if (subscriptionDetails?.showSubscriptionModel && isDriver) {
            !subscriptionModal && dispatch(subscriptionModalAction(true));
        } else {
            _navigateBottomScreen(STACKS.TRAINING, { quizModal: true });
        }
    }



    const getSuitsJobCount = async () => {
        try {
            const response = await axiosInstance.get(END_POINTS.JOB_THAT_SUITS_YOU);
            if (response.data && Array.isArray(response.data.data)) {
                setSuitsJobCount(response.data.data.length);
            } else {
                setSuitsJobCount(0);
            }
        } catch (error) {
            console.error('Error fetching suits jobs:', error);
            setSuitsJobCount(0);
        }
    };

    const [interviewsCount, setInterviewsCount] = React.useState<number | null>(null);

    const getInterviewsCount = async () => {
        try {
            const response = await axiosInstance.get(END_POINTS.DRIVER_INTERVIEW);
            if (response.data && Array.isArray(response.data.data)) {
                setInterviewsCount(response.data.data.length);
            } else {
                setInterviewsCount(0);
            }
        } catch (error) {
            console.error('Error fetching interviews count:', error);
            setInterviewsCount(0);
        }
    };

    // Fetch jobs that suits you count
    useEffect(() => {
        if (isDriver) {
            getSuitsJobCount();
            getInterviewsCount();
        }
    }, [isDriver]);

    // Determine Driver Badge Text using utility function
    // const driverBadgeText = getUserBadgeText({
    //     user,
    //     subscriptionDetails,
    //     isDriver
    // });

    const getDriverBadgeText = () => {

        if (subscriptionDetails?.hasActiveSubscription || !subscriptionDetails?.showSubscriptionModel) {

            const paymentType = subscriptionDetails?.payment_type || 'JOB READY';

            const amount = parseFloat(subscriptionDetails?.amount) || 0;

            const tier = getTierFromPaymentType(paymentType, amount);

            if (tier === 'TRUSTED') return t('cardTrustedDriver') || 'Trusted Driver';

            if (tier === 'VERIFIED') return t('cardVerifiedDriver') || 'Verified Driver';

            if (tier === 'LEGACY') return t('cardLegacyDriver') || 'Legacy Driver';
            if (tier === 'JOB READY') return t('cardJobReadyDriver') || 'Job Ready Driver';
            return t('cardJobReadyDriver') || 'Job Ready Driver';
        }
        return t('cardJobReadyDriver') || 'Job Ready Driver';
    };

    const driverBadgeText = getDriverBadgeText();



    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.white }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
            <Space height={safeAreaInsets.top} />
            {/* Navigation Header */}
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', paddingHorizontal: responsiveWidth(3), paddingTop: responsiveWidth(2), paddingBottom: 0 }}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100, ...shadow }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{t(`dashboard`)}</Text>
            </View>

            {/* Simple Header - Profile Left, Info Right */}
            {isDriver ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: responsiveWidth(5), paddingBottom: responsiveWidth(3), paddingTop: 0, alignItems: 'flex-start', marginTop: responsiveHeight(1) }}>
                    {/* Left: Hi, Name, TM ID, Driver Badge */}
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: responsiveFontSize(2.3), color: colors.royalBlue, fontFamily: 'Inter-Bold', fontWeight: 'bold' }}>{t(`hi`)}</Text>
                            <Text style={{ fontSize: responsiveFontSize(2.3), color: colors.royalBlue, fontFamily: 'Inter-Bold', fontWeight: 'bold' }}>{`, ${user?.name || ''} 👋`}</Text>
                        </View>
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.6), fontFamily: 'Inter-Bold', fontWeight: 'bold', marginTop: 2 }}>{`${user?.unique_id || ''}`}</Text>
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.4), fontFamily: 'Inter-Bold', fontWeight: 'bold', marginTop: 2 }}>{driverBadgeText}</Text>
                    </View>

                    {/* Right: Profile Avatar with Progress Ring */}
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => navigation.navigate(STACKS.PROFILE)} activeOpacity={.7} style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                                <Svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0 }}>
                                    {/* Background Circle */}
                                    <Circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        stroke={colors.blackOpacity(.07)}
                                        strokeWidth={strokeWidth}
                                        fill="none"
                                    />
                                    {/* Progress Circle */}
                                    <Circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        stroke="#FFD700"
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
                                    <Text style={{ fontSize: responsiveFontSize(1.0), color: 'green', fontWeight: '700' }}>{`${profileCompletion}%`}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Stars & Rank */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: responsiveFontSize(1.5), gap: 2 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <FontAwesome
                                    key={i}
                                    name={i < (star_rating || 0) ? "star" : "star-o"}
                                    size={responsiveFontSize(1.6)}
                                    color={i < (star_rating || 0) ? "#FFD700" : "#D3D3D3"}
                                />
                            ))}
                        </View>
                        <View style={{ marginTop: 2, backgroundColor: colors.white, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: responsiveFontSize(1.2), color: colors.royalBlue, fontFamily: 'Inter-Bold', textAlign: 'center' }}>💎 {rank || 'N/A'}</Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={{ flexDirection: 'row', paddingHorizontal: responsiveWidth(5), paddingBottom: responsiveWidth(5), paddingTop: 0, alignItems: 'center' }}>
                    {/* Left: Profile Avatar with Progress Ring */}
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => navigation.navigate(STACKS.PROFILE)} activeOpacity={1} style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Svg width={size} height={size} style={{ position: "absolute" }}>
                                {/* Background Circle */}
                                <Circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    stroke={colors.blackOpacity(.07)}
                                    strokeWidth={strokeWidth}
                                    fill="none"
                                />
                                {/* Progress Circle */}
                                <Circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    stroke="#FFD700"
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
                    </View>

                    {/* Right: Info */}
                    <View style={{ flex: 1, marginLeft: responsiveWidth(4) }}>
                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.2), fontWeight: '600' }}>{user?.name || 'Transporter'}</Text>
                        <Text style={{ color: colors.blackOpacity(0.6), fontSize: responsiveFontSize(1.6), fontWeight: '400', marginTop: 2 }}>{`TM ID: ${user?.unique_id || 'N/A'}`}</Text>
                        <View style={{ backgroundColor: colors.royalBlueOpacity(0.1), alignSelf: 'flex-start', paddingVertical: responsiveFontSize(.3), paddingHorizontal: responsiveFontSize(1.5), borderRadius: 100, marginTop: responsiveFontSize(.5) }}>
                            <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.5), fontWeight: '500' }}>{capitalizeFirst(user?.role) || 'Transporter'}</Text>
                        </View>
                    </View>
                </View>
            )}
            {/*  */}
            {isTransporter ? <>
                <Space height={responsiveFontSize(3)} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: responsiveWidth(2.5) }}>
                    <TouchableOpacity onPress={() => _navigateBottomScreen(STACKS.VIEW_JOBS)} activeOpacity={.7} style={{ width: responsiveWidth(46.25), backgroundColor: colors.white, borderRadius: 10, padding: responsiveFontSize(2), borderColor: colors.blueOpacity(.1), borderWidth: 1, ...shadow, shadowColor: isIOS() ? colors.blueOpacity(.2) : colors.blueOpacity(.3) }}>
                        <View style={{ height: responsiveFontSize(4.5), width: responsiveFontSize(4.5), backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', borderRadius: 100 }}>
                            <MaterialIcons name={'business-center'} size={18} color={colors.white} style={{}} />
                        </View>
                        <Text style={{ color: colors.blue, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(.5) }}>{t(`totalJobPosted`)}</Text>
                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.2), fontWeight: '600' }}>{`${dashboard?.total_jobs_posted}`}</Text>
                        <Text style={{ color: colors.blackOpacity(.5), fontSize: responsiveFontSize(1.4), fontWeight: '500' }}>{t(`manageYourPostings`)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => _navigateBottomScreen(STACKS.TRANSPORTER_APPLIED_JOB)} activeOpacity={.7} style={{ width: responsiveWidth(46.25), backgroundColor: colors.white, borderRadius: 10, padding: responsiveFontSize(2), borderColor: colors.purpleOpacitiy(.1), borderWidth: 1, ...shadow, shadowColor: isIOS() ? colors.purpleOpacitiy(.2) : colors.purpleOpacitiy(.3) }}>
                        <View style={{ height: responsiveFontSize(4.5), width: responsiveFontSize(4.5), backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', borderRadius: 100 }}>
                            <FontAwesome6 name={'user-tie'} size={18} color={colors.white} style={{}} />
                        </View>
                        <Text style={{ color: colors.purple, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(.5) }}>{t(`totalApplicants`)}</Text>
                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.2), fontWeight: '600' }}>{`${dashboard?.total_applications}`}</Text>
                        <Text style={{ color: colors.blackOpacity(.5), fontSize: responsiveFontSize(1.4), fontWeight: '500' }}>{t(`reviewAllApplicants`)}</Text>
                    </TouchableOpacity>
                </View>
            </> :
                <>
                    {/* SECTION: JOBS */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 24, marginBottom: 12 }}>
                        <Ionicons name="briefcase-outline" size={20} color={colors.royalBlue} style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: colors.royalBlue }}>Jobs</Text>
                    </View>

                    {/* Row 1: Jobs Section - 3 Items */}
                    <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 14 }}>
                        <DashboardCard
                            title="All Available Jobs"
                            subtitle=""
                            count={dashboard?.total_availablejobs}
                            icon="https://cdn-icons-png.flaticon.com/512/3281/3281289.png"
                            onPress={() => _navigateBottomScreen(STACKS.JOB)}
                            // badge="New"
                            // badgeColor="#22C55E"
                            colors={colors}
                            shadow={shadow}
                            responsiveFontSize={responsiveFontSize}
                        />
                        <Space width={responsiveFontSize(1.5)} />
                        <DashboardCard
                            title={t(`appliedJobs`)}
                            subtitle=""
                            count={dashboard?.total_applyjobs}
                            icon="https://cdn-icons-png.flaticon.com/512/11651/11651437.png"
                            onPress={() => navigation.navigate(STACKS.APPLIED_JOB)}
                            colors={colors}
                            shadow={shadow}
                            responsiveFontSize={responsiveFontSize}
                        />
                        <Space width={responsiveFontSize(1.5)} />
                        <DashboardCard
                            title={t(`jobsThatSuitsYou`)}
                            subtitle=""
                            count={suitsJobCount !== null ? suitsJobCount : dashboard?.jobs_that_suit_you}
                            icon="https://cdn-icons-png.flaticon.com/512/2966/2966773.png"
                            onPress={() => {
                                if (subscriptionDetails?.showSubscriptionModel && isDriver) {
                                    dispatch(subscriptionModalAction(true))
                                } else {
                                    if (dashboard?.jobs_that_suit_you === 0) {
                                        showToast(t(`youNeedToUpdateYourProfileFirstToSeeJobs`))
                                    } else {
                                        navigation.navigate(STACKS.SUITS_JOB)
                                    }
                                }
                            }}
                            colors={colors}
                            shadow={shadow}
                            responsiveFontSize={responsiveFontSize}
                        />
                    </View>

                    {/* SECTION: TRAINING & CERTIFICATE */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 24, marginBottom: 12 }}>
                        <Ionicons name="school-outline" size={20} color={colors.royalBlue} style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: colors.royalBlue }}>Training & Certificate</Text>
                    </View>

                    {/* Row 1: Training Section - 3 Items */}
                    <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
                        <DashboardCard
                            title={t(`trainingVideos`)}
                            subtitle=""
                            count={dashboard?.total_videos}
                            icon="https://cdn-icons-png.flaticon.com/512/11825/11825158.png"
                            onPress={() => _navigateBottomScreen(STACKS.TRAINING)}
                            colors={colors}
                            shadow={shadow}
                            responsiveFontSize={responsiveFontSize}
                        />
                        <Space width={responsiveFontSize(1.5)} />
                        <DashboardCard
                            title={`Health & Hygiene\nVideo`}
                            subtitle=""
                            count={dashboard?.total_health_hygiene}
                            icon="https://cdn-icons-png.flaticon.com/512/2382/2382461.png"
                            onPress={() => _navigateBottomScreen(STACKS.HEALTH_HYGIENE)}
                            // badge="Pending"
                            // badgeColor="#EAB308"
                            colors={colors}
                            shadow={shadow}
                            responsiveFontSize={responsiveFontSize}
                        />
                        <Space width={responsiveFontSize(1.5)} />
                        <DashboardCard
                            title={t(`quizzes`)}
                            subtitle=""
                            count={dashboard?.total_quizzes}
                            icon="https://cdn-icons-png.flaticon.com/512/9913/9913576.png"
                            onPress={_navigateToQuizTrainingScreen}
                            colors={colors}
                            shadow={shadow}
                            responsiveFontSize={responsiveFontSize}
                        />
                    </View>

                    {/* SECTION: COMMUNICATION */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 24, marginBottom: 12 }}>
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.royalBlue} style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: colors.royalBlue }}>Communication</Text>
                    </View>

                    {/* Row 1: Communication Section - 3 Items */}
                    <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 24 }}>
                        <DashboardCard
                            title={`Transporter\nInvitations`}
                            subtitle=""
                            count={dashboard?.total_invites ?? 0}
                            icon="https://cdn-icons-png.flaticon.com/512/6003/6003724.png"
                            onPress={() => navigation.navigate(STACKS.JOB_INVITATIONS_LIST)}
                            colors={colors}
                            shadow={shadow}
                            responsiveFontSize={responsiveFontSize}
                        />
                        <Space width={responsiveFontSize(1.5)} />
                        <DashboardCard
                            title={`Video Interview\nInvitation`}
                            subtitle=""
                            count={interviewsCount ?? 0}
                            icon="https://cdn-icons-png.flaticon.com/512/1256/1256650.png"
                            onPress={() => navigation.navigate(STACKS.SCHEDULED_INTERVIEWS)}
                            colors={colors}
                            shadow={shadow}
                            responsiveFontSize={responsiveFontSize}
                        />
                        <Space width={responsiveFontSize(1.5)} />
                        <DashboardCard
                            title={t('callJobManager', 'Call Job Manager')}
                            subtitle=""
                            count={0}
                            icon="https://cdn-icons-png.flaticon.com/512/724/724664.png"
                            onPress={() => navigation.navigate(STACKS.CALL_JOB_MANAGER_INFO)}
                            colors={colors}
                            shadow={shadow}
                            responsiveFontSize={responsiveFontSize}
                        />
                    </View>
                    <Space height={responsiveFontSize(3)} />
                </>}
        </ScrollView>
    )
}
