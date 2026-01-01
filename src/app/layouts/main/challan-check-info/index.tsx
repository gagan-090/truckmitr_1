import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, ScrollView, TouchableOpacity, Platform, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { STACKS } from '@truckmitr/src/stacks/stacks';
import { useTranslation } from 'react-i18next';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { showToast } from '@truckmitr/src/app/hooks/toast';

const ChallanCheckInfo = () => {
    const navigation = useNavigation<any>();
    const colors = useColor();
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const { shadow } = useShadow();
    const { t } = useTranslation();

    const { subscriptionDetails } = useSelector((state: any) => state?.user);

    const checkSubscriptionStatus = () => {
        if (!subscriptionDetails) return false;

        // Ensure we have an array, even if API returns a single object
        const subs = Array.isArray(subscriptionDetails) ? subscriptionDetails : [subscriptionDetails];

        console.log('[ChallanCheck] Checking subscriptions:', JSON.stringify(subs));

        // Check for active subscription with amount 199 or 499
        const validSubscription = subs.find((sub: any) => {
            if (!sub) return false;

            // Check expiry
            if (!sub.end_at) return false;
            const endDate = new Date(sub.end_at * 1000);
            const now = new Date();

            // If expired
            if (endDate <= now) return false;

            // Check amount (handle string or number)
            const amount = parseFloat(sub.amount);

            console.log(`[ChallanCheck] Sub Amount: ${amount}, EndDate: ${endDate}`);

            // Allow 199, 499 (and handle potential variations like 199.00)
            // also checking payment_status if available
            const isAmountValid = Math.floor(amount) === 199 || Math.floor(amount) === 499;

            return isAmountValid;
        });

        return !!validSubscription;
    };

    const hasActivePlan = checkSubscriptionStatus();

    // State
    const [inputModalVisible, setInputModalVisible] = useState(false);
    const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const _goBack = () => navigation.goBack();

    const _handleCheckChallan = () => {
        setInputModalVisible(true);
    };

    const _handleVerify = async () => {
        if (!vehicleNumber.trim()) return;

        if (hasActivePlan) {
            setLoading(true);
            try {
                const payload = {
                    vehicle_no: vehicleNumber.toUpperCase(),
                    consent: "Y",
                    consent_text: "I give my consent to challan-details api to check my challan details"
                };

                const response = await axiosInstance.post(END_POINTS.CHALLAN_VERIFY, payload);

                if (response.data.status === 1) {
                    setInputModalVisible(false);
                    setVehicleNumber('');
                    navigation.navigate(STACKS.CHALLAN_CHECK_RESULT, {
                        vehicleNumber: vehicleNumber.toUpperCase(),
                        results: response.data.result
                    });
                } else {
                    showToast(response.data.message || t('somethingWentWrong'));
                }
            } catch (error: any) {
                console.error("Challan check error:", error);
                showToast(error?.response?.data?.message || t('somethingWentWrong'));
            } finally {
                setLoading(false);
            }
        } else {
            setInputModalVisible(false);
            setTimeout(() => {
                setSubscriptionModalVisible(true);
            }, 300);
        }
    };

    const _handleViewPlans = () => {
        setSubscriptionModalVisible(false);
        console.log("Navigating to Plans...");
        // navigation.navigate(STACKS.SUBSCRIPTION_CONSENT);
    };

    const StepItem = ({ number, text }: { number: number; text: string }) => (
        <View style={{ flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ color: '#2563EB', fontWeight: 'bold', fontSize: responsiveFontSize(1.4) }}>{number}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: responsiveFontSize(1.4), color: '#334155', lineHeight: responsiveFontSize(2.2), textAlign: 'left' }}>{text}</Text>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: responsiveWidth(4), paddingTop: responsiveHeight(6), backgroundColor: colors.white, elevation: 4 }}>
                <TouchableOpacity onPress={_goBack} style={{ padding: 5, marginRight: 10 }}>
                    <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: 'bold', color: colors.royalBlue }}>
                    {t('challanCheckTitle', 'Challan Check')}
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: responsiveWidth(4), paddingBottom: responsiveHeight(14) }} showsVerticalScrollIndicator={false}>

                {/* Hero Card */}
                <View style={{ backgroundColor: '#EAF3FF', borderRadius: 16, padding: responsiveWidth(5), marginBottom: responsiveHeight(2), alignItems: 'center' }}>
                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <Ionicons name="receipt-outline" size={30} color={colors.white} />
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: '700', color: '#001F3F', textAlign: 'center', marginBottom: 8 }}>
                        {t('challanCheckTitle', 'Challan Check')}
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.5), color: '#475569', textAlign: 'center', lineHeight: responsiveFontSize(2.4), paddingHorizontal: 8 }}>
                        {t('challanCheckHeroDesc', 'Check pending traffic challans for your vehicle by entering the vehicle number')}
                    </Text>
                </View>

                {/* What is Challan Check */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: '#334155', marginBottom: 10 }}>
                        {t('whatIsChallanCheck', 'What is Challan Check?')}
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.45), color: '#475569', lineHeight: responsiveFontSize(2.2), marginBottom: 10, textAlign: 'left' }}>
                        {t('whatIsChallanCheckDesc', 'Check pending traffic challans for your vehicle by entering the vehicle number.')}
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(1.3), color: '#64748B', fontStyle: 'italic', lineHeight: responsiveFontSize(2.0), textAlign: 'left' }}>
                        {t('challanFeatureNote', 'This feature is available for drivers with an active TruckMitr subscription.')}
                    </Text>
                </View>

                {/* How It Works */}
                <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                    <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: '#334155', marginBottom: 16 }}>
                        {t('howItWorks', 'How it works')}
                    </Text>
                    <StepItem number={1} text={t('challanStep1', 'Enter your vehicle number')} />
                    <StepItem number={2} text={t('challanStep2', 'Start challan verification')} />
                    <StepItem number={3} text={t('challanStep3', 'View challan status and details')} />
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 }}>
                        <Ionicons name="time-outline" size={16} color="#059669" style={{ marginRight: 6, marginTop: 2 }} />
                        <Text style={{ flex: 1, fontSize: responsiveFontSize(1.3), color: '#059669', fontWeight: '600', lineHeight: responsiveFontSize(2.0), textAlign: 'left' }}>
                            {t('challanResultTime', 'Results are shown shortly after submission')}
                        </Text>
                    </View>
                </View>

                {/* Subscription Requirement */}
                {!hasActivePlan && (
                    <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), ...shadow, shadowColor: 'rgba(0,0,0,0.06)' }}>
                        <Text style={{ fontSize: responsiveFontSize(1.7), fontWeight: '700', color: '#334155', marginBottom: 12 }}>
                            {t('subscriptionRequirement', 'Subscription Requirement')}
                        </Text>
                        <Text style={{ fontSize: responsiveFontSize(1.45), color: '#475569', marginBottom: 10, lineHeight: responsiveFontSize(2.0), textAlign: 'left' }}>
                            {t('challanIncludedWith', 'Challan Check is included with:')}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Ionicons name="checkmark-circle" size={18} color="#16A34A" style={{ marginRight: 8 }} />
                            <Text style={{ fontSize: responsiveFontSize(1.5), color: '#334155', fontWeight: '600' }}>{t('plan199', '₹199 Plan')}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                            <Ionicons name="checkmark-circle" size={18} color="#16A34A" style={{ marginRight: 8 }} />
                            <Text style={{ fontSize: responsiveFontSize(1.5), color: '#334155', fontWeight: '600' }}>{t('plan499', '₹499 Plan')}</Text>
                        </View>
                        <View style={{ backgroundColor: '#FFF7ED', padding: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#F97316' }}>
                            <Text style={{ fontSize: responsiveFontSize(1.3), color: '#9A3412', lineHeight: responsiveFontSize(2.0), textAlign: 'left' }}>
                                ⚠️ {t('ensureSubscriptionActive', 'Please ensure your subscription is active to use this feature.')}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Data Security */}
                <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: responsiveWidth(4), marginBottom: responsiveHeight(2), borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'flex-start' }}>
                    <MaterialCommunityIcons name="shield-lock-outline" size={24} color="#64748B" style={{ marginRight: 12, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: responsiveFontSize(1.5), fontWeight: '700', color: '#334155', marginBottom: 4, textAlign: 'left' }}>
                            {t('dataSecurity', 'Data Security')}
                        </Text>
                        <Text style={{ fontSize: responsiveFontSize(1.3), color: '#64748B', lineHeight: responsiveFontSize(2.0), textAlign: 'left' }}>
                            {t('dataSecurityDesc', 'Your data is secure and used only for challan verification purposes.')}
                        </Text>
                    </View>
                </View>

            </ScrollView>

            {/* Sticky CTA Button */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: responsiveWidth(4), backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#E5E7EB', ...shadow }}>
                <TouchableOpacity
                    onPress={_handleCheckChallan}
                    style={{ backgroundColor: colors.royalBlue, paddingVertical: responsiveHeight(1.8), borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.8), fontWeight: 'bold' }}>
                        {t('checkChallanBtn', 'Check Challan')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Input Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={inputModalVisible}
                onRequestClose={() => { if (!loading) setInputModalVisible(false); }}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: responsiveWidth(5), paddingBottom: responsiveHeight(5) }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={{ fontSize: responsiveFontSize(2), fontWeight: 'bold', color: '#001F3F' }}>
                                    {t('challanVerification', 'Challan Verification')}
                                </Text>
                                {!loading && (
                                    <TouchableOpacity onPress={() => setInputModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#64748B" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {loading ? (
                                <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                                    <ActivityIndicator size="large" color={colors.royalBlue} style={{ marginBottom: 16 }} />
                                    <Text style={{ fontSize: responsiveFontSize(1.8), fontWeight: '600', color: '#001F3F', marginBottom: 8, textAlign: 'center' }}>
                                        {t('verifyingDetails', 'Verifying details...')}
                                    </Text>
                                    <Text style={{ fontSize: responsiveFontSize(1.4), color: '#64748B', textAlign: 'center' }}>
                                        {t('pleaseWaitMoment', 'Please wait, this may take a moment')}
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={{ fontSize: responsiveFontSize(1.4), color: '#334155', marginBottom: 8, textAlign: 'left' }}>
                                        {t('enterVehicleNumber', 'Enter Vehicle Number')}
                                    </Text>
                                    <TextInput
                                        value={vehicleNumber}
                                        onChangeText={setVehicleNumber}
                                        placeholder="MH12AB1234"
                                        placeholderTextColor="#94A3B8"
                                        autoCapitalize="characters"
                                        style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: responsiveFontSize(1.8), color: '#001F3F', backgroundColor: '#F8FAFC', marginBottom: 8, textAlign: 'left' }}
                                    />
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 }}>
                                        <Ionicons name="information-circle-outline" size={16} color="#64748B" style={{ marginRight: 6, marginTop: 2 }} />
                                        <Text style={{ flex: 1, fontSize: responsiveFontSize(1.2), color: '#64748B', lineHeight: responsiveFontSize(1.8), textAlign: 'left' }}>
                                            {t('enterVehicleCorrectly', 'Please enter the vehicle number correctly')}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={_handleVerify}
                                        style={{ backgroundColor: vehicleNumber.trim() ? colors.royalBlue : '#CBD5E1', paddingVertical: responsiveHeight(1.8), borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                                        disabled={!vehicleNumber.trim()}
                                    >
                                        <Text style={{ color: 'white', fontSize: responsiveFontSize(1.8), fontWeight: 'bold' }}>
                                            {t('verifyChallan', 'Verify Challan')}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Subscription Modal */}
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
                        <Text style={{ fontSize: responsiveFontSize(2.2), fontWeight: 'bold', color: '#001F3F', marginBottom: 8, textAlign: 'center' }}>
                            {t('subscriptionRequired', 'Subscription Required')}
                        </Text>
                        <Text style={{ fontSize: responsiveFontSize(1.5), color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: responsiveFontSize(2.4), paddingHorizontal: 10 }}>
                            {t('challanAvailablePlans', 'Challan Check is available only for ₹199 and ₹499 plans.')}
                        </Text>
                        <TouchableOpacity onPress={_handleViewPlans} style={{ backgroundColor: colors.royalBlue, width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12 }}>
                            <Text style={{ color: 'white', fontSize: responsiveFontSize(1.6), fontWeight: 'bold' }}>
                                {t('viewPlans', 'View Plans')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSubscriptionModalVisible(false)} style={{ paddingVertical: 10 }}>
                            <Text style={{ color: '#64748B', fontSize: responsiveFontSize(1.6), fontWeight: '600' }}>
                                {t('cancel', 'Cancel')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

export default ChallanCheckInfo;
