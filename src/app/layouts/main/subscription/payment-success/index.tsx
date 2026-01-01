import {
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    BackHandler,
    StyleSheet,
    Dimensions,
    ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColor, useResponsiveScale, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigatorParams } from '@truckmitr/src/stacks/stacks';
import LottieView from 'lottie-react-native';
import { hitSlop } from '@truckmitr/src/app/functions';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { useDispatch, useSelector } from 'react-redux';
import { subscriptionDetailsAction } from '@truckmitr/src/redux/actions/user.action';
import moment from 'moment';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withTiming,
    FadeIn,
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Classic Design Colors
const COLORS = {
    primary: '#1E3A8A',
    primaryLight: '#3B82F6',
    success: '#059669',
    successLight: '#10B981',
    gold: '#D97706',
    white: '#FFFFFF',
    background: '#F1F5F9',
    text: '#1E293B',
    textMuted: '#64748B',
    textLight: '#94A3B8',
    border: '#E2E8F0',
};

// Plan tier configurations with benefits
const TIER_CONFIG: Record<string, {
    color: string;
    gradient: string[];
    icon: string;
    label: string;
    benefitKeys: string[];
    noteKeys: string[];
    ctaKey: string;
}> = {
    'JOB READY': {
        color: '#475569',
        gradient: ['#475569', '#64748B'],
        icon: '🚛',
        label: 'Job Ready',
        benefitKeys: [
            'subBenefitCreateProfile',
            'subBenefitBrowseJobs',
            'subBenefitContactTransporters',
            'subBenefitBasicTraining',
            'subBenefitStayJobReady',
        ],
        noteKeys: [
            'subNoteNoVerification',
            'subNoteChooseJobs',
        ],
        ctaKey: 'subIdealLowPayment',
    },
    'VERIFIED': {
        color: '#1E3A8A',
        gradient: ['#1E3A8A', '#3B82F6'],
        icon: '✅',
        label: 'Verified',
        benefitKeys: [
            'subBenefitEverythingJobReady',
            'subBenefitOneTimeVerification',
            'subBenefitVerifiedBadge',
            'subBenefitHigherTrust',
            'subBenefitBetterShortlisting',
            'subBenefitTruckMitrSupport',
        ],
        noteKeys: [
            'subNoteVerificationAfterUpload',
            'subNoteMayRequireOTP',
            'subNoteNoGuarantee',
        ],
        ctaKey: 'subRecommendedSerious',
    },
    'TRUSTED': {
        color: '#D97706',
        gradient: ['#D97706', '#F59E0B'],
        icon: '🛡️',
        label: 'Trusted',
        benefitKeys: [
            'subBenefitEverythingVerified',
            'subBenefitCourtCheck',
            'subBenefitAddressVerify',
            'subBenefitHomePhotoVerify',
            'subBenefitTrustedBadge',
            'subBenefitHighestCredibility',
            'subBenefitPriorityPremium',
        ],
        noteKeys: [
            'subNoteDigitallyProcessed',
            'subNoteFollowInstructions',
            'subNoteImprovesConfidence',
        ],
        ctaKey: 'subBestLongTerm',
    },
};

export default function PaymentSuccess() {
    const route: any = useRoute();
    const { t } = useTranslation();
    useStatusBarStyle('dark-content');
    const dispatch = useDispatch();
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const [emailPopupVisible, setEmailPopupVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { user, isDriver, subscriptionDetails } = useSelector((state: any) => state?.user);
    const [email, setEmail] = useState(user?.email || '');

    // Extract plan data
    const plan = route?.params?.plan;
    const planPrice = plan?.price || (isDriver ? 199 : 499);
    const planName = plan?.name || (isDriver ? 'VERIFIED' : 'STANDARD');
    const originalPrice = plan?.price === 99 ? 249 : plan?.price === 199 ? 499 : plan?.price === 499 ? 999 : 499;

    const tierConfig = TIER_CONFIG[planName] || TIER_CONFIG['VERIFIED'];

    // Animation
    const checkScale = useSharedValue(0);

    const _goback = () => {
        navigation.goBack();
    };

    const _handleEmailSubmit = async () => {
        if (email && !/\S+@\S+\.\S+/.test(email)) {
            showToast(t('pleaseEnterValidEmail'));
            return;
        }
        if (email && email !== user?.email) {
            try {
                let emailFormData = new FormData();
                emailFormData.append('email', email);
                setEmailPopupVisible(false);
                await axiosInstance.post(END_POINTS.PAYMENT_SEND_INVOICE_EMAIL, emailFormData);
            } catch (error) {
                console.log('Email update error:', error);
            }
        }
        setEmailPopupVisible(false);
    };

    useEffect(() => {
        const backAction = () => isLoading;
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [isLoading]);

    const _handleSkipEmail = () => setEmailPopupVisible(false);

    const _syncSubscriptionStatus = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(END_POINTS.PAYMENT_SUBSCRIPTION_DETAILS);
            if (response?.data?.status) {
                dispatch(subscriptionDetailsAction(response?.data?.data));
                if (response?.data?.email_required) setEmailPopupVisible(true);
            }

            const subscriptionId = route?.params?.data?.razorpay_subscription_id;
            const paymentId = route?.params?.data?.razorpay_payment_id;

            if (subscriptionId && paymentId) {
                try {
                    let syncFormData = new FormData();
                    syncFormData.append('subscription_id', subscriptionId);
                    syncFormData.append('payment_id', paymentId);
                    syncFormData.append('payment_type', 'subscription');
                    const subscriptionDates = route?.params?.subscriptionDates;
                    if (subscriptionDates?.start_date) syncFormData.append('start_date', subscriptionDates.start_date);
                    if (subscriptionDates?.end_date) syncFormData.append('end_date', subscriptionDates.end_date);
                    const syncResponse = await axiosInstance.post(END_POINTS.PAYMENT_SUBSCRIPTION_CAPTURE, syncFormData);
                    if (syncResponse?.data?.email_required) setEmailPopupVisible(true);
                    if (syncResponse?.data?.status) {
                        const updatedDetails = await axiosInstance.get(END_POINTS.PAYMENT_SUBSCRIPTION_DETAILS);
                        if (updatedDetails?.data?.status) {
                            dispatch(subscriptionDetailsAction(updatedDetails?.data?.data));
                        }
                    }
                } catch (syncError) {
                    console.log('Payment sync note:', syncError);
                }
            }
        } catch (error: any) {
            console.error('Subscription status error:', error.response?.data || error.message);
        } finally {
            setIsLoading(false);
            checkScale.value = withDelay(200, withSpring(1, { damping: 12 }));
        }
    };

    useEffect(() => {
        _syncSubscriptionStatus();
    }, []);

    const checkAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkScale.value }],
    }));

    return (
        <View style={styles.container}>
            {/* Loading */}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('subConfirmingPayment')}</Text>
                </View>
            )}

            {/* Header - Slim */}
            <View style={[styles.header, { paddingTop: safeAreaInsets.top + 8 }]}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('subPaymentHeader')}</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Success Card */}
                <Animated.View
                    entering={FadeInDown.delay(100).duration(400)}
                    style={styles.successCard}
                >
                    {/* Success Icon */}
                    <Animated.View style={[styles.successIcon, checkAnimatedStyle]}>
                        <Ionicons name="checkmark-circle" size={72} color={COLORS.success} />
                    </Animated.View>

                    <Animated.Text
                        entering={FadeIn.delay(300)}
                        style={styles.successTitle}
                    >
                        {t('subPaymentSuccessful')}
                    </Animated.Text>

                    <Animated.Text
                        entering={FadeIn.delay(400)}
                        style={styles.successSubtitle}
                    >
                        {t('subSubscriptionActive')}
                    </Animated.Text>

                    {/* Amount */}
                    <Animated.View
                        entering={FadeInUp.delay(500)}
                        style={styles.amountContainer}
                    >
                        <Text style={styles.amountLabel}>{t('subAmountPaid')}</Text>
                        <Text style={[styles.amountValue, { color: tierConfig.color }]}>₹{planPrice}</Text>
                    </Animated.View>
                </Animated.View>

                {/* Benefits */}
                <Animated.View
                    entering={FadeInUp.delay(700).duration(400)}
                    style={styles.benefitsCard}
                >
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionDot, { backgroundColor: COLORS.success }]} />
                        <Text style={styles.benefitsTitle}>{t('subYourBenefits')}</Text>
                    </View>
                    {tierConfig.benefitKeys.map((key, idx) => (
                        <BenefitItem key={idx} text={t(key)} />
                    ))}

                    <View style={styles.ctaNote}>
                        <Text style={[styles.ctaNoteText, { color: tierConfig.color }]}>
                            ✨ {t(tierConfig.ctaKey)}
                        </Text>
                    </View>
                </Animated.View>

                {/* Important Notes */}
                <Animated.View
                    entering={FadeInUp.delay(800).duration(400)}
                    style={styles.notesCard}
                >
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionDot, { backgroundColor: COLORS.gold }]} />
                        <Text style={styles.notesTitle}>{t('subPleaseNote')}</Text>
                    </View>
                    {tierConfig.noteKeys.map((key, idx) => (
                        <NoteItem key={idx} text={t(key)} />
                    ))}
                </Animated.View>

                {/* Spacer for button */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Bottom Button */}
            <Animated.View
                entering={FadeInUp.delay(900).duration(400)}
                style={[styles.bottomContainer, { paddingBottom: safeAreaInsets.bottom + 16 }]}
            >
                <TouchableOpacity
                    onPress={_goback}
                    activeOpacity={0.8}
                    style={styles.homeButton}
                >
                    <LinearGradient
                        colors={tierConfig.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.homeButtonGradient}
                    >
                        <Ionicons name="home-outline" size={20} color={COLORS.white} />
                        <Text style={styles.homeButtonText}>{t('backToHome')}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>

            {/* Email Modal */}
            <Modal
                animationType="fade"
                transparent
                visible={emailPopupVisible}
                onRequestClose={() => setEmailPopupVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Ionicons name="mail-outline" size={40} color={COLORS.primary} />
                        <Text style={styles.modalTitle}>{t('emailReceipt')}</Text>
                        <Text style={styles.modalSubtitle}>{t('weNeedYourEmail')}</Text>

                        <TextInput
                            style={styles.emailInput}
                            placeholder={t('subEnterEmail')}
                            placeholderTextColor={COLORS.textLight}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={_handleSkipEmail} style={styles.skipBtn}>
                                <Text style={styles.skipBtnText}>{t('subSkip')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={_handleEmailSubmit} style={styles.submitBtn}>
                                <Text style={styles.submitBtnText}>{t('subSubmit')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// Benefit Item Component
const BenefitItem = ({ text }: { text: string }) => (
    <View style={styles.benefitItem}>
        <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
        <Text style={styles.benefitText}>{text}</Text>
    </View>
);

// Note Item Component
const NoteItem = ({ text }: { text: string }) => (
    <View style={styles.noteItem}>
        <Ionicons name="information-circle-outline" size={18} color={COLORS.gold} />
        <Text style={styles.noteText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    // Header - Slim
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    scrollContent: {
        padding: 20,
    },
    // Success Card
    successCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    successIcon: {
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    successSubtitle: {
        fontSize: 15,
        color: COLORS.textMuted,
        marginBottom: 20,
    },
    amountContainer: {
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        width: '100%',
    },
    amountLabel: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
    },
    // Plan Card
    planCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    planInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    planIcon: {
        fontSize: 32,
    },
    planName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    planDuration: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    activeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.white,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 16,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    priceLabel: {
        fontSize: 14,
        color: COLORS.textMuted,
    },
    priceValues: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    priceOriginal: {
        fontSize: 14,
        color: COLORS.textLight,
        textDecorationLine: 'line-through',
    },
    priceCurrent: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    savingsValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    // Benefits Card
    benefitsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    benefitsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 16,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    benefitText: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '500',
        flex: 1,
    },
    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    // CTA Note
    ctaNote: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    ctaNoteText: {
        fontSize: 14,
        fontWeight: '600',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    // Notes Card
    notesCard: {
        backgroundColor: '#FFFBEB', // Warm amber tint
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    notesTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.gold,
        marginBottom: 0,
    },
    noteItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 10,
    },
    noteText: {
        fontSize: 13,
        color: COLORS.textMuted,
        fontStyle: 'italic',
        flex: 1,
        lineHeight: 18,
    },
    // Bottom Button
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    homeButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    homeButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    homeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.white,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 16,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: 20,
    },
    emailInput: {
        width: '100%',
        height: 48,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 15,
        color: COLORS.text,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    skipBtn: {
        flex: 1,
        height: 46,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textMuted,
    },
    submitBtn: {
        flex: 1,
        height: 46,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.white,
    },
});
