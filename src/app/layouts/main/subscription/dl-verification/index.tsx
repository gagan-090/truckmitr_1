import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useColor, useResponsiveScale, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigatorParams } from '@truckmitr/src/stacks/stacks';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { useDispatch, useSelector } from 'react-redux';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    FadeIn,
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';
import { hitSlop } from '@truckmitr/src/app/functions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Modern Colors
const COLORS = {
    primary: '#1E3A8A',
    primaryLight: '#3B82F6',
    success: '#059669',
    successLight: '#10B981',
    successBg: '#ECFDF5',
    gold: '#D97706',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    error: '#DC2626',
    errorBg: '#FEF2F2',
    white: '#FFFFFF',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1E293B',
    textMuted: '#64748B',
    textLight: '#94A3B8',
    border: '#E2E8F0',
    inputBg: '#F1F5F9',
    inactiveTab: '#F1F5F9',
    inactiveTabText: '#64748B',
};

// Response Interfaces
interface DLVerificationResponse {
    status: number;
    message: string;
    txn_id?: string;
    result?: {
        name?: string;
        user_full_name?: string;
        dob?: string;
        user_dob?: string;
        img?: string;
        father_name?: string;
        father_or_husband?: string;
        cov_details?: {
            cov: string;
            issue_date: string;
            expiry_date: string;
        }[];
        validity?: {
            non_transport: string;
            transport: string;
        };
        user_address?: {
            addressLine1: string;
            completeAddress: string;
            country: string;
            district: string;
            pin: string;
            state: string;
            type: string;
        }[];
        issue_date?: string;
        issued_date?: string;
        blood_group?: string;
        user_blood_group?: string;
        status?: string;
        expiry_date?: string;
    };
}

interface PANVerificationResponse {
    status: number;
    message: string;
    txn_id?: string;
    result?: {
        pan: string;
        full_name: string;
        first_name: string;
        last_name: string;
        gender: string;
        dob: string;
        email: string;
        mobile: string;
        address: {
            state: string;
            pin_code: string;
            [key: string]: string;
        };
        category: string;
    };
}

// Pre-verified DL check response (from GET API)
interface DLVerificationCheckResponse {
    status: number;
    dl_number_verified?: boolean;
    user_full_name?: string;
    father_or_husband?: string;
    user_blood_group?: string;
    issued_date?: string;
    expiry_date?: string;
    user_address?: {
        line1?: string;
        complete_address?: string;
        district?: string;
        state?: string;
        country?: string;
        pin?: string;
    };
    dl_number?: string;
}

// Pre-verified PAN check response (from GET API)
interface PANVerificationCheckResponse {
    status: number;
    pan_verified: boolean;
    pan: string;
    txn_id: string;
    full_name: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    gender: string;
    email: string | null;
    mobile: string | null;
    aadhaar: string;
    aadharlink: boolean;
    tax: string;
    category: string;
    address: {
        address_line_1: string;
        address_line_2: string;
        address_line_3: string;
        address_line_4: string;
        address_line_5: string;
        pin_code: string;
        state: string;
    };
    pin_code: string;
    state: string;
    verified_at: string;
}

interface AadhaarVerificationResponse {
    status: number;
    message: string;
    result?: any;
}

interface VoterVerificationResponse {
    status: number;
    message: string;
    result?: any;
}

type TabType = 'DL' | 'PAN' | 'AADHAAR' | 'VOTER';

export default function DocumentVerification() {
    const route: any = useRoute();
    const { t } = useTranslation();
    useStatusBarStyle('dark-content');
    const dispatch = useDispatch();
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();

    const { user, isDriver } = useSelector((state: any) => state?.user);

    // Tab State
    const [activeTab, setActiveTab] = useState<TabType>('DL');

    // Form State
    const [dlNumber, setDlNumber] = useState('');
    const [panNumber, setPanNumber] = useState('');
    const [aadhaarNumber, setAadhaarNumber] = useState('');
    const [voterIdNumber, setVoterIdNumber] = useState('');
    const [consentChecked, setConsentChecked] = useState(false);

    // Loading & Result States
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingProfile, setIsFetchingProfile] = useState(true);

    // Results
    const [dlResult, setDlResult] = useState<DLVerificationResponse | null>(null);
    const [panResult, setPanResult] = useState<PANVerificationResponse | null>(null);
    const [aadhaarResult, setAadhaarResult] = useState<AadhaarVerificationResponse | null>(null);
    const [voterResult, setVoterResult] = useState<VoterVerificationResponse | null>(null);

    const [error, setError] = useState<string | null>(null);

    // Validation Errors
    const [inputError, setInputError] = useState<string | null>(null);

    // Animation
    const cardScale = useSharedValue(0);

    // Scroll ref
    const scrollViewRef = useRef<ScrollView>(null);

    // Check if error requires subscription upgrade
    const isUpgradeRequired = useCallback((errorMsg: string | null): boolean => {
        if (!errorMsg) return false;
        const lowerError = errorMsg.toLowerCase();
        return lowerError.includes('active plan required') ||
            lowerError.includes('active subscription required') ||
            lowerError.includes('subscription required') ||
            lowerError.includes('plan required') ||
            lowerError.includes('upgrade') ||
            lowerError.includes('subscribe');
    }, []);

    // Format error message - show custom message for subscription required errors
    const getFormattedError = useCallback((errorMsg: string): string => {
        if (isUpgradeRequired(errorMsg)) {
            return t('upgradeForAccess') || 'Upgrade your plan for accessing this feature';
        }
        return errorMsg;
    }, [isUpgradeRequired, t]);

    // Auto-fill from user profile
    useEffect(() => {
        // Auto-fill DL
        const licenseNumber = user?.License_Number || user?.license_number || '';
        if (licenseNumber && licenseNumber.trim()) {
            setDlNumber(licenseNumber.trim().toUpperCase());
        }

        // Auto-fill PAN (if available in profile)
        const pan = user?.pan || user?.PAN_Number || user?.pan_number || user?.Pan_Number || '';
        if (pan && pan.trim()) {
            setPanNumber(pan.trim().toUpperCase());
        }

        // Auto-fill Aadhaar
        const aadhaar = user?.aadhaar_number || user?.Aadhaar_Number || user?.aadhaar || '';
        if (aadhaar && aadhaar.trim()) {
            setAadhaarNumber(aadhaar.trim());
        }

        // Auto-fill Voter ID
        const voter = user?.voter_id || user?.Voter_Id || user?.voter_id_number || '';
        if (voter && voter.trim()) {
            setVoterIdNumber(voter.trim().toUpperCase());
        }

        setIsFetchingProfile(false);
    }, [user]);

    // Check if DL is already verified on screen load
    useEffect(() => {
        const checkDLVerificationStatus = async () => {
            // Get user ID - check multiple possible field names
            const userId = user?.id || user?.user_id || user?.userId;
            const licenseNumber = user?.License_Number || user?.license_number || dlNumber || '';

            if (!userId || !licenseNumber) {
                return;
            }
            try {
                setIsFetchingProfile(true);
                const apiUrl = END_POINTS.DRIVERVERIFICATIONDLVERIFICATION(userId, licenseNumber.trim().toUpperCase());

                const response = await axiosInstance.get(apiUrl);
                const data: DLVerificationCheckResponse = response?.data;

                // If DL is already verified, transform the response and show success screen
                if (data?.status === 1 && data?.dl_number_verified === true) {
                    console.log('DL is verified! Showing success screen...');

                    // Transform API response to match DLVerificationResponse format
                    const transformedResult: DLVerificationResponse = {
                        status: 1,
                        message: 'DL already verified',
                        result: {
                            user_full_name: data.user_full_name,
                            name: data.user_full_name,
                            father_or_husband: data.father_or_husband,
                            father_name: data.father_or_husband,
                            user_blood_group: data.user_blood_group,
                            blood_group: data.user_blood_group,
                            issued_date: data.issued_date,
                            issue_date: data.issued_date,
                            expiry_date: data.expiry_date,
                            validity: {
                                non_transport: data.expiry_date || '',
                                transport: data.expiry_date || '',
                            },
                            user_address: data.user_address ? [{
                                addressLine1: data.user_address.line1 || '',
                                completeAddress: data.user_address.complete_address || '',
                                district: data.user_address.district || '',
                                state: data.user_address.state || '',
                                country: data.user_address.country || '',
                                pin: data.user_address.pin || '',
                                type: 'permanent',
                            }] : undefined,
                        },
                    };

                    setDlResult(transformedResult);
                    setDlNumber(data.dl_number || licenseNumber.trim().toUpperCase());
                }
            } catch (err: any) {
                console.log('DL Verification Check Error:', err?.response?.data || err?.message || err);
                // Silently fail - user can still verify manually
            } finally {
                setIsFetchingProfile(false);
            }
        };

        // Only run if we have a user
        if (user) {
            checkDLVerificationStatus();
        }
    }, [user]);

    // Check if PAN is already verified on screen load
    useEffect(() => {
        const checkPANVerificationStatus = async () => {
            // Get user ID
            const userId = user?.id || user?.user_id || user?.userId;
            const panNo = user?.pan || user?.PAN_Number || user?.pan_number || user?.Pan_Number || panNumber || '';

            if (!userId || !panNo) {
                return;
            }

            try {
                // Determine if we need to show loading (only if DL is not loading)
                if (!isFetchingProfile) setIsFetchingProfile(true);

                const apiUrl = END_POINTS.DRIVERVERIFICATIONPANVERIFICATION(userId, panNo.trim().toUpperCase());

                const response = await axiosInstance.get(apiUrl);
                const data: PANVerificationCheckResponse = response?.data;

                // If PAN is already verified
                if (data?.status === 1 && data?.pan_verified === true) {
                    console.log('PAN is verified! Showing success screen...');

                    // Transform API response to match PANVerificationResponse format
                    const transformedResult: PANVerificationResponse = {
                        status: 1,
                        message: 'PAN already verified',
                        txn_id: data.txn_id,
                        result: {
                            pan: data.pan,
                            full_name: data.full_name,
                            first_name: data.first_name,
                            last_name: data.last_name,
                            gender: data.gender,
                            dob: '', // DOB not returned in check API
                            email: data.email || '',
                            mobile: data.mobile || '',
                            address: {
                                state: data.state || data.address?.state || '',
                                pin_code: data.pin_code || data.address?.pin_code || '',
                                address_line_1: data.address?.address_line_1 || '',
                                address_line_2: data.address?.address_line_2 || '',
                            },
                            category: data.category,
                        },
                    };

                    setPanResult(transformedResult);
                    setPanNumber(data.pan || panNo.trim().toUpperCase());
                }
            } catch (err: any) {
                console.log('PAN Verification Check Error:', err?.response?.data || err?.message || err);
                // Silently fail
            } finally {
                setIsFetchingProfile(false);
            }
        };

        if (user) {
            checkPANVerificationStatus();
        }
    }, [user]);

    // Animate success card
    useEffect(() => {
        const isSuccess = activeTab === 'DL' ? !!(dlResult?.status === 1) : !!(panResult?.status === 1);
        if (isSuccess) {
            setError(null);
            cardScale.value = withDelay(200, withSpring(1, { damping: 12 }));
        }
    }, [dlResult, panResult, activeTab]);

    // Reset error when tab changes
    useEffect(() => {
        setError(null);
        setInputError(null);
        setConsentChecked(false);
    }, [activeTab]);

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
    }));

    // Validators
    const validateDL = (value: string): boolean => {
        if (!value || value.trim().length === 0) {
            setInputError(t('dlNumberRequired') || 'Driving License number is required');
            return false;
        }
        if (value.length < 10 || value.length > 20) {
            setInputError(t('dlNumberLengthError') || 'DL number must be between 10-20 characters');
            return false;
        }
        setInputError(null);
        return true;
    };

    const validatePAN = (value: string): boolean => {
        if (!value || value.trim().length === 0) {
            setInputError(t('panNumberRequired') || 'PAN number is required');
            return false;
        }
        // Basic PAN Pattern: 5 letters, 4 digits, 1 letter
        const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panPattern.test(value)) {
            setInputError(t('invalidPanFormat') || 'Invalid PAN format (e.g., ABCPD1234E)');
            return false;
        }
        setInputError(null);
        return true;
    };

    const validateAadhaar = (value: string): boolean => {
        if (!value || value.trim().length === 0) {
            setInputError(t('aadhaarNumberRequired') || 'Aadhaar number is required');
            return false;
        }
        if (value.length !== 12 || !/^\d+$/.test(value)) {
            setInputError(t('invalidAadhaarFormat') || 'Aadhaar number must be 12 digits');
            return false;
        }
        setInputError(null);
        return true;
    };

    const validateVoterId = (value: string): boolean => {
        if (!value || value.trim().length === 0) {
            setInputError(t('voterIdRequired') || 'Voter ID is required');
            return false;
        }
        // Basic Voter ID pattern (usually 3 chars + 7 digits, but can vary)
        if (value.length < 10) {
            setInputError(t('invalidVoterIdFormat') || 'Invalid Voter ID format');
            return false;
        }
        setInputError(null);
        return true;
    };

    // Handlers
    const handleDLChange = (value: string) => {
        const cleanedValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        setDlNumber(cleanedValue);
        if (inputError) validateDL(cleanedValue);
    };

    const handlePanChange = (value: string) => {
        const cleanedValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        setPanNumber(cleanedValue);
        if (inputError) validatePAN(cleanedValue);
    };

    const handleAadhaarChange = (value: string) => {
        const cleanedValue = value.replace(/[^0-9]/g, '');
        setAadhaarNumber(cleanedValue);
        if (inputError) validateAadhaar(cleanedValue);
    };

    const handleVoterIdChange = (value: string) => {
        const cleanedValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        setVoterIdNumber(cleanedValue);
        if (inputError) validateVoterId(cleanedValue);
    };

    // API Call
    const handleVerify = async () => {
        setError(null);

        if (activeTab === 'DL') {
            if (!validateDL(dlNumber)) return;
            if (!consentChecked) {
                showToast(t('dlConsentRequired') || 'Please provide consent to proceed');
                return;
            }

            try {
                setIsLoading(true);
                const payload = {
                    dl_no: dlNumber,
                    consent: 'Y',
                    consent_text: 'We confirm obtaining valid customer consent to access/process their dl data. Consent remains valid, informed, and unwithdrawn.',
                };

                const config = { headers: { 'Content-Type': 'application/json' } };
                const response = await axiosInstance.post(END_POINTS.DL_VERIFY, payload, config);

                if (response?.data?.status === 1) {
                    setDlResult(response.data);
                    cardScale.value = 0;
                } else {
                    const apiError = response?.data?.message || t('verificationFailed') || 'Verification failed';
                    setError(getFormattedError(apiError));
                }
            } catch (err: any) {
                const apiError = err?.response?.data?.message || t('errorOccurred') || 'An error occurred';
                setError(getFormattedError(apiError));
            } finally {
                setIsLoading(false);
            }

        } else if (activeTab === 'PAN') {
            if (!validatePAN(panNumber)) return;

            try {
                setIsLoading(true);
                const payload = { pan: panNumber };
                const config = { headers: { 'Content-Type': 'application/json' } };
                const response = await axiosInstance.post(END_POINTS.PAN_VERIFY, payload, config);

                if (response?.data?.status === 1) {
                    setPanResult(response.data);
                    cardScale.value = 0;
                } else {
                    const apiError = response?.data?.message || t('verificationFailed') || 'Verification failed';
                    setError(getFormattedError(apiError));
                }
            } catch (err: any) {
                const msg = err?.response?.data?.message || err?.response?.data?.error || t('errorOccurred') || 'An error occurred';
                setError(getFormattedError(msg));
            } finally {
                setIsLoading(false);
            }
        } else if (activeTab === 'AADHAAR') {
            if (!validateAadhaar(aadhaarNumber)) return;

            try {
                setIsLoading(true);
                const payload = { aadhaar: aadhaarNumber };
                const config = { headers: { 'Content-Type': 'application/json' } };
                const response = await axiosInstance.post(END_POINTS.AADHAAR_VERIFY, payload, config);

                if (response?.data?.status === 1) {
                    setAadhaarResult(response.data);
                    cardScale.value = 0;
                } else {
                    const apiError = response?.data?.message || t('verificationFailed') || 'Verification failed';
                    setError(getFormattedError(apiError));
                }
            } catch (err: any) {
                const msg = err?.response?.data?.message || t('errorOccurred') || 'An error occurred';
                setError(getFormattedError(msg));
            } finally {
                setIsLoading(false);
            }
        } else if (activeTab === 'VOTER') {
            if (!validateVoterId(voterIdNumber)) return;

            try {
                setIsLoading(true);
                const payload = { voter_id: voterIdNumber };
                const config = { headers: { 'Content-Type': 'application/json' } };
                const response = await axiosInstance.post(END_POINTS.VOTER_VERIFY, payload, config);

                if (response?.data?.status === 1) {
                    setVoterResult(response.data);
                    cardScale.value = 0;
                } else {
                    const apiError = response?.data?.message || t('verificationFailed') || 'Verification failed';
                    setError(getFormattedError(apiError));
                }
            } catch (err: any) {
                const msg = err?.response?.data?.message || t('errorOccurred') || 'An error occurred';
                setError(getFormattedError(msg));
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleGoBack = () => navigation.goBack();

    // Open Subscription Modal (existing global modal) with upgradeOnly option
    // This will show only ₹199 and ₹499 plans, not the ₹99 plan
    const handleOpenUpgradeModal = useCallback(() => {
        dispatch(subscriptionModalAction({ visible: true, upgradeOnly: true }));
    }, [dispatch]);

    // Render Logic
    const isSuccess = activeTab === 'DL' ? !!(dlResult?.status === 1) :
        activeTab === 'PAN' ? !!(panResult?.status === 1) :
            activeTab === 'AADHAAR' ? !!(aadhaarResult?.status === 1) :
                !!(voterResult?.status === 1);

    const renderSuccessView = () => {
        if (activeTab === 'DL' && dlResult?.result) {
            const data = dlResult.result;
            const address = data.user_address && data.user_address[0] ? data.user_address[0] : null;
            const vehicleCats = data.cov_details?.map(cov => cov.cov) || [];

            return (
                <View>
                    {/* Driver Details Card */}
                    <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.detailsCard}>
                        <View style={styles.detailsHeader}>
                            <MaterialCommunityIcons name="card-account-details" size={24} color={COLORS.primary} />
                            <Text style={styles.detailsTitle}>{t('dlDriverDetails') || 'Driver Details'}</Text>
                        </View>
                        <View style={styles.detailsGrid}>
                            <DetailRow icon="person" label={t('fullName') || 'Full Name'} value={data.name || data.user_full_name || '-'} />
                            <DetailRow icon="person-add" label={t('fatherName') || 'Father Name'} value={data.father_name || data.father_or_husband || '-'} />
                            <DetailRow icon="calendar" label={t('dob') || 'Date of Birth'} value={data.dob || data.user_dob || '-'} />
                            <DetailRow icon="shield-checkmark" label={t('status') || 'Status'} value={data.status || 'Active'} isStatus statusType={data.status?.toLowerCase() === 'active' ? 'success' : 'warning'} />

                            {/* Additional Details */}
                            <DetailRow icon="water" label={t('bloodGroup') || 'Blood Group'} value={data.blood_group || data.user_blood_group || '-'} />
                            <DetailRow icon="calendar-outline" label={t('issueDate') || 'Issue Date'} value={data.issue_date || data.issued_date || '-'} />

                            {/* Validity / Expiry */}
                            {data.validity ? (
                                <DetailRow
                                    icon="time"
                                    label={t('dlValidity') || 'Validity'}
                                    value={data.validity.transport || data.validity.non_transport || '-'}
                                />
                            ) : (
                                <DetailRow icon="time" label={t('dlExpiryDate') || 'Expiry Date'} value={data.expiry_date || '-'} />
                            )}

                            {address && (
                                <DetailRow
                                    icon="location"
                                    label={t('address') || 'Address'}
                                    value={address.completeAddress}
                                    multiline
                                />
                            )}
                        </View>

                        {vehicleCats.length > 0 && (
                            <View style={styles.categoriesSection}>
                                <Text style={styles.categoriesTitle}><Ionicons name="car" size={16} color={COLORS.textMuted} />  {t('dlVehicleCategories') || 'Vehicle Categories'}</Text>
                                <View style={styles.categoriesList}>
                                    {vehicleCats.map((cat, idx) => (
                                        <View key={idx} style={styles.categoryBadge}><Text style={styles.categoryText}>{cat}</Text></View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </Animated.View>
                </View>
            );
        } else if (activeTab === 'PAN' && panResult?.result) {
            const data = panResult.result;
            return (
                <View>
                    {/* PAN Details Card */}
                    <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.detailsCard}>
                        <View style={styles.detailsHeader}>
                            <MaterialCommunityIcons name="card-account-details" size={24} color={COLORS.primary} />
                            <Text style={styles.detailsTitle}>{t('panDetails') || 'PAN Details'}</Text>
                        </View>
                        <View style={styles.detailsGrid}>
                            <DetailRow icon="person" label={t('fullName') || 'Full Name'} value={data.full_name} />
                            <DetailRow icon="card" label="PAN Number" value={data.pan} highlight />
                            <DetailRow icon="male-female" label={t('gender') || 'Gender'} value={data.gender} />
                            <DetailRow icon="calendar" label={t('dob') || 'Date of Birth'} value={data.dob} />
                            <DetailRow icon="call" label={t('mobile') || 'Mobile'} value={data.mobile} />
                            {data.address && (
                                <DetailRow
                                    icon="location"
                                    label={t('address') || 'Address'}
                                    value={`${data.address.address_line_1}, ${data.address.address_line_2 || ''}, ${data.address.state} - ${data.address.pin_code}`}
                                    multiline
                                />
                            )}
                        </View>
                    </Animated.View>
                </View>
            );
        } else if (activeTab === 'AADHAAR' && aadhaarResult) {
            return (
                <View>
                    <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.detailsCard}>
                        <View style={styles.detailsHeader}>
                            <MaterialCommunityIcons name="card-account-details" size={24} color={COLORS.primary} />
                            <Text style={styles.detailsTitle}>{t('aadhaarDetails') || 'Aadhaar Details'}</Text>
                        </View>
                        <View style={styles.detailsGrid}>
                            <DetailRow icon="shield-checkmark" label={t('status') || 'Status'} value="Verified" isStatus statusType="success" />
                            {/* Add more fields if available in result */}
                        </View>
                    </Animated.View>
                </View>
            );
        } else if (activeTab === 'VOTER' && voterResult) {
            return (
                <View>
                    <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.detailsCard}>
                        <View style={styles.detailsHeader}>
                            <MaterialCommunityIcons name="card-account-details" size={24} color={COLORS.primary} />
                            <Text style={styles.detailsTitle}>{t('voterIdDetails') || 'Voter ID Details'}</Text>
                        </View>
                        <View style={styles.detailsGrid}>
                            <DetailRow icon="shield-checkmark" label={t('status') || 'Status'} value="Verified" isStatus statusType="success" />
                            {/* Add more fields if available in result */}
                        </View>
                    </Animated.View>
                </View>
            );
        }
        return null;
    };

    const TabButton = ({ type, label, icon }: any) => (
        <TouchableOpacity
            style={[styles.tab, activeTab === type && styles.activeTab, { flex: 1, margin: 0, borderWidth: 1, borderColor: activeTab === type ? COLORS.primaryLight : COLORS.border }]}
            onPress={() => setActiveTab(type)}
            disabled={isLoading}
        >
            <Ionicons name={icon} size={18} color={activeTab === type ? COLORS.primary : COLORS.inactiveTabText} />
            <Text style={[styles.tabText, activeTab === type && styles.activeTabText]}>{label}</Text>
        </TouchableOpacity>
    );

    const renderTabs = () => (
        <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <TabButton type='DL' label={t('drivingLicense') || 'Driving License'} icon='car-outline' />
                <TabButton type='AADHAAR' label={t('aadhaarCard') || 'Aadhaar Card'} icon='finger-print' />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <TabButton type='PAN' label={t('panCard') || 'PAN Card'} icon='card-outline' />
                <TabButton type='VOTER' label={t('voterId') || 'Voter ID'} icon='person-outline' />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Slim Header */}
            <View style={[styles.header, { paddingTop: safeAreaInsets.top + 4 }]}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={handleGoBack} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={20} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerText}>{t('documentVerification') || 'Document Verification'}</Text>
                <View style={{ width: 32 }} />
            </View>

            {/* Content */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={0}>
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    bounces={true}
                    scrollEventThrottle={16}
                >
                    {/* Header Card */}
                    <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.headerCard}>
                        <View style={styles.headerRow}>
                            <View style={styles.kycIconContainer}>
                                <MaterialCommunityIcons name="shield-check-outline" size={28} color={COLORS.primary} />
                            </View>
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.headerTitle}>{t('kycVerification') || 'KYC Verification'}</Text>
                                <Text style={styles.headerSubtitle}>{t('kycSubtitle') || 'Verify your documents to build trust'}</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Tabs */}
                    {renderTabs()}

                    {/* Main Content Area */}
                    {isSuccess ? (
                        <View>
                            {/* Success Card */}
                            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.successCard, cardAnimatedStyle]}>
                                <View style={styles.successIconContainer}>
                                    <View style={styles.successIconBg}>
                                        <Ionicons name="checkmark-circle" size={56} color={COLORS.success} />
                                    </View>
                                </View>
                                <Text style={styles.successTitle}>{t('verificationSuccessful') || 'Verified Successfully!'}</Text>
                                <Text style={styles.successSubtitle}>{t('verificationSuccessDesc') || `Your ${activeTab === 'DL' ? 'driving license' : 'PAN card'} has been verified`}</Text>
                            </Animated.View>

                            {renderSuccessView()}

                            <TouchableOpacity
                                onPress={() => {
                                    // Reset to allow verify other doc or update
                                    if (activeTab === 'DL') setDlResult(null);
                                    else setPanResult(null);
                                    setConsentChecked(false);
                                }}
                                style={styles.secondaryButton}
                            >
                                <Text style={styles.secondaryButtonText}>{t('verifyAnother') || 'Verify Another Document'}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.formCard}>
                            {activeTab === 'DL' && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}><Ionicons name="card" size={14} color={COLORS.textMuted} />  {t('drivingLicenseNumber') || 'Driving License Number'}</Text>
                                    <View style={[styles.inputContainer, inputError ? styles.inputError : null]}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter DL Number"
                                            placeholderTextColor={COLORS.textLight}
                                            value={dlNumber}
                                            onChangeText={handleDLChange}
                                            maxLength={20}
                                            autoCapitalize="characters"
                                            editable={!isFetchingProfile}
                                        />
                                        {isFetchingProfile && <ActivityIndicator size="small" color={COLORS.primary} style={styles.inputLoader} />}
                                    </View>
                                    <Text style={styles.inputHint}>Format: 10-20 alphanumeric characters</Text>
                                </View>
                            )}

                            {activeTab === 'PAN' && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}><Ionicons name="card" size={14} color={COLORS.textMuted} />  {t('panNumber') || 'PAN Number'}</Text>
                                    <View style={[styles.inputContainer, inputError ? styles.inputError : null]}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter PAN Number (e.g. ABCDE1234F)"
                                            placeholderTextColor={COLORS.textLight}
                                            value={panNumber}
                                            onChangeText={handlePanChange}
                                            maxLength={10}
                                            autoCapitalize="characters"
                                            editable={!isFetchingProfile}
                                        />
                                    </View>
                                    <Text style={styles.inputHint}>Format: 5 Letters, 4 Digits, 1 Letter</Text>
                                </View>
                            )}

                            {activeTab === 'AADHAAR' && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}><Ionicons name="finger-print" size={14} color={COLORS.textMuted} />  {t('aadhaarNumber') || 'Aadhaar Number'}</Text>
                                    <View style={[styles.inputContainer, inputError ? styles.inputError : null]}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter 12-digit Aadhaar Number"
                                            placeholderTextColor={COLORS.textLight}
                                            value={aadhaarNumber}
                                            onChangeText={handleAadhaarChange}
                                            maxLength={12}
                                            keyboardType="numeric"
                                            editable={!isFetchingProfile}
                                        />
                                    </View>
                                    <Text style={styles.inputHint}>Format: 12-digit numeric code</Text>
                                </View>
                            )}

                            {activeTab === 'VOTER' && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}><Ionicons name="person" size={14} color={COLORS.textMuted} />  {t('voterIdNumber') || 'Voter ID Number'}</Text>
                                    <View style={[styles.inputContainer, inputError ? styles.inputError : null]}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter Voter ID"
                                            placeholderTextColor={COLORS.textLight}
                                            value={voterIdNumber}
                                            onChangeText={handleVoterIdChange}
                                            maxLength={15}
                                            autoCapitalize="characters"
                                            editable={!isFetchingProfile}
                                        />
                                    </View>
                                    <Text style={styles.inputHint}>Format: Alphanumeric ID</Text>
                                </View>
                            )}

                            {inputError && <Text style={styles.errorText}>{inputError}</Text>}

                            {activeTab === 'DL' && (
                                <TouchableOpacity onPress={() => setConsentChecked(!consentChecked)} activeOpacity={0.7} style={styles.consentRow}>
                                    <View style={[styles.checkbox, consentChecked && styles.checkboxChecked]}>
                                        {consentChecked && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                                    </View>
                                    <Text style={styles.consentText}>{t('dlConsentText') || 'I consent to verify my driving license for KYC purposes.'}</Text>
                                </TouchableOpacity>
                            )}

                            {error && (
                                <Animated.View entering={FadeIn.duration(300)} style={styles.errorCard}>
                                    <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                                    <Text style={styles.errorCardText}>{error}</Text>
                                </Animated.View>
                            )}

                            {/* Button Section - Show Upgrade or Verify based on error */}
                            {isUpgradeRequired(error) ? (
                                <TouchableOpacity
                                    onPress={handleOpenUpgradeModal}
                                    activeOpacity={0.9}
                                    style={styles.verifyButtonContainer}
                                >
                                    <LinearGradient colors={['#F59E0B', '#FBBF24']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.verifyButton}>

                                        <Text style={styles.verifyButtonText}>{t('upgradeSubscription') || 'Upgrade Subscription'} </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={handleVerify}
                                    activeOpacity={0.9}
                                    disabled={isLoading || (activeTab === 'DL' && !consentChecked)}
                                    style={[
                                        styles.verifyButtonContainer,
                                        (isLoading || (activeTab === 'DL' && !consentChecked)) && styles.verifyButtonDisabled
                                    ]}
                                >
                                    <LinearGradient colors={['#1E3A8A', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.verifyButton}>
                                        {isLoading ? (
                                            <>
                                                <ActivityIndicator size="small" color={COLORS.white} />
                                                <Text style={styles.verifyButtonText}>{t('verifying') || 'Verifying...'}</Text>
                                            </>
                                        ) : (
                                            <>
                                                <MaterialCommunityIcons name="shield-check" size={20} color={COLORS.white} />
                                                <Text style={styles.verifyButtonText}>{t('verifyNow') || 'Verify Now'}</Text>
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </Animated.View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Loading Overlay */}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Verifying...</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

// Detail Row
const DetailRow = ({ icon, label, value, highlight = false, isStatus = false, statusType = 'success', multiline = false }: any) => (
    <View style={styles.detailRow}>
        <View style={styles.detailLabelContainer}>
            <Ionicons name={icon} size={16} color={COLORS.textMuted} />
            <Text style={styles.detailLabel}>{label}</Text>
        </View>
        {isStatus ? (
            <View style={[styles.statusBadge, statusType === 'success' ? styles.statusSuccess : styles.statusWarning]}>
                <Text style={[styles.statusText, statusType === 'success' ? styles.statusTextSuccess : styles.statusTextWarning]}>{value}</Text>
            </View>
        ) : (
            <Text style={[styles.detailValue, highlight && styles.detailValueHighlight, multiline && { flex: 1, textAlign: 'right' }]}>{value || '-'}</Text>
        )}
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingBottom: 8, backgroundColor: COLORS.white,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border,
    },
    backBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.inputBg },
    headerText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
    scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
    headerCard: {
        backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    headerTextContainer: { flex: 1, marginLeft: 12 },
    kycIconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
    headerSubtitle: { fontSize: 13, color: COLORS.textMuted },

    // Tabs
    tabContainer: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 8 },
    activeTab: { backgroundColor: '#EFF6FF', borderColor: COLORS.primaryLight, borderWidth: 1 },
    tabText: { fontSize: 14, fontWeight: '600', color: COLORS.inactiveTabText },
    activeTabText: { color: COLORS.primary },

    // Form
    formCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 12, shadowOpacity: 0.04, elevation: 1 },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.inputBg, paddingHorizontal: 16 },
    inputError: { borderColor: COLORS.error },
    input: { flex: 1, height: 48, fontSize: 15, fontWeight: '600', color: COLORS.text, letterSpacing: 0.3 },
    inputLoader: { marginLeft: 8 },
    inputHint: { fontSize: 12, color: COLORS.textLight, marginTop: 6 },
    errorText: { fontSize: 12, color: COLORS.error, marginTop: 4 },

    // Consent
    consentRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 12 },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
    checkboxChecked: { backgroundColor: COLORS.success, borderColor: COLORS.success },
    consentText: { flex: 1, fontSize: 13, color: COLORS.textMuted, lineHeight: 19 },

    // Buttons
    verifyButtonContainer: { borderRadius: 14, overflow: 'hidden', shadowColor: COLORS.primary, shadowOpacity: 0.2, elevation: 4 },
    verifyButtonDisabled: { opacity: 0.6, shadowOpacity: 0, elevation: 0 },
    verifyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 10 },
    verifyButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
    secondaryButton: { marginTop: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12 },
    secondaryButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.text },

    // Error
    errorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.errorBg, borderRadius: 12, padding: 14, marginBottom: 20, gap: 10 },
    errorCardText: { flex: 1, fontSize: 13, color: COLORS.error, fontWeight: '500' },

    // Result
    successCard: { alignItems: 'center', marginBottom: 24, backgroundColor: COLORS.white, padding: 24, borderRadius: 16 },
    successIconContainer: { marginBottom: 16 },
    successIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.successBg, alignItems: 'center', justifyContent: 'center' },
    successTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
    successSubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },

    detailsCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 16, shadowOpacity: 0.04, elevation: 1 },
    detailsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 10 },
    detailsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    detailsGrid: { gap: 12 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 4 },
    detailLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '40%' },
    detailLabel: { fontSize: 13, color: COLORS.textMuted },
    detailValue: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1, textAlign: 'right' },
    detailValueHighlight: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },

    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusSuccess: { backgroundColor: COLORS.successBg },
    statusWarning: { backgroundColor: COLORS.warningBg },
    statusText: { fontSize: 12, fontWeight: '700' },
    statusTextSuccess: { color: COLORS.success },
    statusTextWarning: { color: COLORS.warning },

    categoriesSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
    categoriesTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 10 },
    categoriesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    categoryBadge: { backgroundColor: COLORS.inputBg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    categoryText: { fontSize: 12, fontWeight: '600', color: COLORS.text },

    loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    loadingCard: { backgroundColor: COLORS.white, padding: 24, borderRadius: 16, alignItems: 'center', shadowOpacity: 0.1, elevation: 5 },
    loadingText: { marginTop: 12, fontSize: 14, fontWeight: '600', color: COLORS.primary },
});
