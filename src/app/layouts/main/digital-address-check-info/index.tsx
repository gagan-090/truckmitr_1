import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';

const DigitalAddressCheckInfo = () => {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();
    const [refreshKey, setRefreshKey] = useState(0);

    // Form State
    const [mobileNumber, setMobileNumber] = useState('');
    const [fullName, setFullName] = useState('');
    const [currentAddress, setCurrentAddress] = useState('');

    const _goBack = () => navigation.goBack();
    const _startDigitalAddressCheck = () => {
        dispatch(subscriptionModalAction(true));
    };
    const _contactSupport = () => {
        Linking.openURL('tel:+911234567890');
    };
    const _refreshPage = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Detail Card Component
    const DetailCard = ({ icon, title, iconType = 'ion' }: { icon: string, title: string, iconType?: 'ion' | 'material' }) => (
        <View style={{ width: '31%', backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(2), marginBottom: 10, ...shadow, shadowColor: 'rgba(0,0,0,0.08)', borderWidth: 1, borderColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center', height: 100 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#EAF3FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                {iconType === 'ion' ? (
                    <Ionicons name={icon} size={20} color="#2563EB" />
                ) : (
                    <MaterialCommunityIcons name={icon} size={20} color="#2563EB" />
                )}
            </View>
            <Text style={{ fontSize: responsiveFontSize(1.3), fontWeight: '600', color: '#001F3F', textAlign: 'center' }}>{title}</Text>
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
                    Digital Address Check
                </Text>
                <TouchableOpacity onPress={_refreshPage} style={{ padding: 5 }}>
                    <Ionicons name="refresh" size={22} color={colors.royalBlue} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: responsiveWidth(4), paddingBottom: responsiveHeight(14) }} showsVerticalScrollIndicator={false}>

                {/* 🏠 Hero Card */}
                <View style={{ backgroundColor: '#EAF3FF', borderRadius: 16, padding: responsiveWidth(5), marginBottom: responsiveHeight(2), alignItems: 'center' }}>
                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <Ionicons name="location" size={32} color={colors.white} />
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: '#001F3F', textAlign: 'center', marginBottom: 6 }}>
                        Digital Address Check
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#475569', textAlign: 'center', lineHeight: responsiveFontSize(2.2) }}>
                        Verify your address digitally and complete your profile
                    </Text>
                </View>

                {/* ❓ Why it’s required */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '700', color: '#001F3F', marginBottom: 8 }}>Why it’s required?</Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B', lineHeight: responsiveFontSize(2.2) }}>
                        Digital Address Check helps confirm your address and improves trust and reliability for transporters and trucking stakeholders during driver hiring.
                    </Text>
                </View>

                {/* 📝 Information Required */}
                <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '700', color: '#001F3F', marginBottom: 10 }}>Information Required</Text>
                <View style={{ marginBottom: responsiveHeight(2) }}>
                    {/* Mobile Number Input */}
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#334155', fontWeight: '600', marginBottom: 6 }}>Mobile Number</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12 }}>
                            <Ionicons name="phone-portrait-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 12, fontSize: responsiveFontSize(1.6), color: '#0F172A' }}
                                placeholder="Enter mobile number"
                                placeholderTextColor="#94A3B8"
                                keyboardType="phone-pad"
                                value={mobileNumber}
                                onChangeText={setMobileNumber}
                            />
                        </View>
                    </View>

                    {/* Full Name Input */}
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#334155', fontWeight: '600', marginBottom: 6 }}>Full Name</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12 }}>
                            <Ionicons name="person-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 12, fontSize: responsiveFontSize(1.6), color: '#0F172A' }}
                                placeholder="Enter full name"
                                placeholderTextColor="#94A3B8"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>
                    </View>

                    {/* Current Address Input */}
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#334155', fontWeight: '600', marginBottom: 6 }}>Current Address</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12 }}>
                            <Ionicons name="home-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 12, fontSize: responsiveFontSize(1.6), color: '#0F172A' }}
                                placeholder="Enter current address"
                                placeholderTextColor="#94A3B8"
                                value={currentAddress}
                                onChangeText={setCurrentAddress}
                            />
                        </View>
                    </View>
                </View>

                {/* ⚠️ Inline Warning */}
                <View style={{ backgroundColor: '#FFF7ED', padding: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'flex-start', marginBottom: responsiveHeight(2), borderWidth: 1, borderColor: '#FFEDD5' }}>
                    <Ionicons name="warning" size={20} color="#F97316" style={{ marginRight: 10, marginTop: 2 }} />
                    <Text style={{ fontSize: responsiveFontSize(1.4), color: '#9A3412', flex: 1, lineHeight: responsiveFontSize(2) }}>
                        Ensure details are accurate. Incorrect information may cause verification failure.
                    </Text>
                </View>

                {/* 🔄 How It Works - Stepper */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '700', color: '#001F3F', marginBottom: 16 }}>How It Works</Text>
                    <ProcessStep number="1" text="Enter mobile number, name & address" />
                    <ProcessStep number="2" text="Receive an automated verification call" />
                    <ProcessStep number="3" text="Get an address verification link" />
                    <ProcessStep number="4" text="Open the link and fill the form" />
                    <ProcessStep number="5" text="Submit to start verification" isLast />
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: '#E0F2FE', padding: 10, borderRadius: 8 }}>
                        <Ionicons name="time-outline" size={16} color="#0369A1" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#075985', fontWeight: '600', fontSize: responsiveFontSize(1.4) }}>Verification is initiated once the form is submitted</Text>
                    </View>
                </View>

                {/* 📌 Important Notes */}
                <View style={{ backgroundColor: '#F1F5F9', borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2) }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <MaterialCommunityIcons name="pin" size={20} color="#475569" style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: responsiveFontSize(1.6), fontWeight: '700', color: '#334155' }}>Important Notes</Text>
                    </View>
                    <View style={{ marginLeft: 6 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#475569', marginBottom: 6 }}>• Keep your phone available to receive the call</Text>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#475569', marginBottom: 6 }}>• Complete the form using the link sent to your mobile</Text>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#475569' }}>• Do not share the verification link with anyone</Text>
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
                            Your data is encrypted and used only for address verification.
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
                    onPress={_startDigitalAddressCheck}
                    style={{ backgroundColor: colors.royalBlue, paddingVertical: responsiveHeight(1.8), borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: 'bold' }}>Start Digital Address Check</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default DigitalAddressCheckInfo;
