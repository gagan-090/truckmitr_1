import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { STACKS } from '@truckmitr/src/stacks/stacks';

const RcCheckInfo = () => {
    const navigation = useNavigation<any>();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();

    // Mock Subscription Status (Set to true to test happy path, false to test gating)
    const [isSubscriptionActive, setIsSubscriptionActive] = useState(true);

    // State
    const [rcInputModalVisible, setRcInputModalVisible] = useState(false);
    const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
    const [rcNumber, setRcNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const _goBack = () => navigation.goBack();

    // 1. Open Input Modal
    const _handleCheckRc = () => {
        setRcInputModalVisible(true);
    };

    // 2. Verify Logic
    const _handleVerify = () => {
        if (!rcNumber.trim()) {
            return; // Add validation toast here if needed
        }

        if (isSubscriptionActive) {
            // Start Loading
            setLoading(true);

            // Simulate API Call
            setTimeout(() => {
                setLoading(false);
                setRcInputModalVisible(false);
                setRcNumber(''); // Clear input
                navigation.navigate(STACKS.RC_CHECK_RESULT, { rcNumber: rcNumber.toUpperCase() });
            }, 2000);
        } else {
            // Show Subscription Required Modal
            setRcInputModalVisible(false);
            setTimeout(() => {
                setSubscriptionModalVisible(true);
            }, 300); // Small delay for smooth transition
        }
    };

    const _handleViewPlans = () => {
        setSubscriptionModalVisible(false);
        // Navigate to Subscription Plans
        // navigation.navigate(STACKS.SUBSCRIPTION_CONSENT); 
        console.log("Navigating to Plans...");
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: responsiveWidth(4), paddingTop: responsiveHeight(4), backgroundColor: colors.white, elevation: 2 }}>
                <TouchableOpacity onPress={_goBack} style={{ padding: 5, marginRight: 10 }}>
                    <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: 'bold', color: colors.royalBlue }}>
                    RC Check
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: responsiveWidth(4), paddingBottom: responsiveHeight(14) }} showsVerticalScrollIndicator={false}>

                {/* 🚗 1️⃣ Hero Card */}
                <View style={{ backgroundColor: '#EAF3FF', borderRadius: 16, padding: responsiveWidth(5), marginBottom: responsiveHeight(2), alignItems: 'center' }}>
                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <Ionicons name="car-outline" size={30} color={colors.white} />
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: '700', color: '#001F3F', textAlign: 'center', marginBottom: 6 }}>
                        Vehicle RC Check
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#475569', textAlign: 'center', lineHeight: responsiveFontSize(2.2) }}>
                        Verify your vehicle RC details instantly by entering your vehicle number
                    </Text>
                </View>

                {/* ❓ 2️⃣ What is RC Check */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.6), fontWeight: '700', color: '#334155', marginBottom: 8 }}>What is RC Check?</Text>
                    <Text style={{ fontSize: responsiveFontSize(1.4), color: '#475569', lineHeight: responsiveFontSize(2.0), marginBottom: 8 }}>
                        Check your vehicle RC details instantly by entering your vehicle number.
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.3), color: '#64748B', fontStyle: 'italic' }}>
                        This feature is available for drivers with an active TruckMitr subscription.
                    </Text>
                </View>

                {/* 🔄 3️⃣ How It Works */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.6), fontWeight: '700', color: '#334155', marginBottom: 16 }}>How it works</Text>
                    {[
                        "Enter your vehicle number",
                        "Start RC verification",
                        "View RC check status and details"
                    ].map((step, index) => (
                        <View key={index} style={{ flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' }}>
                            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                <Text style={{ color: '#2563EB', fontWeight: 'bold', fontSize: responsiveFontSize(1.4) }}>{index + 1}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: responsiveFontSize(1.4), color: '#334155', lineHeight: responsiveFontSize(2) }}>{step}</Text>
                            </View>
                        </View>
                    ))}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Ionicons name="time-outline" size={16} color="#059669" style={{ marginRight: 6 }} />
                        <Text style={{ fontSize: responsiveFontSize(1.3), color: '#059669', fontWeight: '600' }}>Results are shared quickly after submission</Text>
                    </View>
                </View>

                {/* 💳 4️⃣ Subscription Requirement */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.6), fontWeight: '700', color: '#334155', marginBottom: 12 }}>Subscription Requirement</Text>
                    <Text style={{ fontSize: responsiveFontSize(1.4), color: '#475569', marginBottom: 8 }}>RC Check is included with:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Ionicons name="checkmark-circle" size={18} color="#16A34A" style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: responsiveFontSize(1.5), color: '#334155', fontWeight: '600' }}>₹199 Plan</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Ionicons name="checkmark-circle" size={18} color="#16A34A" style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: responsiveFontSize(1.5), color: '#334155', fontWeight: '600' }}>₹499 Plan</Text>
                    </View>
                    <View style={{ backgroundColor: '#FFF7ED', padding: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#F97316' }}>
                        <Text style={{ fontSize: responsiveFontSize(1.3), color: '#9A3412', lineHeight: responsiveFontSize(1.8) }}>
                            ⚠️ Please ensure your subscription is active to use this feature.
                        </Text>
                    </View>
                </View>

                {/* 🔐 5️⃣ Data Security */}
                <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="shield-lock-outline" size={24} color="#64748B" style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.4), fontWeight: '700', color: '#334155', marginBottom: 2 }}>Data Security</Text>
                        <Text style={{ fontSize: responsiveFontSize(1.2), color: '#64748B', lineHeight: responsiveFontSize(1.6) }}>
                            Your data is secure and used only for RC verification purposes.
                        </Text>
                    </View>
                </View>

            </ScrollView>

            {/* 📌 Sticky CTA Button */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: responsiveWidth(4), backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#E5E7EB', ...shadow }}>
                <TouchableOpacity
                    onPress={_handleCheckRc}
                    style={{ backgroundColor: colors.royalBlue, paddingVertical: responsiveHeight(1.8), borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: 'bold' }}>
                        Check Vehicle RC
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 🪟 1️⃣ RC Input Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={rcInputModalVisible}
                onRequestClose={() => {
                    if (!loading) setRcInputModalVisible(false);
                }}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: responsiveWidth(5), paddingBottom: responsiveHeight(5) }}>
                            {/* Header */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={{ fontSize: responsiveFontSize(2), fontWeight: 'bold', color: '#001F3F' }}>Vehicle RC Verification</Text>
                                {!loading && (
                                    <TouchableOpacity onPress={() => setRcInputModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#64748B" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Loader Specific View */}
                            {loading ? (
                                <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                                    <ActivityIndicator size="large" color={colors.royalBlue} style={{ marginBottom: 16 }} />
                                    <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '600', color: '#001F3F', marginBottom: 8 }}>Verifying RC details...</Text>
                                    <Text style={{ fontSize: responsiveFontSize(1.4), color: '#64748B' }}>Please wait, this may take a moment</Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={{ fontSize: responsiveFontSize(1.4), color: '#334155', marginBottom: 8 }}>Enter Vehicle Number</Text>
                                    <TextInput
                                        value={rcNumber}
                                        onChangeText={setRcNumber}
                                        placeholder="MH12AB1234"
                                        placeholderTextColor="#94A3B8"
                                        autoCapitalize="characters"
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#E2E8F0',
                                            borderRadius: 12,
                                            paddingHorizontal: 16,
                                            paddingVertical: 12,
                                            fontSize: responsiveFontSize(1.8),
                                            color: '#001F3F',
                                            backgroundColor: '#F8FAFC',
                                            marginBottom: 8
                                        }}
                                    />
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                                        <Ionicons name="information-circle-outline" size={16} color="#64748B" style={{ marginRight: 4 }} />
                                        <Text style={{ fontSize: responsiveFontSize(1.2), color: '#64748B' }}>Please enter the vehicle number correctly</Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={_handleVerify}
                                        style={{
                                            backgroundColor: rcNumber.trim() ? colors.royalBlue : '#CBD5E1',
                                            paddingVertical: responsiveHeight(1.8),
                                            borderRadius: 12,
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        disabled={!rcNumber.trim()}
                                    >
                                        <Text style={{ color: 'white', fontSize: responsiveFontSize(1.8), fontWeight: 'bold' }}>Verify RC</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* 🔐 2️⃣ Subscription Required Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={subscriptionModalVisible}
                onRequestClose={() => setSubscriptionModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 }}>
                    <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' }}>
                        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <MaterialCommunityIcons name="crown-outline" size={32} color="#F97316" />
                        </View>
                        <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: 'bold', color: '#001F3F', marginBottom: 8, textAlign: 'center' }}>Subscription Required</Text>
                        <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: responsiveFontSize(2.2) }}>
                            RC Check is available only for{'\n'}₹199 and ₹499 plans.
                        </Text>

                        <TouchableOpacity
                            onPress={_handleViewPlans}
                            style={{ backgroundColor: colors.royalBlue, width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12 }}
                        >
                            <Text style={{ color: 'white', fontSize: responsiveFontSize(1.6), fontWeight: 'bold' }}>View Plans</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setSubscriptionModalVisible(false)}
                            style={{ paddingVertical: 10 }}
                        >
                            <Text style={{ color: '#64748B', fontSize: responsiveFontSize(1.6), fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

export default RcCheckInfo;
