import analytics from '@react-native-firebase/analytics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import { isIOS } from '@truckmitr/src/app/functions';
import {
  useColor,
  useResponsiveScale,
  useShadow
} from '@truckmitr/src/app/hooks';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
import { NavigatorParams, STACKS } from '@truckmitr/src/stacks/stacks';
import { STATICS } from '@truckmitr/src/utils/config';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
} from 'react-native';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import RazorpayCheckout from 'react-native-razorpay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.50;
const CARD_SPACING = 14;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

type NavigatorProp = NativeStackNavigationProp<
  NavigatorParams,
  keyof NavigatorParams
>;

interface SubscriptionPlan {
  id: number;
  name: string;
  amount: number;
  duration_months: number;
  razorpay_months: number;
  razorpay_plan_id: string;
  tier: 'base' | 'semi-premium' | 'premium';
  category: string;
  tagline: string;
  badge: string;
  benefits: string[];
  verificationRequired: string[];
  verificationOptional: string[];
  trustMessage: string;
  edgeCaseNote?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
}

// Design system colors per specification
const DESIGN_COLORS = {
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#64748B',
  base: '#64748B',
  baseLight: '#94A3B8',
  verified: '#3B82F6',
  verifiedLight: '#60A5FA',
  trusted: '#F59E0B',
  trustedLight: '#FBBF24',
  white: '#FFFFFF',
  border: '#E2E8F0',
};

// Driver plan tiers configuration
const DRIVER_PLAN_CONFIG: Record<number, Partial<SubscriptionPlan>> = {
  99: {
    tier: 'base',
    category: 'Job Ready Driver',
    tagline: 'Job Ready',
    badge: '🚛',
    benefits: [
      'Apply to 5 jobs only',
      'Access to 3 training modules',
      'First training module free',
      'Profile shown as Standard Driver',
      'Limited visibility to transporters',
    ],
    verificationRequired: [],
    verificationOptional: [],
    trustMessage: 'Upgrade to unlock more job opportunities and verified trust',
  },
  199: {
    tier: 'semi-premium',
    category: 'Verified Driver',
    tagline: 'Most Popular',
    badge: '✅',
    isPopular: true,
    benefits: [
      'Apply to 20 jobs',
      'Access to 5 training modules',
      'Verified Driver badge',
      'Mandatory profile completion',
      'Higher transporter visibility',
    ],
    verificationRequired: ['Driving License', 'Aadhaar'],
    verificationOptional: ['PAN', 'Voter ID'],
    trustMessage: 'Verified drivers get faster callbacks and higher match success',
  },
  499: {
    tier: 'premium',
    category: 'Trusted Driver',
    tagline: 'Best Value ⭐',
    badge: '⭐',
    isBestValue: true,
    benefits: [
      'Unlimited job applications',
      'Full access to all training modules',
      'Trusted Driver premium badge',
      'Priority visibility for transporters',
      'TeleChamp prioritization enabled',
    ],
    verificationRequired: ['Court Check', 'Digital Address Verification'],
    verificationOptional: [],
    trustMessage: 'Maximum trust, maximum opportunities. Get hired faster!',
    edgeCaseNote: 'Verification can be completed later with progress tracking',
  },
};

// Transporter plan tiers configuration
const TRANSPORTER_PLAN_CONFIG: Record<number, Partial<SubscriptionPlan>> = {
  499: {
    tier: 'base',
    category: 'Standard Transporter',
    tagline: 'Start Hiring',
    badge: '🚚',
    benefits: [
      'Unlimited Job Posting',
      'View Driver Applications',
      'Profile Updates',
      'Add Drivers for Training',
    ],
    verificationRequired: [],
    verificationOptional: [],
    trustMessage: 'Post jobs and find drivers for your fleet',
  },
};

// Get tier color helper
const getTierColor = (tier?: string, fallback?: string) => {
  switch (tier) {
    case 'base':
      return DESIGN_COLORS.base;
    case 'semi-premium':
      return DESIGN_COLORS.verified;
    case 'premium':
      return DESIGN_COLORS.trusted;
    default:
      return fallback || DESIGN_COLORS.verified;
  }
};

// Large Plan Card Component with animations
const PlanCard = React.memo(({
  plan,
  index,
  scrollX,
  onSelect,
  isSelected,
}: {
  plan: SubscriptionPlan;
  index: number;
  scrollX: Animated.SharedValue<number>;
  onSelect: () => void;
  isSelected: boolean;
}) => {
  const { responsiveFontSize } = useResponsiveScale();

  const tierColors: Record<string, { accent: string; bg: string }> = {
    base: { accent: DESIGN_COLORS.base, bg: '#F1F5F9' },
    'semi-premium': { accent: DESIGN_COLORS.verified, bg: '#EFF6FF' },
    premium: { accent: DESIGN_COLORS.trusted, bg: '#FEF3C7' },
  };

  const tierStyle = tierColors[plan.tier] || tierColors.base;
  const inputRange = [
    (index - 1) * SNAP_INTERVAL,
    index * SNAP_INTERVAL,
    (index + 1) * SNAP_INTERVAL,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.88, 1.0, 0.88],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onSelect}>
      <Animated.View
        style={[
          styles.planCard,
          animatedStyle,
          {
            width: CARD_WIDTH,
            marginRight: CARD_SPACING,
            borderWidth: isSelected ? 3 : 1,
            borderColor: isSelected ? tierStyle.accent : DESIGN_COLORS.border,
            backgroundColor: DESIGN_COLORS.white,
          },
        ]}
      >
        {/* Colored Top Bar */}
        <View style={[styles.cardTopBar, { backgroundColor: tierStyle.accent }]} />

        {/* Tag Badge */}
        {(plan.isPopular || plan.isBestValue) && (
          <View
            style={[
              styles.tagBadge,
              { backgroundColor: plan.isBestValue ? DESIGN_COLORS.trusted : '#8B5CF6' },
            ]}
          >
            <Text style={styles.tagBadgeText}>
              {plan.isBestValue ? '⭐ Best Value' : '🔥 Popular'}
            </Text>
          </View>
        )}

        {/* Card Content */}
        <View style={styles.cardContent}>
          <Text style={styles.planBadgeEmoji}>{plan.badge}</Text>

          <View style={styles.priceSection}>
            <Text style={[styles.currencySymbol, { color: tierStyle.accent, fontSize: responsiveFontSize(2) }]}>₹</Text>
            <Text style={[styles.priceAmount, { fontSize: responsiveFontSize(4.5) }]}>{plan.amount}</Text>
          </View>

          <Text style={[styles.durationText, { fontSize: responsiveFontSize(1.2) }]}>
            / {plan.duration_months} Months
          </Text>

          <Text style={[styles.planName, { fontSize: responsiveFontSize(1.8), color: DESIGN_COLORS.text }]}>
            {plan.tier === 'base' ? 'Base Plan' : plan.tier === 'semi-premium' ? 'Verified' : 'Trusted'}
          </Text>

          <View style={[styles.taglineContainer, { backgroundColor: tierStyle.bg }]}>
            <Text style={[styles.planTagline, { fontSize: responsiveFontSize(1.2), color: tierStyle.accent }]}>
              {plan.tagline}
            </Text>
          </View>

          <View style={[
            styles.selectionIndicator,
            { backgroundColor: isSelected ? tierStyle.accent : DESIGN_COLORS.border }
          ]}>
            {isSelected && <Ionicons name="checkmark" size={16} color={DESIGN_COLORS.white} />}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

export default function Subscription({ }: any) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const colors = useColor();
  const safeAreaInsets = useSafeAreaInsets();
  const { shadow } = useShadow();
  const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
  const [checkBoxSelect, setCheckBoxSelect] = useState<boolean>(false);
  const navigation = useNavigation<NavigatorProp>();
  const { user, subscriptionModal, isDriver } = useSelector((state: any) => state?.user);

  const [errors, setErrors] = useState<{ checkBox?: string }>({});
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(false);

  // Animation values
  const scrollX = useSharedValue(0);
  const benefitsOpacity = useSharedValue(1);
  const flatListRef = useRef<Animated.FlatList<SubscriptionPlan>>(null);

  // Get selected plan - memoized
  const selectedPlan = useMemo(() => plans[selectedPlanIndex] || null, [plans, selectedPlanIndex]);

  // Fetch plans when modal opens
  useEffect(() => {
    if (subscriptionModal) {
      fetchPlans();
    }
  }, [subscriptionModal]);

  // Reset scroll position when plans change
  useEffect(() => {
    if (plans.length > 0) {
      const popularIndex = plans.findIndex(p => p.isPopular);
      const initialIndex = popularIndex >= 0 ? popularIndex : 0;
      setSelectedPlanIndex(initialIndex);

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: initialIndex * SNAP_INTERVAL,
          animated: true,
        });
      }, 100);
    }
  }, [plans]);

  const fetchPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const role = isDriver ? 'driver' : 'transporter';
      const response = await axiosInstance.get(END_POINTS.SUBSCRIPTION_PLANS(role));

      if (response?.data?.success && Array.isArray(response?.data?.data)) {
        const planConfig = isDriver ? DRIVER_PLAN_CONFIG : TRANSPORTER_PLAN_CONFIG;
        const fetchedPlans: SubscriptionPlan[] = response.data.data.map((plan: any) => {
          const config = planConfig[plan.amount] || {};
          return { ...plan, ...config };
        });
        fetchedPlans.sort((a, b) => a.amount - b.amount);
        setPlans(fetchedPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  // Smooth plan change with simple opacity animation
  const handlePlanChange = useCallback((index: number) => {
    if (index !== selectedPlanIndex && index >= 0 && index < plans.length) {
      // Simple fade transition - no heavy layout animations
      benefitsOpacity.value = withTiming(0, { duration: 80, easing: Easing.out(Easing.ease) }, () => {
        // Update index on JS thread after fade out
      });

      // Update state immediately for responsive feel
      setSelectedPlanIndex(index);

      // Fade back in
      setTimeout(() => {
        benefitsOpacity.value = withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) });
      }, 80);
    }
  }, [selectedPlanIndex, plans.length, benefitsOpacity]);

  const onMomentumScrollEnd = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SNAP_INTERVAL);
    if (newIndex >= 0 && newIndex < plans.length) {
      handlePlanChange(newIndex);
    }
  }, [handlePlanChange, plans.length]);

  const onScroll = useCallback((event: any) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  }, [scrollX]);

  const _generateOrderId = async () => {
    if (!validate()) return;
    if (!selectedPlan) {
      showToast(t('pleaseSelectAPlan'));
      return;
    }

    try {
      const amount = selectedPlan.amount * 100;
      const payload = { plan_id: selectedPlan.id };
      const response = await axiosInstance.post(END_POINTS.PAYMENT_SUBSCRIPTION_CREATE, payload);
      const subscriptionId = response?.data?.subscription_id;

      if (subscriptionId) {
        _onPressPayNow(subscriptionId, amount.toString());
      } else {
        showToast(t('oopsPaymentUnsuccessful'));
      }
    } catch (error) {
      console.error('Error creating order:', error);
      showToast(t('oopsPaymentUnsuccessful'));
    }
  };

  const _onpressCheckBox = () => {
    setCheckBoxSelect(!checkBoxSelect);
    setErrors({ checkBox: undefined });
  };

  const validate = (): boolean => {
    if (!checkBoxSelect) {
      setErrors({ checkBox: t(`youNeedToAcceptTruckMitr`) });
      return false;
    }
    return true;
  };

  const _onPressPayNow = async (subscriptionId: string, amount: string) => {
    const options = {
      description: 'TruckMitr Subscription',
      image: 'https://truckmitr.com/public/front/assets/images/logotrick.png',
      currency: 'INR',
      key: STATICS?.RAYZORPAY_KEY_ID,
      subscription_id: subscriptionId,
      name: 'TruckMitr',
      notes: { unique_id: user?.unique_id, role: user?.role, plan_id: selectedPlan?.id },
      prefill: { email: user?.email, contact: Number(user?.mobile), name: user?.name },
      theme: { color: colors.royalBlue },
    } as any;

    await RazorpayCheckout.open(options)
      .then(async data => {
        const eventData = {
          user_id: String(user?.id ?? ''),
          user_unique_id: user?.unique_id ?? '',
          user_name: user?.name ?? '',
          user_email: user?.email ?? '',
          user_role: user?.role ?? '',
          payment_order_id: data?.razorpay_order_id ?? (data as any)?.razorpay_subscription_id ?? '',
          payment_id: data?.razorpay_payment_id ?? '',
          payment_signature: data?.razorpay_signature ?? '',
          payment_amount: selectedPlan?.amount?.toString() ?? '',
          payment_currency: options.currency,
          payment_method: 'razorpay',
          status: 'success',
          plan_id: selectedPlan?.id ?? '',
        };
        await analytics().logEvent('payment_success', eventData);
        AppEventsLogger.logEvent('payment_success', eventData);
        dispatch(subscriptionModalAction(false));
        setTimeout(() => navigation.navigate(STACKS.PAYMENT_SUCCESS, { options, data }), 100);
      })
      .catch(async error => {
        showToast(t('oopsPaymentUnsuccessful'));
        dispatch(subscriptionModalAction(false));
        const errorData = {
          user_id: String(user?.id ?? ''),
          user_unique_id: user?.unique_id ?? '',
          payment_amount: selectedPlan?.amount?.toString() ?? '',
          error_code: error?.code,
          status: 'failed',
        };
        await analytics().logEvent('payment_failure', errorData);
        AppEventsLogger.logEvent('payment_failure', errorData);
      });
  };

  // Animated styles for benefits section - simple opacity
  const benefitsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: benefitsOpacity.value,
  }));

  const sidePadding = (SCREEN_WIDTH - CARD_WIDTH) / 2;

  const renderPlanCard = useCallback(({ item, index }: { item: SubscriptionPlan; index: number }) => (
    <PlanCard
      plan={item}
      index={index}
      scrollX={scrollX}
      isSelected={selectedPlanIndex === index}
      onSelect={() => {
        flatListRef.current?.scrollToOffset({
          offset: index * SNAP_INTERVAL,
          animated: true,
        });
        handlePlanChange(index);
      }}
    />
  ), [scrollX, selectedPlanIndex, handlePlanChange]);

  // Memoized benefits content to prevent re-renders
  const BenefitsContent = useMemo(() => {
    if (!selectedPlan) return null;

    const tierColor = getTierColor(selectedPlan.tier);

    return (
      <>
        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: tierColor }]}>
          <Text style={styles.categoryBadgeText}>
            {selectedPlan.badge} {selectedPlan.category}
          </Text>
        </View>

        {/* Benefits List */}
        <View style={styles.benefitsList}>
          {selectedPlan.benefits?.map((benefit, idx) => (
            <View key={`benefit-${idx}`} style={styles.benefitRow}>
              <View style={styles.checkIconContainer}>
                <Ionicons name="checkmark" size={14} color={DESIGN_COLORS.white} />
              </View>
              <Text style={[styles.benefitText, { fontSize: responsiveFontSize(1.45) }]}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>

        {/* Verification Section */}
        {(selectedPlan.verificationRequired?.length > 0 || selectedPlan.verificationOptional?.length > 0) && (
          <View style={styles.verificationContainer}>
            <View style={styles.verificationHeader}>
              <Ionicons name="shield-checkmark" size={18} color={DESIGN_COLORS.verified} />
              <Text style={[styles.verificationTitle, { fontSize: responsiveFontSize(1.3) }]}>
                Verification Requirements
              </Text>
            </View>
            {selectedPlan.verificationRequired?.length > 0 && (
              <View style={styles.verificationGroup}>
                <Text style={[styles.verificationLabel, { fontSize: responsiveFontSize(1.15) }]}>Required: </Text>
                <Text style={[styles.verificationItems, { fontSize: responsiveFontSize(1.15) }]}>
                  {selectedPlan.verificationRequired.join(', ')}
                </Text>
              </View>
            )}
            {selectedPlan.verificationOptional?.length > 0 && (
              <View style={styles.verificationGroup}>
                <Text style={[styles.verificationLabelOptional, { fontSize: responsiveFontSize(1.15) }]}>Optional: </Text>
                <Text style={[styles.verificationItems, { fontSize: responsiveFontSize(1.15) }]}>
                  {selectedPlan.verificationOptional.join(', ')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Trust Message */}
        <View style={styles.trustMessageContainer}>
          <Ionicons name="information-circle" size={18} color={DESIGN_COLORS.verified} />
          <Text style={[styles.trustMessage, { fontSize: responsiveFontSize(1.25) }]}>
            {selectedPlan.trustMessage}
          </Text>
        </View>

        {/* Edge Case Note */}
        {selectedPlan.edgeCaseNote && (
          <View style={styles.edgeCaseNote}>
            <Ionicons name="time-outline" size={16} color={DESIGN_COLORS.base} />
            <Text style={[styles.edgeCaseText, { fontSize: responsiveFontSize(1.1) }]}>
              {selectedPlan.edgeCaseNote}
            </Text>
          </View>
        )}
      </>
    );
  }, [selectedPlan, responsiveFontSize]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={subscriptionModal}
      statusBarTranslucent
      onRequestClose={() => dispatch(subscriptionModalAction(false))}
    >
      <StatusBar barStyle="dark-content" backgroundColor={DESIGN_COLORS.background} />

      <View style={[styles.fullScreenContainer, { paddingTop: safeAreaInsets.top }]}>
        {/* Close Button */}
        <TouchableOpacity
          onPress={() => dispatch(subscriptionModalAction(false))}
          activeOpacity={0.7}
          style={[styles.closeButton, shadow]}
        >
          <Ionicons name="close" size={24} color={DESIGN_COLORS.text} />
        </TouchableOpacity>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ===== 1️⃣ HEADER ===== */}
          <View style={styles.headerSection}>
            <Text style={[styles.headerTitle, { fontSize: responsiveFontSize(2.6) }]}>
              Driver Subscriptions
            </Text>
            <Text style={[styles.headerSubtitle, { fontSize: responsiveFontSize(1.45) }]}>
              Choose how far you want to grow
            </Text>
            <View style={styles.headerDivider} />
          </View>

          {/* ===== 2️⃣ BENEFITS SECTION (TOP) ===== */}
          <Animated.View style={[styles.benefitsSection, benefitsAnimatedStyle]}>
            {isLoadingPlans ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={DESIGN_COLORS.verified} />
                <Text style={styles.loadingText}>Loading plans...</Text>
              </View>
            ) : (
              BenefitsContent
            )}
          </Animated.View>

          {/* ===== 3️⃣ PLAN CARDS (BOTTOM) ===== */}
          {!isLoadingPlans && plans.length > 0 && (
            <View style={styles.planCardsSection}>
              <Text style={[styles.selectPlanTitle, { fontSize: responsiveFontSize(1.5) }]}>
                Scroll to Select Plan
              </Text>
              <Animated.FlatList
                ref={flatListRef}
                data={plans}
                renderItem={renderPlanCard}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: sidePadding, paddingVertical: 16 }}
                onMomentumScrollEnd={onMomentumScrollEnd}
                onScroll={onScroll}
                scrollEventThrottle={16}
                removeClippedSubviews={true}
                maxToRenderPerBatch={3}
                windowSize={3}
              />
            </View>
          )}
        </ScrollView>

        {/* ===== 4️⃣ CTA SECTION (STICKY) ===== */}
        <View style={[styles.ctaSection, { paddingBottom: safeAreaInsets.bottom + 14 }]}>
          <TouchableOpacity activeOpacity={0.7} onPress={_onpressCheckBox} style={styles.consentRow}>
            <MaterialCommunityIcons
              name={checkBoxSelect ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={24}
              color={checkBoxSelect ? DESIGN_COLORS.verified : DESIGN_COLORS.base}
            />
            <Text style={[styles.consentText, { fontSize: responsiveFontSize(1.25) }]}>
              {t(`iAgreeToTruckMitr`)}{' '}
              <Text
                onPress={() => {
                  dispatch(subscriptionModalAction(false));
                  navigation.navigate(STACKS?.SUBSCRIPTION_CONSENT);
                }}
                style={styles.consentLink}
              >
                {t(`Subscription consent`)}
              </Text>
            </Text>
          </TouchableOpacity>

          {errors.checkBox && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{errors.checkBox}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={_generateOrderId}
            activeOpacity={checkBoxSelect ? 0.8 : 1}
            disabled={!checkBoxSelect}
            style={[
              styles.ctaButton,
              { backgroundColor: checkBoxSelect ? getTierColor(selectedPlan?.tier, colors.royalBlue) : '#CBD5E1' },
            ]}
          >
            <Text style={[styles.ctaButtonText, { fontSize: responsiveFontSize(1.7) }]}>
              {selectedPlan
                ? `Continue with ${selectedPlan.category} – ₹${selectedPlan.amount}`
                : t('payNow')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: DESIGN_COLORS.background,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    height: 44,
    width: 44,
    backgroundColor: DESIGN_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: 20,
  },

  // Header
  headerSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontWeight: '700',
    color: DESIGN_COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: DESIGN_COLORS.textSecondary,
    fontWeight: '400',
    marginTop: 6,
    textAlign: 'center',
  },
  headerDivider: {
    width: 60,
    height: 4,
    backgroundColor: DESIGN_COLORS.verified,
    borderRadius: 2,
    marginTop: 14,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    color: DESIGN_COLORS.textSecondary,
    fontSize: 14,
  },

  // Benefits Section (TOP)
  benefitsSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    minHeight: 200,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginBottom: 16,
  },
  categoryBadgeText: {
    color: DESIGN_COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  benefitsList: {
    marginBottom: 14,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  checkIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: DESIGN_COLORS.verified,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  benefitText: {
    flex: 1,
    fontWeight: '500',
    lineHeight: 22,
    color: DESIGN_COLORS.text,
  },
  verificationContainer: {
    backgroundColor: DESIGN_COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verificationTitle: {
    fontWeight: '600',
    color: DESIGN_COLORS.text,
    marginLeft: 8,
  },
  verificationGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  verificationLabel: {
    fontWeight: '600',
    color: DESIGN_COLORS.verified,
  },
  verificationLabelOptional: {
    fontWeight: '500',
    color: DESIGN_COLORS.textSecondary,
  },
  verificationItems: {
    color: DESIGN_COLORS.text,
    fontWeight: '400',
    flex: 1,
  },
  trustMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  trustMessage: {
    flex: 1,
    marginLeft: 10,
    color: DESIGN_COLORS.verified,
    fontWeight: '500',
    lineHeight: 20,
  },
  edgeCaseNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
  },
  edgeCaseText: {
    flex: 1,
    marginLeft: 10,
    color: DESIGN_COLORS.textSecondary,
    fontWeight: '400',
  },

  // Plan Cards Section (BOTTOM)
  planCardsSection: {
    marginTop: 16,
  },
  selectPlanTitle: {
    textAlign: 'center',
    fontWeight: '600',
    color: DESIGN_COLORS.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  planCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  cardTopBar: {
    height: 5,
    width: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 5,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 10,
  },
  tagBadgeText: {
    color: DESIGN_COLORS.white,
    fontSize: 9,
    fontWeight: '700',
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  planBadgeEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  currencySymbol: {
    fontWeight: '600',
    marginTop: 6,
    marginRight: 2,
  },
  priceAmount: {
    fontWeight: '800',
    color: DESIGN_COLORS.text,
  },
  durationText: {
    color: DESIGN_COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
  },
  planName: {
    fontWeight: '700',
    marginBottom: 6,
  },
  taglineContainer: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 10,
  },
  planTagline: {
    fontWeight: '600',
  },
  selectionIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // CTA Section
  ctaSection: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: DESIGN_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: DESIGN_COLORS.border,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  consentText: {
    flex: 1,
    marginLeft: 12,
    color: DESIGN_COLORS.textSecondary,
  },
  consentLink: {
    color: DESIGN_COLORS.verified,
    fontWeight: '600',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#EF4444',
  },
  ctaButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaButtonText: {
    color: DESIGN_COLORS.white,
    fontWeight: '700',
  },
});
