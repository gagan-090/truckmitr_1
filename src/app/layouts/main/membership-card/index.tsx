import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useColor, useResponsiveScale } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Space } from '@truckmitr/src/app/components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { hitSlop } from '@truckmitr/src/app/functions';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { ImageBackground } from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { BASE_URL } from '@truckmitr/src/utils/config';
import { useTranslation } from 'react-i18next';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

// Asset Images
const LOGO_IMAGE = require('@truckmitr/src/assets/membership-card/logotrick.png');
const PROFILE_PLACEHOLDER = require('@truckmitr/src/assets/membership-card/man.png');

// Background Images for each tier
const BACKGROUND_VERIFIED = require('@truckmitr/src/assets/membership-card/membershipbg.png');       // Silver/Gray for Verified
const BACKGROUND_TRUSTED = require('@truckmitr/src/assets/membership-card/membershipcardbg2.png');   // Gold for Trusted
const BACKGROUND_JOB_READY = require('@truckmitr/src/assets/membership-card/membershipcard3.png');   // Blue for Job Ready

// Card configurations for each tier
type TierType = 'JOB READY' | 'VERIFIED' | 'TRUSTED' | 'Standard' | 'LEGACY' | 'TRANSPORTER PRO';

interface TierConfig {
    background: any;
    borderColors: string[];
    chromeGradient: { offset: string; color: string }[];
    categoryText: string;
}

const TIER_CONFIGS: Record<TierType, TierConfig> = {
    'JOB READY': {
        background: BACKGROUND_JOB_READY,
        borderColors: ['#000b29', '#002661', '#4A90E2', '#002661', '#000b29'],
        chromeGradient: [
            { offset: '0', color: '#E0E3E7' },
            { offset: '0.25', color: '#BFC5CC' },
            { offset: '0.5', color: '#9AA0A6' },
            { offset: '0.75', color: '#BFC5CC' },
            { offset: '1', color: '#E0E3E7' },
        ],
        categoryText: 'JOB READY DRIVER',
    },
    'VERIFIED': {
        background: BACKGROUND_VERIFIED,
        borderColors: ['#404040', '#E0E3E7', '#FFFFFF', '#E0E3E7', '#404040'],
        chromeGradient: [
            { offset: '0', color: '#E0E3E7' },
            { offset: '0.25', color: '#BFC5CC' },
            { offset: '0.5', color: '#9AA0A6' },
            { offset: '0.75', color: '#BFC5CC' },
            { offset: '1', color: '#E0E3E7' },
        ],
        categoryText: 'VERIFIED DRIVER',
    },
    'TRUSTED': {
        background: BACKGROUND_TRUSTED,
        borderColors: ['#A67C00', '#C9A23F', '#FFF6C8', '#C9A23F', '#A67C00'],
        chromeGradient: [
            { offset: '0', color: '#FFF6C8' },
            { offset: '0.25', color: '#C9A23F' },
            { offset: '0.5', color: '#A67C00' },
            { offset: '0.75', color: '#C9A23F' },
            { offset: '1', color: '#FFF6C8' },
        ],
        categoryText: 'TRUSTED DRIVER',
    },
    'Standard': {
        background: BACKGROUND_JOB_READY,
        borderColors: ['#000b29', '#002661', '#4A90E2', '#002661', '#000b29'],
        chromeGradient: [
            { offset: '0', color: '#E0E3E7' },
            { offset: '0.25', color: '#BFC5CC' },
            { offset: '0.5', color: '#9AA0A6' },
            { offset: '0.75', color: '#BFC5CC' },
            { offset: '1', color: '#E0E3E7' },
        ],
        categoryText: 'STANDARD MEMBER',
    },
    'LEGACY': {
        background: BACKGROUND_VERIFIED,
        borderColors: ['#8B4513', '#CD853F', '#DEB887', '#CD853F', '#8B4513'],
        chromeGradient: [
            { offset: '0', color: '#DEB887' },
            { offset: '0.25', color: '#CD853F' },
            { offset: '0.5', color: '#8B4513' },
            { offset: '0.75', color: '#CD853F' },
            { offset: '1', color: '#DEB887' },
        ],
        categoryText: 'LEGACY MEMBER', // Will be overridden dynamically
    },
    'TRANSPORTER PRO': {
        background: BACKGROUND_TRUSTED,
        borderColors: ['#A67C00', '#C9A23F', '#FFF6C8', '#C9A23F', '#A67C00'],
        chromeGradient: [
            { offset: '0', color: '#FFF6C8' },
            { offset: '0.25', color: '#C9A23F' },
            { offset: '0.5', color: '#A67C00' },
            { offset: '0.75', color: '#C9A23F' },
            { offset: '1', color: '#FFF6C8' },
        ],
        categoryText: 'TRANSPORTER PRO',
    },
};

// Helper function to get tier from payment_type, now accepts amount and role for legacy detection
const getTierFromPaymentType = (paymentType: string, amount?: number, role?: string): TierType => {
    // Legacy driver detection: Rs 49 or Rs 100 payment for DRIVERS
    if (role === 'driver' && (amount === 49 || amount === 49.00 || amount === 100 || amount === 100.00)) {
        return 'LEGACY';
    }

    // Transporter Pro detection: Rs 499 payment for transporters
    if (role === 'transporter' && (amount === 499 || amount === 499.00)) {
        return 'TRANSPORTER PRO';
    }

    // Legacy transporter detection: Rs 99 payment for TRANSPORTERS
    if (role === 'transporter' && (amount === 99 || amount === 99.00)) {
        return 'LEGACY';
    }

    const normalizedType = paymentType?.toUpperCase().replace(/\\s+/g, ' ').trim();

    if (normalizedType === 'TRUSTED') return 'TRUSTED';
    if (normalizedType === 'VERIFIED') return 'VERIFIED';
    if (normalizedType === 'JOB READY' || normalizedType === 'JOBREADY') return 'JOB READY';
    if (normalizedType === 'STANDARD') return 'Standard';
    if (normalizedType === 'LEGACY') return 'LEGACY';

    // Default to JOB READY for any other type
    return 'JOB READY';
};

export default function MembershipCard() {
    const { t } = useTranslation();
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();

    // Get user and subscription data from Redux
    const { user, subscriptionDetails } = useSelector((state: any) => state?.user) || {};

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Small delay to ensure data is loaded
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const _goback = () => {
        navigation.goBack();
    };

    // Extract data from Redux
    const userName = user?.name?.toUpperCase() || 'MEMBER NAME';
    const uniqueId = user?.unique_id || 'TM0000000000000';
    const userLocation = user?.city?.toUpperCase() || user?.state?.toUpperCase() || 'INDIA';
    const licenseType = user?.Type_of_License || 'HMV';
    const profileImage = user?.images ? { uri: `${BASE_URL}public/${user?.images}` } : PROFILE_PLACEHOLDER;

    // Subscription details
    const paymentType = subscriptionDetails?.payment_type || 'JOB READY';
    const amount = parseFloat(subscriptionDetails?.amount) || 0;
    const userRole = user?.role || 'driver';
    const tier = getTierFromPaymentType(paymentType, amount, userRole);

    // Get tier config and dynamically set categoryText for LEGACY based on role
    let tierConfig = { ...TIER_CONFIGS[tier] };
    if (tier === 'LEGACY') {
        tierConfig.categoryText = userRole === 'transporter' ? 'LEGACY TRANSPORTER' : 'LEGACY DRIVER';
    }

    const startDate = subscriptionDetails?.start_at
        ? moment.unix(subscriptionDetails.start_at).format('DD/MM/YY')
        : moment().format('DD/MM/YY');
    const endDate = subscriptionDetails?.end_at
        ? moment.unix(subscriptionDetails.end_at).format('DD/MM/YY')
        : moment().add(1, 'year').format('DD/MM/YY');

    // Credit card aspect ratio: 1.586:1 (landscape)
    const cardWidth = responsiveWidth(92);
    const cardHeight = cardWidth / 1.586;

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.royalBlue} />
            </View>
        );
    }

    // Check if user has an active subscription
    const hasActiveSubscription = subscriptionDetails?.hasActiveSubscription ||
        (subscriptionDetails?.subscription_id && subscriptionDetails?.payment_status === 'captured');

    if (!hasActiveSubscription) {
        return (
            <View style={[styles.container, { backgroundColor: colors.white }]}>
                <Space height={safeAreaInsets.top} />
                <View style={[styles.header, { padding: responsiveWidth(3) }]}>
                    <TouchableOpacity
                        hitSlop={hitSlop(10)}
                        onPress={_goback}
                        style={[styles.backButton, {
                            height: responsiveFontSize(4),
                            width: responsiveFontSize(4),
                            backgroundColor: colors.white
                        }]}
                    >
                        <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, {
                        width: responsiveWidth(100),
                        fontSize: responsiveFontSize(2.2),
                        color: colors.royalBlue
                    }]}>
                        {t('membershipCard') || 'Membership Card'}
                    </Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Ionicons name="card-outline" size={80} color={colors.blackOpacity(0.2)} />
                    <Space height={20} />
                    <Text style={{ fontSize: responsiveFontSize(2), color: colors.blackOpacity(0.6), textAlign: 'center' }}>
                        {t('noActiveSubscription') || 'No active subscription found'}
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.6), color: colors.blackOpacity(0.4), textAlign: 'center', marginTop: 8 }}>
                        {t('subscribeToGetCard') || 'Subscribe to get your membership card'}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.white }]}
            contentContainerStyle={{ paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
        >
            <Space height={safeAreaInsets.top} />

            {/* Header */}
            <View style={[styles.header, { padding: responsiveWidth(3) }]}>
                <TouchableOpacity
                    hitSlop={hitSlop(10)}
                    onPress={_goback}
                    style={[styles.backButton, {
                        height: responsiveFontSize(4),
                        width: responsiveFontSize(4),
                        backgroundColor: colors.white
                    }]}
                >
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, {
                    width: responsiveWidth(100),
                    fontSize: responsiveFontSize(2.2),
                    color: colors.royalBlue
                }]}>
                    {t('membershipCard') || 'Membership Card'}
                </Text>
            </View>

            <Space height={responsiveHeight(2)} />

            {/* Tier Badge */}
            <View style={{ alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                <View style={[styles.tierBadge, { backgroundColor: tierConfig.borderColors[2] + '20' }]}>
                    <Text style={[styles.tierBadgeText, { color: tierConfig.borderColors[1] }]}>
                        {tier} MEMBER
                    </Text>
                </View>
            </View>

            {/* Dynamic Membership Card */}
            <View style={styles.cardContainer}>
                <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
                    {/* Outer Metallic Border */}
                    <LinearGradient
                        colors={tierConfig.borderColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardMetallicBorder}
                    >
                        {/* Inner White Border */}
                        <View style={styles.innerBorder}>
                            {/* Background Image */}
                            <ImageBackground
                                source={tierConfig.background}
                                style={styles.gradientBackground}
                                resizeMode="cover"
                            >
                                <View style={styles.darkOverlay} />

                                {/* Main Content - 65/35 Split */}
                                <View style={styles.contentRow}>
                                    {/* Left Section - 65% */}
                                    <View style={styles.leftSection}>
                                        {/* Logo */}
                                        <View style={styles.logoArea}>
                                            <Image
                                                source={LOGO_IMAGE}
                                                style={styles.logoImage}
                                                resizeMode="contain"
                                            />
                                        </View>

                                        {/* Category & ID Code Section */}
                                        <View style={styles.idCodeSection}>
                                            {/* Category Label */}
                                            <View style={{ marginBottom: 4, marginLeft: 2 }}>
                                                <View style={{ height: 20, width: 200 }}>
                                                    <Svg height="100%" width="100%" viewBox="0 0 200 20">
                                                        <Defs>
                                                            <SvgLinearGradient id="chromeGradientCat" x1="0" y1="0" x2="0" y2="1">
                                                                {tierConfig.chromeGradient.map((stop, index) => (
                                                                    <Stop key={index} offset={stop.offset} stopColor={stop.color} stopOpacity="1" />
                                                                ))}
                                                            </SvgLinearGradient>
                                                        </Defs>
                                                        {/* Shadow */}
                                                        <SvgText fill="#000000" fillOpacity="0.8" fontSize="14" fontWeight="900" fontFamily="sans-serif" letterSpacing="1" x="1.5" y="15.5" textAnchor="start">
                                                            {tierConfig.categoryText}
                                                        </SvgText>
                                                        {/* Thickener */}
                                                        <SvgText fill="#383838ff" stroke="#383838ff" strokeWidth="1.2" fontSize="14" fontWeight="900" fontFamily="sans-serif" letterSpacing="1" x="0" y="14" textAnchor="start">
                                                            {tierConfig.categoryText}
                                                        </SvgText>
                                                        {/* Chrome */}
                                                        <SvgText fill="url(#chromeGradientCat)" stroke="#FFFFFF" strokeWidth="0.6" fontSize="14" fontWeight="900" fontFamily="sans-serif" letterSpacing="1" x="0" y="14" textAnchor="start">
                                                            {tierConfig.categoryText}
                                                        </SvgText>
                                                    </Svg>
                                                </View>
                                            </View>

                                            {/* TM ID */}
                                            <View style={{ height: 40, width: '100%', alignItems: 'flex-start', justifyContent: 'center', marginBottom: -10 }}>
                                                <Svg height="100%" width="100%" viewBox="0 0 400 40">
                                                    <Defs>
                                                        <SvgLinearGradient id="chromeGradientId" x1="0" y1="0" x2="0" y2="1">
                                                            {tierConfig.chromeGradient.map((stop, index) => (
                                                                <Stop key={index} offset={stop.offset} stopColor={stop.color} stopOpacity="1" />
                                                            ))}
                                                        </SvgLinearGradient>
                                                    </Defs>
                                                    {/* Shadow */}
                                                    <SvgText fill="#000000" fillOpacity="0.8" fontSize="28" fontWeight="900" letterSpacing="1.5" x="2" y="28" textAnchor="start">
                                                        {uniqueId}
                                                    </SvgText>
                                                    {/* Thickener */}
                                                    <SvgText fill="#383838ff" stroke="#383838ff" strokeWidth="1.5" fontSize="28" fontWeight="900" letterSpacing="1.5" x="0" y="26" textAnchor="start">
                                                        {uniqueId}
                                                    </SvgText>
                                                    {/* Chrome */}
                                                    <SvgText fill="url(#chromeGradientId)" stroke="#FFFFFF" strokeWidth="0.8" fontSize="28" fontWeight="900" letterSpacing="1.5" x="0" y="26" textAnchor="start">
                                                        {uniqueId}
                                                    </SvgText>
                                                </Svg>
                                            </View>
                                        </View>

                                        {/* Member Name and Location */}
                                        <View style={styles.memberInfo}>
                                            {/* Name */}
                                            <View style={{ height: 30, width: 320, marginBottom: -6, marginLeft: -2 }}>
                                                <Svg height="100%" width="100%" viewBox="0 0 320 30">
                                                    <Defs>
                                                        <SvgLinearGradient id="chromeGradientName" x1="0" y1="0" x2="0" y2="1">
                                                            {tierConfig.chromeGradient.map((stop, index) => (
                                                                <Stop key={index} offset={stop.offset} stopColor={stop.color} stopOpacity="1" />
                                                            ))}
                                                        </SvgLinearGradient>
                                                    </Defs>
                                                    {/* Shadow */}
                                                    <SvgText fill="#000000" fillOpacity="0.8" fontSize="13" fontWeight="900" letterSpacing="1.2" x="2" y="22" textAnchor="start">
                                                        {userName}
                                                    </SvgText>
                                                    {/* Thickener */}
                                                    <SvgText fill="#383838ff" stroke="#383838ff" strokeWidth="1.0" fontSize="13" fontWeight="900" letterSpacing="1.2" x="0" y="20" textAnchor="start">
                                                        {userName}
                                                    </SvgText>
                                                    {/* Chrome */}
                                                    <SvgText fill="url(#chromeGradientName)" stroke="#FFFFFF" strokeWidth="0.6" fontSize="13" fontWeight="900" letterSpacing="1.2" x="0" y="20" textAnchor="start">
                                                        {userName}
                                                    </SvgText>
                                                </Svg>
                                            </View>
                                            <Text style={styles.memberLocation}>{userLocation}</Text>
                                        </View>
                                    </View>

                                    {/* Right Section - Photo */}
                                    <View style={styles.rightSection}>
                                        <LinearGradient
                                            colors={tierConfig.borderColors}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.photoMetallicBorder}
                                        >
                                            <View style={styles.photoInnerFrame}>
                                                <Image
                                                    source={profileImage}
                                                    style={styles.photoImage}
                                                    resizeMode="cover"
                                                />
                                            </View>
                                        </LinearGradient>
                                    </View>

                                    {/* Validity Dates & License - Bottom Right */}
                                    <View style={styles.validityAbsContainer}>
                                        <View style={styles.datesRow}>
                                            <View style={styles.validityBlock}>
                                                <Text style={styles.validityLabelAbs}>VALID FROM</Text>
                                                <View style={{ height: 20, width: 100, marginTop: -2 }}>
                                                    <Svg height="100%" width="100%" viewBox="0 0 100 20">
                                                        <Defs>
                                                            <SvgLinearGradient id="chromeGradientDate1" x1="0" y1="0" x2="0" y2="1">
                                                                {tierConfig.chromeGradient.map((stop, index) => (
                                                                    <Stop key={index} offset={stop.offset} stopColor={stop.color} stopOpacity="1" />
                                                                ))}
                                                            </SvgLinearGradient>
                                                        </Defs>
                                                        <SvgText fill="#000000" fillOpacity="0.8" fontSize="12" fontWeight="900" fontFamily="sans-serif" letterSpacing="1" x="50" y="14" textAnchor="middle">
                                                            {startDate}
                                                        </SvgText>
                                                        <SvgText fill="#383838ff" stroke="#383838ff" strokeWidth="0.8" fontSize="12" fontWeight="900" fontFamily="sans-serif" letterSpacing="1" x="50" y="13" textAnchor="middle">
                                                            {startDate}
                                                        </SvgText>
                                                        <SvgText fill="url(#chromeGradientDate1)" stroke="#FFFFFF" strokeWidth="0.4" fontSize="12" fontWeight="900" fontFamily="sans-serif" letterSpacing="1" x="50" y="13" textAnchor="middle">
                                                            {startDate}
                                                        </SvgText>
                                                    </Svg>
                                                </View>
                                            </View>
                                            <View style={styles.validityBlock}>
                                                <Text style={styles.validityLabelAbs}>VALID THRU</Text>
                                                <View style={{ height: 20, width: 100, marginTop: -2 }}>
                                                    <Svg height="100%" width="100%" viewBox="0 0 100 20">
                                                        <Defs>
                                                            <SvgLinearGradient id="chromeGradientDate2" x1="0" y1="0" x2="0" y2="1">
                                                                {tierConfig.chromeGradient.map((stop, index) => (
                                                                    <Stop key={index} offset={stop.offset} stopColor={stop.color} stopOpacity="1" />
                                                                ))}
                                                            </SvgLinearGradient>
                                                        </Defs>
                                                        <SvgText fill="#000000" fillOpacity="0.8" fontSize="12" fontWeight="900" fontFamily="sans-serif" letterSpacing="1" x="50" y="14" textAnchor="middle">
                                                            {endDate}
                                                        </SvgText>
                                                        <SvgText fill="#383838ff" stroke="#383838ff" strokeWidth="0.8" fontSize="12" fontWeight="900" fontFamily="sans-serif" letterSpacing="1" x="50" y="13" textAnchor="middle">
                                                            {endDate}
                                                        </SvgText>
                                                        <SvgText fill="url(#chromeGradientDate2)" stroke="#FFFFFF" strokeWidth="0.4" fontSize="12" fontWeight="900" fontFamily="sans-serif" letterSpacing="1" x="50" y="13" textAnchor="middle">
                                                            {endDate}
                                                        </SvgText>
                                                    </Svg>
                                                </View>
                                            </View>
                                        </View>

                                        {/* License Type */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, marginRight: 35 }}>
                                            <Text style={[styles.validityLabelAbs, { marginBottom: 0, marginRight: 4 }]}>LICENSE TYPE:</Text>
                                            <Text style={[styles.validityLabelAbs, { marginBottom: 0, color: '#FFFFFF', fontWeight: '900' }]}>{licenseType}</Text>
                                        </View>
                                    </View>
                                </View>
                            </ImageBackground>
                        </View>
                    </LinearGradient>
                </View>
            </View>

            <Space height={responsiveHeight(3)} />

            {/* Card Info Section */}
            <View style={{ paddingHorizontal: responsiveWidth(5) }}>
                <Text style={[styles.infoTitle, { color: colors.black }]}>
                    {t('membershipDetails') || 'Membership Details'}
                </Text>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('membershipType') || 'Membership Type'}</Text>
                    <Text style={[styles.infoValue, { color: tierConfig.borderColors[1] }]}>{tier}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('memberId') || 'Member ID'}</Text>
                    <Text style={styles.infoValue}>{uniqueId}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('validFrom') || 'Valid From'}</Text>
                    <Text style={styles.infoValue}>{startDate}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('validUntil') || 'Valid Until'}</Text>
                    <Text style={styles.infoValue}>{endDate}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('status') || 'Status'}</Text>
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>{t('active') || 'ACTIVE'}</Text>
                    </View>
                </View>
            </View>

            <Space height={responsiveHeight(3)} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
    },
    backButton: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100,
        zIndex: 10,
    },
    headerTitle: {
        position: 'absolute',
        textAlign: 'center',
        fontWeight: '600',
    },
    tierBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    tierBadgeText: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
    cardContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        borderRadius: 28,
        overflow: 'visible',
    },
    cardMetallicBorder: {
        flex: 1,
        borderRadius: 28,
        padding: 3,
        shadowColor: '#000000ff',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15,
    },
    innerBorder: {
        flex: 1,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
    },
    gradientBackground: {
        flex: 1,
        position: 'relative',
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.17)',
        borderRadius: 25,
    },
    contentRow: {
        flex: 1,
        flexDirection: 'row',
        padding: 18,
    },
    leftSection: {
        flex: 65,
        paddingRight: 12,
        justifyContent: 'space-between',
    },
    rightSection: {
        position: 'absolute',
        top: 4,
        right: 4,
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        paddingTop: -4,
    },
    logoArea: {
        position: 'absolute',
        top: -10,
        left: -25,
        marginBottom: -20,
        alignItems: 'flex-start',
    },
    logoImage: {
        width: 160,
        height: 52,
        marginBottom: 2,
    },
    idCodeSection: {
        position: 'absolute',
        top: 65,
        left: 5,
        width: 380,
        alignItems: 'flex-start',
        marginVertical: 0,
        zIndex: 10,
    },
    memberInfo: {
        position: 'absolute',
        bottom: -20,
        left: -5,
        top: 140,
        right: -90,
        marginTop: 0,
    },
    memberLocation: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1.2,
        marginTop: -2,
        textShadowColor: 'rgba(0,0,0,1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        elevation: 3,
    },
    photoMetallicBorder: {
        padding: 3,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 5,
    },
    photoInnerFrame: {
        backgroundColor: '#FFFFFF',
        padding: 2,
        borderRadius: 100,
    },
    photoImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    validityAbsContainer: {
        position: 'absolute',
        bottom: 15,
        right: -15,
        alignItems: 'flex-end',
        gap: 16,
        zIndex: 20,
    },
    datesRow: {
        flexDirection: 'row',
        gap: 4,
    },
    validityBlock: {
        alignItems: 'center',
        marginBottom: 0,
    },
    validityLabelAbs: {
        color: '#D0D0D0',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: -2,
        lineHeight: 10,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    // Info Section Styles
    infoTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.06)',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    activeBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
