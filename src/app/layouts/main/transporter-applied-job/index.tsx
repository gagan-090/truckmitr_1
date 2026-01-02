import { ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, View, Linking, ScrollView, BackHandler } from 'react-native'
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConfirmationModal, Space } from '@truckmitr/src/app/components';
import { hitSlop, isIOS } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { FlatList } from 'react-native';
import { BASE_URL, END_POINTS } from '@truckmitr/src/utils/config';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { ZegoSendCallInvitationButton } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet, { BottomSheetModal, BottomSheetView, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;



export default function TransporterAppliedJob() {
    const dispatch = useDispatch()
    const { t } = useTranslation();
    useStatusBarStyle('dark-content')
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { shadow } = useShadow()
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const [loading, setloading] = useState(true)
    const [appliedJobList, setappliedJobList] = useState([])
    const [search, setsearch] = useState('')
    const [acceptJobId, setacceptJobId] = useState<any>(-1)
    const [rejectJobId, setrejectJobId] = useState<any>(-1)
    const [accpetRejectLoading, setaccpetRejectLoading] = useState(false)
    const [showVideoInterviewModal, setShowVideoInterviewModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<any>(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [scheduleJob, setScheduleJob] = useState<any>(null);
    const MIN_OFFSET_MINUTES = 15;
    const [selectedInterviewDate, setSelectedInterviewDate] = useState<Date | null>(null);
    const [isDateSelected, setIsDateSelected] = useState(false);
    const [isTimeSelected, setIsTimeSelected] = useState(false);
    const [tempInterviewDate, setTempInterviewDate] = useState<Date | null>(null);
    const [tempIsDateSelected, setTempIsDateSelected] = useState(false);
    const [tempIsTimeSelected, setTempIsTimeSelected] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [expandedJobIds, setExpandedJobIds] = useState<string[]>([]);
    const [jobFilters, setJobFilters] = useState<Record<string, string>>({});

    const setFilter = (jobId: string, filter: string) => {
        setJobFilters(prev => ({ ...prev, [jobId]: filter }));
    };

    // Bottom Sheet Modal State
    const bottomSheetModalRef = useRef<BottomSheet>(null);
    const [selectedDriverForModal, setSelectedDriverForModal] = useState<any>(null);
    const snapPoints = useMemo(() => ['85%'], []);
    const [sheetIndex, setSheetIndex] = useState(-1);

    // Initial Back Handler
    useEffect(() => {
        const backAction = () => {
            if (sheetIndex >= 0) {
                bottomSheetModalRef.current?.close();
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [sheetIndex]);



    // Masking Utility Functions
    const maskAadhar = (aadhar: string) => {
        if (!aadhar || aadhar.length < 4) return '****';
        return `XXXX XXXX ${aadhar.slice(-4)}`;
    };

    const maskLicense = (license: string) => {
        if (!license || license.length < 4) return '****';
        return `${'X'.repeat(Math.max(0, license.length - 4))}${license.slice(-4)}`;
    };

    const maskMobile = (mobile: string) => {
        if (!mobile || mobile.length < 4) return '****';
        return `XXXXXX${mobile.slice(-4)}`;
    };

    const maskEmail = (email: string) => {
        if (!email) return '****';
        const parts = email.split('@');
        if (parts.length !== 2) return '****';
        return `${parts[0][0]}***@${parts[1]}`;
    };

    // Open Bottom Sheet Modal
    const openDriverProfileModal = (item: any) => {
        setSelectedDriverForModal(item);
        bottomSheetModalRef.current?.snapToIndex(0); // ✅ fixed height
    };

    // Close Bottom Sheet Modal
    const closeDriverProfileModal = () => {
        bottomSheetModalRef.current?.close();
    };

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                opacity={0.5}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior={'close'}
            />
        ),
        []
    );


    const safeInterviewDate = selectedInterviewDate ?? moment().add(15, 'minutes').toDate();
    const _fetchJobs = async () => {
        // return setappliedJobList(MOCK_APPLIED_JOBS as any);
        try {
            const response: any = await axiosInstance.get(END_POINTS?.TRANSPORTER_APPLIED_JOBS_LIST);
            if (response?.data?.status) {
                setappliedJobList(response?.data?.data);
                console.log('data-------------', response?.data?.data);

            } else {
                setappliedJobList([]);
            }
        } catch (error) {
            console.error("Error searching jobs:", error);
        } finally {
            setloading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            setloading(true)
            _fetchJobs();
        }, [])
    );

    const _goback = () => {
        navigation.goBack()
    }


    const _onPressAcceptApplication = async () => {
        try {
            setaccpetRejectLoading(true)
            const formData = new FormData();
            formData.append('status', `Accepted`);  // {`Pending`} {`Accepted`} {`Rejected`}
            const response: any = await axiosInstance.post(END_POINTS?.TRANSPORTER_JOB_ACCEPT_REJECT(acceptJobId), formData);
            if (response?.data?.status) {
                _fetchJobs()
            } else {
                showToast(response?.data?.message)
            }
        } catch (error) {

        } finally {
            setaccpetRejectLoading(false)
            setacceptJobId(-1)
        }
    }
    const _onPressRejectApplication = async () => {
        try {
            setaccpetRejectLoading(true)
            const formData = new FormData();
            formData.append('status', `Rejected`);  // {`Pending`} {`Accepted`} {`Rejected`}
            const response: any = await axiosInstance.post(END_POINTS?.TRANSPORTER_JOB_ACCEPT_REJECT(rejectJobId), formData);
            if (response?.data?.status) {
                _fetchJobs()
            } else {
                showToast(response?.data?.message)
            }
        } catch (error) {

        } finally {
            setaccpetRejectLoading(false)
            setrejectJobId(-1)
        }
    }

    const callToDriver = async (item: any) => {
        try {
            Linking.openURL(`tel:${item?.driver_mobile}`)
            const formData = new FormData();
            formData.append('id', item.driver_id);
            formData.append('job_id', item.job_id);
            const response: any = await axiosInstance.post(END_POINTS?.CALL_TRANSPORTER, formData);
            if (response?.data?.status) {
                console.log(response, "response")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const getInterviewUIState = (interviewAt?: string) => {
        if (!interviewAt) {
            return { type: 'NOT_SCHEDULED' };
        }

        const now = moment();
        const interviewTime = moment(interviewAt, 'YYYY-MM-DD HH:mm:ss');

        if (now.isBefore(interviewTime)) {
            return {
                type: 'SCHEDULED_FUTURE',
                label: t('interviewScheduledAt', {
                    dateTime: moment(interviewAt).format('DD MMM YYYY, h:mm A'),
                }),
            };
        }

        return { type: 'READY' };
    };


    const getMinimumTime = () => {
        const nowPlus15 = moment().add(MIN_OFFSET_MINUTES, 'minutes');

        const isToday =
            moment(safeInterviewDate).format('YYYY-MM-DD') ===
            moment().format('YYYY-MM-DD');

        return isToday ? nowPlus15.toDate() : undefined;
    };

    const openScheduleModal = () => {
        setTempInterviewDate(selectedInterviewDate);
        setTempIsDateSelected(isDateSelected);
        setTempIsTimeSelected(isTimeSelected);
        setShowScheduleModal(true);
    };

    const onConfirm = async () => {
        if (!tempIsDateSelected || !tempIsTimeSelected) return;

        // Combine selected date + time into one moment
        const selectedDateTime = moment(tempInterviewDate);

        // Compare with current time
        if (selectedDateTime.isBefore(moment())) {
            showToast(t('pleaseSelectFutureDateAndTime'));
            return;
        }

        try {
            setScheduleLoading(true);
            const formData = new FormData();
            formData.append('applyjobs_id', scheduleJob?.application_id);
            formData.append('job_id', scheduleJob?.job_id);
            formData.append('interview_at', selectedDateTime.format('YYYY-MM-DD HH:mm:ss'));

            const response: any = await axiosInstance.post(END_POINTS.TRANSPORTER_SCHEDULE_INTERVIEW, formData);
            if (response?.data?.status) {
                showToast(response?.data?.message || 'Interview scheduled successfully');
                // Reset states
                setSelectedInterviewDate(null);
                setIsDateSelected(false);
                setIsTimeSelected(false);
                setTempInterviewDate(null);
                setTempIsDateSelected(false);
                setTempIsTimeSelected(false);

                setShowScheduleModal(false);
                setloading(true);
                _fetchJobs();
            } else {
                showToast(response?.data?.message || 'Failed to schedule interview');
            }
        } catch (error) {
            console.error('Error scheduling interview:', error);
            showToast('Something went wrong');
        } finally {
            setScheduleLoading(false);
        }
    };


    const groupedJobs = appliedJobList.reduce((acc: any, item: any) => {
        const jobId = item?.job_id;

        if (!acc[jobId]) {
            acc[jobId] = {
                job_id: jobId,
                job_title: item?.job_title,
                applications: [],
            };
        }

        acc[jobId].applications.push(item);
        return acc;
    }, {});

    const jobGroups = Object.values(groupedJobs);

    const toggleJob = (jobId: string) => {
        setExpandedJobIds(prev =>
            prev.includes(jobId)
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId]
        );
    };

    const getDriverTag = (item: any) => {
        if (item?.payment_type === 'subscription' && item?.subscription_plan_name === 'Standard') {
            return { label: 'Job Ready', color: '#16A34A' };
        }
        if (item?.payment_type === 'trusted') {
            return { label: 'Trusted', color: '#7C3AED' };
        }
        if (item?.payment_type === 'verified') {
            return { label: 'Verified', color: '#2563EB' };
        }
        return { label: 'Job Ready', color: '#16A34A' };
    };


    const DriverApplicationCard = ({ item }: any) => {
        const driver = item?.driver_details;

        // ❌ HARD STOP: no TM ID → no UI
        if (!driver?.unique_id) {
            return null;
        }

        const driverName = driver?.driver_name || driver?.name || 'Driver';
        const tmId = driver.unique_id;
        const rating = Number(driver?.rating) || 0;
        const reviewCount = driver?.review_count || 0;
        const driverType = driver?.driver_type || 'Driver';
        const city = driver?.city || '—';
        const state = driver?.states || driver?.state || '—';
        const drivingExp = driver?.driving_exp || driver?.driving_experience || driver?.Driving_Experience || '—';
        const licenseType = driver?.license_type || driver?.License_Type || '—';
        const licenseNo = driver?.license_no || driver?.License_No || '';
        const licenseExpiry = driver?.license_expiry || driver?.License_Expiry
            ? moment(driver?.license_expiry || driver?.License_Expiry).format('DD MMM YYYY')
            : '—';

        const profileImage =
            driver?.driver_picture
                ? `${BASE_URL}${driver.driver_picture}`
                : driver?.images
                    ? `${BASE_URL}public/${driver.images}`
                    : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

        const tag = getDriverTag(driver);

        // Detail Row Component
        const DetailRow = ({ label, value, icon }: { label: string; value: string; icon?: string }) => (
            <View style={{ flex: 1, marginBottom: 10 }}>
                <Text style={{ fontSize: responsiveFontSize(1.3), color: colors.blackOpacity(0.5), marginBottom: 2 }}>
                    {label}
                </Text>
                <Text style={{ fontSize: responsiveFontSize(1.5), color: colors.black, fontWeight: '500' }} numberOfLines={1}>
                    {value}
                </Text>
            </View>
        );

        return (
            <View
                style={{
                    backgroundColor: colors.white,
                    borderRadius: 16,
                    padding: responsiveFontSize(1.8),
                    marginBottom: responsiveFontSize(2),
                    borderWidth: 1,
                    borderColor: colors.blackOpacity(0.06),
                    ...shadow,
                }}
            >
                {/* HEADER ROW - Profile Photo, Name, Tag */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    {/* Profile Photo */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => openDriverProfileModal(item)}
                        style={{ position: 'relative' }}
                    >
                        <Image
                            source={{ uri: profileImage }}
                            style={{
                                height: 64,
                                width: 64,
                                borderRadius: 32,
                                borderWidth: 2,
                                borderColor: tag.color,
                            }}
                        />
                        {/* Name Tag Badge on Profile */}
                        <View style={{
                            position: 'absolute',
                            bottom: -4,
                            alignSelf: 'center',
                            backgroundColor: tag.color,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 10,
                        }}>
                            <Text style={{ color: colors.white, fontSize: 9, fontWeight: '700' }}>
                                {tag.label}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Name and Rating Info */}
                    <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: colors.black }} numberOfLines={1}>
                            {driverName}
                        </Text>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: colors.blackOpacity(0.6), marginTop: 2 }}>
                            {tmId}
                        </Text>

                        {/* Rating Row */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
                                <FontAwesome name="star" size={12} color="#F59E0B" />
                                <Text style={{ marginLeft: 4, fontSize: 12, fontWeight: '600', color: '#92400E' }}>
                                    {rating.toFixed(1)}
                                </Text>
                                {reviewCount > 0 && (
                                    <Text style={{ fontSize: 11, color: '#92400E', marginLeft: 2 }}>
                                        ({reviewCount})
                                    </Text>
                                )}
                            </View>
                            <View style={{
                                marginLeft: 8,
                                backgroundColor: colors.blueOpacity(0.1),
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 12
                            }}>
                                <Text style={{ fontSize: 11, fontWeight: '500', color: colors.royalBlue }}>
                                    {driverType}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* DIVIDER */}
                <View style={{ height: 1, backgroundColor: colors.blackOpacity(0.08), marginVertical: 14 }} />

                {/* DETAILS GRID - 2 Column Layout */}
                <View style={{ flexDirection: 'row' }}>
                    <DetailRow label={t('city')} value={city} />
                    <DetailRow label={t('state')} value={state} />
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <DetailRow label={t('drivingExperience') || 'Experience'} value={drivingExp} />
                    <DetailRow label={t('licenseType') || 'License Type'} value={licenseType} />
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <DetailRow label={t('licenseNo') || 'License No.'} value={maskLicense(licenseNo)} />
                    <DetailRow label={t('licenseExpiry') || 'License Expiry'} value={licenseExpiry} />
                </View>

                {/* ACTION BUTTONS */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                    {item?.current_status === 'Accepted' ? (
                        item?.interview_at ? (
                            (() => {
                                const isTimeForInterview = moment().isSameOrAfter(moment(item?.interview_at));
                                return (
                                    <TouchableOpacity
                                        activeOpacity={isTimeForInterview ? 0.8 : 1}
                                        onPress={() => {
                                            if (isTimeForInterview) {
                                                setSelectedDriver(item);
                                                setShowVideoInterviewModal(true);
                                            }
                                        }}
                                        style={{ flex: 1 }}
                                    >
                                        <LinearGradient
                                            colors={isTimeForInterview ? ['#8B5CF6', '#6D28D9'] : ['#1E5EFF', '#3B82F6']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{
                                                height: 48,
                                                borderRadius: 12,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'row',
                                                paddingHorizontal: 12,
                                            }}
                                        >
                                            <Ionicons name="videocam" size={18} color={colors.white} style={{ marginRight: 8 }} />
                                            <View>
                                                <Text style={{ color: colors.white, fontWeight: '600', fontSize: responsiveFontSize(1.3) }}>
                                                    {isTimeForInterview
                                                        ? (t('startInterview') || 'Start Interview')
                                                        : (t('interviewScheduled') || 'Interview Scheduled')}
                                                </Text>
                                                <Text style={{ color: colors.white, fontWeight: '700', fontSize: responsiveFontSize(1.5) }}>
                                                    {moment(item?.interview_at).format('DD MMM, hh:mm A')}
                                                </Text>
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                );
                            })()
                        ) : (
                            <TouchableOpacity
                                activeOpacity={1}
                                style={{ flex: 1 }}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#059669']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        height: 44,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'row',
                                        opacity: 0.9
                                    }}
                                >
                                    <Ionicons name="checkmark-circle" size={18} color={colors.white} style={{ marginRight: 6 }} />
                                    <Text style={{ color: colors.white, fontWeight: '600', fontSize: responsiveFontSize(1.6) }}>
                                        {t('accepted')}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )
                    ) : item?.current_status === 'Rejected' ? (
                        <TouchableOpacity
                            activeOpacity={1}
                            style={{ flex: 1 }}
                        >
                            <LinearGradient
                                colors={['#EF4444', '#DC2626']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    height: 44,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'row',
                                    opacity: 0.9
                                }}
                            >
                                <Ionicons name="close-circle" size={18} color={colors.white} style={{ marginRight: 6 }} />
                                <Text style={{ color: colors.white, fontWeight: '600', fontSize: responsiveFontSize(1.6) }}>
                                    {t('rejected') || 'Rejected'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity
                                onPress={() => setrejectJobId(item.application_id)}
                                style={{ flex: 1, marginRight: 12 }}
                            >
                                <LinearGradient
                                    colors={['#FF6B6B', '#E63946']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        height: 44,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'row',
                                    }}
                                >
                                    <Ionicons name="close-circle" size={18} color={colors.white} style={{ marginRight: 6 }} />
                                    <Text style={{ color: colors.white, fontWeight: '600', fontSize: responsiveFontSize(1.6) }}>
                                        {t('reject')}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setacceptJobId(item.application_id)}
                                style={{ flex: 1 }}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#059669']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        height: 44,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'row',
                                    }}
                                >
                                    <Ionicons name="checkmark-circle" size={18} color={colors.white} style={{ marginRight: 6 }} />
                                    <Text style={{ color: colors.white, fontWeight: '600', fontSize: responsiveFontSize(1.6) }}>
                                        {t('accept')}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* VIEW DRIVER DETAILS */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => openDriverProfileModal(item)}
                    style={{
                        marginTop: 10,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: colors.blueOpacity(0.08),
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        borderWidth: 1,
                        borderColor: colors.blueOpacity(0.15),
                    }}
                >
                    <Ionicons name="person-circle-outline" size={20} color={colors.royalBlue} style={{ marginRight: 8 }} />
                    <Text style={{ color: colors.royalBlue, fontWeight: '600', fontSize: responsiveFontSize(1.6) }}>
                        {t('viewDriverDetails')}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };



    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text onPress={() => {
                    ;
                }} style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{t(`viewApplications`)}</Text>
            </View>
            {(loading && !search.length) ?
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Space height={responsiveHeight(20)} />
                    <Image style={{ height: responsiveHeight(15), width: responsiveWidth(80), tintColor: colors.blackOpacity(.1) }} source={{ uri: 'https://truckmitr.com/public/images/preview.png' }} />
                </View>
                : loading ?
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <ActivityIndicator color={colors.royalBlue} size="small" />
                    </View>
                    :
                    !appliedJobList?.length ?
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Space height={responsiveHeight(20)} />
                            <Image style={{ height: responsiveHeight(15), width: responsiveWidth(80), tintColor: colors.blackOpacity(.1) }} source={{ uri: 'https://truckmitr.com/public/images/preview.png' }} />
                            <Text style={{ width: responsiveWidth(80), color: colors.blackOpacity(.9), fontSize: responsiveFontSize(1.9), textAlign: 'center', fontWeight: '500', }}> {search ? `${t(`noDriverFoundFor`)} "${search}" ${t(`trySearchingDifferentKeyword`)}` : t("driverHaventAppliedYetApplicationsMayComeSoon")}</Text>
                        </View>
                        :
                        <View style={{ flex: 1 }}>

                            <FlatList
                                data={jobGroups}
                                keyExtractor={(item: any) => item.job_id}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{
                                    paddingHorizontal: responsiveWidth(5),
                                    paddingBottom: responsiveHeight(5),
                                    paddingTop: responsiveHeight(2),
                                }}
                                renderItem={({ item: job }: any) => {
                                    const isExpanded = expandedJobIds.includes(job.job_id);

                                    const activeFilter = jobFilters[job.job_id] || 'All';

                                    const validApplications = job.applications.filter((app: any) => {
                                        if (!app?.driver_details?.unique_id) return false;
                                        if (activeFilter === 'Accepted') return app?.current_status === 'Accepted';
                                        if (activeFilter === 'Rejected') return app?.current_status === 'Rejected';
                                        // 'All' shows everything EXCEPT Rejected (Default view)
                                        return app?.current_status !== 'Rejected';
                                    });
                                    return (
                                        <View style={{ marginBottom: responsiveFontSize(3) }}>
                                            {/* ================= JOB DROPDOWN HEADER ================= */}
                                            <TouchableOpacity
                                                activeOpacity={0.85}
                                                onPress={() => toggleJob(job.job_id)}
                                                style={{
                                                    backgroundColor: colors.royalBlue,
                                                    borderRadius: 10,
                                                    padding: responsiveFontSize(1.6),
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    ...shadow,
                                                    shadowColor: colors.blackOpacity(0.3),
                                                }}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text
                                                        numberOfLines={1}
                                                        style={{
                                                            color: colors.white,
                                                            fontSize: responsiveFontSize(2),
                                                            fontWeight: '700',
                                                        }}
                                                    >
                                                        {job.job_title}
                                                    </Text>

                                                    <Text
                                                        style={{
                                                            color: colors.whiteOpacity(0.9),
                                                            fontSize: responsiveFontSize(1.6),
                                                            marginTop: 4,
                                                        }}
                                                    >
                                                        {t('jobId')}: {job.job_id} • {validApplications.length} {t('applicants')}
                                                    </Text>
                                                </View>

                                                <Ionicons
                                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                                    size={24}
                                                    color={colors.white}
                                                />
                                            </TouchableOpacity>

                                            {/* ================= DROPDOWN CONTENT ================= */}
                                            {isExpanded && (
                                                <View style={{ marginTop: responsiveFontSize(1.5) }}>
                                                    {/* FILTER CHIPS */}
                                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12, flexDirection: 'row' }}>
                                                        {['All', 'Accepted', 'Rejected'].map((filter) => {
                                                            const isSelected = activeFilter === filter;
                                                            return (
                                                                <TouchableOpacity
                                                                    key={filter}
                                                                    onPress={() => setFilter(job.job_id, filter)}
                                                                    style={{
                                                                        paddingHorizontal: 16,
                                                                        paddingVertical: 6,
                                                                        borderRadius: 20,
                                                                        backgroundColor: isSelected ? colors.royalBlue : '#F3F4F6',
                                                                        marginRight: 10,
                                                                        borderWidth: 1,
                                                                        borderColor: isSelected ? colors.royalBlue : '#E5E7EB',
                                                                    }}
                                                                >
                                                                    <Text style={{
                                                                        color: isSelected ? colors.white : '#4B5563',
                                                                        fontSize: responsiveFontSize(1.5),
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        {filter}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                    </ScrollView>
                                                    {validApplications.map((item: any, index: number) => {
                                                        return (
                                                            <DriverApplicationCard key={item.application_id} item={item} />
                                                        )
                                                    })}
                                                </View>
                                            )}
                                        </View>
                                    );
                                }}
                            />

                        </View>
            }
            <ConfirmationModal
                visible={acceptJobId !== -1}
                title={t(`acceptThisApplication`)}
                subtitle={t(`byAcceptingThisApplicationYouWillBeContactedSoon`)}
                confirmText={t(`accept`)}
                loader={accpetRejectLoading}
                onCancel={() => setacceptJobId(-1)}
                onAccept={_onPressAcceptApplication}
            />
            <ConfirmationModal
                visible={rejectJobId !== -1}
                title={t(`rejectThisApplication`)}
                subtitle={t(`noWorriesYouWillGetMoreApplications`)}
                confirmText={t(`reject`)}
                loader={accpetRejectLoading}
                onCancel={() => setrejectJobId(-1)}
                onAccept={_onPressRejectApplication}
                confirmStyle={{ backgroundColor: colors.roseRed }}
            />
            <Modal
                visible={showScheduleModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowScheduleModal(false)}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.55)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <View
                        style={{
                            width: '88%',
                            backgroundColor: '#fff',
                            borderRadius: 14,
                            padding: 18,
                        }}
                    >
                        {/* HEADER */}
                        <Text
                            style={{
                                fontSize: 17,
                                fontWeight: '600',
                                textAlign: 'center',
                                color: '#111',
                            }}
                        >
                            {t('scheduleInterview')}
                        </Text>

                        <Text
                            style={{
                                fontSize: 13,
                                textAlign: 'center',
                                color: '#777',
                                marginTop: 4,
                                marginBottom: 20,
                            }}
                        >
                            {t('selectInterviewDateTime')}
                        </Text>

                        {/* DATE CARD */}
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 14,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                marginBottom: 12,
                            }}
                        >
                            <Ionicons name="calendar-outline" size={20} color="#1E5EFF" />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.5),
                                    color: '#777'
                                }}>
                                    {t('date')}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: responsiveFontSize(1.5),
                                        fontWeight: '500',
                                        color: tempIsDateSelected ? '#111' : '#9CA3AF',
                                    }}
                                >
                                    {tempIsDateSelected
                                        ? moment(tempInterviewDate).format('DD MMM YYYY')
                                        : t('clickToSelectDate')}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* TIME CARD */}
                        <TouchableOpacity
                            disabled={!tempIsDateSelected}
                            onPress={() => setShowTimePicker(true)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 14,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                opacity: tempIsDateSelected ? 1 : 0.5,
                                marginBottom: 22,
                            }}
                        >
                            <Ionicons name="time-outline" size={20} color="#1E5EFF" />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={{
                                    fontSize: responsiveFontSize(1.5),
                                    color: '#777'
                                }}>
                                    {t('time')}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: responsiveFontSize(1.5),
                                        fontWeight: '500',
                                        color: tempIsTimeSelected ? '#111' : '#9CA3AF',
                                    }}
                                >
                                    {tempIsTimeSelected
                                        ? moment(tempInterviewDate).format('h:mm A')
                                        : t('clickToSelectTime')}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* ACTIONS */}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10,
                            }}
                        >
                            {/* CANCEL */}
                            <TouchableOpacity
                                onPress={() => {
                                    // ❌ clear temp (modal) values
                                    setTempInterviewDate(null);
                                    setTempIsDateSelected(false);
                                    setTempIsTimeSelected(false);

                                    // ❌ clear saved (final) values
                                    setSelectedInterviewDate(null);
                                    setIsDateSelected(false);
                                    setIsTimeSelected(false);

                                    // ❌ close modal
                                    setShowScheduleModal(false);
                                }}
                                activeOpacity={0.8}
                                style={{
                                    flex: 1,
                                    height: 44,
                                    borderRadius: 8,
                                    backgroundColor: '#F3F4F6',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: '#333', fontWeight: '500' }}>
                                    {t('cancel')}
                                </Text>
                            </TouchableOpacity>

                            {/* CONFIRM */}
                            <TouchableOpacity
                                disabled={!tempIsDateSelected || !tempIsTimeSelected}
                                activeOpacity={0.8}
                                onPress={onConfirm}
                                style={{
                                    flex: 1,
                                    height: 44,
                                    borderRadius: 8,
                                    overflow: 'hidden', // ⭐ VERY IMPORTANT
                                }}
                            >
                                <LinearGradient
                                    colors={
                                        !tempIsDateSelected || !tempIsTimeSelected
                                            ? ['#9BB3FF', '#9BB3FF']
                                            : ['#1E3A8A', '#3B82F6']
                                    }
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        opacity: !tempIsDateSelected || !tempIsTimeSelected ? 0.7 : 1,
                                    }}
                                >
                                    {scheduleLoading ? (
                                        <ActivityIndicator color={colors.white} />
                                    ) : (
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>
                                            {t('confirm')}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                        {/* DATE PICKER */}
                        {showDatePicker && (
                            <DateTimePicker
                                value={tempInterviewDate ?? moment().add(15, 'minutes').toDate()}
                                mode="date"
                                minimumDate={new Date()}
                                onChange={(event, date) => {
                                    setShowDatePicker(false);

                                    // ✅ IMPORTANT: user pressed Cancel
                                    if (event.type === 'dismissed') {
                                        return;
                                    }

                                    if (!date) return;

                                    setTempInterviewDate(
                                        moment(date).set({ hour: 9, minute: 0 }).toDate()
                                    );
                                    setTempIsDateSelected(true);
                                    setTempIsTimeSelected(false); // reset time
                                }}
                            />
                        )}

                        {/* TIME PICKER */}
                        {showTimePicker && (
                            <DateTimePicker
                                value={tempInterviewDate ?? moment().add(15, 'minutes').toDate()}
                                mode="time"
                                minimumDate={getMinimumTime()}
                                onChange={(event, time) => {
                                    setShowTimePicker(false);

                                    // ✅ IMPORTANT: user pressed Cancel
                                    if (event.type === 'dismissed') {
                                        return;
                                    }

                                    if (!time || !tempInterviewDate) return;

                                    setTempInterviewDate(
                                        moment(tempInterviewDate)
                                            .set({
                                                hour: time.getHours(),
                                                minute: time.getMinutes(),
                                            })
                                            .toDate()
                                    );
                                    setTempIsTimeSelected(true);
                                }}
                            />
                        )}

                    </View>
                </View>
            </Modal>

            {/* DRIVER PROFILE BOTTOM SHEET MODAL */}
            {/* <BottomSheetModal */}

            {/* > */}
            <BottomSheet
                ref={bottomSheetModalRef}
                index={-1}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                enablePanDownToClose={true}
                enableOverDrag={false}   // 🔒 IMPORTANT
                enableContentPanningGesture={false} // 🔒 IMPORTANT
                // onDismiss={() => setSelectedDriverForModal(null)}
                onChange={setSheetIndex}
            >
                {/* <BottomSheetView

                    style={{ flex: 1, paddingBottom: safeAreaInsets.bottom + 16 }}> */}
                <BottomSheetScrollView
                    showsVerticalScrollIndicator={true}
                    bounces={true}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                >
                    {selectedDriverForModal && (() => {
                        const driver = selectedDriverForModal?.driver_details;
                        if (!driver) return null;

                        const driverName = driver?.driver_name || driver?.name || 'Driver';
                        const tmId = driver?.unique_id || '—';
                        const rating = Number(driver?.rating) || 0;
                        const reviewCount = driver?.review_count || 0;
                        const driverType = driver?.driver_type || 'Driver';
                        const city = driver?.city || '—';
                        const state = driver?.states || driver?.state || '—';
                        const drivingExp = driver?.driving_exp || driver?.driving_experience || driver?.Driving_Experience || '—';
                        const licenseType = driver?.license_type || driver?.License_Type || '—';
                        const licenseNo = driver?.license_no || driver?.License_No || '';
                        const licenseExpiry = driver?.license_expiry || driver?.License_Expiry
                            ? moment(driver?.license_expiry || driver?.License_Expiry).format('DD MMM YYYY')
                            : '—';
                        const aadharNo = driver?.Aadhar_Number || driver?.aadhar_number || '';
                        const mobile = driver?.mobile || driver?.driver_mobile || '';
                        const email = driver?.email || '';

                        const profileImage =
                            driver?.driver_picture
                                ? `${BASE_URL}${driver.driver_picture}`
                                : driver?.images
                                    ? `${BASE_URL}public/${driver.images}`
                                    : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

                        const tag = getDriverTag(driver);

                        // Detail Item Component
                        const DetailItem = ({ label, value, icon }: { label: string; value: string; icon?: string }) => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.blackOpacity(0.05) }}>
                                {icon && <Ionicons name={icon as any} size={18} color={colors.royalBlue} style={{ marginRight: 12 }} />}
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: responsiveFontSize(1.3), color: colors.blackOpacity(0.5) }}>{label}</Text>
                                    <Text style={{ fontSize: responsiveFontSize(1.6), color: colors.black, fontWeight: '500', marginTop: 2 }}>{value}</Text>
                                </View>
                            </View>
                        );

                        return (
                            <>
                                {/* Profile Header */}
                                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                    <View style={{ position: 'relative' }}>
                                        <Image
                                            source={{ uri: profileImage }}
                                            style={{
                                                height: 100,
                                                width: 100,
                                                borderRadius: 50,
                                                borderWidth: 3,
                                                borderColor: tag.color,
                                            }}
                                        />
                                        {/* Name Tag Badge */}
                                        <View style={{
                                            position: 'absolute',
                                            bottom: -6,
                                            alignSelf: 'center',
                                            backgroundColor: tag.color,
                                            paddingHorizontal: 12,
                                            paddingVertical: 4,
                                            borderRadius: 12,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                            <Ionicons
                                                name={
                                                    tag.label === 'Trusted'
                                                        ? 'shield-checkmark'
                                                        : tag.label === 'Verified'
                                                            ? 'checkmark-circle'
                                                            : 'briefcase'
                                                }
                                                size={12}
                                                color={colors.white}
                                                style={{ marginRight: 4 }}
                                            />
                                            <Text style={{ color: colors.white, fontSize: 11, fontWeight: '700' }}>
                                                {tag.label}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: colors.black, marginTop: 16 }}>
                                        {driverName}
                                    </Text>
                                    <Text style={{ fontSize: responsiveFontSize(1.5), color: colors.blackOpacity(0.6), marginTop: 4 }}>
                                        {tmId}
                                    </Text>

                                    {/* Rating */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16 }}>
                                            <FontAwesome name="star" size={14} color="#F59E0B" />
                                            <Text style={{ marginLeft: 6, fontSize: 14, fontWeight: '600', color: '#92400E' }}>
                                                {rating.toFixed(1)}
                                            </Text>
                                            {reviewCount > 0 && (
                                                <Text style={{ fontSize: 13, color: '#92400E', marginLeft: 4 }}>
                                                    ({reviewCount} reviews)
                                                </Text>
                                            )}
                                        </View>
                                        <View style={{
                                            marginLeft: 10,
                                            backgroundColor: colors.blueOpacity(0.1),
                                            paddingHorizontal: 12,
                                            paddingVertical: 5,
                                            borderRadius: 16
                                        }}>
                                            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.royalBlue }}>
                                                {driverType}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Details Section */}
                                <View style={{
                                    backgroundColor: colors.blackOpacity(0.02),
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 16,
                                }}>
                                    <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '600', color: colors.black, marginBottom: 8 }}>
                                        {t('driverDetails') || 'Driver Details'}
                                    </Text>
                                    <DetailItem label={t('city')} value={city} icon="location-outline" />
                                    <DetailItem label={t('state')} value={state} icon="map-outline" />
                                    <DetailItem label={t('drivingExperience') || 'Driving Experience'} value={drivingExp} icon="car-outline" />
                                    <DetailItem label={t('licenseType') || 'License Type'} value={licenseType} icon="card-outline" />
                                    <DetailItem label={t('licenseNo') || 'License No.'} value={maskLicense(licenseNo)} icon="document-text-outline" />
                                    <DetailItem label={t('licenseExpiry') || 'License Expiry'} value={licenseExpiry} icon="calendar-outline" />
                                </View>

                                {/* Masked Sensitive Info */}
                                <View style={{
                                    backgroundColor: colors.blackOpacity(0.02),
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 20,
                                }}>
                                    <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '600', color: colors.black, marginBottom: 8 }}>
                                        {t('contactInfo') || 'Contact Information'}
                                    </Text>
                                    <DetailItem label={t('aadharNumber') || 'Aadhar No.'} value={maskAadhar(aadharNo)} icon="finger-print-outline" />
                                    <DetailItem label={t('mobile') || 'Mobile'} value={maskMobile(mobile)} icon="call-outline" />
                                    <DetailItem label={t('e-mail') || 'Email'} value={maskEmail(email)} icon="mail-outline" />
                                </View>

                                {/* Call Driver & Interview CTAs */}
                                {(() => {
                                    const interviewAt = selectedDriverForModal?.interview_at;
                                    const isInterviewScheduled = !!interviewAt;
                                    const isTimeForInterview = interviewAt && moment().isSameOrAfter(moment(interviewAt));
                                    const formattedInterviewDate = interviewAt
                                        ? moment(interviewAt).format('DD MMM YYYY, h:mm A')
                                        : null;

                                    return (
                                        <>
                                            {/* Call Driver Button - Always visible */}
                                            <TouchableOpacity
                                                onPress={() => {
                                                    closeDriverProfileModal();
                                                    setTimeout(() => callToDriver(selectedDriverForModal), 300);
                                                }}
                                                style={{ marginBottom: 12 }}
                                            >
                                                <LinearGradient
                                                    colors={['#3B82F6', '#1D4ED8']}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                    style={{
                                                        height: 48,
                                                        borderRadius: 12,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexDirection: 'row',
                                                    }}
                                                >
                                                    <Ionicons name="call" size={18} color={colors.white} style={{ marginRight: 8 }} />
                                                    <Text style={{ color: colors.white, fontWeight: '600', fontSize: responsiveFontSize(1.5) }}>
                                                        {t('callDriver') || 'Call Driver'}
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>

                                            {/* Interview Section - Conditional */}
                                            {isInterviewScheduled ? (
                                                // Interview is scheduled - Show info or Start button
                                                isTimeForInterview ? (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setSelectedDriver(selectedDriverForModal);
                                                            setShowVideoInterviewModal(true);
                                                        }}
                                                        style={{ marginBottom: 12 }}
                                                    >
                                                        <LinearGradient
                                                            colors={['#8B5CF6', '#6D28D9']}
                                                            start={{ x: 0, y: 0 }}
                                                            end={{ x: 1, y: 0 }}
                                                            style={{
                                                                height: 54,
                                                                borderRadius: 12,
                                                                alignItems: 'center',
                                                                paddingHorizontal: 16,
                                                                flexDirection: 'row',
                                                            }}
                                                        >
                                                            <View style={{
                                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                                borderRadius: 20,
                                                                padding: 8,
                                                                marginRight: 12,
                                                            }}>
                                                                <Ionicons name="videocam" size={22} color={colors.white} />
                                                            </View>
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={{ fontSize: responsiveFontSize(1.4), color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
                                                                    {t('interviewTime') || 'Interview Time'}
                                                                </Text>
                                                                <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.white, fontWeight: '700' }}>
                                                                    {t('startVideoInterview') || 'Start Video Interview'}
                                                                </Text>
                                                            </View>
                                                            <Ionicons name="chevron-forward" size={24} color={colors.white} />
                                                        </LinearGradient>
                                                    </TouchableOpacity>
                                                ) : (
                                                    <View style={{
                                                        backgroundColor: '#ECFDF5',
                                                        borderRadius: 12,
                                                        padding: 14,
                                                        marginBottom: 12,
                                                        borderWidth: 1,
                                                        borderColor: '#10B981',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                    }}>
                                                        <View style={{
                                                            backgroundColor: '#10B981',
                                                            borderRadius: 20,
                                                            padding: 8,
                                                            marginRight: 12,
                                                        }}>
                                                            <Ionicons name="videocam" size={20} color={colors.white} />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{ fontSize: responsiveFontSize(1.4), color: '#059669', fontWeight: '600' }}>
                                                                {t('interviewScheduled') || 'Interview Scheduled'}
                                                            </Text>
                                                            <Text style={{ fontSize: responsiveFontSize(1.6), color: '#047857', fontWeight: '700', marginTop: 2 }}>
                                                                {formattedInterviewDate}
                                                            </Text>
                                                        </View>
                                                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                                                    </View>
                                                )
                                            ) : (
                                                // Interview not scheduled - Show schedule button
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        if (selectedDriverForModal?.current_status === 'Rejected') {
                                                            showToast(t('youAlreadyRejectedThisDriver') || 'You already rejected this driver');
                                                            return;
                                                        }
                                                        if (selectedDriverForModal?.current_status !== 'Accepted') {
                                                            showToast(t('youHaveToAcceptThisApplicationFirst') || 'You have to accept this application first');
                                                            return;
                                                        }
                                                        setScheduleJob(selectedDriverForModal);
                                                        // closeDriverProfileModal();
                                                        closeDriverProfileModal();
                                                        setTimeout(() => openScheduleModal(), 300);
                                                    }}
                                                    style={{ marginBottom: 12 }}
                                                >
                                                    <LinearGradient
                                                        colors={['#8B5CF6', '#6D28D9']}
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 1, y: 0 }}
                                                        style={{
                                                            height: 48,
                                                            borderRadius: 12,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexDirection: 'row',
                                                        }}
                                                    >
                                                        <Ionicons name="videocam" size={18} color={colors.white} style={{ marginRight: 8 }} />
                                                        <Text style={{ color: colors.white, fontWeight: '600', fontSize: responsiveFontSize(1.5) }}>
                                                            {t('scheduleVideoInterview') || 'Schedule Video Interview'}
                                                        </Text>
                                                    </LinearGradient>
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    );
                                })()}

                                {/* Accept / Reject CTAs */}
                                {/* <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            closeDriverProfileModal();
                                            setTimeout(() => setrejectJobId(selectedDriverForModal.application_id), 300);
                                        }}
                                        style={{ flex: 1, marginRight: 8 }}
                                    >
                                        <LinearGradient
                                            colors={['#FF6B6B', '#E63946']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{
                                                height: 52,
                                                borderRadius: 14,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'row',
                                            }}
                                        >
                                            <Ionicons name="close-circle" size={20} color={colors.white} style={{ marginRight: 8 }} />
                                            <Text style={{ color: colors.white, fontWeight: '700', fontSize: responsiveFontSize(1.7) }}>
                                                {t('reject')}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => {
                                            closeDriverProfileModal();
                                            setTimeout(() => setacceptJobId(selectedDriverForModal.application_id), 300);
                                        }}
                                        style={{ flex: 1 }}
                                    >
                                        <LinearGradient
                                            colors={['#10B981', '#059669']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{
                                                height: 52,
                                                borderRadius: 14,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'row',
                                            }}
                                        >
                                            <Ionicons name="checkmark-circle" size={20} color={colors.white} style={{ marginRight: 8 }} />
                                            <Text style={{ color: colors.white, fontWeight: '700', fontSize: responsiveFontSize(1.7) }}>
                                                {t('accept')}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View> */}

                                <Space height={100} />
                            </>
                        );
                    })()}
                </BottomSheetScrollView>
                {/* </BottomSheetView> */}
            </BottomSheet>


            {/* </BottomSheetModal> */}




            {/* VIDEO INTERVIEW CONFIRMATION MODAL */}
            <Modal
                visible={showVideoInterviewModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowVideoInterviewModal(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20
                }}>
                    <View style={{
                        width: '100%',
                        backgroundColor: colors.white,
                        borderRadius: 24,
                        padding: 24,
                        alignItems: 'center',
                        ...shadow,
                        elevation: 10
                    }}>
                        {/* ICON / IMAGE */}
                        <View style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            backgroundColor: '#F3E8FF',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 20
                        }}>
                            <Ionicons name="videocam" size={40} color="#8B5CF6" />
                        </View>

                        <Text style={{
                            fontSize: responsiveFontSize(2.2),
                            fontWeight: '700',
                            color: colors.black,
                            textAlign: 'center',
                            marginBottom: 12
                        }}>
                            {t('videoCallConfirmationTitle') || 'Confirm Video Interview'}
                        </Text>

                        <Text style={{
                            fontSize: responsiveFontSize(1.7),
                            color: colors.blackOpacity(0.6),
                            textAlign: 'center',
                            marginBottom: 24,
                            lineHeight: 22
                        }}>
                            {t('videoCallConfirmationMessage') || 'Do you want to start the video interview?'}
                        </Text>

                        {/* DRIVER MINI CARD */}
                        {selectedDriver && (
                            <View style={{
                                width: '100%',
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.blackOpacity(0.04),
                                padding: 12,
                                borderRadius: 16,
                                marginBottom: 24
                            }}>
                                <Image
                                    source={{ uri: selectedDriver?.driver_details?.images ? `${BASE_URL}public/${selectedDriver?.driver_details.images}` : 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png' }}
                                    style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12 }}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontWeight: '600', color: colors.black }} numberOfLines={1}>
                                        {selectedDriver?.driver_details?.driver_name}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: colors.blackOpacity(0.5) }}>
                                        {selectedDriver?.driver_details?.unique_id}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* ACTION BUTTONS */}
                        <View style={{ width: '100%', alignItems: 'center', gap: 24 }}>
                            <ZegoSendCallInvitationButton
                                invitees={[{
                                    userID: selectedDriver?.driver_details?.unique_id || selectedDriver?.driver_details?.driver_id?.toString(),
                                    userName: selectedDriver?.driver_details?.driver_name || 'Driver'
                                }]}
                                isVideoCall={true}
                                resourceID={"TruckMitr"}
                                renderNormal={(onPress: any) => (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowVideoInterviewModal(false);
                                            onPress();
                                        }}
                                        style={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 40,
                                            ...shadow,
                                            elevation: 5
                                        }}
                                    >
                                        <LinearGradient
                                            colors={['#8B5CF6', '#6D28D9']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={{
                                                flex: 1,
                                                borderRadius: 40,
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Ionicons name="videocam" size={36} color={colors.white} />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            />

                            <TouchableOpacity
                                onPress={() => setShowVideoInterviewModal(false)}
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 24,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Text style={{ color: colors.royalBlue, fontSize: 16, fontWeight: '600' }}>
                                    {t('cancel') || 'Cancel'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


        </View >
    )
}
