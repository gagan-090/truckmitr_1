import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hitSlop } from '@truckmitr/src/app/functions';

const TruckmitrDhaba = () => {
    const navigation = useNavigation<any>();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();
    const { t } = useTranslation();
    const safeAreaInsets = useSafeAreaInsets();

    const _goBack = () => navigation.goBack();


    // Benefit Item Component
    const BenefitItem = ({ text }: { text: string }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveHeight(1.4) }}>
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="checkmark" size={16} color="#16A34A" />
            </View>
            <Text style={{ fontSize: responsiveFontSize(2.0), color: '#334155' }}>{text}</Text>
        </View>
    );

    // Bullet Item Component
    const BulletItem = ({ text }: { text: string }) => (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: responsiveHeight(1.2) }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#EA580C', marginRight: 12, marginTop: 8 }} />
            <Text style={{ fontSize: responsiveFontSize(2.0), color: '#334155', flex: 1 }}>{text}</Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 12,
                marginTop: safeAreaInsets.top,
                paddingHorizontal: responsiveFontSize(2),
                backgroundColor: colors.white,
                borderBottomWidth: 1,
                borderBottomColor: colors.blackOpacity(0.05)
            }}>
                <TouchableOpacity
                    onPress={_goBack}
                    hitSlop={hitSlop(10)}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.blackOpacity(0.05)
                    }}
                >
                    <Ionicons name="chevron-back" size={22} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{
                    fontSize: responsiveFontSize(2.2),
                    color: colors.black,
                    fontWeight: '700'
                }}>
                    {t('truckMitrDhabaTitle')}
                </Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: responsiveWidth(4), paddingBottom: responsiveHeight(6) }} showsVerticalScrollIndicator={false}>

                {/* 🍛 1️⃣ Hero Card */}
                <View style={{ backgroundColor: '#FFF7ED', borderRadius: 16, padding: responsiveWidth(5), marginBottom: responsiveHeight(2), alignItems: 'center', ...shadow, shadowColor: 'rgba(0,0,0,0.08)' }}>
                    {/* Coming Soon Badge */}
                    <View style={{ backgroundColor: '#EA580C', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginBottom: 14 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: colors.white }}>🍛 {t('comingSoon')}</Text>
                    </View>

                    <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#EA580C', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                        <Text style={{ fontSize: 32 }}>🍛</Text>
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(3.0), fontWeight: '700', color: '#001F3F', textAlign: 'center', marginBottom: 8 }}>
                        {t('truckMitrDhabaTitle')}
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: '600', color: '#EA580C', textAlign: 'center', marginBottom: 10 }}>
                        {t('dhabaTagline')}
                    </Text>

                    {/* Sub-line */}
                    <View style={{ marginTop: 10, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#FED7AA', width: '100%', alignItems: 'center' }}>
                        <Text style={{ fontSize: responsiveFontSize(1.9), color: '#78350F', textAlign: 'center', lineHeight: responsiveFontSize(2.8) }}>
                            {t('dhabaHeroDesc')}
                        </Text>
                    </View>
                </View>

                {/* 💡 2️⃣ What is TruckMitr Dhaba */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: '#001F3F', marginBottom: 10 }}>{t('whatIsDhabaTitle')}</Text>
                    <Text style={{ fontSize: responsiveFontSize(2.0), color: '#64748B', lineHeight: responsiveFontSize(2.8) }}>
                        {t('whatIsDhabaDesc')}
                    </Text>
                    <View style={{ backgroundColor: '#FFF7ED', padding: 12, borderRadius: 8, marginTop: 14 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.9), color: '#C2410C', fontWeight: '600', textAlign: 'center' }}>
                            🍽️ {t('eatWellSpendSmart')}
                        </Text>
                    </View>
                </View>

                {/* 🍽️ 3️⃣ What TruckMitr Dhaba Offers */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)', borderLeftWidth: 4, borderLeftColor: '#EA580C' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                        <Text style={{ fontSize: 28, marginRight: 12 }}>🍽️</Text>
                        <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: '#001F3F' }}>{t('whatDhabaOffers')}</Text>
                    </View>
                    <BenefitItem text={t('nearbyDhabhas')} />
                    <BenefitItem text={t('trustedFoodSpots')} />
                    <BenefitItem text={t('cleanTastyAffordable')} />
                    <BenefitItem text={t('specialVouchers')} />
                    <BenefitItem text={t('betterDeals')} />

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 10 }}>
                        <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ fontSize: responsiveFontSize(1.7), color: '#16A34A', fontWeight: '600' }}>✔ {t('easyToScan')}</Text>
                        </View>
                        <View style={{ backgroundColor: '#FFF7ED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ fontSize: responsiveFontSize(1.7), color: '#C2410C', fontWeight: '600' }}>✔ {t('veryPractical')}</Text>
                        </View>
                    </View>
                </View>

                {/* ❤️ 4️⃣ Why Drivers Will Love It */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)', borderLeftWidth: 4, borderLeftColor: '#E11D48' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                        <Text style={{ fontSize: 28, marginRight: 12 }}>❤️</Text>
                        <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: '#001F3F' }}>{t('whyDriversLoveIt')}</Text>
                    </View>
                    <BulletItem text={t('noMoreSearching')} />
                    <BulletItem text={t('saveMoneyVouchers')} />
                    <BulletItem text={t('reliableFoodOptions')} />
                    <BulletItem text={t('betterComfortEnergy')} />

                    <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                        <Text style={{ fontSize: responsiveFontSize(2.0), color: '#001F3F', fontWeight: '700', textAlign: 'center' }}>
                            {t('satisfiedDriver')}
                        </Text>
                    </View>
                </View>

                {/* 🚛 5️⃣ Built for Life on the Road */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)', borderLeftWidth: 4, borderLeftColor: '#2563EB' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                        <Text style={{ fontSize: 28, marginRight: 12 }}>🚛</Text>
                        <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: '#001F3F' }}>{t('builtForRoad')}</Text>
                    </View>
                    <BenefitItem text={t('driverRecommended')} />
                    <BenefitItem text={t('easyToFind')} />
                    <BenefitItem text={t('dailyDriverNeeds')} />
                    <BenefitItem text={t('moreComfortJourney')} />
                </View>

                {/* ⏳ 6️⃣ Coming Soon for Drivers */}
                <View style={{ backgroundColor: '#FEF3C7', borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Text style={{ fontSize: 28, marginRight: 10 }}>⏳</Text>
                        <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: '#92400E' }}>{t('comingSoonDrivers')}</Text>
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(2.0), color: '#78350F', textAlign: 'center', lineHeight: responsiveFontSize(2.8) }}>
                        {t('dhabaComingSoonDesc')}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}>
                        <Ionicons name="notifications" size={18} color="#D97706" style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: responsiveFontSize(1.9), color: '#92400E', fontWeight: '600' }}>{t('launchUpdates')}</Text>
                    </View>
                </View>

                {/* 📢 7️⃣ Footer Brand Message */}
                <View style={{ backgroundColor: '#7C2D12', borderRadius: 12, padding: responsiveWidth(5), marginBottom: responsiveHeight(2), alignItems: 'center' }}>
                    <Text style={{ fontSize: 32, marginBottom: 10 }}>📢</Text>
                    <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: colors.white, marginBottom: 6 }}>{t('truckMitrDhabaTitle')}</Text>
                    <Text style={{ fontSize: responsiveFontSize(2.2), color: '#FDBA74', fontStyle: 'italic', marginBottom: 10 }}>{t('dhabaFooterTagline')}</Text>
                    <View style={{ borderTopWidth: 1, borderTopColor: '#9A3412', paddingTop: 12, width: '100%', alignItems: 'center' }}>
                        <Text style={{ fontSize: responsiveFontSize(1.8), color: '#FED7AA' }}>{t('launchingSoon')}</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
};

export default TruckmitrDhaba;
