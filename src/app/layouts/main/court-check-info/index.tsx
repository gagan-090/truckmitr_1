import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, TouchableOpacity, Linking, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';

const CourtCheckInfo = () => {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();
    const { t } = useTranslation();
    const [refreshKey, setRefreshKey] = useState(0);

    // Form State
    const [fullName, setFullName] = useState('');
    const [dob, setDob] = useState('');
    const [address, setAddress] = useState('');
    const [fathersName, setFathersName] = useState('');

    const _goBack = () => navigation.goBack();
    const _startCourtCheck = () => {
        dispatch(subscriptionModalAction(true));
    };
    const _contactSupport = () => {
        Linking.openURL('tel:+911234567890');
    };
    const _refreshPage = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Detail Card Component
    const DetailCard = ({ icon, title }: { icon: string, title: string }) => (
        <View style={{ width: '48%', backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(3), marginBottom: 12, ...shadow, shadowColor: 'rgba(0,0,0,0.08)', borderWidth: 1, borderColor: '#F0F0F0', flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#EAF3FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name={icon} size={22} color="#2563EB" />
            </View>
            <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '600', color: '#001F3F', flex: 1 }}>{title}</Text>
        </View>
    );

    // Process Step Component
    const ProcessStep = ({ number, text, isLast }: { number: string, text: string, isLast?: boolean }) => (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ alignItems: 'center', marginRight: 14 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.6), fontWeight: '700', color: colors.white }}>{number}</Text>
                </View>
                {!isLast && <View style={{ width: 2, height: 28, backgroundColor: '#E0E7FF', marginTop: 4 }} />}
            </View>
            <Text style={{ fontSize: responsiveFontSize(1.9), color: '#334155', flex: 1, paddingTop: 6 }}>{text}</Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: responsiveWidth(4), paddingTop: responsiveHeight(6), paddingBottom: responsiveHeight(2), backgroundColor: colors.white, elevation: 2 }}>
                <TouchableOpacity onPress={_goBack} style={{ padding: 8 }}>
                    <Ionicons name="chevron-back" size={28} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ fontSize: responsiveFontSize(2.6), fontWeight: 'bold', color: colors.royalBlue, textAlign: 'center' }}>
                    {t('courtCheckTitle')}
                </Text>
                <TouchableOpacity onPress={_refreshPage} style={{ padding: 8 }}>
                    <Ionicons name="refresh" size={26} color={colors.royalBlue} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: responsiveWidth(4), paddingBottom: responsiveHeight(14) }} showsVerticalScrollIndicator={false}>

                {/* ⚖️ Hero Card */}
                <View style={{ backgroundColor: '#EAF3FF', borderRadius: 16, padding: responsiveWidth(5), marginBottom: responsiveHeight(2), alignItems: 'center' }}>
                    <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                        <MaterialCommunityIcons name="scale-balance" size={36} color={colors.white} />
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(2.8), fontWeight: '700', color: '#001F3F', textAlign: 'center', marginBottom: 8 }}>
                        {t('courtCheckTitle')}
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.8), color: '#475569', textAlign: 'center', lineHeight: responsiveFontSize(2.6) }}>
                        {t('courtCheckDesc')}
                    </Text>
                    <TouchableOpacity
                        onPress={_startCourtCheck}
                        style={{ backgroundColor: colors.royalBlue, paddingVertical: responsiveHeight(1.8), paddingHorizontal: responsiveWidth(8), borderRadius: 12, marginTop: responsiveHeight(2) }}
                    >
                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.9), fontWeight: '600' }}>{t('startCourtCheck')}</Text>
                    </TouchableOpacity>
                </View>

                {/* ❓ Why Court Check? */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: '700', color: '#001F3F', marginBottom: 10 }}>{t('whyCourtCheck')}</Text>
                    <Text style={{ fontSize: responsiveFontSize(1.8), color: '#64748B', lineHeight: responsiveFontSize(2.6) }}>
                        {t('whyCourtCheckDesc')}
                    </Text>
                </View>

                {/* 📝 Required Details - Input Form */}
                <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: '700', color: '#001F3F', marginBottom: 12 }}>{t('requiredDetails')}</Text>
                <View style={{ marginBottom: responsiveHeight(2) }}>
                    <View style={{ marginBottom: 18 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.7), color: '#334155', fontWeight: '600', marginBottom: 8 }}>{t('fullName')}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 14 }}>
                            <Ionicons name="person-outline" size={22} color="#64748B" style={{ marginRight: 12 }} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 14, fontSize: responsiveFontSize(1.8), color: '#0F172A' }}
                                placeholder={t('enterFullName')}
                                placeholderTextColor="#94A3B8"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>
                    </View>

                    <View style={{ marginBottom: 18 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.7), color: '#334155', fontWeight: '600', marginBottom: 8 }}>{t('dateOfBirth')}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 14 }}>
                            <Ionicons name="calendar-outline" size={22} color="#64748B" style={{ marginRight: 12 }} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 14, fontSize: responsiveFontSize(1.8), color: '#0F172A' }}
                                placeholder="DD/MM/YYYY"
                                placeholderTextColor="#94A3B8"
                                value={dob}
                                onChangeText={setDob}
                            />
                        </View>
                    </View>

                    <View style={{ marginBottom: 18 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.7), color: '#334155', fontWeight: '600', marginBottom: 8 }}>{t('address')}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 14 }}>
                            <Ionicons name="home-outline" size={22} color="#64748B" style={{ marginRight: 12 }} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 14, fontSize: responsiveFontSize(1.8), color: '#0F172A' }}
                                placeholder={t('enterCompleteAddress')}
                                placeholderTextColor="#94A3B8"
                                value={address}
                                onChangeText={setAddress}
                            />
                        </View>
                    </View>

                    <View style={{ marginBottom: 18 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.7), color: '#334155', fontWeight: '600', marginBottom: 8 }}>{t('fathersName')}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 14 }}>
                            <Ionicons name="people-outline" size={22} color="#64748B" style={{ marginRight: 12 }} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 14, fontSize: responsiveFontSize(1.8), color: '#0F172A' }}
                                placeholder={t('enterFatherName')}
                                placeholderTextColor="#94A3B8"
                                value={fathersName}
                                onChangeText={setFathersName}
                            />
                        </View>
                    </View>
                </View>

                {/* 🔄 Verification Process - Stepper */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: '700', color: '#001F3F', marginBottom: 18 }}>{t('verificationProcess')}</Text>
                    <ProcessStep number="1" text={t('enterRequiredDetails')} />
                    <ProcessStep number="2" text={t('verificationStarts')} />
                    <ProcessStep number="3" text={t('statusShown')} isLast />
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18, backgroundColor: '#E0F2FE', padding: 12, borderRadius: 10 }}>
                        <Ionicons name="time-outline" size={18} color="#0369A1" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#075985', fontWeight: '600', fontSize: responsiveFontSize(1.6) }}>{t('verificationTakes72Hours')}</Text>
                    </View>
                </View>

                {/* 🔐 Data Security */}
                <View style={{ backgroundColor: '#F0FDF4', borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                        <Ionicons name="lock-closed" size={24} color="#16A34A" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.9), fontWeight: '700', color: '#166534', marginBottom: 4 }}>{t('dataSecurity')}</Text>
                        <Text style={{ fontSize: responsiveFontSize(1.6), color: '#15803D', lineHeight: responsiveFontSize(2.4) }}>
                            {t('dataSecurityDescCourt')}
                        </Text>
                    </View>
                </View>

                {/* ☎️ Support Access */}
                <TouchableOpacity onPress={_contactSupport} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: responsiveHeight(1.5) }}>
                    <Ionicons name="call-outline" size={20} color="#64748B" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: responsiveFontSize(1.6), color: '#64748B' }}>{t('needHelp')} <Text style={{ fontWeight: '600', color: '#2563EB' }}>{t('contactTruckMitrSupport')}</Text></Text>
                </TouchableOpacity>

            </ScrollView>

            {/* 📌 Sticky CTA Button */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: responsiveWidth(4), backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#E5E7EB', ...shadow }}>
                <TouchableOpacity
                    onPress={_startCourtCheck}
                    style={{ backgroundColor: colors.royalBlue, paddingVertical: responsiveHeight(2), borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(2.0), fontWeight: 'bold' }}>{t('startCourtCheck')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CourtCheckInfo;
