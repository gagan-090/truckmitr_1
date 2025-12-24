import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Animated } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { Space } from '@truckmitr/src/app/components'
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { hitSlop } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons'
import Feather from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { jobAddAction, subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

const drivingExperienceArray = [
    { label: '1-5 years', value: '1-5' },
    { label: '5-10 years', value: '5-10' },
    { label: '10-15 years', value: '10-15' },
    { label: '15-20 years', value: '15-20' },
    { label: '20-25 years', value: '20-25' },
    { label: '25-30 years', value: '25-30' },
    { label: '30-35 years', value: '30-35' },
    { label: '35-40 years', value: '35-40' },
    { label: '40-45 years', value: '40-45' },
    { label: '45-50 years', value: '45-50' },
];

// Apple-style Dropdown Component
const AppleDropdown = ({
    label,
    placeholder,
    value,
    data,
    onChange,
    error,
    required = false,
    icon
}: {
    label: string;
    placeholder: string;
    value: string;
    data: { label: string; value: string }[];
    onChange: (item: { label: string; value: string }) => void;
    error?: string;
    required?: boolean;
    icon?: React.ReactNode;
}) => {
    const colors = useColor();
    const { responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');

    const selectedItem = data.find(item => item.value === value || item.label === value);

    const filteredData = data.filter(item =>
        item.label.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <View style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
                {icon && <View style={[styles.labelIcon, { backgroundColor: colors.royalBlueOpacity(0.1) }]}>{icon}</View>}
                <Text style={[styles.fieldLabel, { color: colors.black, fontSize: responsiveFontSize(1.6) }]}>
                    {label}
                    {required && <Text style={{ color: '#FF3B30' }}> *</Text>}
                </Text>
            </View>

            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsOpen(true)}
                style={[
                    styles.dropdownButton,
                    {
                        backgroundColor: colors.blackOpacity(0.03),
                        borderColor: error ? '#FF3B30' : 'transparent',
                        borderWidth: error ? 1 : 0,
                    }
                ]}
            >
                <Text style={[
                    styles.dropdownText,
                    {
                        color: selectedItem ? colors.black : colors.blackOpacity(0.4),
                        fontSize: responsiveFontSize(1.8)
                    }
                ]}>
                    {selectedItem?.label || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.blackOpacity(0.4)} />
            </TouchableOpacity>

            {error && (
                <Text style={[styles.errorText, { fontSize: responsiveFontSize(1.4) }]}>{error}</Text>
            )}

            {/* Apple-style Bottom Sheet Modal */}
            <Modal
                visible={isOpen}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
                        {/* Handle Bar */}
                        <View style={styles.modalHandle} />

                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.black, fontSize: responsiveFontSize(2) }]}>
                                {label}
                            </Text>
                            <TouchableOpacity onPress={() => setIsOpen(false)}>
                                <View style={[styles.closeButton, { backgroundColor: colors.blackOpacity(0.08) }]}>
                                    <Ionicons name="close" size={18} color={colors.black} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View style={[styles.modalSearchBar, { backgroundColor: colors.blackOpacity(0.05) }]}>
                            <Feather name="search" size={18} color={colors.blackOpacity(0.4)} />
                            <TextInput
                                placeholder={`Search ${label.toLowerCase()}...`}
                                placeholderTextColor={colors.blackOpacity(0.4)}
                                value={searchText}
                                onChangeText={setSearchText}
                                style={[styles.modalSearchInput, { color: colors.black, fontSize: responsiveFontSize(1.6) }]}
                            />
                            {searchText.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchText('')}>
                                    <Ionicons name="close-circle" size={18} color={colors.blackOpacity(0.3)} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Options List */}
                        <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                            {filteredData.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        onChange(item);
                                        setIsOpen(false);
                                        setSearchText('');
                                    }}
                                    style={[
                                        styles.modalItem,
                                        {
                                            backgroundColor: selectedItem?.value === item.value
                                                ? colors.royalBlueOpacity(0.1)
                                                : 'transparent',
                                            borderBottomColor: colors.blackOpacity(0.06)
                                        }
                                    ]}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        {
                                            color: selectedItem?.value === item.value ? colors.royalBlue : colors.black,
                                            fontSize: responsiveFontSize(1.7),
                                            fontWeight: selectedItem?.value === item.value ? '600' : '400'
                                        }
                                    ]}>
                                        {item.label}
                                    </Text>
                                    {selectedItem?.value === item.value && (
                                        <Ionicons name="checkmark" size={22} color={colors.royalBlue} />
                                    )}
                                </TouchableOpacity>
                            ))}
                            <Space height={40} />
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

// Apple-style Text Input Component
const AppleTextInput = ({
    label,
    placeholder,
    value,
    onChangeText,
    error,
    required = false,
    icon,
    multiline = false,
}: {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    required?: boolean;
    icon?: React.ReactNode;
    multiline?: boolean;
}) => {
    const colors = useColor();
    const { responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
                {icon && <View style={[styles.labelIcon, { backgroundColor: colors.royalBlueOpacity(0.1) }]}>{icon}</View>}
                <Text style={[styles.fieldLabel, { color: colors.black, fontSize: responsiveFontSize(1.6) }]}>
                    {label}
                    {required && <Text style={{ color: '#FF3B30' }}> *</Text>}
                </Text>
            </View>

            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.blackOpacity(0.4)}
                multiline={multiline}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={[
                    styles.textInput,
                    {
                        backgroundColor: colors.blackOpacity(0.03),
                        color: colors.black,
                        fontSize: responsiveFontSize(1.8),
                        borderColor: error ? '#FF3B30' : isFocused ? colors.royalBlue : 'transparent',
                        borderWidth: error || isFocused ? 1.5 : 0,
                        minHeight: multiline ? responsiveHeight(10) : responsiveHeight(5.2),
                        textAlignVertical: multiline ? 'top' : 'center',
                        paddingTop: multiline ? 12 : 0,
                    }
                ]}
            />

            {error && (
                <Text style={[styles.errorText, { fontSize: responsiveFontSize(1.4) }]}>{error}</Text>
            )}
        </View>
    );
};

export default function AddJob() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    useStatusBarStyle('dark-content');
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { shadow } = useShadow();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const { addJob } = useSelector((state: any) => state?.job);
    const { isTransporter, subscriptionDetails, subscriptionModal } = useSelector((state: any) => state?.user);

    const [vehicleTypeList, setvehicleTypeList] = useState<any[]>([]);
    const [locationsList, setlocationsList] = useState<any[]>([]);
    const [availableFreeJob, setAvailableFreeJob] = useState<boolean>(false);
    const [showSecondJobPopup, setShowSecondJobPopup] = useState<boolean>(false);

    const getVehicleTypes = async () => {
        try {
            const response = await axiosInstance.get(END_POINTS.VEHICLE_TYPES);
            if (response?.data?.status) {
                setvehicleTypeList(response?.data?.data);
            }
        } catch (error: any) {
            console.log('Error fetching vehicle types:', error);
        }
    };

    const getLocationList = async () => {
        try {
            const response = await axiosInstance.get(END_POINTS.GETSTATES);
            if (response?.data?.status) {
                setlocationsList(response?.data?.data);
            }
        } catch (error: any) {
            console.log('Error fetching locations:', error);
        }
    };

    const fetchAvailableFreeJob = async () => {
        try {
            const response: any = await axiosInstance.get(END_POINTS?.TRANSPORTER_ALL_JOBS(''));
            if (response?.data?.hasOwnProperty('available_free_job')) {
                setAvailableFreeJob(response.data.available_free_job);
            } else {
                setAvailableFreeJob(false);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    useEffect(() => {
        fetchAvailableFreeJob();
    }, []);

    useEffect(() => {
        getVehicleTypes();
        getLocationList();
        return () => {
            dispatch(jobAddAction(null));
        };
    }, []);

    const [errors, setErrors] = useState<{
        jobTitle?: string;
        jobLocation?: string;
        vehicleType?: string;
        exerienceInYear?: string;
    }>({});

    const validate = (): boolean => {
        let valid = true;
        const newErrors: { [key: string]: string } = {};
        if (!addJob?.job_title) {
            newErrors.jobTitle = t('jobTitleRequired');
            valid = false;
        }
        if (!addJob?.job_location) {
            newErrors.jobLocation = t('jobLocationRequired');
            valid = false;
        }
        if (!addJob?.vehicle_type) {
            newErrors.vehicleType = t('vihicleTypeRequired');
            valid = false;
        }
        if (!addJob?.Required_Experience) {
            newErrors.exerienceInYear = t('experienceYearsRequired');
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    const _goback = () => navigation.goBack();

    const _onpressNext = () => {
        if (!validate()) return;
        if (addJob?.id) {
            navigation.navigate(STACKS.JOB_STEP2);
            return;
        }
        if (isTransporter && !availableFreeJob && subscriptionDetails?.showSubscriptionModel) {
            setShowSecondJobPopup(true);
        } else {
            navigation.navigate(STACKS.JOB_STEP2);
        }
    };

    const handleSecondJobPopupResponse = (proceed: boolean) => {
        setShowSecondJobPopup(false);
        if (proceed) {
            !subscriptionModal && dispatch(subscriptionModalAction(true));
        }
    };

    // Progress Steps Component
    const ProgressSteps = () => (
        <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
                <View style={[styles.progressDot, styles.progressDotActive, { backgroundColor: colors.royalBlue }]}>
                    <Text style={styles.progressDotText}>1</Text>
                </View>
                <Text style={[styles.progressLabel, { color: colors.royalBlue, fontSize: responsiveFontSize(1.3) }]}>
                    {t('Basic Info')}
                </Text>
            </View>
            <View style={[styles.progressLine, { backgroundColor: colors.blackOpacity(0.15) }]} />
            <View style={styles.progressStep}>
                <View style={[styles.progressDot, { backgroundColor: colors.blackOpacity(0.15) }]}>
                    <Text style={[styles.progressDotText, { color: colors.blackOpacity(0.4) }]}>2</Text>
                </View>
                <Text style={[styles.progressLabel, { color: colors.blackOpacity(0.4), fontSize: responsiveFontSize(1.3) }]}>
                    {t('Details')}
                </Text>
            </View>
            <View style={[styles.progressLine, { backgroundColor: colors.blackOpacity(0.15) }]} />
            <View style={styles.progressStep}>
                <View style={[styles.progressDot, { backgroundColor: colors.blackOpacity(0.15) }]}>
                    <Text style={[styles.progressDotText, { color: colors.blackOpacity(0.4) }]}>3</Text>
                </View>
                <Text style={[styles.progressLabel, { color: colors.blackOpacity(0.4), fontSize: responsiveFontSize(1.3) }]}>
                    {t('Review')}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.white }]}>
            <Space height={safeAreaInsets.top} />

            {/* Apple-style Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    hitSlop={hitSlop(10)}
                    onPress={_goback}
                    style={[styles.backButton, { backgroundColor: colors.blackOpacity(0.05) }]}
                >
                    <Ionicons name={'chevron-back'} size={22} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.black, fontSize: responsiveFontSize(2.2) }]}>
                    {addJob?.id ? t('editJob') : t('addJob')}
                </Text>
                <View style={{ width: 36 }} />
            </View>

            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                extraScrollHeight={responsiveHeight(10)}
                showsVerticalScrollIndicator={false}
            >
                {/* Progress Steps */}
                <ProgressSteps />

                <Space height={responsiveFontSize(1.5)} />

                {/* Form Card */}
                <View style={[styles.formCard, { backgroundColor: colors.white }]}>
                    <View style={styles.formHeader}>
                        <View style={[styles.formIconContainer, { backgroundColor: colors.royalBlueOpacity(0.1) }]}>
                            <MaterialCommunityIcons name="briefcase-edit-outline" size={24} color={colors.royalBlue} />
                        </View>
                        <View style={styles.formHeaderText}>
                            <Text style={[styles.formTitle, { color: colors.black, fontSize: responsiveFontSize(2) }]}>
                                {t('Basic Info')}
                            </Text>
                            <Text style={[styles.formSubtitle, { color: colors.blackOpacity(0.5), fontSize: responsiveFontSize(1.4) }]}>
                                {t('Fill Job Details')}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.formDivider, { backgroundColor: colors.blackOpacity(0.06) }]} />

                    {/* Job Title */}
                    <AppleTextInput
                        label={t('jobTitle')}
                        placeholder={t('enterJobTitle')}
                        value={addJob?.job_title || ''}
                        onChangeText={(text) => {
                            dispatch(jobAddAction({ ...addJob, job_title: text }));
                            setErrors((prev) => ({ ...prev, jobTitle: undefined }));
                        }}
                        error={errors?.jobTitle}
                        required
                        icon={<Feather name="briefcase" size={16} color={colors.royalBlue} />}
                    />

                    {/* Job Location */}
                    <AppleDropdown
                        label={t('jobLocation')}
                        placeholder={t('selectJobLocation')}
                        value={(locationsList?.find(state =>
                            addJob?.job_location &&
                            (state.name.toLowerCase() === addJob.job_location.toLowerCase() ||
                                state.id === Number(addJob.job_location))
                        )?.id)?.toString() || ''}
                        data={locationsList.map(item => ({ label: item.name, value: item.id.toString() }))}
                        onChange={(item) => {
                            dispatch(jobAddAction({ ...addJob, job_location: item.label }));
                            setErrors((prev) => ({ ...prev, jobLocation: undefined }));
                        }}
                        error={errors?.jobLocation}
                        required
                        icon={<Ionicons name="location-outline" size={16} color={colors.royalBlue} />}
                    />

                    {/* Vehicle Type */}
                    <AppleDropdown
                        label={t('vehicleType')}
                        placeholder={t('selectVehicleType')}
                        value={vehicleTypeList.find(item => item.vehicle_name?.trim() === addJob?.vehicle_type)?.id.toString() || ''}
                        data={vehicleTypeList.map(item => ({ label: item.vehicle_name?.trim(), value: item.id.toString() }))}
                        onChange={(item) => {
                            dispatch(jobAddAction({ ...addJob, vehicle_type: item.label }));
                            setErrors((prev) => ({ ...prev, vehicleType: undefined }));
                        }}
                        error={errors?.vehicleType}
                        required
                        icon={<Ionicons name="car-outline" size={16} color={colors.royalBlue} />}
                    />

                    {/* Experience */}
                    <AppleDropdown
                        label={t('experienceInYears')}
                        placeholder={t('experienceInYears')}
                        value={addJob?.Required_Experience || ''}
                        data={drivingExperienceArray}
                        onChange={(item) => {
                            dispatch(jobAddAction({ ...addJob, Required_Experience: item.value }));
                            setErrors((prev) => ({ ...prev, exerienceInYear: undefined }));
                        }}
                        error={errors?.exerienceInYear}
                        required
                        icon={<Ionicons name="time-outline" size={16} color={colors.royalBlue} />}
                    />
                </View>

                <Space height={responsiveFontSize(10)} />
            </KeyboardAwareScrollView>

            {/* Fixed Bottom Button */}
            <View style={[styles.bottomButtonContainer, { paddingBottom: safeAreaInsets.bottom + 10 }]}>
                <TouchableOpacity
                    onPress={_onpressNext}
                    activeOpacity={0.9}
                    style={styles.nextButton}
                >
                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFillObject}
                        colors={['#084489', '#0c78f0']}
                    />
                    <Text style={[styles.nextButtonText, { fontSize: responsiveFontSize(1.8) }]}>
                        {t('next')}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Second Job Popup Modal - Apple Style */}
            <Modal
                visible={showSecondJobPopup}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSecondJobPopup(false)}
            >
                <View style={styles.popupOverlay}>
                    <View style={[styles.popupContent, { backgroundColor: colors.white }]}>
                        <View style={[styles.popupIconContainer, { backgroundColor: colors.royalBlueOpacity(0.1) }]}>
                            <MaterialCommunityIcons name="briefcase-plus-outline" size={32} color={colors.royalBlue} />
                        </View>
                        <Text style={[styles.popupTitle, { color: colors.black, fontSize: responsiveFontSize(2.2) }]}>
                            {t('secondJobTitle')}
                        </Text>
                        <Text style={[styles.popupMessage, { color: colors.blackOpacity(0.6), fontSize: responsiveFontSize(1.6) }]}>
                            {t('secondJobMessage')}
                        </Text>
                        <View style={styles.popupButtons}>
                            <TouchableOpacity
                                onPress={() => handleSecondJobPopupResponse(false)}
                                style={[styles.popupButton, styles.popupButtonSecondary, { backgroundColor: colors.blackOpacity(0.08) }]}
                            >
                                <Text style={[styles.popupButtonTextSecondary, { color: colors.black, fontSize: responsiveFontSize(1.6) }]}>
                                    {t('cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleSecondJobPopupResponse(true)}
                                style={[styles.popupButton, styles.popupButtonPrimary]}
                            >
                                <LinearGradient
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={StyleSheet.absoluteFillObject}
                                    colors={['#084489', '#0c78f0']}
                                />
                                <Text style={[styles.popupButtonTextPrimary, { fontSize: responsiveFontSize(1.6) }]}>
                                    {t('proceed')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontWeight: '700',
    },
    scrollContent: {
        paddingHorizontal: 16,
    },

    // Progress Steps
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    progressStep: {
        alignItems: 'center',
    },
    progressDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressDotActive: {
        shadowColor: '#084489',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    progressDotText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
    },
    progressLabel: {
        marginTop: 4,
        fontWeight: '500',
    },
    progressLine: {
        width: 32,
        height: 2,
        marginHorizontal: 6,
        marginBottom: 16,
        borderRadius: 1,
    },

    // Form Card
    formCard: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    formIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    formHeaderText: {
        marginLeft: 12,
    },
    formTitle: {
        fontWeight: '700',
    },
    formSubtitle: {
        marginTop: 2,
    },
    formDivider: {
        height: 1,
        marginVertical: 14,
    },

    // Field Container
    fieldContainer: {
        marginBottom: 14,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    labelIcon: {
        width: 26,
        height: 26,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    fieldLabel: {
        fontWeight: '600',
    },

    // Text Input
    textInput: {
        borderRadius: 12,
        paddingHorizontal: 18,
        fontWeight: '500',
    },

    // Dropdown
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 12,
    },
    dropdownText: {
        fontWeight: '500',
    },

    // Error
    errorText: {
        color: '#FF3B30',
        marginTop: 6,
        marginLeft: 4,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
        paddingBottom: 20,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    modalTitle: {
        fontWeight: '700',
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    modalSearchInput: {
        flex: 1,
        marginLeft: 10,
        padding: 0,
    },
    modalList: {
        marginTop: 10,
        paddingHorizontal: 10,
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginHorizontal: 6,
        borderRadius: 12,
        marginBottom: 4,
    },
    modalItemText: {
        flex: 1,
    },

    // Bottom Button Container
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
    },

    // Next Button
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 14,
        overflow: 'hidden',
        gap: 8,
        shadowColor: '#084489',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    // Popup Modal
    popupOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    popupContent: {
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    popupIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    popupTitle: {
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
    },
    popupMessage: {
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    popupButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    popupButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    popupButtonSecondary: {},
    popupButtonPrimary: {},
    popupButtonTextSecondary: {
        fontWeight: '600',
    },
    popupButtonTextPrimary: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});