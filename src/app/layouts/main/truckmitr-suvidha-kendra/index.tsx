import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TruckmitrSuvidhaKendra = () => {
    const navigation = useNavigation<any>();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();
    const { t } = useTranslation();
    const [refreshKey, setRefreshKey] = useState(0);

    const _goBack = () => navigation.goBack();
    const _refreshPage = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Benefit Item Component
    const BenefitItem = ({ text }: { text: string }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveHeight(1.2) }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name="checkmark" size={16} color="#16A34A" />
            </View>
            <Text style={{ fontSize: responsiveFontSize(2.0), color: '#334155' }}>{text}</Text>
        </View>
    );

    // Bullet Item Component
    const BulletItem = ({ text }: { text: string }) => (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: responsiveHeight(1) }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#7C3AED', marginRight: 10, marginTop: 8 }} />
            <Text style={{ fontSize: responsiveFontSize(2.0), color: '#334155', flex: 1 }}>{text}</Text>
        </View>
    );

    // Facility Item Component with Emoji
    const FacilityItem = ({ emoji, text }: { emoji: string; text: string }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveHeight(1.4) }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ fontSize: 20 }}>{emoji}</Text>
            </View>
            <Text style={{ fontSize: responsiveFontSize(2.0), color: '#334155', flex: 1 }}>{text}</Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: responsiveWidth(4), paddingTop: responsiveHeight(4), backgroundColor: colors.white, elevation: 2 }}>
                <TouchableOpacity onPress={_goBack} style={{ padding: 5 }}>
                    <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: 'bold', color: colors.royalBlue, textAlign: 'center' }}>
                    {t('truckMitrSuvidhaKendraTitle')}
                </Text>
                <TouchableOpacity onPress={_refreshPage} style={{ padding: 5 }}>
                    <Ionicons name="refresh" size={22} color={colors.royalBlue} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: responsiveWidth(4), paddingBottom: responsiveHeight(6) }} showsVerticalScrollIndicator={false}>

                {/* 🏢 1️⃣ Hero Card */}
                <View style={{ backgroundColor: '#EDE9FE', borderRadius: 16, padding: responsiveWidth(5), marginBottom: responsiveHeight(2), alignItems: 'center', ...shadow, shadowColor: 'rgba(0,0,0,0.08)' }}>
                    {/* Coming Soon Badge */}
                    <View style={{ backgroundColor: '#7C3AED', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginBottom: 12 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '700', color: colors.white }}>🏢 {t('comingSoon')}</Text>
                    </View>

                    <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                        <Text style={{ fontSize: 32 }}>🏢</Text>
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(2.8), fontWeight: '700', color: '#001F3F', textAlign: 'center', marginBottom: 8 }}>
                        {t('truckMitrSuvidhaKendraTitle')}
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: '600', color: '#7C3AED', textAlign: 'center', marginBottom: 10 }}>
                        {t('suvidhaTagline')}
                    </Text>

                    {/* Sub-line */}
                    <View style={{ marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#C4B5FD', width: '100%', alignItems: 'center' }}>
                        <Text style={{ fontSize: responsiveFontSize(2.0), color: '#5B21B6', textAlign: 'center', lineHeight: responsiveFontSize(2.8) }}>
                            {t('suvidhaHeroDesc')}
                        </Text>
                    </View>
                </View>

                {/* 💡 2️⃣ What is TruckMitr Suvidha Kendra */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: '#001F3F', marginBottom: 10 }}>{t('whatIsSuvidhaTitle')}</Text>
                    <Text style={{ fontSize: responsiveFontSize(2.0), color: '#64748B', lineHeight: responsiveFontSize(2.8) }}>
                        {t('whatIsSuvidhaDesc')}
                    </Text>
                    <View style={{ backgroundColor: '#EDE9FE', padding: 12, borderRadius: 8, marginTop: 14 }}>
                        <Text style={{ fontSize: responsiveFontSize(2.0), color: '#6D28D9', fontWeight: '600', textAlign: 'center' }}>
                            🏠 {t('everythingDriverNeeds')}
                        </Text>
                    </View>
                </View>

                {/* 🧾 3️⃣ Facilities Available */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)', borderLeftWidth: 4, borderLeftColor: '#7C3AED' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={{ fontSize: 26, marginRight: 10 }}>🧾</Text>
                        <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: '#001F3F' }}>{t('facilitiesAvailable')}</Text>
                    </View>
                    <FacilityItem emoji="🚻" text={t('cleanToilets')} />
                    <FacilityItem emoji="🧺" text={t('washingMachines')} />
                    <FacilityItem emoji="🛏️" text={t('cleanSleepingAreas')} />
                    <FacilityItem emoji="🌬️" text={t('coolersVentilation')} />
                    <FacilityItem emoji="🚛" text={t('safeParking')} />

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 }}>
                        <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ fontSize: responsiveFontSize(1.8), color: '#16A34A', fontWeight: '600' }}>✔ {t('easyToScan')}</Text>
                        </View>
                        <View style={{ backgroundColor: '#EDE9FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ fontSize: responsiveFontSize(1.8), color: '#7C3AED', fontWeight: '600' }}>✔ {t('veryPractical')}</Text>
                        </View>
                    </View>
                </View>

                {/* ❤️ 4️⃣ Why Suvidha Kendra Matters */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)', borderLeftWidth: 4, borderLeftColor: '#E11D48' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                        <Text style={{ fontSize: 26, marginRight: 10 }}>❤️</Text>
                        <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: '#001F3F' }}>{t('whySuvidhaMatters')}</Text>
                    </View>
                    <BulletItem text={t('helpsRest')} />
                    <BulletItem text={t('improvesHealth')} />
                    <BulletItem text={t('reducesFatigue')} />
                    <BulletItem text={t('ensuresSaferJourneys')} />
                    <BulletItem text={t('bringsComfort')} />

                    <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                        <Text style={{ fontSize: responsiveFontSize(2.2), color: '#001F3F', fontWeight: '700', textAlign: 'center' }}>
                            {t('restedDriverIsSafer')}
                        </Text>
                    </View>
                </View>

                {/* 🚛 5️⃣ Designed for Drivers */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)', borderLeftWidth: 4, borderLeftColor: '#2563EB' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                        <Text style={{ fontSize: 26, marginRight: 10 }}>🚛</Text>
                        <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: '#001F3F' }}>{t('designedForDrivers')}</Text>
                    </View>
                    <BenefitItem text={t('cleanSecure')} />
                    <BenefitItem text={t('easyAccess')} />
                    <BenefitItem text={t('focusedOnComfort')} />
                    <BenefitItem text={t('builtForLongDistance')} />
                </View>

                {/* ⏳ 6️⃣ Coming Soon for Driver Comfort */}
                <View style={{ backgroundColor: '#FEF3C7', borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Text style={{ fontSize: 26, marginRight: 8 }}>⏳</Text>
                        <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: '#92400E' }}>{t('comingSoonComfort')}</Text>
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(2.0), color: '#78350F', textAlign: 'center', lineHeight: responsiveFontSize(2.8) }}>
                        {t('suvidhaComingSoonDesc')}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}>
                        <Ionicons name="notifications" size={18} color="#D97706" style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: responsiveFontSize(2.0), color: '#92400E', fontWeight: '600' }}>{t('stayConnectedLaunch')}</Text>
                    </View>
                </View>

                {/* 📢 7️⃣ Footer Brand Message */}
                <View style={{ backgroundColor: '#5B21B6', borderRadius: 12, padding: responsiveWidth(5), marginBottom: responsiveHeight(2), alignItems: 'center' }}>
                    <Text style={{ fontSize: 32, marginBottom: 10 }}>📢</Text>
                    <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: colors.white, marginBottom: 6 }}>{t('truckMitrSuvidhaKendraTitle')}</Text>
                    <Text style={{ fontSize: responsiveFontSize(2.2), color: '#C4B5FD', fontStyle: 'italic', marginBottom: 10 }}>{t('suvidhaFooterTagline')}</Text>
                    <View style={{ borderTopWidth: 1, borderTopColor: '#7C3AED', paddingTop: 12, width: '100%', alignItems: 'center' }}>
                        <Text style={{ fontSize: responsiveFontSize(1.9), color: '#DDD6FE' }}>{t('launchingSoonSuvidha')}</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
};

export default TruckmitrSuvidhaKendra;

