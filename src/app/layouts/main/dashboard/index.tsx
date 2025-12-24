import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
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
import { BASE_URL } from '@truckmitr/src/utils/config';
import { useTranslation } from 'react-i18next';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
import { showToast } from '@truckmitr/src/app/hooks/toast';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

const capitalizeFirst = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function Dashboard() {
    const { t } = useTranslation();
    const dispatch = useDispatch()
    useStatusBarStyle('dark-content')
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { shadow } = useShadow()
    const { responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();

    const { user, isDriver, isTransporter, profileCompletion, dashboard, rank, star_rating, subscriptionDetails, subscriptionModal, } = useSelector((state: any) => { return state?.user }) || {};

    const progress = profileCompletion || 0; // Profile completion percentage
    const size = responsiveFontSize(11); // Size of the circle
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
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                        {
                            name: STACKS.BOTTOM_TAB,
                            state: {
                                index: 0,
                                routes: [
                                    {
                                        name: sreen,
                                        params: params,
                                    },

                                ],
                            },
                        },
                    ],
                })
            );
        }
    };

    const _navigateToQuizTrainingScreen = () => {
        if (subscriptionDetails?.showSubscriptionModel && isDriver) {
            !subscriptionModal && dispatch(subscriptionModalAction(true));
        } else {
            _navigateBottomScreen(STACKS.TRAINING, { quizModal: true });
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{t(`dashboard`)}</Text>
            </View>
            <View style={{ flexDirection: 'row', padding: responsiveWidth(5), paddingVertical: responsiveWidth(2.5) }}>
                <View style={{ alignItems: 'center', }}>
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
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
                                stroke={colors.royalBlue}
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
                    </View>
                    {isDriver && <View style={{ flexDirection: 'row', marginTop: responsiveFontSize(2.5) }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <FontAwesome
                                key={i}
                                name={'star'}
                                size={14}
                                color={i < star_rating ? colors.royalBlue : colors.blackOpacity(.2)}
                                style={{ marginEnd: responsiveFontSize(.5) }}
                            />
                        ))}
                    </View>}
                </View>
                <View style={{ marginStart: responsiveFontSize(2.5) }}>
                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.6), fontWeight: '500' }}>{`${user?.name || ''}`}</Text>
                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.6), fontWeight: '400' }}>{`ID - ${user?.unique_id || ''}`}</Text>
                    <Text style={{ backgroundColor: colors?.blackOpacity(.05), alignSelf: 'flex-start', color: colors.black, fontSize: responsiveFontSize(1.7), fontWeight: '500', paddingVertical: responsiveFontSize(.1), paddingHorizontal: responsiveFontSize(2), borderRadius: 100 }}>{`${capitalizeFirst(user?.role)}`}</Text>
                    {isDriver && <View style={{ flexDirection: 'row', backgroundColor: colors.bronzeOpacity(.08), alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: responsiveFontSize(2), paddingVertical: responsiveFontSize(.2), marginTop: responsiveFontSize(1), borderRadius: 100 }}>
                        <Text style={{ color: colors.bronze, fontSize: responsiveFontSize(1.6), fontWeight: '500' }}>{rank}</Text>
                        <Image style={{ height: responsiveFontSize(2.6), width: responsiveFontSize(2.6) }} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/11881/11881945.png' }} />
                    </View>}
                </View>
                <View style={{ flex: 1 }} />

            </View>
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
                    <Space height={responsiveFontSize(3)} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: responsiveWidth(2.5) }}>
                        <TouchableOpacity onPress={() => navigation.navigate(STACKS.APPLIED_JOB)} activeOpacity={.7} style={{ width: responsiveWidth(46.25), backgroundColor: colors.white, borderRadius: 10, padding: responsiveFontSize(2), borderColor: colors.yellowOpacity(.1), borderWidth: 1, ...shadow, shadowColor: isIOS() ? colors.yellowOpacity(.2) : colors.yellowOpacity(.3) }}>
                            <View style={{ height: responsiveFontSize(4.5), width: responsiveFontSize(4.5), backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center', borderRadius: 100 }}>
                                <FontAwesome6 name={'user-shield'} size={16} color={colors.white} style={{ marginLeft: 4 }} />
                            </View>
                            <Text style={{ color: colors.yellow, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(.5) }}>{t(`appliedJobs`)}</Text>
                            <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.2), fontWeight: '600' }}>{`${dashboard?.total_applyjobs}`}</Text>
                            <Text style={{ color: colors.blackOpacity(.5), fontSize: responsiveFontSize(1.4), fontWeight: '500' }}>{t(`trackYourApplications`)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => _navigateBottomScreen(STACKS.TRAINING)} activeOpacity={.7} style={{ width: responsiveWidth(46.25), backgroundColor: colors.white, borderRadius: 10, padding: responsiveFontSize(2), borderColor: colors.blueOpacity(.1), borderWidth: 1, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blueOpacity(.3) }}>
                            <View style={{ height: responsiveFontSize(4.5), width: responsiveFontSize(4.5), backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', borderRadius: 100 }}>
                                <MaterialCommunityIcons name={'video-wireless'} size={18} color={colors.white} style={{}} />
                            </View>
                            <Text style={{ color: colors.blue, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(.5) }}>{t(`trainingVideos`)}</Text>
                            <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.2), fontWeight: '600' }}>{`${dashboard?.total_videos}`}</Text>
                            <Text style={{ color: colors.blackOpacity(.5), fontSize: responsiveFontSize(1.4), fontWeight: '500' }}>{t(`masterNewSkillsAnytime`)}</Text>
                        </TouchableOpacity>
                    </View>
                    <Space height={responsiveFontSize(3)} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: responsiveWidth(2.5) }}>
                        <TouchableOpacity onPress={_navigateToQuizTrainingScreen} activeOpacity={.7} style={{ width: responsiveWidth(46.25), backgroundColor: colors.white, borderRadius: 10, padding: responsiveFontSize(2), borderColor: colors.greenOpacitiy(.1), borderWidth: 1, ...shadow, shadowColor: isIOS() ? colors.greenOpacitiy(.2) : colors.greenOpacitiy(.3) }}>
                            <View style={{ height: responsiveFontSize(4.5), width: responsiveFontSize(4.5), backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', borderRadius: 100 }}>
                                <MaterialCommunityIcons name={'notebook-check'} size={18} color={colors.white} style={{}} />
                            </View>
                            <Text style={{ color: colors.green, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(.5) }}>{t(`quizzes`)}</Text>
                            <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.2), fontWeight: '600' }}>{`${dashboard?.total_quizzes}`}</Text>
                            <Text style={{ color: colors.blackOpacity(.5), fontSize: responsiveFontSize(1.4), fontWeight: '500' }}>{t(`levelUpYourSkills`)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => _navigateBottomScreen(STACKS.HEALTH_HYGIENE)} activeOpacity={.7} style={{ width: responsiveWidth(46.25), backgroundColor: colors.white, borderRadius: 10, padding: responsiveFontSize(2), borderColor: colors.roseRedOpacity(.1), borderWidth: 1, ...shadow, shadowColor: isIOS() ? colors.roseRedOpacity(.2) : colors.roseRedOpacity(.3) }}>
                            <View style={{ height: responsiveFontSize(4.5), width: responsiveFontSize(4.5), backgroundColor: colors.roseRed, alignItems: 'center', justifyContent: 'center', borderRadius: 100 }}>
                                <MaterialCommunityIcons name={'heart-pulse'} size={18} color={colors.white} style={{}} />
                            </View>
                            <Text style={{ color: colors.roseRed, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(.5) }}>{t(`healthHygiene`)}</Text>
                            <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.2), fontWeight: '600' }}>{dashboard?.total_health_hygiene}</Text>
                            <Text style={{ color: colors.blackOpacity(.5), fontSize: responsiveFontSize(1.4), fontWeight: '500' }}>{t(`yourFirstStepToWellness`)}</Text>
                        </TouchableOpacity>
                    </View>
                    <Space height={responsiveFontSize(3)} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: responsiveWidth(2.5) }}>
                        <TouchableOpacity onPress={() => _navigateBottomScreen(STACKS.JOB)} activeOpacity={.7} style={{ width: responsiveWidth(46.25), backgroundColor: colors.white, borderRadius: 10, padding: responsiveFontSize(2), borderColor: colors.purpleOpacitiy(.1), borderWidth: 1, ...shadow, shadowColor: isIOS() ? colors.purpleOpacitiy(.2) : colors.purpleOpacitiy(.3) }}>
                            <View style={{ height: responsiveFontSize(4.5), width: responsiveFontSize(4.5), backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', borderRadius: 100 }}>
                                <MaterialIcons name={'business-center'} size={18} color={colors.white} style={{}} />
                            </View>
                            <Text style={{ color: colors.purple, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(.5) }}>{t(`availableJobs`)}</Text>
                            <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.2), fontWeight: '600' }}>{`${dashboard?.total_availablejobs}`}</Text>
                            <Text style={{ color: colors.blackOpacity(.5), fontSize: responsiveFontSize(1.4), fontWeight: '500' }}>{t(`discoverApplySucceed`)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            if (subscriptionDetails?.showSubscriptionModel && isDriver) {
                                dispatch(subscriptionModalAction(true))
                            } else {
                                if (dashboard?.jobs_that_suit_you === 0) {
                                    showToast(t(`youNeedToUpdateYourProfileFirstToSeeJobs`))
                                } else {
                                    navigation.navigate(STACKS.SUITS_JOB)
                                }
                            }
                        }} activeOpacity={.7} style={{ width: responsiveWidth(46.25), backgroundColor: colors.white, borderRadius: 10, padding: responsiveFontSize(2), borderColor: colors.blackOpacity(.1), borderWidth: 1, ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.3) }}>
                            <View style={{ height: responsiveFontSize(4.5), width: responsiveFontSize(4.5), backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center', borderRadius: 100 }}>
                                <Foundation name={'torso-business'} size={18} color={colors.white} style={{}} />
                            </View>
                            <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '500', marginTop: responsiveFontSize(.5) }}>{t(`jobsThatSuitsYou`)}</Text>
                            <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.2), fontWeight: '600' }}>{`${dashboard?.jobs_that_suit_you}`}</Text>
                            <Text style={{ color: colors.blackOpacity(.5), fontSize: responsiveFontSize(1.4), fontWeight: '500' }}>{t(`findJobsTailoredJustForYou`)}</Text>
                        </TouchableOpacity>
                    </View>
                </>}
        </View>
    )
}
