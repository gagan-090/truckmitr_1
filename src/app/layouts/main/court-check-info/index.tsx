import React, { useState } from 'react';
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
    const [refreshKey, setRefreshKey] = useState(0);

    // Form State
    const [fullName, setFullName] = useState('');
    const [dob, setDob] = useState('');
    const [address, setAddress] = useState('');
    const [fathersName, setFathersName] = useState('');

    const _goBack = () => navigation.goBack();
    const _startCourtCheck = () => {
        // Navigate to payment or start flow - currently opening subscription modal as place holder or per ID Check flow
        // "Redirects to Court Check flow / payment if any" 
        // For now I will use the same subscription modal action or just a placeholder alert if no specific route provided
        // Given I don't have a specific route, I will keep the subscription modal for now as it's a paid feature likely.
        dispatch(subscriptionModalAction(true));
    };
    const _contactSupport = () => {
        Linking.openURL('tel:+911234567890');
    };
    const _refreshPage = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Document/Detail Card Component
    const DetailCard = ({ icon, title }: { icon: string, title: string }) => (
        <View style={{ width: '48%', backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(3), marginBottom: 10, ...shadow, shadowColor: 'rgba(0,0,0,0.08)', borderWidth: 1, borderColor: '#F0F0F0', flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#EAF3FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name={icon} size={20} color="#2563EB" />
            </View>
            <Text style={{ fontSize: responsiveFontSize(1.4), fontWeight: '600', color: '#001F3F', flex: 1 }}>{title}</Text>
        </View>
    );

    // Process Step Component
    const ProcessStep = ({ number, text, isLast }: { number: string, text: string, isLast?: boolean }) => (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ alignItems: 'center', marginRight: 12 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.4), fontWeight: '700', color: colors.white }}>{number}</Text>
                </View>
                {!isLast && <View style={{ width: 2, height: 24, backgroundColor: '#E0E7FF', marginTop: 4 }} />}
            </View>
            <Text style={{ fontSize: responsiveFontSize(1.6), color: '#334155', flex: 1, paddingTop: 4 }}>{text}</Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: responsiveWidth(4), paddingTop: responsiveHeight(4), backgroundColor: colors.white, elevation: 2 }}>
                <TouchableOpacity onPress={_goBack} style={{ padding: 5 }}>
                    <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: 'bold', color: colors.royalBlue, textAlign: 'center' }}>
                    Court Check
                </Text>
                <TouchableOpacity onPress={_refreshPage} style={{ padding: 5 }}>
                    <Ionicons name="refresh" size={22} color={colors.royalBlue} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: responsiveWidth(4), paddingBottom: responsiveHeight(14) }} showsVerticalScrollIndicator={false}>

                {/* ⚖️ Hero Card */}
                <View style={{ backgroundColor: '#EAF3FF', borderRadius: 16, padding: responsiveWidth(5), marginBottom: responsiveHeight(2), alignItems: 'center' }}>
                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <MaterialCommunityIcons name="scale-balance" size={32} color={colors.white} />
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: '#001F3F', textAlign: 'center', marginBottom: 6 }}>
                        Court Check
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#475569', textAlign: 'center', lineHeight: responsiveFontSize(2.2) }}>
                        Verify court records and build trust with transporters
                    </Text>
                    <TouchableOpacity
                        onPress={_startCourtCheck}
                        style={{ backgroundColor: colors.royalBlue, paddingVertical: responsiveHeight(1.5), paddingHorizontal: responsiveWidth(8), borderRadius: 10, marginTop: responsiveHeight(2) }}
                    >
                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.6), fontWeight: '600' }}>Start Court Check</Text>
                    </TouchableOpacity>
                </View>

                {/* ❓ Why Court Check? */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '700', color: '#001F3F', marginBottom: 8 }}>Why Court Check?</Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B', lineHeight: responsiveFontSize(2.2) }}>
                        Court Check helps verify court records and establishes trust and reliability for transporters and trucking stakeholders during driver hiring.
                    </Text>
                </View>

                {/* 📝 Required Details - Input Form */}
                <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '700', color: '#001F3F', marginBottom: 10 }}>Required Details</Text>
                <View style={{ marginBottom: responsiveHeight(2) }}>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#334155', fontWeight: '600', marginBottom: 6 }}>Full Name</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12 }}>
                            <Ionicons name="person-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 12, fontSize: responsiveFontSize(1.6), color: '#0F172A' }}
                                placeholder="Enter your full name"
                                placeholderTextColor="#94A3B8"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#334155', fontWeight: '600', marginBottom: 6 }}>Date of Birth</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12 }}>
                            <Ionicons name="calendar-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 12, fontSize: responsiveFontSize(1.6), color: '#0F172A' }}
                                placeholder="DD/MM/YYYY"
                                placeholderTextColor="#94A3B8"
                                value={dob}
                                onChangeText={setDob}
                            />
                        </View>
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#334155', fontWeight: '600', marginBottom: 6 }}>Address</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12 }}>
                            <Ionicons name="home-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 12, fontSize: responsiveFontSize(1.6), color: '#0F172A' }}
                                placeholder="Enter your address"
                                placeholderTextColor="#94A3B8"
                                value={address}
                                onChangeText={setAddress}
                            />
                        </View>
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#334155', fontWeight: '600', marginBottom: 6 }}>Father's Name</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12 }}>
                            <Ionicons name="people-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 12, fontSize: responsiveFontSize(1.6), color: '#0F172A' }}
                                placeholder="Enter father's name"
                                placeholderTextColor="#94A3B8"
                                value={fathersName}
                                onChangeText={setFathersName}
                            />
                        </View>
                    </View>
                </View>

                {/* 🔄 Verification Process - Stepper */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '700', color: '#001F3F', marginBottom: 16 }}>Verification Process</Text>
                    <ProcessStep number="1" text="Enter required details" />
                    <ProcessStep number="2" text="Verification starts" />
                    <ProcessStep number="3" text="Status shown" isLast />
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: '#E0F2FE', padding: 10, borderRadius: 8 }}>
                        <Ionicons name="time-outline" size={16} color="#0369A1" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#075985', fontWeight: '600', fontSize: responsiveFontSize(1.4) }}>Verification takes up to 72 hours</Text>
                    </View>
                </View>

                {/* 🔐 Data Security */}
                <View style={{ backgroundColor: '#F0FDF4', borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <Ionicons name="lock-closed" size={20} color="#16A34A" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.6), fontWeight: '700', color: '#166534', marginBottom: 2 }}>Data Security</Text>
                        <Text style={{ fontSize: responsiveFontSize(1.3), color: '#15803D', lineHeight: responsiveFontSize(1.9) }}>
                            Your data is encrypted and used only for verification purposes.
                        </Text>
                    </View>
                </View>

                {/* ☎️ Support Access */}
                <TouchableOpacity onPress={_contactSupport} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: responsiveHeight(1.5) }}>
                    <Ionicons name="call-outline" size={18} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: responsiveFontSize(1.4), color: '#64748B' }}>Need help? <Text style={{ fontWeight: '600', color: '#2563EB' }}>Contact TruckMitr Support</Text></Text>
                </TouchableOpacity>

            </ScrollView>

            {/* 📌 Sticky CTA Button */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: responsiveWidth(4), backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#E5E7EB', ...shadow }}>
                <TouchableOpacity
                    onPress={_startCourtCheck}
                    style={{ backgroundColor: colors.royalBlue, paddingVertical: responsiveHeight(1.8), borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: 'bold' }}>Start Court Check</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CourtCheckInfo;
