import { ActivityIndicator, Text, TouchableOpacity, View, Animated, StyleSheet, Pressable } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
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
import { Image } from 'react-native';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Subscription from '../subscription';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
import LinearGradient from 'react-native-linear-gradient';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

// Job Card Component with animations
const JobCard = ({ item, expandedJobs, toggleExpand, checkBoxSelect, _onpressCheckBox, errors, loadingApplyJob, _applyJob, colors, responsiveFontSize, responsiveHeight, responsiveWidth, t, navigation }: any) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const isExpanded = expandedJobs[item.id] || false;
    const shortDescription = item?.Job_Description?.length > 200
        ? item?.Job_Description.slice(0, 200) + "..."
        : item?.Job_Description;

    let skills: string[] = [];
    try {
        const parsed = JSON.parse(item?.Preferred_Skills);
        skills = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
        skills = [item?.Preferred_Skills];
    }

    return (
        <Animated.View
            style={{
                transform: [
                    { scale: scaleAnim },
                    { translateY: slideAnim }
                ],
                opacity: fadeAnim,
            }}
        >
            <View style={[styles.cardContainer, {
                width: responsiveWidth(92),
                backgroundColor: colors.white,
                marginBottom: responsiveHeight(2.5),
                borderRadius: responsiveFontSize(2),
                overflow: 'hidden',
                shadowColor: colors.royalBlue,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 8,
            }]}>
                {/* Gradient Header Accent */}
                <LinearGradient
                    colors={[colors.royalBlue + '15', colors.royalBlue + '05', 'transparent']}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, height: responsiveHeight(15) }}
                />

                {/* Card Content */}
                <View style={{ padding: responsiveFontSize(2.5) }}>
                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: responsiveFontSize(2.5),
                                color: colors.black,
                                fontWeight: '700',
                                letterSpacing: -0.5,
                                marginBottom: responsiveFontSize(0.5)
                            }}>
                                {item?.job_title}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveFontSize(0.5) }}>
                                <View style={{
                                    backgroundColor: colors.royalBlue + '15',
                                    paddingHorizontal: responsiveFontSize(1.2),
                                    paddingVertical: responsiveFontSize(0.5),
                                    borderRadius: responsiveFontSize(1),
                                }}>
                                    <Text style={{
                                        fontSize: responsiveFontSize(1.4),
                                        color: colors.royalBlue,
                                        fontWeight: '600'
                                    }}>
                                        ID: {item?.job_id}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={{ marginTop: responsiveFontSize(2) }}>
                        <Text style={{
                            fontSize: responsiveFontSize(1.85),
                            color: colors.blackOpacity(.65),
                            fontWeight: '400',
                            lineHeight: responsiveFontSize(2.8),
                            letterSpacing: 0.2
                        }}>
                            {isExpanded ? item?.Job_Description : shortDescription}
                        </Text>

                        {item?.Job_Description?.length > 200 && (
                            <Pressable
                                onPress={() => toggleExpand(item.id)}
                                style={({ pressed }) => [
                                    styles.expandButton,
                                    {
                                        marginTop: responsiveFontSize(1.5),
                                        opacity: pressed ? 0.6 : 1
                                    }
                                ]}
                            >
                                <Text style={{
                                    fontSize: responsiveFontSize(1.75),
                                    color: colors.royalBlue,
                                    fontWeight: '600',
                                    marginRight: responsiveFontSize(0.5)
                                }}>
                                    {isExpanded ? t("showLess") : t("showMore")}
                                </Text>
                                <FontAwesome6
                                    name={!isExpanded ? 'chevron-down' : 'chevron-up'}
                                    size={12}
                                    color={colors.royalBlue}
                                />
                            </Pressable>
                        )}
                    </View>

                    {/* Info Grid */}
                    <View style={{ marginTop: responsiveFontSize(3) }}>
                        {/* Salary & License */}
                        <View style={styles.infoRow}>
                            <InfoItem
                                icon={<FontAwesome name='rupee' size={16} color={colors.royalBlue} />}
                                label={t(`salary`)}
                                value={item?.Salary_Range}
                                colors={colors}
                                responsiveFontSize={responsiveFontSize}
                                flex={1.5}
                            />
                            <View style={{ width: responsiveFontSize(2) }} />
                            <InfoItem
                                icon={<MaterialCommunityIcons name='license' size={16} color={colors.royalBlue} />}
                                label={t(`typeOfLicense`)}
                                value={item?.Type_of_License}
                                colors={colors}
                                responsiveFontSize={responsiveFontSize}
                                flex={1}
                            />
                        </View>

                        {/* Location & No. of Jobs */}
                        <View style={[styles.infoRow, { marginTop: responsiveFontSize(1.5) }]}>
                            <InfoItem
                                icon={<FontAwesome6 name='location-dot' size={16} color={colors.royalBlue} />}
                                label={t(`location`)}
                                value={item?.job_location}
                                colors={colors}
                                responsiveFontSize={responsiveFontSize}
                                flex={1.5}
                            />
                            <View style={{ width: responsiveFontSize(2) }} />
                            <InfoItem
                                icon={<FontAwesome6 name='business-time' size={16} color={colors.royalBlue} />}
                                label={t(`noOfJobs`)}
                                value={item?.Job_Management}
                                colors={colors}
                                responsiveFontSize={responsiveFontSize}
                                flex={1}
                            />
                        </View>

                        {/* Experience & Vehicle Type */}
                        <View style={[styles.infoRow, { marginTop: responsiveFontSize(1.5) }]}>
                            <InfoItem
                                icon={<FontAwesome name='trophy' size={16} color={colors.royalBlue} />}
                                label={t(`experience`)}
                                value={item?.Required_Experience}
                                colors={colors}
                                responsiveFontSize={responsiveFontSize}
                                flex={1.5}
                            />
                            <View style={{ width: responsiveFontSize(2) }} />
                            <InfoItem
                                icon={<FontAwesome6 name='car-rear' size={16} color={colors.royalBlue} />}
                                label={t(`vehicleType`)}
                                value={item?.vehicle_type}
                                colors={colors}
                                responsiveFontSize={responsiveFontSize}
                                flex={1}
                            />
                        </View>

                        {/* Dates */}
                        <View style={[styles.infoRow, { marginTop: responsiveFontSize(1.5) }]}>
                            <InfoItem
                                icon={<FontAwesome name='calendar-o' size={16} color={colors.royalBlue} />}
                                label={t(`postDate`)}
                                value={moment(item?.Created_at).format("DD-MM-YYYY")}
                                colors={colors}
                                responsiveFontSize={responsiveFontSize}
                                flex={1.5}
                            />
                            <View style={{ width: responsiveFontSize(2) }} />
                            <InfoItem
                                icon={<FontAwesome name='calendar-minus-o' size={16} color={colors.royalBlue} />}
                                label={t(`lastDate`)}
                                value={item?.Application_Deadline}
                                colors={colors}
                                responsiveFontSize={responsiveFontSize}
                                flex={1}
                            />
                        </View>

                        {/* Skills - Full Width */}
                        {skills?.length > 0 && skills[0] && (
                            <View style={{
                                marginTop: responsiveFontSize(2),
                                backgroundColor: colors.royalBlue + '08',
                                borderRadius: responsiveFontSize(1.5),
                                padding: responsiveFontSize(1.8),
                                borderWidth: 1,
                                borderColor: colors.royalBlue + '15'
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveFontSize(1) }}>
                                    <FontAwesome6 name='child-reaching' size={16} color={colors.royalBlue} />
                                    <Text style={{
                                        color: colors.royalBlue,
                                        fontSize: responsiveFontSize(1.7),
                                        fontWeight: '600',
                                        marginLeft: responsiveFontSize(1)
                                    }}>
                                        {t(`preferredSkills`)}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: responsiveFontSize(1) }}>
                                    {skills.map((skill, index) => (
                                        skill && (
                                            <View key={index} style={{
                                                backgroundColor: colors.white,
                                                paddingHorizontal: responsiveFontSize(1.5),
                                                paddingVertical: responsiveFontSize(0.7),
                                                borderRadius: responsiveFontSize(1.2),
                                                borderWidth: 1,
                                                borderColor: colors.royalBlue + '25'
                                            }}>
                                                <Text style={{
                                                    color: colors.royalBlue,
                                                    fontSize: responsiveFontSize(1.6),
                                                    fontWeight: '500'
                                                }}>
                                                    {skill}
                                                </Text>
                                            </View>
                                        )
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Divider */}
                    <View style={{
                        height: 1,
                        backgroundColor: colors.blackOpacity(.08),
                        marginVertical: responsiveFontSize(3)
                    }} />

                    {/* Consent Checkbox */}
                    <Pressable
                        onPress={() => _onpressCheckBox(item.id)}
                        style={({ pressed }) => [
                            styles.consentContainer,
                            {
                                backgroundColor: checkBoxSelect[item.id]
                                    ? colors.royalBlue + '08'
                                    : colors.blackOpacity(.02),
                                borderRadius: responsiveFontSize(1.5),
                                padding: responsiveFontSize(1.8),
                                borderWidth: 1.5,
                                borderColor: checkBoxSelect[item.id]
                                    ? colors.royalBlue + '30'
                                    : colors.blackOpacity(.08),
                                opacity: pressed ? 0.7 : 1
                            }
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={checkBoxSelect[item.id] ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={26}
                            color={colors.royalBlue}
                            style={{ marginRight: responsiveFontSize(1.5) }}
                        />
                        <Text style={{
                            color: colors.blackOpacity(0.75),
                            fontSize: responsiveFontSize(1.7),
                            flex: 1,
                            lineHeight: responsiveFontSize(2.5),
                            fontWeight: '400'
                        }}>
                            {t(`iAgreeToTruckMitr`)}
                            <Text
                                onPress={() => navigation.navigate(STACKS?.DRIVER_CONSENT)}
                                style={{
                                    color: colors.royalBlue,
                                    fontWeight: '600',
                                    textDecorationLine: 'underline'
                                }}
                            >
                                {' '}{t(`driverConsent`)}
                            </Text>
                            {t(`applyJobPolicy`)}
                        </Text>
                    </Pressable>

                    {/* Error Message */}
                    {errors[item.id]?.checkBox && (
                        <View style={{
                            marginTop: responsiveFontSize(1.5),
                            backgroundColor: colors.error + '10',
                            padding: responsiveFontSize(1.5),
                            borderRadius: responsiveFontSize(1),
                            borderLeftWidth: 3,
                            borderLeftColor: colors.error
                        }}>
                            <Text style={{
                                color: colors.error,
                                fontSize: responsiveFontSize(1.6),
                                fontWeight: '500'
                            }}>
                                {errors[item.id]?.checkBox}
                            </Text>
                        </View>
                    )}

                    {/* Apply Button - Full Width */}
                    <Pressable
                        onPress={() => _applyJob(item?.id)}
                        disabled={loadingApplyJob === item?.id}
                        style={({ pressed }) => [
                            {
                                marginTop: responsiveFontSize(2.5),
                                height: responsiveFontSize(6.5),
                                borderRadius: responsiveFontSize(1.5),
                                overflow: 'hidden',
                                width: '100%',
                                opacity: pressed ? 0.85 : 1,
                                transform: [{ scale: pressed ? 0.98 : 1 }]
                            }
                        ]}
                    >
                        <LinearGradient
                            colors={[colors.royalBlue, colors.royalBlue + 'DD']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: colors.royalBlue,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 6,
                            }}
                        >
                            {loadingApplyJob === item?.id ? (
                                <ActivityIndicator color={colors.white} size="small" />
                            ) : (
                                <>
                                    <Text style={{
                                        color: colors.white,
                                        fontSize: responsiveFontSize(2.1),
                                        fontWeight: '600',
                                        letterSpacing: 0.5
                                    }}>
                                        {t(`apply`)}
                                    </Text>
                                    <Ionicons
                                        name='send'
                                        size={18}
                                        color={colors.white}
                                        style={{ marginLeft: responsiveFontSize(1.2) }}
                                    />
                                </>
                            )}
                        </LinearGradient>
                    </Pressable>
                </View>
            </View>
        </Animated.View>
    );
};

// Info Item Component
const InfoItem = ({ icon, label, value, colors, responsiveFontSize, flex }: any) => (
    <View style={{ flex }}>
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: responsiveFontSize(0.8)
        }}>
            {icon}
            <Text style={{
                color: colors.royalBlue,
                fontSize: responsiveFontSize(1.6),
                fontWeight: '600',
                marginLeft: responsiveFontSize(0.8),
                letterSpacing: 0.2
            }}>
                {label}
            </Text>
        </View>
        <Text style={{
            color: colors.blackOpacity(.75),
            fontSize: responsiveFontSize(1.75),
            fontWeight: '500',
            letterSpacing: 0.1
        }}>
            {value}
        </Text>
    </View>
);

export default function AvailableJob() {
    const { t } = useTranslation();
    const dispatch = useDispatch()
    const colors = useColor();
    const route = useRoute<any>();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();

    const [loadingApplyJob, setloadingApplyJob] = useState(-1)
    const [showLottie, setshowLottie] = useState(false)
    const [checkBoxSelect, setCheckBoxSelect] = useState<{ [jobId: number]: boolean }>({});
    const [errors, setErrors] = useState<{ [jobId: number]: { checkBox?: string } }>({});

    const { isDriver, subscriptionDetails, subscriptionModal } = useSelector((state: any) => { return state?.user })

    const { item } = route?.params

    const headerOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(headerOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    // Initialize all checkboxes as checked when jobs data loads
    useEffect(() => {
        if (item?.data?.length) {
            const initialCheckboxState: { [jobId: number]: boolean } = {};
            item.data.forEach((job: any) => {
                initialCheckboxState[job.id] = true;
            });
            setCheckBoxSelect(initialCheckboxState);
        }
    }, [item?.data]);

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

    const _goback = () => {
        navigation.goBack()
    }

    const [expandedJobs, setExpandedJobs] = useState<{ [key: number]: boolean }>({});

    const toggleExpand = (id: number) => {
        setExpandedJobs((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const _applyJob = async (id: any) => {
        if (!validate(id)) return;
        if (subscriptionDetails?.showSubscriptionModel && isDriver) {
            !subscriptionModal && dispatch(subscriptionModalAction(true))
        } else {
            try {
                setloadingApplyJob(id)
                const FormData = require('form-data');
                let data = new FormData();
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
                showToast(error?.response?.data?.message);
            } finally {
                setloadingApplyJob(-1)
            }
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.blackOpacity(.02) }}>
            <Space height={safeAreaInsets.top} />

            {/* Header */}
            <Animated.View
                style={{
                    opacity: headerOpacity,
                    backgroundColor: colors.white,
                    paddingHorizontal: responsiveWidth(4),
                    paddingVertical: responsiveHeight(2),
                    borderBottomWidth: 1,
                    borderBottomColor: colors.blackOpacity(.06),
                    shadowColor: colors.black,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Pressable
                        hitSlop={hitSlop(10)}
                        onPress={_goback}
                        style={({ pressed }) => [{
                            position: 'absolute',
                            left: 0,
                            height: responsiveFontSize(5),
                            width: responsiveFontSize(5),
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colors.royalBlue + '12',
                            borderRadius: responsiveFontSize(2.5),
                            opacity: pressed ? 0.6 : 1
                        }]}
                    >
                        <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                    </Pressable>

                    <Text style={{
                        fontSize: responsiveFontSize(2.4),
                        color: colors.royalBlue,
                        fontWeight: '700',
                        letterSpacing: -0.3
                    }}>
                        {t(`availableJobs`)}
                    </Text>
                </View>
            </Animated.View>

            {/* Content */}
            {item?.data?.length ? (
                <View style={{ flex: 1 }}>
                    <FlatList
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        data={item?.data}
                        renderItem={({ item: jobItem }: any) => (
                            <JobCard
                                item={jobItem}
                                expandedJobs={expandedJobs}
                                toggleExpand={toggleExpand}
                                checkBoxSelect={checkBoxSelect}
                                _onpressCheckBox={_onpressCheckBox}
                                errors={errors}
                                loadingApplyJob={loadingApplyJob}
                                _applyJob={_applyJob}
                                colors={colors}
                                responsiveFontSize={responsiveFontSize}
                                responsiveHeight={responsiveHeight}
                                responsiveWidth={responsiveWidth}
                                t={t}
                                navigation={navigation}
                            />
                        )}
                        contentContainerStyle={{
                            paddingHorizontal: responsiveWidth(4),
                            paddingTop: responsiveHeight(2.5),
                            paddingBottom: responsiveHeight(10)
                        }}
                        keyExtractor={(item) => item.id.toString()}
                    />
                </View>
            ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{
                        backgroundColor: colors.white,
                        borderRadius: responsiveFontSize(2.5),
                        padding: responsiveFontSize(4),
                        alignItems: 'center',
                        shadowColor: colors.black,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.08,
                        shadowRadius: 12,
                        elevation: 5,
                        marginHorizontal: responsiveWidth(8)
                    }}>
                        <Image
                            style={{
                                height: responsiveHeight(12),
                                width: responsiveWidth(60),
                                tintColor: colors.blackOpacity(.15),
                                marginBottom: responsiveHeight(2)
                            }}
                            source={{ uri: 'https://truckmitr.com/public/images/preview.png' }}
                        />
                        <Text style={{
                            color: colors.blackOpacity(.7),
                            fontSize: responsiveFontSize(2),
                            textAlign: 'center',
                            fontWeight: '500',
                            lineHeight: responsiveFontSize(3)
                        }}>
                            {t(`weCouldntFindAnyJobsCurrentFilters`)}
                        </Text>
                    </View>
                </View>
            )}

            {/* Success Lottie */}
            {showLottie && (
                <View style={{
                    height: responsiveHeight(100),
                    width: responsiveWidth(100),
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    pointerEvents: 'none',
                    backgroundColor: colors.blackOpacity(0.3)
                }}>
                    <LottieView
                        style={{ height: responsiveHeight(50), width: responsiveWidth(70) }}
                        source={require('@truckmitr/res/lotties/boom.json')}
                        autoPlay
                        loop
                    />
                </View>
            )}

            <Subscription />
        </View>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        alignSelf: 'center',
    },
    titleSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    consentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
