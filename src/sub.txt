import analytics from '@react-native-firebase/analytics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
import { NavigatorParams, STACKS } from '@truckmitr/src/stacks/stacks';
import { STATICS } from '@truckmitr/src/utils/config';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import RazorpayCheckout from 'react-native-razorpay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigatorProp = NativeStackNavigationProp<
  NavigatorParams,
  keyof NavigatorParams
>;

// --- Constants & Colors ---
const COLORS = {
  background: '#FAFBFC',
  white: '#FFFFFF',
  text: '#1A202C',
  textMuted: '#718096',
  border: '#E2E8F0',
  primary: '#4F46E5', // Indigo
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  danger: '#EF4444', // Red
  base: '#6B7280',
  verified: '#3B82F6',
  trusted: '#F59E0B',
  verifiedBg: '#EFF6FF',
  trustedBg: '#FFFBEB',
  baseBg: '#F9FAFB',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// --- Plan Data Configuration ---
const PLAN_DATA = [
  {
    id: 99,
    tier: 'base',
    name: 'JOB READY',
    subtitle: 'DRIVER',
    tagline: 'Start your journey',
    badge: '🚛',
    price: 99,
    duration: 'year',
    intro: 'Best for drivers who want to explore jobs on their own',
    benefits: [
      'Create your driver profile',
      'Browse and apply for job opportunities',
      'Contact transporters via in-app calling',
      'Access basic training & guidance',
      'Stay job-ready and visible',
    ],
    ctaText: 'Get Started',
    color: COLORS.base,
    bgColor: COLORS.baseBg,
    gradient: ['#6B7280', '#9CA3AF'],
  },
  {
    id: 199,
    tier: 'verified',
    name: 'VERIFIED',
    subtitle: 'DRIVER',
    tagline: 'Stand out with trust',
    badge: '✅',
    price: 199,
    duration: 'year',
    intro: 'Best for drivers who want more trust & better visibility',
    benefits: [
      'Everything in Job Ready',
      'One-time ID & document verification',
      'Verified badge on profile',
      'Higher trust with transporters',
      'Better chances of shortlisting',
    ],
    ctaText: 'Get Verified',
    color: COLORS.primary,
    bgColor: COLORS.verifiedBg,
    gradient: ['#4F46E5', '#6366F1'],
  },
  {
    id: 499,
    tier: 'trusted',
    name: 'TRUSTED',
    subtitle: 'DRIVER',
    tagline: 'Maximum opportunities',
    badge: '🛡️',
    price: 499,
    duration: 'year',
    intro: 'Best for premium trust & faster hiring',
    benefits: [
      'Everything in Verified',
      'Digital court & background check',
      'Digital address verification',
      'Home & photo verification with geo-location',
      'Trusted badge on profile',
      'Priority consideration for premium jobs',
    ],
    ctaText: 'Get Trusted',
    color: COLORS.trusted,
    bgColor: COLORS.trustedBg,
    gradient: ['#F59E0B', '#FBBF24'],
  },
];

const COMPARISON_DATA = {
  columns: ['Feature', 'Job Ready', 'Verified', 'Trusted'],
  rows: [
    { label: 'Job Access', values: ['5', '20', 'Unlimited'] },
    { label: 'Profile Visibility', values: ['Basic', 'Higher', 'Highest'] },
    { label: 'ID Verification', values: [false, true, true] },
    { label: 'Court Check', values: [false, false, true] },
    { label: 'Address Verification', values: [false, false, true] },
    { label: 'Transporter Trust', values: ['Low', 'Medium', 'High'] },
  ],
};

// --- Loading Overlay Component ---
const LoadingOverlay = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.loadingOverlay}
    >
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Opening Payment Gateway...</Text>
      </View>
    </Animated.View>
  );
};

// --- Consent Modal Component ---
const ConsentModal = ({
  visible,
  onClose,
  safeAreaInsets,
}: {
  visible: boolean;
  onClose: () => void;
  safeAreaInsets: { top: number; bottom: number };
}) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { width: screenWidth } = Dimensions.get('window');

  useEffect(() => {
    if (visible) {
      fetchConsentContent();
    }
  }, [visible]);

  const fetchConsentContent = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(END_POINTS.SUBSCRIPTION_CONSENT);
      const data = response?.data;
      
      // Try different response structures
      let htmlContent = '';
      if (data?.data?.content) {
        htmlContent = data.data.content;
      } else if (data?.content) {
        htmlContent = data.content;
      } else if (data?.data?.description) {
        htmlContent = data.data.description;
      } else if (data?.description) {
        htmlContent = data.description;
      } else if (data?.data?.html) {
        htmlContent = data.data.html;
      } else if (data?.html) {
        htmlContent = data.html;
      } else if (typeof data?.data === 'string') {
        htmlContent = data.data;
      } else if (typeof data === 'string') {
        htmlContent = data;
      }
      
      setContent(htmlContent || '<p>No content available.</p>');
    } catch (error) {
      console.error('Error fetching consent content:', error);
      setContent('<p>Unable to load content. Please try again later.</p>');
    } finally {
      setLoading(false);
    }
  };

  const tagsStyles = {
    body: {
      color: COLORS.text,
      fontSize: 15,
      lineHeight: 24,
    },
    p: {
      marginBottom: 12,
      color: COLORS.text,
    },
    h1: {
      fontSize: 22,
      fontWeight: '700' as const,
      color: COLORS.text,
      marginBottom: 16,
      marginTop: 20,
    },
    h2: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: COLORS.text,
      marginBottom: 12,
      marginTop: 16,
    },
    h3: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: COLORS.text,
      marginBottom: 10,
      marginTop: 14,
    },
    ul: {
      marginBottom: 12,
      paddingLeft: 8,
    },
    ol: {
      marginBottom: 12,
      paddingLeft: 8,
    },
    li: {
      marginBottom: 6,
      color: COLORS.text,
    },
    strong: {
      fontWeight: '700' as const,
      color: COLORS.text,
    },
    a: {
      color: COLORS.primary,
    },
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={[styles.consentModalContainer, { paddingTop: safeAreaInsets.top }]}>
        {/* Header */}
        <View style={styles.consentModalHeader}>
          <Text style={styles.consentModalTitle}>Terms & Disclaimer</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.consentModalCloseBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.consentModalLoading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.consentModalLoadingText}>Loading...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.consentModalScroll}
            contentContainerStyle={[
              styles.consentModalScrollContent,
              { paddingBottom: safeAreaInsets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={true}
          >
            {content ? (
              <RenderHtml
                contentWidth={screenWidth - 48}
                source={{ html: content }}
                tagsStyles={tagsStyles}
              />
            ) : (
              <Text style={{ color: COLORS.text, fontSize: 15 }}>No content available.</Text>
            )}
          </ScrollView>
        )}

        {/* Close Button at Bottom */}
        <View style={[styles.consentModalFooter, { paddingBottom: safeAreaInsets.bottom + 16 }]}>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.9}
            style={styles.consentModalDoneBtn}
          >
            <LinearGradient
              colors={[COLORS.primary, '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.consentModalDoneBtnGradient}
            >
              <Text style={styles.consentModalDoneBtnText}>I Understand</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- Sub-Components ---

const FeatureTable = React.memo(({ responsiveFontSize }: { responsiveFontSize: (s: number) => number }) => {
  return (
    <View style={styles.tableContainer}>
      <Text style={[styles.tableTitle, { fontSize: responsiveFontSize(1.8) }]}>
        Compare Plans
      </Text>

      {/* Header Row */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'left' }]}>Feature</Text>
        <Text style={styles.tableHeaderCell}>Job Ready</Text>
        <Text style={styles.tableHeaderCell}>Verified</Text>
        <Text style={[styles.tableHeaderCell, { color: COLORS.trusted }]}>Trusted</Text>
      </View>

      {/* Data Rows */}
      {COMPARISON_DATA.rows.map((row, idx) => (
        <View key={idx} style={[styles.tableRow, idx === COMPARISON_DATA.rows.length - 1 && styles.tableRowLast]}>
          <Text style={[
            styles.tableCellLabel,
            { fontSize: responsiveFontSize(1.3) },
          ]}>
            {row.label}
          </Text>

          {row.values.map((val, vIdx) => (
            <View key={vIdx} style={styles.tableCell}>
              {typeof val === 'boolean' ? (
                val ? <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                  : <Ionicons name="close-circle-outline" size={20} color={COLORS.danger} />
              ) : (
                <Text style={[
                  styles.tableCellValue,
                  { fontSize: responsiveFontSize(1.3) },
                ]}>
                  {val}
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

const BulletPoint = ({ text, color }: { text: string; color: string }) => (
  <View style={styles.bulletRow}>
    <Ionicons name="checkmark-circle" size={18} color={color} style={{ marginTop: 1 }} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const PlanCard = React.memo(({
  plan,
  isExpanded,
  onToggle,
  onSelect,
  responsiveFontSize,
  isPopular,
  consentChecked,
  onConsentToggle,
  onOpenConsent
}: {
  plan: typeof PLAN_DATA[0];
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  responsiveFontSize: (s: number) => number;
  isPopular?: boolean;
  consentChecked: boolean;
  onConsentToggle: () => void;
  onOpenConsent: () => void;
}) => {
  const rotation = useSharedValue(isExpanded ? 180 : 0);

  useEffect(() => {
    rotation.value = withTiming(isExpanded ? 180 : 0, { duration: 250 });
  }, [isExpanded]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[
      styles.cardContainer,
      isExpanded && styles.cardContainerExpanded,
      isPopular && styles.cardPopular
    ]}>
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
        </View>
      )}

      {/* Header (Always Visible) */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onToggle}
        style={styles.cardHeader}
      >
        <View style={styles.cardHeaderContent}>
          <View style={styles.cardHeaderTop}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.badgeContainer, { backgroundColor: plan.bgColor }]}>
                <Text style={styles.cardBadgeEmoji}>{plan.badge}</Text>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.cardTitle, { fontSize: responsiveFontSize(2) }]}>{plan.name}</Text>
                <Text style={[styles.cardSubtitle, { fontSize: responsiveFontSize(1.2) }]}>{plan.subtitle}</Text>
              </View>
            </View>
            <Animated.View style={animatedIconStyle}>
              <Ionicons name="chevron-down" size={24} color={COLORS.textMuted} />
            </Animated.View>
          </View>

          {/* Price always visible */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceAmount, { color: plan.color, fontSize: responsiveFontSize(3) }]}>
                ₹{plan.price}
              </Text>
              <Text style={styles.priceDuration}>/{plan.duration}</Text>
            </View>
            <Text style={[styles.priceTagline, { fontSize: responsiveFontSize(1.2) }]}>
              {plan.tagline}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.cardItinerary}>
          <View style={styles.separator} />

          {/* Intro */}
          <Text style={[styles.introText, { fontSize: responsiveFontSize(1.35) }]}>
            {plan.intro}
          </Text>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>What's Included:</Text>
            {plan.benefits.map((benefit, idx) => (
              <BulletPoint key={idx} text={benefit} color={plan.color} />
            ))}
          </View>

          {/* Consent Checkbox */}
          <View style={styles.consentRow}>
            <TouchableOpacity
              onPress={onConsentToggle}
              activeOpacity={0.7}
              style={styles.checkboxTouchable}
            >
              <View style={[styles.checkbox, consentChecked && styles.checkboxChecked]}>
                {consentChecked && (
                  <Ionicons name="checkmark" size={14} color={COLORS.white} />
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.consentText}>
              I agree to the{' '}
              <Text
                style={styles.consentLink}
                onPress={onOpenConsent}
              >
                subscription terms and disclaimer
              </Text>
              {' '}and authorize recurring payments
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={onSelect}
            activeOpacity={consentChecked ? 0.9 : 1}
            disabled={!consentChecked}
            style={[styles.ctaButtonContainer, { shadowColor: plan.color, opacity: consentChecked ? 1 : 0.5 }]}
          >
            <LinearGradient
              colors={plan.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaButtonText}>{plan.ctaText}</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
});

// --- Main Component ---
export default function Subscription({ }: any) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const colors = useColor();
  const safeAreaInsets = useSafeAreaInsets();
  const { responsiveFontSize } = useResponsiveScale();
  const navigation = useNavigation<NavigatorProp>();
  const { user, subscriptionModal } = useSelector((state: any) => state?.user);

  const [expandedId, setExpandedId] = useState<number | null>(199); // Default to verified plan
  const [isLoading, setIsLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentModalVisible, setConsentModalVisible] = useState(false);

  const handleToggle = (id: number) => {
    LayoutAnimation.configureNext({
      duration: 250,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    });
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleSelectPlan = async (plan: typeof PLAN_DATA[0]) => {
    try {
      setIsLoading(true);
      await _generateOrderId(plan);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const _generateOrderId = async (plan: typeof PLAN_DATA[0]) => {
    try {
      const amount = plan.price * 100;

      // Fetch plans real quick to get correct server ID just in case
      let serverPlanId = plan.id;
      try {
        const response = await axiosInstance.get(END_POINTS.SUBSCRIPTION_PLANS('driver'));
        if (response?.data?.success && Array.isArray(response?.data?.data)) {
          const found = response.data.data.find((p: any) => p.amount === plan.price);
          if (found) serverPlanId = found.id;
        }
      } catch (e) {
        console.log('Error fetching plans for matching, using fallback ID', e);
      }

      const payload = { plan_id: serverPlanId };
      const response = await axiosInstance.post(END_POINTS.PAYMENT_SUBSCRIPTION_CREATE, payload);
      const subscriptionId = response?.data?.subscription_id;

      if (subscriptionId) {
        _onPressPayNow(subscriptionId, amount.toString(), plan);
      } else {
        setIsLoading(false);
        showToast(t('oopsPaymentUnsuccessful'));
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setIsLoading(false);
      showToast(t('oopsPaymentUnsuccessful'));
    }
  };

  const _onPressPayNow = async (subscriptionId: string, amount: string, plan: typeof PLAN_DATA[0]) => {
    const options = {
      description: 'TruckMitr Subscription',
      image: 'https://truckmitr.com/public/front/assets/images/logotrick.png',
      currency: 'INR',
      key: STATICS?.RAYZORPAY_KEY_ID,
      subscription_id: subscriptionId,
      name: 'TruckMitr',
      notes: { unique_id: user?.unique_id, role: user?.role, plan_id: plan.id },
      prefill: { email: user?.email, contact: Number(user?.mobile), name: user?.name },
      theme: { color: plan.color },
    } as any;

    await RazorpayCheckout.open(options)
      .then(async data => {
        setIsLoading(false);
        const eventData = {
          user_id: String(user?.id ?? ''),
          user_unique_id: user?.unique_id ?? '',
          payment_amount: amount,
          payment_method: 'razorpay',
          status: 'success',
          plan_id: plan.id,
        };
        await analytics().logEvent('payment_success', eventData as any);
        AppEventsLogger.logEvent('payment_success', eventData);
        dispatch(subscriptionModalAction(false));
        setTimeout(() => navigation.navigate(STACKS.PAYMENT_SUCCESS, { options, data }), 100);
      })
      .catch(async error => {
        setIsLoading(false);
        showToast(t('oopsPaymentUnsuccessful'));
      });
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={subscriptionModal}
      statusBarTranslucent
      onRequestClose={() => dispatch(subscriptionModalAction(false))}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>

        {/* Close Button */}
        <TouchableOpacity
          onPress={() => dispatch(subscriptionModalAction(false))}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>

        {/* Top Banner - Limited Time Offer */}
        <View style={styles.topBanner}>
          <Text style={styles.headerTag}>Limited Time Mega Offer</Text>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: safeAreaInsets.bottom }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 1️⃣ Heading */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { fontSize: responsiveFontSize(2) }]}>
              Get Skilled. Get Verified. Get Hired. Get Ahead.
            </Text>
            <Text style={[styles.headerSubtitle, { fontSize: responsiveFontSize(2) }]}>
              Join TruckMitr Annual Membership and unlock exclusive benefits designed for drivers!
            </Text>
          </View>
          <FeatureTable responsiveFontSize={responsiveFontSize} />
          {/* 2️⃣ Plan Cards Section */}
          <View style={styles.cardsStack}>
            {PLAN_DATA.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isExpanded={expandedId === plan.id}
                onToggle={() => handleToggle(plan.id)}
                onSelect={() => handleSelectPlan(plan)}
                responsiveFontSize={responsiveFontSize}
                isPopular={index === 1} // Middle plan is popular
                consentChecked={consentChecked}
                onConsentToggle={() => setConsentChecked(!consentChecked)}
                onOpenConsent={() => setConsentModalVisible(true)}
              />
            ))}
          </View>

          {/* 3️⃣ Feature Comparison Box */}


          {/* Footer Note */}
          <View style={styles.footerNote}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
            <Text style={styles.footerNoteText}>
              Secure payment powered by Razorpay
            </Text>
          </View>

        </ScrollView>

        {/* Loading Overlay */}
        <LoadingOverlay visible={isLoading} />

        {/* Consent Modal */}
        <ConsentModal
          visible={consentModalVisible}
          onClose={() => setConsentModalVisible(false)}
          safeAreaInsets={safeAreaInsets}
        />
      </View >
    </Modal >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Loading Overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 7,
  },
  headerTitle: {
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 4,
    paddingHorizontal: 20,
  },
  topBanner: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.success,
  },
  headerTag: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Cards
  cardsStack: {
    gap: 16,
    marginBottom: 32,
  },
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  cardContainerExpanded: {
    shadowOpacity: 0.1,
    borderColor: COLORS.primary,
  },
  cardPopular: {
    borderColor: COLORS.primary,
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    zIndex: 1,
  },
  popularBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardHeader: {
    padding: 20,
  },
  cardHeaderContent: {
    gap: 16,
  },
  cardHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badgeContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBadgeEmoji: {
    fontSize: 28,
  },
  cardTitle: {
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },

  // Price
  priceContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  priceAmount: {
    fontWeight: '900',
    letterSpacing: -1,
  },
  priceDuration: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginLeft: 4,
  },
  priceTagline: {
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Expanded Content
  cardItinerary: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
    width: '100%',
  },
  introText: {
    color: COLORS.textMuted,
    marginBottom: 20,
    fontWeight: '500',
    lineHeight: 20,
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  ctaButtonContainer: {
    width: '100%',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  ctaButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 10,
  },
  checkboxTouchable: {
    padding: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    fontWeight: '500',
  },
  consentLink: {
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Table
  tableContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tableTitle: {
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCellLabel: {
    flex: 1.2,
    color: COLORS.text,
    fontWeight: '600',
  },
  tableCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableCellValue: {
    fontWeight: '600',
    color: COLORS.text,
  },

  // Footer
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  footerNoteText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Consent Modal
  consentModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  consentModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  consentModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  consentModalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentModalLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentModalLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  consentModalScroll: {
    flex: 1,
  },
  consentModalScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  consentModalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  consentModalDoneBtn: {
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderRadius: 14,
  },
  consentModalDoneBtnGradient: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentModalDoneBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});