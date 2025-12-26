import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Image,
    ScrollView,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    ZoomIn,
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';
import { useColor, useResponsiveScale, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Space } from '@truckmitr/src/app/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { jobAddAction, subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
import LinearGradient from 'react-native-linear-gradient';

// Truck Images
const TruckImages = {
    cargoOpen: require('@truckmitr/src/assets/trucks/open_cargo.png'),
    cargoClosed: require('@truckmitr/src/assets/trucks/close_cargo.png'),
    tipper: require('@truckmitr/src/assets/trucks/tripper.png'),
    trailer: require('@truckmitr/src/assets/trucks/tailer.png'),
    tanker: require('@truckmitr/src/assets/trucks/tainkers.png'),
    carCarrier: require('@truckmitr/src/assets/trucks/car_carrier.png'),
    container: require('@truckmitr/src/assets/trucks/container.png'),
    reefer: require('@truckmitr/src/assets/trucks/refregerator.png'),
};

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

// --- Job Steps Configuration ---
const JOB_STEPS = [
    { id: 'job_title', title: 'jobTitle', subtitle: 'enterJobTitle', field: 'job_title', required: true, icon: 'briefcase-outline' },
    { id: 'job_location', title: 'jobLocation', subtitle: 'selectJobLocation', field: 'job_location', required: true, icon: 'location-outline' },
    { id: 'vehicle_type', title: 'vehicleType', subtitle: 'selectVehicleType', field: 'vehicle_type', required: true, icon: 'car-outline' },
    { id: 'experience', title: 'experienceInYears', subtitle: 'selectExperience', field: 'Required_Experience', required: true, icon: 'time-outline' },
    { id: 'salary_range', title: 'salaryRange', subtitle: 'selectSalaryRange', field: 'Salary_Range', required: true, icon: 'cash-outline' },
    { id: 'license_type', title: 'typeOfLicense', subtitle: 'selectLicenseType', field: 'Type_of_License', required: true, icon: 'card-outline' },
    { id: 'preferred_skills', title: 'preferredSkills', subtitle: 'Select Preferred Skills', field: 'Preferred_Skills', required: true, icon: 'construct-outline' },
    { id: 'deadline', title: 'applicationDeadline', subtitle: 'Select Deadline', field: 'Application_Deadline', required: true, icon: 'calendar-outline' },
    { id: 'drivers_count', title: 'numberOfDrivers', subtitle: 'Enter Drivers Count', field: 'Job_Management', required: true, icon: 'people-outline' },
    { id: 'job_description', title: 'Job Description', subtitle: 'Write Description', field: 'Job_Description', required: true, icon: 'document-text-outline' },
];

// Data Arrays
const vehicleTypes = [
    { label: 'Cargo Truck (Open)', value: 'Cargo Truck (Open)', image: TruckImages.cargoOpen },
    { label: 'Cargo Truck (Closed)', value: 'Cargo Truck (Closed)', image: TruckImages.cargoClosed },
    { label: 'Tipper Trucks', value: 'Tipper Trucks', image: TruckImages.tipper },
    { label: 'Trailer / Semi-Trailer', value: 'Trailer / Semi-Trailer Trucks', image: TruckImages.trailer },
    { label: 'Tankers', value: 'Tankers', image: TruckImages.tanker },
    { label: 'Car Carriers', value: 'Car Carriers', image: TruckImages.carCarrier },
    { label: 'Container Trucks', value: 'Container Trucks', image: TruckImages.container },
    { label: 'Reefer Trucks', value: 'Refrigerator (Reefer) Trucks', image: TruckImages.reefer },
];

const drivingExperienceArray = [
    { label: '1-5 years', value: '1-5' },
    { label: '5-10 years', value: '5-10' },
    { label: '10-15 years', value: '10-15' },
    { label: '15-20 years', value: '15-20' },
    { label: '20+ years', value: '20+' },
];

const salaryRanges = [
    { label: '₹20,000 - 25,000', value: '20000-25000' },
    { label: '₹25,000 - 30,000', value: '25000-30000' },
    { label: '₹30,000 - 35,000', value: '30000-35000' },
    { label: '₹35,000 - 40,000', value: '35000-40000' },
    { label: '₹40,000 - 50,000', value: '40000-50000' },
    { label: '₹50,000+', value: '50000+' },
];

const licenseTypes = [
    { label: 'LMV (Light)', value: 'LMV', emoji: '🚗' },
    { label: 'HMV (Heavy)', value: 'HMV', emoji: '🚛' },
    { label: 'HGMV (Goods)', value: 'HGMV', emoji: '📦' },
    { label: 'HPMV/HTV', value: 'HPMV/HTV', emoji: '🚚' },
];

const operationalSegments = [
    { id: 'ecommerce', label: 'E-commerce', emoji: '📦' },
    { id: 'white_goods', label: 'White Goods', emoji: '🏠' },
    { id: 'livestock', label: 'Livestock', emoji: '🐄' },
    { id: 'perishable', label: 'Perishable', emoji: '🍎' },
    { id: 'oversized', label: 'Oversized', emoji: '📏' },
    { id: 'fuel_tanker', label: 'Fuel Tanker', emoji: '⛽' },
    { id: 'automobile', label: 'Automobile Carrier', emoji: '🚗' },
    { id: 'construction', label: 'Construction', emoji: '🏗️' },
    { id: 'refrigerator', label: 'Refrigerator Vehicle', emoji: '❄️' },
    { id: 'others', label: 'Others', emoji: '📋' },
];

export default function AddJob() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    useStatusBarStyle('dark-content');
    const colors = useColor();
    const { responsiveHeight, responsiveFontSize } = useResponsiveScale();
    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation<NavigatorProp>();
    const { addJob } = useSelector((state: any) => state?.job);
    const { isTransporter, subscriptionDetails, subscriptionModal } = useSelector((state: any) => state?.user);

    const [currentStep, setCurrentStep] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [locationsList, setLocationsList] = useState<any[]>([]);
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [checkBoxSelect, setCheckBoxSelect] = useState<boolean>(true);
    const [availableFreeJob, setAvailableFreeJob] = useState<boolean>(false);
    const [showSecondJobPopup, setShowSecondJobPopup] = useState<boolean>(false);

    // Fade animation for content transition
    const contentOpacity = useSharedValue(1);
    const contentTranslateX = useSharedValue(0);

    const progressPercent = ((currentStep + 1) / JOB_STEPS.length) * 100;

    // Load locations
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get(END_POINTS.GETSTATES);
                if (response?.data?.status) {
                    setLocationsList(response?.data?.data);
                }
            } catch (error: any) {
                console.log('Error fetching locations:', error);
            }
        };
        fetchData();
        fetchAvailableFreeJob();
        return () => {
            dispatch(jobAddAction(null));
        };
    }, []);

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

    // Staggered entrance animation
    useEffect(() => {
        contentOpacity.value = 0;
        contentTranslateX.value = 20;
        contentOpacity.value = withTiming(1, { duration: 400 });
        contentTranslateX.value = withSpring(0, { damping: 12 });
    }, [currentStep]);

    const animatedContentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateX: contentTranslateX.value }]
    }));

    const handleNext = async () => {
        const step = JOB_STEPS[currentStep];

        // Validation
        if (step.id === 'preferred_skills') {
            if (!addJob?.Preferred_Skills || addJob.Preferred_Skills.length === 0) {
                showToast(t('pleaseSelectAtLeastOne') || 'Please select at least one skill');
                return;
            }
        } else if (step.field && !addJob?.[step.field]) {
            showToast(t('pleaseEnterAllRequiredDetails') || 'Please fill in this field');
            return;
        }

        if (currentStep < JOB_STEPS.length - 1) {
            contentOpacity.value = withTiming(0, { duration: 200 });
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 200);
        } else {
            // Check subscription before final submit
            if (addJob?.id) {
                submitJob();
                return;
            }
            if (isTransporter && !availableFreeJob && subscriptionDetails?.showSubscriptionModel) {
                setShowSecondJobPopup(true);
            } else {
                submitJob();
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            contentOpacity.value = withTiming(0, { duration: 200 });
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
            }, 200);
        } else {
            navigation.goBack();
        }
    };

    const handleSecondJobPopupResponse = (proceed: boolean) => {
        setShowSecondJobPopup(false);
        if (proceed) {
            !subscriptionModal && dispatch(subscriptionModalAction(true));
        }
    };

    const toggleSkill = (label: string) => {
        const current = addJob?.Preferred_Skills || [];
        let newSkills;
        if (current.includes(label)) {
            newSkills = current.filter((i: string) => i !== label);
        } else {
            newSkills = [...current, label];
        }
        dispatch(jobAddAction({ ...addJob, Preferred_Skills: newSkills }));
    };

    const submitJob = async () => {
        if (!checkBoxSelect) {
            showToast(t('youNeedToAcceptTruckMitr') || 'Please accept the terms');
            return;
        }

        setFinishing(true);
        const FormData = require('form-data');
        let data = new FormData();
        data.append('job_title', addJob?.job_title);
        data.append('job_location', addJob?.job_location);
        data.append('vehicle_type', addJob?.vehicle_type);
        data.append('Required_Experience', addJob?.Required_Experience);
        data.append('Salary_Range', addJob?.Salary_Range);
        data.append('Type_of_License', addJob?.Type_of_License);
        data.append('Preferred_Skills', JSON.stringify(addJob?.Preferred_Skills));
        data.append('Application_Deadline', moment(addJob?.Application_Deadline).format("DD-MM-YYYY"));
        data.append('Job_Management', addJob?.Job_Management);
        data.append('Job_Description', addJob?.Job_Description);
        data.append('consent_visible_driver', checkBoxSelect ? 1 : 0);

        try {
            const response = addJob?.id
                ? await axiosInstance.post(END_POINTS.TRANSPORTER_EDIT_JOB(addJob?.id), data)
                : await axiosInstance.post(END_POINTS.TRANSPORTER_ADD_JOB, data);

            if (response?.data?.status) {
                setShowSuccess(true);
                setTimeout(() => {
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{
                                name: STACKS.BOTTOM_TAB,
                                state: { index: 0, routes: [{ name: STACKS.HOME }] },
                            }],
                        })
                    );
                    dispatch(jobAddAction(null));
                }, 2500);
            } else {
                showToast(response?.data?.message);
            }
        } catch (error) {
            console.log('Add job error:', JSON.stringify(error));
            showToast(t('somethingWentWrong') || 'Something went wrong');
        } finally {
            setFinishing(false);
        }
    };

    const renderStepContent = () => {
        const step = JOB_STEPS[currentStep];

        switch (step.id) {
            case 'job_title':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('jobTitle') || 'Job Title'}</Text>
                        <Text style={[styles.helperText, { marginBottom: 12, marginTop: 0 }]}>
                            {t('Enter a clear and descriptive job title') || 'Enter a clear and descriptive job title'}
                        </Text>
                        <TextInput
                            style={[styles.classicInput, styles.largeInput]}
                            placeholder={t('e.g. Long Haul Truck Driver for Interstate Routes') || "e.g. Long Haul Truck Driver for Interstate Routes"}
                            placeholderTextColor="#999"
                            value={addJob?.job_title || ''}
                            onChangeText={(text) => dispatch(jobAddAction({ ...addJob, job_title: text }))}
                            multiline
                        />
                    </View>
                );

            case 'job_location':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('jobLocation') || 'Job Location'}</Text>
                        <Text style={[styles.helperText, { marginBottom: 12, marginTop: 0 }]}>
                            {t('Select the state where the job is located') || 'Select the state where the job is located'}
                        </Text>
                        <TouchableOpacity
                            style={styles.classicBox}
                            onPress={() => setLocationModalOpen(true)}
                        >
                            <Text style={[styles.classicBoxText, !addJob?.job_location && { color: '#999' }]}>
                                {addJob?.job_location || t('Tap to Select Location') || 'Tap to select location'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#246BFD" />
                        </TouchableOpacity>
                    </View>
                );

            case 'vehicle_type':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('vehicleType') || 'Vehicle Type'}</Text>
                        <Text style={[styles.helperText, { marginBottom: 12, marginTop: 0 }]}>
                            {t('Select the type of vehicle required for this job') || 'Select the type of vehicle required for this job'}
                        </Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.vehicleGrid}>
                                {vehicleTypes.map((vehicle) => {
                                    const isSelected = addJob?.vehicle_type === vehicle.value;
                                    return (
                                        <TouchableOpacity
                                            key={vehicle.value}
                                            style={[
                                                styles.vehicleTile,
                                                isSelected && styles.vehicleTileSelected
                                            ]}
                                            onPress={() => dispatch(jobAddAction({ ...addJob, vehicle_type: vehicle.value }))}
                                            activeOpacity={0.7}
                                        >
                                            <Image
                                                source={vehicle.image}
                                                style={styles.vehicleImage}
                                                resizeMode="contain"
                                            />
                                            <Text style={[
                                                styles.vehicleLabel,
                                                isSelected && styles.vehicleLabelSelected
                                            ]}>
                                                {vehicle.label}
                                            </Text>
                                            {isSelected && (
                                                <View style={styles.vehicleCheckmark}>
                                                    <Ionicons name="checkmark-circle" size={20} color="#246BFD" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>
                );

            case 'experience':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('Experience Required') || 'Experience Required'}</Text>
                        <Text style={[styles.helperText, { marginBottom: 12, marginTop: 0 }]}>
                            {t('Select the minimum experience required') || 'Select the minimum experience required'}
                        </Text>
                        <View style={styles.gridContainer}>
                            {drivingExperienceArray.map((exp) => (
                                <TouchableOpacity
                                    key={exp.value}
                                    style={[
                                        styles.experienceTile,
                                        addJob?.Required_Experience === exp.value && styles.experienceTileSelected
                                    ]}
                                    onPress={() => dispatch(jobAddAction({ ...addJob, Required_Experience: exp.value }))}
                                >
                                    <Text style={[
                                        styles.experienceTileText,
                                        addJob?.Required_Experience === exp.value && styles.experienceTileTextSelected
                                    ]}>
                                        {exp.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 'salary_range':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('Salary Range') || 'Salary Range'}</Text>
                        <Text style={[styles.helperText, { marginBottom: 12, marginTop: 0 }]}>
                            {t('Select the monthly salary range for this position') || 'Select the monthly salary range for this position'}
                        </Text>
                        <View style={styles.gridContainer}>
                            {salaryRanges.map((salary) => (
                                <TouchableOpacity
                                    key={salary.value}
                                    style={[
                                        styles.salaryTile,
                                        addJob?.Salary_Range === salary.value && styles.salaryTileSelected
                                    ]}
                                    onPress={() => dispatch(jobAddAction({ ...addJob, Salary_Range: salary.value }))}
                                >
                                    <Text style={[
                                        styles.salaryTileText,
                                        addJob?.Salary_Range === salary.value && styles.salaryTileTextSelected
                                    ]}>
                                        {salary.label}
                                    </Text>
                                    {addJob?.Salary_Range === salary.value && (
                                        <Ionicons name="checkmark-circle" size={16} color="#246BFD" style={{ marginLeft: 4 }} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 'license_type':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('Type of License') || 'Type of License'}</Text>
                        <Text style={[styles.helperText, { marginBottom: 12, marginTop: 0 }]}>
                            {t('Select the license type required for this job') || 'Select the license type required for this job'}
                        </Text>
                        <View>
                            {licenseTypes.map((license) => {
                                const isSelected = addJob?.Type_of_License === license.value;
                                return (
                                    <TouchableOpacity
                                        key={license.value}
                                        style={[
                                            styles.endorsementTile,
                                            isSelected && styles.endorsementTileSelected
                                        ]}
                                        onPress={() => dispatch(jobAddAction({ ...addJob, Type_of_License: license.value }))}
                                    >
                                        <View style={[styles.endorsementIcon, isSelected && { backgroundColor: '#246BFD' }]}>
                                            <Text style={{ fontSize: 22 }}>{license.emoji}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.endorsementLabel, isSelected && { color: '#246BFD' }]}>
                                                {license.label}
                                            </Text>
                                        </View>
                                        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#246BFD" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                );

            case 'preferred_skills':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('Preferred Skills') || 'Preferred Skills'}</Text>
                        <Text style={[styles.helperText, { marginBottom: 12, marginTop: 0 }]}>
                            {t('Select all skills that apply to this job') || 'Select all skills that apply to this job'}
                        </Text>
                        <View style={styles.skillsGrid}>
                            {operationalSegments.map((skill) => {
                                const isSelected = addJob?.Preferred_Skills?.includes(skill.label);
                                return (
                                    <TouchableOpacity
                                        key={skill.id}
                                        style={[
                                            styles.skillChip,
                                            isSelected && styles.skillChipSelected
                                        ]}
                                        onPress={() => toggleSkill(skill.label)}
                                    >
                                        <Text style={{ fontSize: 16, marginRight: 6 }}>{skill.emoji}</Text>
                                        <Text style={[
                                            styles.skillChipText,
                                            isSelected && styles.skillChipTextSelected
                                        ]}>
                                            {skill.label}
                                        </Text>
                                        <Ionicons
                                            name={isSelected ? "checkmark" : "add"}
                                            size={14}
                                            color={isSelected ? "#246BFD" : "#666"}
                                            style={{ marginLeft: 4 }}
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                );

            case 'deadline':
                const deadlineDate = addJob?.Application_Deadline ? new Date(addJob.Application_Deadline) : moment().toDate();
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('Application Deadline') || 'Application Deadline'}</Text>
                        <Text style={[styles.helperText, { marginBottom: 12, marginTop: 0 }]}>
                            {t('Set the last date to accept applications') || 'Set the last date to accept applications'}
                        </Text>
                        <TouchableOpacity
                            style={styles.classicBox}
                            onPress={() => setDatePickerOpen(true)}
                        >
                            <Text style={[styles.classicBoxText, !addJob?.Application_Deadline && { color: '#999' }]}>
                                {addJob?.Application_Deadline
                                    ? moment(deadlineDate).format('DD MMMM YYYY')
                                    : t('selectFromCalendarBelow') || 'Tap to select date'}
                            </Text>
                            <Ionicons name="calendar" size={20} color="#246BFD" />
                        </TouchableOpacity>
                        <Space height={12} />
                        <DatePicker
                            mode='date'
                            theme='light'
                            date={deadlineDate}
                            minimumDate={new Date()}
                            maximumDate={moment().add(150, "years").toDate()}
                            onDateChange={(date) => {
                                dispatch(jobAddAction({ ...addJob, Application_Deadline: date }));
                            }}
                            modal={false}
                            style={{ alignSelf: 'center' }}
                        />
                    </View>
                );

            case 'drivers_count':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('numberOfDrivers') || 'Number of Drivers'}</Text>
                        <Text style={[styles.helperText, { marginBottom: 12, marginTop: 0 }]}>
                            {t('How many drivers do you need for this job?') || 'How many drivers do you need for this job?'}
                        </Text>
                        <TextInput
                            style={styles.classicInput}
                            placeholder={t('enterNumberOfDrivers') || "e.g. 5"}
                            placeholderTextColor="#999"
                            keyboardType="number-pad"
                            value={addJob?.Job_Management || ''}
                            onChangeText={(text) => dispatch(jobAddAction({ ...addJob, Job_Management: text }))}
                        />
                    </View>
                );

            case 'job_description':
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.classicLabel}>{t('Job Description') || 'Job Description'}</Text>
                        <Text style={[styles.helperText, { marginBottom: 12, marginTop: 0 }]}>
                            {t('Describe the job responsibilities and requirements') || 'Describe the job responsibilities and requirements'}
                        </Text>
                        <TextInput
                            style={[styles.classicInput, { height: 150, textAlignVertical: 'top', paddingTop: 12 }]}
                            placeholder={t('writeJobDescription') || "Describe the job requirements, responsibilities..."}
                            placeholderTextColor="#999"
                            multiline
                            value={addJob?.Job_Description || ''}
                            onChangeText={(text) => dispatch(jobAddAction({ ...addJob, Job_Description: text }))}
                        />
                        <Space height={16} />
                        {/* Consent Checkbox */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setCheckBoxSelect(!checkBoxSelect)}
                            style={styles.checkboxContainer}
                        >
                            <View style={[
                                styles.checkbox,
                                {
                                    backgroundColor: checkBoxSelect ? '#246BFD' : 'transparent',
                                    borderColor: checkBoxSelect ? '#246BFD' : '#ADB5BD'
                                }
                            ]}>
                                {checkBoxSelect && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                            </View>
                            <Text style={styles.checkboxText}>
                                {t('iAgreeToTruckMitr') || 'I agree to TruckMitr '}
                                <Text
                                    onPress={() => navigation.navigate(STACKS?.TRANSPORTER_CONSENT)}
                                    style={{ color: '#246BFD', fontWeight: '600' }}
                                >
                                    {t('transporterConsent') || 'Transporter Consent'}
                                </Text>
                                {t('addJobPolicy') || ' policy for adding jobs.'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                );

            default:
                return null;
        }
    };

    if (showSuccess) {
        return (
            <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <Animated.View entering={FadeInDown.duration(800).delay(300)} style={{ alignItems: 'center', marginTop: responsiveHeight(10) }}>
                    <Text style={{ fontSize: 28, fontWeight: '700', color: '#246BFD', marginBottom: -4 }}>
                        {t('success') || 'Success!'}
                    </Text>
                    <Text style={{ fontSize: 16, color: '#666', marginTop: 8 }}>
                        {addJob?.id ? t('jobUpdatedSuccessfully') || 'Job updated successfully!' : t('jobPostedSuccessfully') || 'Job posted successfully!'}
                    </Text>
                </Animated.View>
                <Animated.View entering={ZoomIn.duration(1000).delay(500).springify()} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: 240, height: 240, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{
                            position: 'absolute', width: 240, height: 240, borderRadius: 120,
                            backgroundColor: '#F0F8FF', borderWidth: 1, borderColor: '#E3F2FD', opacity: 0.6
                        }} />
                        <View style={{
                            position: 'absolute', width: 180, height: 180, borderRadius: 90,
                            backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E3F2FD', opacity: 0.8
                        }} />
                        <View style={{
                            width: 100, height: 100, borderRadius: 50, backgroundColor: '#246BFD',
                            justifyContent: 'center', alignItems: 'center'
                        }}>
                            <Ionicons name="checkmark" size={60} color="white" />
                        </View>
                    </View>
                </Animated.View>
                <Animated.View
                    entering={FadeInUp.duration(800).delay(1000)}
                    style={{ marginBottom: responsiveHeight(8), width: '85%', alignSelf: 'center', alignItems: 'center' }}
                >
                    <View style={{ width: '100%', height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, marginBottom: 16, overflow: 'hidden' }}>
                        <Animated.View
                            entering={FadeInDown.duration(2000)}
                            style={{ width: '100%', height: '100%', backgroundColor: '#246BFD', borderRadius: 3 }}
                        />
                    </View>
                    <Text style={{ fontSize: 15, color: '#333', fontWeight: '500' }}>
                        {t('redirectingToHome') || 'Redirecting to home...'}
                    </Text>
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: '#F8F9FA' }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
            <Space height={safeAreaInsets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.navBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{addJob?.id ? t('editJob') : t('addJob')}</Text>
                <View style={styles.navBtn} />
            </View>



            {/* Progress Info */}
            <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                    {t('step') || 'Step'} {currentStep + 1} {t('of') || 'of'} {JOB_STEPS.length}
                </Text>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
                </View>
            </View>

            {/* Main Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={animatedContentStyle}>
                    <View style={styles.stepHeader}>
                        <View style={[styles.stepIconContainer, { backgroundColor: '#246BFD' }]}>
                            <Ionicons name={JOB_STEPS[currentStep].icon as any} size={24} color="white" />
                        </View>
                        <View style={styles.stepHeaderText}>
                            <Text style={styles.stepTitle}>
                                {t(JOB_STEPS[currentStep].title)} <Text style={{ color: 'red' }}>*</Text>
                            </Text>
                            <Text style={styles.stepSubtitle}>{t(JOB_STEPS[currentStep].subtitle)}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {renderStepContent()}
                </Animated.View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: safeAreaInsets.bottom + 20 }]}>
                <TouchableOpacity
                    style={styles.classicButton}
                    onPress={handleNext}
                    disabled={finishing}
                >
                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFillObject}
                        colors={['#084489', '#0c78f0']}
                    />
                    {finishing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.classicButtonText}>
                                {currentStep === JOB_STEPS.length - 1 ? (addJob?.id ? t('updateJob') : t('postJob')) : t('next')}
                            </Text>
                            {currentStep !== JOB_STEPS.length - 1 && <Ionicons name="arrow-forward" size={18} color="white" style={{ marginLeft: 8 }} />}
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Location Modal */}
            <Modal visible={locationModalOpen} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('selectLocation')}</Text>
                            <TouchableOpacity onPress={() => setLocationModalOpen(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={true}>
                            {locationsList.map((location) => (
                                <TouchableOpacity
                                    key={location.id}
                                    style={[
                                        styles.modalItem,
                                        addJob?.job_location === location.name && styles.modalItemSelected
                                    ]}
                                    onPress={() => {
                                        dispatch(jobAddAction({ ...addJob, job_location: location.name }));
                                        setLocationModalOpen(false);
                                    }}
                                >
                                    <Ionicons name="location-outline" size={20} color={addJob?.job_location === location.name ? "#246BFD" : "#666"} />
                                    <Text style={[
                                        styles.modalItemText,
                                        addJob?.job_location === location.name && { color: '#246BFD', fontWeight: '600' }
                                    ]}>
                                        {location.name}
                                    </Text>
                                    {addJob?.job_location === location.name && (
                                        <Ionicons name="checkmark-circle" size={20} color="#246BFD" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Second Job Popup Modal */}
            <Modal
                visible={showSecondJobPopup}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSecondJobPopup(false)}
            >
                <View style={styles.popupOverlay}>
                    <View style={styles.popupContent}>
                        <View style={[styles.popupIconContainer, { backgroundColor: 'rgba(36, 107, 253, 0.1)' }]}>
                            <MaterialCommunityIcons name="briefcase-plus-outline" size={32} color="#246BFD" />
                        </View>
                        <Text style={styles.popupTitle}>
                            {t('secondJobTitle') || 'Post Another Job?'}
                        </Text>
                        <Text style={styles.popupMessage}>
                            {t('secondJobMessage') || 'You need a subscription to post more than one job.'}
                        </Text>
                        <View style={styles.popupButtons}>
                            <TouchableOpacity
                                onPress={() => handleSecondJobPopupResponse(false)}
                                style={[styles.popupButton, styles.popupButtonSecondary]}
                            >
                                <Text style={styles.popupButtonTextSecondary}>
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
                                <Text style={styles.popupButtonTextPrimary}>
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
        backgroundColor: '#F8F9FA',
    },
    navBtn: {
        width: 60,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    progressInfo: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    progressText: {
        fontSize: 12,
        color: '#6C757D',
        marginBottom: 8,
        fontWeight: '500',
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: '#E9ECEF',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#246BFD',
        borderRadius: 2,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
        paddingTop: 12,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stepIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepHeaderText: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 2,
    },
    stepSubtitle: {
        fontSize: 13,
        color: '#6C757D',
    },
    divider: {
        height: 1,
        backgroundColor: '#E9ECEF',
        marginBottom: 16,
    },
    stepContainer: {
        width: '100%',
    },
    classicLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 4,
    },
    classicBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#CED4DA',
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 52,
    },
    classicBoxText: {
        fontSize: 15,
        color: '#212529',
    },
    classicInput: {
        borderWidth: 1,
        borderColor: '#CED4DA',
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 52,
        fontSize: 15,
        color: '#212529',
    },
    largeInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
        paddingBottom: 12,
    },
    helperText: {
        fontSize: 12,
        color: '#6C757D',
        marginTop: 6,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    // Vehicle Type Styles
    vehicleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    vehicleTile: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E9ECEF',
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        position: 'relative',
    },
    vehicleTileSelected: {
        borderColor: '#246BFD',
        backgroundColor: '#F0F5FF',
    },
    vehicleImage: {
        width: '100%',
        height: 80,
        marginBottom: 0,
    },
    vehicleLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#495057',
        textAlign: 'center',
    },
    vehicleLabelSelected: {
        color: '#246BFD',
    },
    vehicleCheckmark: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    // Experience Tile Styles
    experienceTile: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#DEE2E6',
        paddingVertical: 16,
        paddingHorizontal: 12,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    experienceTileSelected: {
        borderColor: '#246BFD',
        backgroundColor: '#F0F5FF',
    },
    experienceTileText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#495057',
        textAlign: 'center',
    },
    experienceTileTextSelected: {
        color: '#246BFD',
        fontWeight: '700',
    },
    // Salary Tile Styles
    salaryTile: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#DEE2E6',
        paddingVertical: 14,
        paddingHorizontal: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    salaryTileSelected: {
        borderColor: '#246BFD',
        backgroundColor: '#F0F5FF',
    },
    salaryTileText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#495057',
        textAlign: 'center',
    },
    salaryTileTextSelected: {
        color: '#246BFD',
        fontWeight: '600',
    },
    // Endorsement/License Type Styles
    endorsementTile: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#DEE2E6',
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: 'white',
    },
    endorsementTileSelected: {
        borderColor: '#246BFD',
        backgroundColor: '#F0F5FF',
    },
    endorsementIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    endorsementLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    // Skills Grid
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    skillChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 24,
        paddingVertical: 10,
        paddingHorizontal: 14,
        margin: 4,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    skillChipSelected: {
        backgroundColor: '#F0F5FF',
        borderColor: '#246BFD',
    },
    skillChipText: {
        fontSize: 13,
        color: '#495057',
        fontWeight: '500',
    },
    skillChipTextSelected: {
        color: '#246BFD',
        fontWeight: '600',
    },
    // Checkbox
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxText: {
        flex: 1,
        fontSize: 13,
        color: '#6C757D',
        lineHeight: 20,
    },
    footer: {
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopColor: '#E9ECEF',
        backgroundColor: 'white',
        paddingTop: 16,
    },
    classicButton: {
        height: 54,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        shadowColor: "#084489",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    classicButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 4,
    },
    modalItemSelected: {
        backgroundColor: '#F0F5FF',
    },
    modalItemText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 12,
        flex: 1,
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
        backgroundColor: 'white',
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
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 12,
    },
    popupMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
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
    popupButtonSecondary: {
        backgroundColor: '#F0F0F0',
    },
    popupButtonPrimary: {},
    popupButtonTextSecondary: {
        fontWeight: '600',
        fontSize: 15,
        color: '#333',
    },
    popupButtonTextPrimary: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 15,
    },
});