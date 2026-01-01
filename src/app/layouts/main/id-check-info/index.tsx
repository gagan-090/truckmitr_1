import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { STACKS } from '@truckmitr/src/stacks/stacks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
import ImagePicker from 'react-native-image-crop-picker';
import { Image } from 'react-native';

const IdCheckInfo = () => {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();
    const [refreshKey, setRefreshKey] = useState(0);

    // Form State
    const [govtId, setGovtId] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [selfie, setSelfie] = useState<any>(null);

    const _takeSelfie = async () => {
        try {
            const image = await ImagePicker.openCamera({
                width: 300,
                height: 400,
                cropping: true,
                useFrontCamera: true,
                mediaType: 'photo'
            });
            setSelfie(image);
        } catch (error) {
            console.log('Camera Error:', error);
        }
    };

    const _goBack = () => navigation.goBack();
    const _navigateToSubscription = () => {
        // Open subscription modal
        dispatch(subscriptionModalAction(true));
    };
    const _contactSupport = () => {
        Linking.openURL('tel:+911234567890');
    };
    const _refreshPage = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Document Card Component
    const DocumentCard = ({ icon, iconType, title, subtitle }: { icon: string, iconType: 'ion' | 'material', title: string, subtitle: string }) => (
        <View style={{ flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(3), margin: 4, ...shadow, shadowColor: 'rgba(0,0,0,0.08)', borderWidth: 1, borderColor: '#F0F0F0' }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#EAF3FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                {iconType === 'ion' ? (
                    <Ionicons name={icon} size={22} color="#2563EB" />
                ) : (
                    <MaterialCommunityIcons name={icon} size={22} color="#2563EB" />
                )}
            </View>
            <Text style={{ fontSize: responsiveFontSize(1.5), fontWeight: '600', color: '#001F3F', marginBottom: 2 }}>{title}</Text>
            <Text style={{ fontSize: responsiveFontSize(1.2), color: '#64748B' }}>{subtitle}</Text>
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

    // Benefit Item Component
    const BenefitItem = ({ text }: { text: string }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveHeight(1.2) }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name="checkmark" size={14} color="#16A34A" />
            </View>
            <Text style={{ fontSize: responsiveFontSize(1.5), color: '#334155' }}>{text}</Text>
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
                    Get ID Check
                </Text>
                <TouchableOpacity onPress={_refreshPage} style={{ padding: 5 }}>
                    <Ionicons name="refresh" size={22} color={colors.royalBlue} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: responsiveWidth(4), paddingBottom: responsiveHeight(14) }} showsVerticalScrollIndicator={false}>

                {/* 🎯 Hero Card */}
                <View style={{ backgroundColor: '#EAF3FF', borderRadius: 16, padding: responsiveWidth(5), marginBottom: responsiveHeight(2), alignItems: 'center' }}>
                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <Ionicons name="shield-checkmark" size={32} color={colors.white} />
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(2.4), fontWeight: '700', color: '#001F3F', textAlign: 'center', marginBottom: 6 }}>
                        ID Verification
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#475569', textAlign: 'center', lineHeight: responsiveFontSize(2.2) }}>
                        Verify your identity and become a trusted driver
                    </Text>
                    <TouchableOpacity
                        onPress={_navigateToSubscription}
                        style={{ backgroundColor: colors.royalBlue, paddingVertical: responsiveHeight(1.5), paddingHorizontal: responsiveWidth(8), borderRadius: 10, marginTop: responsiveHeight(2) }}
                    >
                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.6), fontWeight: '600' }}>Get ID Check Now</Text>
                    </TouchableOpacity>
                </View>

                {/* ❓ Why ID Check */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '700', color: '#001F3F', marginBottom: 8 }}>Why ID Check?</Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B', lineHeight: responsiveFontSize(2.2) }}>
                        To verify driver identity, prevent fake accounts, and build trust across the trucking industry.
                    </Text>
                </View>

                {/* 📄 Required Documents - Input Fields */}
                <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '700', color: '#001F3F', marginBottom: 10, textAlign: 'left' }}>Required Documents</Text>

                <View style={{ marginBottom: responsiveHeight(2) }}>
                    {/* Government ID Input */}
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#334155', fontWeight: '600', marginBottom: 6 }}>Government ID Number</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12 }}>
                            <Ionicons name="card-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 12, fontSize: responsiveFontSize(1.6), color: '#0F172A' }}
                                placeholder="Enter Aadhaar / Voter ID / PAN"
                                placeholderTextColor="#94A3B8"
                                value={govtId}
                                onChangeText={setGovtId}
                            />
                        </View>
                    </View>

                    {/* Driving License Input */}
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#334155', fontWeight: '600', marginBottom: 6 }}>Driving License Number</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12 }}>
                            <Ionicons name="car-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                            <TextInput
                                style={{ flex: 1, paddingVertical: 12, fontSize: responsiveFontSize(1.6), color: '#0F172A' }}
                                placeholder="Enter Driving License Number"
                                placeholderTextColor="#94A3B8"
                                value={licenseNumber}
                                onChangeText={setLicenseNumber}
                            />
                        </View>
                    </View>

                    {/* Live Selfie Input (Simulated) */}
                    <View style={{ marginBottom: 5 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.4), color: '#334155', fontWeight: '600', marginBottom: 6 }}>Live Selfie</Text>
                        <TouchableOpacity onPress={_takeSelfie} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12, paddingVertical: 12, borderStyle: 'dashed' }}>
                            <Ionicons name="camera-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                            {selfie ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <Image source={{ uri: selfie.path }} style={{ width: 30, height: 30, borderRadius: 15, marginRight: 8 }} />
                                    <Text style={{ fontSize: responsiveFontSize(1.6), color: '#0F172A' }}>Selfie Captured</Text>
                                </View>
                            ) : (
                                <Text style={{ fontSize: responsiveFontSize(1.6), color: '#94A3B8' }}>Click to take a selfie</Text>
                            )}
                            <View style={{ flex: 1 }} />
                            {!selfie && <Ionicons name="cloud-upload-outline" size={18} color="#2563EB" />}
                            {selfie && <Ionicons name="checkmark-circle" size={18} color="#16A34A" />}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 🔄 Verification Process - Stepper */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '700', color: '#001F3F', marginBottom: 16 }}>Verification Process</Text>
                    <ProcessStep number="1" text="Upload required documents" />
                    <ProcessStep number="2" text="Identity & document check" />
                    <ProcessStep number="3" text="Photo matching" />
                    <ProcessStep number="4" text="Get verification status" isLast />
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: '#FEF3C7', padding: 10, borderRadius: 8 }}>
                        <Ionicons name="flash" size={16} color="#D97706" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#92400E', fontWeight: '600', fontSize: responsiveFontSize(1.4) }}>Fast & secure process</Text>
                    </View>
                </View>

                {/* 🌟 Benefits */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '700', color: '#001F3F', marginBottom: 16 }}>Benefits</Text>
                    <BenefitItem text="Trusted driver profile" />
                    <BenefitItem text="More trip opportunities" />
                    <BenefitItem text="Faster approvals" />
                    <BenefitItem text="Trusted by transporters" />
                    <BenefitItem text="Safe & secure platform" />
                </View>

                {/* 🔐 Data Security */}
                <View style={{ backgroundColor: '#F0FDF4', borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <Ionicons name="lock-closed" size={20} color="#16A34A" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.6), fontWeight: '700', color: '#166534', marginBottom: 2 }}>Data Security</Text>
                        <Text style={{ fontSize: responsiveFontSize(1.3), color: '#15803D', lineHeight: responsiveFontSize(1.9) }}>
                            Your documents are encrypted and used only for verification purposes.
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
                    onPress={_navigateToSubscription}
                    style={{ backgroundColor: colors.royalBlue, paddingVertical: responsiveHeight(1.8), borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: 'bold' }}>Get ID Check Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default IdCheckInfo;
