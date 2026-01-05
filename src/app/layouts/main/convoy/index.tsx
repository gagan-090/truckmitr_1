import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CheckItem = ({ text, responsiveFontSize }: any) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
            <Ionicons name="checkmark" size={14} color="#16A34A" />
        </View>
        <Text style={{ fontSize: responsiveFontSize(1.8), color: '#334155', flex: 1 }}>{text}</Text>
    </View>
);

const BulletItem = ({ text, responsiveFontSize }: any) => (
    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <Text style={{ fontSize: responsiveFontSize(1.8), color: '#001F3F', marginRight: 8 }}>•</Text>
        <Text style={{ fontSize: responsiveFontSize(1.8), color: '#334155', flex: 1 }}>{text}</Text>
    </View>
);

const Convoy = () => {
    const navigation = useNavigation<any>();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();
    const { t } = useTranslation();

    const _goBack = () => navigation.goBack();

    const styles = StyleSheet.create({
        heroCard: { backgroundColor: '#EAF3FF', borderRadius: 16, padding: responsiveWidth(5), marginBottom: responsiveHeight(2), alignItems: 'center' },
        comingSoonBadge: { backgroundColor: '#F97316', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginBottom: 14 },
        comingSoonText: { fontSize: responsiveFontSize(1.5), fontWeight: '700', color: colors.white },
        heroContent: { alignItems: 'center' },
        heroIcon: { fontSize: 32, marginBottom: 10 },
        heroTitle: { fontSize: responsiveFontSize(2.8), fontWeight: '700', color: '#001F3F', textAlign: 'center', marginBottom: 8 },
        heroSubtitle: { fontSize: responsiveFontSize(1.8), color: '#475569', textAlign: 'center', lineHeight: responsiveFontSize(2.7) },
        heroDescription: { fontSize: responsiveFontSize(1.6), color: '#64748B', textAlign: 'center', fontStyle: 'italic', lineHeight: responsiveFontSize(2.4) },

        infoCard: { backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2) },
        sectionHeader: { fontSize: responsiveFontSize(2.2), fontWeight: '700', color: '#001F3F', marginBottom: 14 },
        infoText: { fontSize: responsiveFontSize(1.8), color: '#334155', lineHeight: responsiveFontSize(2.6) },

        sectionContainer: { marginBottom: responsiveHeight(2) },
        card: { backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4) }
    });

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: responsiveWidth(4), paddingTop: responsiveHeight(4), backgroundColor: colors.white, elevation: 2 }}>
                <TouchableOpacity onPress={_goBack} style={{ padding: 5 }}>
                    <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: 'bold', color: colors.royalBlue, textAlign: 'center', flex: 1 }}>
                    {t('convoyTitle')}
                </Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: responsiveWidth(4), paddingBottom: responsiveHeight(6) }} showsVerticalScrollIndicator={false}>
                {/* Hero Card */}
                <View style={[styles.heroCard, shadow, { shadowColor: 'rgba(0,0,0,0.08)' }]}>
                    <View style={styles.comingSoonBadge}>
                        <Text style={styles.comingSoonText}>{t('convoyComingSoonBadge')}</Text>
                    </View>
                    <View style={styles.heroContent}>
                        <View style={{ width: 65, height: 65, borderRadius: 32, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                            <Text style={{ fontSize: 32 }}>🚛</Text>
                        </View>
                        <Text style={styles.heroTitle}>{t('convoyTitle')}</Text>
                        <Text style={styles.heroSubtitle}>
                            {t('convoyTagline')}
                        </Text>
                    </View>
                    <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#CBD5E1', width: '100%', alignItems: 'center' }}>
                        <Text style={styles.heroDescription}>
                            {t('convoyHeroDesc')}
                        </Text>
                    </View>
                </View>

                {/* How Convoy Works */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>{t('convoyHowWorksTitle')}</Text>
                    <View style={[styles.card, shadow, { shadowColor: 'rgba(0,0,0,0.06)' }]}>
                        <CheckItem text={t('convoyHowWorks1')} responsiveFontSize={responsiveFontSize} />
                        <CheckItem text={t('convoyHowWorks2')} responsiveFontSize={responsiveFontSize} />
                        <CheckItem text={t('convoyHowWorks3')} responsiveFontSize={responsiveFontSize} />
                        <CheckItem text={t('convoyHowWorks4')} responsiveFontSize={responsiveFontSize} />

                        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                            <Text style={{ fontSize: responsiveFontSize(1.7), color: '#1E293B', fontWeight: '700', textAlign: 'center', fontStyle: 'italic' }}>
                                {t('convoyConclusion')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Why Convoy Matters */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>{t('convoyWhyImportantTitle')}</Text>
                    <View style={[styles.card, shadow, { shadowColor: 'rgba(0,0,0,0.06)', borderLeftWidth: 4, borderLeftColor: colors.royalBlue }]}>
                        <BulletItem text={t('convoyWhyImportant1')} responsiveFontSize={responsiveFontSize} />
                        <BulletItem text={t('convoyWhyImportant2')} responsiveFontSize={responsiveFontSize} />
                        <BulletItem text={t('convoyWhyImportant3')} responsiveFontSize={responsiveFontSize} />
                        <BulletItem text={t('convoyWhyImportant4')} responsiveFontSize={responsiveFontSize} />
                        <BulletItem text={t('convoyWhyImportant5')} responsiveFontSize={responsiveFontSize} />
                    </View>
                </View>

                {/* Built for Drivers */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>{t('convoyDriverBenefitsTitle')}</Text>
                    <View style={[styles.card, shadow, { shadowColor: 'rgba(0,0,0,0.06)' }]}>
                        <CheckItem text={t('convoyDriverBenefits1')} responsiveFontSize={responsiveFontSize} />
                        <CheckItem text={t('convoyDriverBenefits2')} responsiveFontSize={responsiveFontSize} />
                        <CheckItem text={t('convoyDriverBenefits3')} responsiveFontSize={responsiveFontSize} />
                        <CheckItem text={t('convoyDriverBenefits4')} responsiveFontSize={responsiveFontSize} />
                    </View>
                </View>

                {/* Coming Soon */}
                <View style={styles.sectionContainer}>
                    <View style={[styles.card, shadow, { shadowColor: 'rgba(0,0,0,0.06)', backgroundColor: '#FFF7ED', borderColor: '#FED7AA', borderWidth: 1 }]}>
                        <Text style={{ fontSize: responsiveFontSize(2), fontWeight: '700', color: '#C2410C', marginBottom: 8 }}>{t('convoyComingSoonDrivers')}</Text>
                        <Text style={{ fontSize: responsiveFontSize(1.6), color: '#9A3412', lineHeight: 22 }}>
                            {t('convoyComingSoonDesc')}
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={{ marginTop: 30, alignItems: 'center', opacity: 0.8 }}>
                    <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: '800', color: colors.royalBlue, marginBottom: 4, textAlign: 'center' }}>
                        {t('convoyFooterTagline')}
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B' }}>{t('convoyFooterSub')}</Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default Convoy;
